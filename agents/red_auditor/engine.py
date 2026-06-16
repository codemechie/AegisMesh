import json
from pydantic import ValidationError
from core.aiml_client import ai_client, extract_json
from core.model_config import get_red_model
from schemas.models import PatchProposal, AuditCritique
from agents.red_auditor.prompts import RED_AUDITOR_SYSTEM_PROMPT


JSON_REPAIR_PROMPT = """You are a JSON repair assistant. Fix JSON syntax errors in the text below.
Output ONLY valid JSON matching this schema — no explanation, no markdown, no code fences:
{
  "patch_id": "string",
  "is_secure": true,
  "finding_type": "VERIFIED_EXPLOIT | SPECULATIVE_RISK | INFORMATIONAL",
  "confidence": "HIGH | MEDIUM | LOW",
  "evidence": [{"file": "str", "line": 0, "reason": "str"}],
  "exploit_found": "string or null",
  "graph_of_thoughts": [{"thought_id": "str", "hypothesis": "str", "evaluation_result": "str", "parent_thoughts": ["str"]}]
}"""


def _extract_largest_json(text: str) -> dict | None:
    """Stage 2: find and parse the largest valid JSON object embedded in text."""
    candidates = []
    depth = 0
    start = -1
    for i, ch in enumerate(text):
        if ch == '{':
            if depth == 0:
                start = i
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0 and start >= 0:
                candidates.append(text[start:i + 1])
                start = -1
    best = None
    best_size = -1
    for c in candidates:
        try:
            obj = json.loads(c)
            if isinstance(obj, dict) and len(obj) > best_size:
                best = obj
                best_size = len(obj)
        except json.JSONDecodeError:
            continue
    return best


def _repair_json_via_llm(raw_text: str) -> str | None:
    """Stage 3: send raw response to a lightweight JSON repair prompt."""
    try:
        resp = ai_client.chat.completions.create(
            model=get_red_model(),
            messages=[
                {"role": "system", "content": JSON_REPAIR_PROMPT},
                {"role": "user", "content": raw_text}
            ],
            max_tokens=2048
        )
        repaired = extract_json(resp.choices[0].message.content)
        json.loads(repaired)
        return repaired
    except Exception:
        return None


def _fallback_critique(patch_id: str, error: str) -> AuditCritique:
    """Stage 4: fallback that never blocks convergence."""
    print(f"[Red Auditor] WARNING: All recovery stages exhausted. Returning INFORMATIONAL fallback.", flush=True)
    print(f"   Error: {error}", flush=True)
    return AuditCritique(
        patch_id=patch_id,
        is_secure=False,
        finding_type="INFORMATIONAL",
        confidence="LOW",
        evidence=[],
        exploit_found=f"Auditor response unparsable: {error}",
        graph_of_thoughts=[]
    )


def _print_verdict(critique: AuditCritique):
    if not critique.is_secure:
        print(f"[Red Auditor] Exploit Path Discovered! Target is vulnerable.")
        print(f"   Vector: {critique.exploit_found}")
    else:
        print(f"[Red Auditor] Patch passed adversarial simulation.")


def execute_adversarial_audit(
    patch: PatchProposal,
    original_vulnerability: str,
    record_failure: callable = None
) -> AuditCritique:
    model = get_red_model()
    print(f"\n[Red Auditor] Initiating Graph-of-Thoughts exploit analysis for Patch: {patch.patch_id}...", flush=True)
    print(f"[Red Auditor] Calling {model} (may take 15-30s)...", flush=True)

    user_content = f"""
    Target Patch ID: {patch.patch_id}
    Original Security Vulnerability to Fix: {original_vulnerability}

    Proposed Fixed Code Implementation:
    ```
    {patch.proposed_code}
    ```

    Architectural Context: {patch.architectural_changes}

    Execute your GoT evaluation. Output ONLY valid JSON matching this schema (no markdown, no code fences):
    {AuditCritique.model_json_schema()}
    """

    response = ai_client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": RED_AUDITOR_SYSTEM_PROMPT},
            {"role": "user", "content": user_content}
        ],
        max_tokens=4096
    )

    print("[Red Auditor] API response received.", flush=True)
    raw_text = extract_json(response.choices[0].message.content)

    # Stage 1: Direct model_validate_json
    try:
        critique_data = AuditCritique.model_validate_json(raw_text)
        _print_verdict(critique_data)
        return critique_data
    except (ValidationError, json.JSONDecodeError) as e:
        print(f"[Red Auditor] Stage 1 (direct parse) failed: {e}", flush=True)

    # Stage 2: Extract largest valid JSON object from response
    obj = _extract_largest_json(raw_text)
    if obj:
        try:
            critique_data = AuditCritique.model_validate(obj)
            print(f"[Red Auditor] Stage 2 (JSON extraction) recovered valid critique.", flush=True)
            _print_verdict(critique_data)
            return critique_data
        except (ValidationError, json.JSONDecodeError) as e:
            print(f"[Red Auditor] Stage 2 (JSON extraction) failed: {e}", flush=True)

    # Stage 3: Send raw response to lightweight JSON repair LLM call
    print("[Red Auditor] Stage 3: Attempting JSON repair via LLM...", flush=True)
    repaired = _repair_json_via_llm(raw_text)
    if repaired:
        try:
            critique_data = AuditCritique.model_validate_json(repaired)
            print(f"[Red Auditor] Stage 3 (LLM repair) recovered valid critique.", flush=True)
            _print_verdict(critique_data)
            return critique_data
        except (ValidationError, json.JSONDecodeError) as e:
            print(f"[Red Auditor] Stage 3 (LLM repair) failed: {e}", flush=True)

    # Stage 4: Fallback — never leave the mesh stuck
    error_msg = "All recovery stages (1-3) exhausted"
    if record_failure:
        record_failure(error_msg)
    return _fallback_critique(patch.patch_id, error_msg)
