import sys
from langgraph.graph import StateGraph, END
from schemas.models import PatchProposal, VulnerabilityReport
from agents.blue_coder.graph import BlueCoderState

from core.aiml_client import ai_client, extract_json


def write_patch_node(state: BlueCoderState) -> dict:
    print(f"\n[Blue Coder] Writing patch iteration {state['iteration_count'] + 1}...", flush=True)
    print("[Blue Coder] Calling AIMLAPI Qwen3-Coder (may take 30-60s)...", flush=True)

    previous_vuln = state.get("vulnerability", None)
    iter_num = state.get("iteration_count", 0) + 1
    is_revision = "PREVIOUS PATCH EXPLOITED" in (state.get("vulnerability", VulnerabilityReport(description="", target_lines=[], severity="")).description)

    if is_revision:
        prompt = f"""
    [ITERATION {iter_num} — REVISION REQUESTED]

    Your last patch was exploited by an adversarial auditor. Fix it properly.

    Source Code:
    ```
    {state['source_file'].raw_code}
    ```

    Auditor's Exploit Finding: {state['vulnerability'].description}

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
        model="alibaba/qwen3-coder-480b-a35b-instruct",
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
