import sys
from langgraph.graph import StateGraph, END
from schemas.models import PatchProposal, VulnerabilityReport
from agents.blue_coder.graph import BlueCoderState

from core.aiml_client import ai_client, extract_json
from core.model_config import get_blue_model


def _format_exploit_chain(exploit_chain: list) -> str:
    if not exploit_chain:
        return "  No exploit chain entries."
    lines = []
    for i, e in enumerate(exploit_chain):
        desc = e.get("description", "Unknown")
        sev = e.get("severity", "UNKNOWN")
        lines.append(f"  {i + 1}. {desc} (severity: {sev})")
    return "\n".join(lines)


def write_patch_node(state: BlueCoderState) -> dict:
    model = get_blue_model()
    print(f"\n[Blue Coder] Writing patch iteration {state['iteration_count'] + 1}...", flush=True)
    print(f"[Blue Coder] Calling {model} (may take 30-60s)...", flush=True)

    previous_vuln = state.get("vulnerability", None)
    iter_num = state.get("iteration_count", 0) + 1
    exploit_chain = state.get("exploit_chain", [])
    is_revision = len(exploit_chain) > 0

    if is_revision:
        exploit_details = _format_exploit_chain(exploit_chain)
        prompt = f"""
    [ITERATION {iter_num} — REVISION REQUESTED]

    Your last patch was exploited by an adversarial auditor. Fix it properly.

    Source Code:
    ```
    {state['source_file'].raw_code}
    ```

    Original Vulnerability (Severity: {state['vulnerability'].severity}):
    {state['vulnerability'].description}
    Target Lines: {state['vulnerability'].target_lines}

    Exploit Chain:
{exploit_details}

    Return ONLY valid PatchProposal JSON (a patch_id string, proposed_code string, architectural_changes string, dependencies_added array). No extra text.
    """
    else:
        prompt = f"""
    [ITERATION {iter_num} — INITIAL PATCH]

    You are an elite secure-coding agent. Fix the security bug highlighted below.

    Source Code:
    ```
    {state['source_file'].raw_code}
    ```

    Vulnerability Details (Severity: {state['vulnerability'].severity}):
    {state['vulnerability'].description}
    Target Lines: {state['vulnerability'].target_lines}

    Previous Compiler Errors:
    {state['compiler_logs'] if state['compiler_logs'] else 'None'}

    Return ONLY valid PatchProposal JSON (a patch_id string, proposed_code string, architectural_changes string, dependencies_added array). No extra text.
    """

    response = ai_client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1024,
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "PatchProposal",
                "schema": PatchProposal.model_json_schema()
            }
        }
    )

    print("[Blue Coder] API response received.", flush=True)
    patch_data = PatchProposal.model_validate_json(extract_json(response.choices[0].message.content))

    return {
        "current_patch": patch_data,
        "iteration_count": state["iteration_count"] + 1
    }


def compile_verification_node(state: BlueCoderState) -> dict:
    print("[Blue Coder] Running syntax compiler checks...", flush=True)
    patch = state["current_patch"]

    if patch is None:
        return {"compiler_logs": "ERROR: No patch available to verify"}

    if state["source_file"].language.lower() == "python":
        try:
            compile(patch.proposed_code, '<string>', 'exec')
            return {"compiler_logs": "SUCCESS"}
        except SyntaxError as e:
            error_msg = f"SyntaxError on line {e.lineno}: {e.msg}\nCode block: {e.text}"
            return {"compiler_logs": error_msg}

    return {"compiler_logs": "SUCCESS"}


def routing_evaluator(state: BlueCoderState) -> str:
    if state["compiler_logs"] != "SUCCESS" and state["iteration_count"] < state["max_iterations"]:
        print("Compiler check failed. Routing back to code-gen.", flush=True)
        return "retry"

    print("Compiler checks passed or max budget met. Routing to output.", flush=True)
    return "finalize"


workflow = StateGraph(BlueCoderState)

workflow.add_node("patcher_agent", write_patch_node)
workflow.add_node("compiler_validator", compile_verification_node)

workflow.set_entry_point("patcher_agent")

workflow.add_edge("patcher_agent", "compiler_validator")

workflow.add_conditional_edges(
    "compiler_validator",
    routing_evaluator,
    {
        "retry": "patcher_agent",
        "finalize": END
    }
)

blue_coder_app = workflow.compile()
