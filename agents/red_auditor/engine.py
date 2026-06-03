from core.aiml_client import ai_client
from schemas.models import PatchProposal, AuditCritique
from agents.red_auditor.prompts import RED_AUDITOR_SYSTEM_PROMPT


def execute_adversarial_audit(patch: PatchProposal, original_vulnerability: str) -> AuditCritique:
    print(f"\n[Red Auditor] Initiating Graph-of-Thoughts exploit analysis for Patch: {patch.patch_id}...")

    user_content = f"""
    Target Patch ID: {patch.patch_id}
    Original Security Vulnerability to Fix: {original_vulnerability}

    Proposed Fixed Code Implementation:
    ```
    {patch.proposed_code}
    ```

    Architectural Context: {patch.architectural_changes}

    Execute your GoT evaluation and respond with strict JSON matching the AuditCritique schema.
    """

    response = ai_client.chat.completions.create(
        model="deepseek-r1",
        messages=[
            {"role": "system", "content": RED_AUDITOR_SYSTEM_PROMPT},
            {"role": "user", "content": user_content}
        ],
        response_format={"type": "json_object", "schema": AuditCritique.model_json_schema()}
    )

    critique_data = AuditCritique.model_validate_json(response.choices[0].message.content)

    if not critique_data.is_secure:
        print(f"[Red Auditor] Exploit Path Discovered! Target is vulnerable.")
        print(f"   Vector: {critique_data.exploit_found}")
    else:
        print(f"[Red Auditor] Patch passed adversarial simulation.")

    return critique_data
