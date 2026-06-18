from schemas.security_report import SecurityIntelligenceReport
from agents.security_intelligence.prompts import SECURITY_INTELLIGENCE_SYSTEM_PROMPT
from core.aiml_client import ai_client, extract_json
from core.model_config import get_si_model


def generate_security_report(channel) -> SecurityIntelligenceReport:
    model = get_si_model()
    print(f"\n[Security Intelligence Agent] Generating security report...", flush=True)
    print(f"[Security Intelligence Agent] Calling {model}...", flush=True)

    sc = channel.shared_context
    bt = sc.get("benchmark_telemetry", {})
    audit_history = sc.get("audit_history", [])
    exploit_chain = sc.get("exploit_chain", [])
    agent_failures = sc.get("agent_failures", [])
    mesh_iter = sc.get("mesh_iteration", 0)

    user_content = f"""
# Security Intelligence Report Generation

## Benchmark Telemetry
- Mesh iterations: {mesh_iter}
- Max mesh iterations: {sc.get('max_mesh_iterations', 'N/A')}
- Final status: {bt.get('final_status', 'N/A')}
- Verified exploits: {bt.get('verified_exploits', 0)}
- Speculative risks: {bt.get('speculative_risks', 0)}
- Informational findings: {bt.get('informational_findings', 0)}
- Audit degradations: {bt.get('audit_degradations', 0)}
- Invalid evidence count: {bt.get('invalid_evidence_count', 0)}
- Evidence downgrades: {bt.get('evidence_downgrades', 0)}
- Blue model: {bt.get('blue_model', 'N/A')}
- Red model: {bt.get('red_model', 'N/A')}

## Audit History
{_format_audit_history(audit_history)}

## Exploit Chain
{_format_exploit_chain(exploit_chain)}

## Agent Failures
{_format_agent_failures(agent_failures)}
"""

    response = ai_client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": SECURITY_INTELLIGENCE_SYSTEM_PROMPT},
            {"role": "user", "content": user_content}
        ],
        max_tokens=4096
    )

    print("[Security Intelligence Agent] API response received.", flush=True)
    raw = extract_json(response.choices[0].message.content)
    report = SecurityIntelligenceReport.model_validate_json(raw)
    report.model = model

    print(f"[Security Intelligence Agent] Score: {report.security_score}/100 | Risk: {report.risk_level} | Rec: {report.deployment_recommendation}", flush=True)

    return report


def _format_audit_history(audit_history: list) -> str:
    if not audit_history:
        return "  No audits recorded."
    lines = []
    for i, a in enumerate(audit_history):
        ft = a.get("finding_type", "UNKNOWN")
        conf = a.get("confidence", "UNKNOWN")
        exploit = a.get("exploit_found") or "None"
        evidence_count = len(a.get("evidence", []))
        lines.append(
            f"  Audit {i + 1}: finding_type={ft}, confidence={conf}, "
            f"evidence={evidence_count}, exploit='{exploit}'"
        )
    return "\n".join(lines)


def _format_exploit_chain(exploit_chain: list) -> str:
    if not exploit_chain:
        return "  No exploit chain entries."
    lines = []
    for i, e in enumerate(exploit_chain):
        desc = e.get("description", "Unknown")
        sev = e.get("severity", "UNKNOWN")
        lines.append(f"  {i + 1}. {desc} (severity: {sev})")
    return "\n".join(lines)


def _format_agent_failures(agent_failures: list) -> str:
    if not agent_failures:
        return "  No agent failures."
    lines = []
    for f in agent_failures:
        agent = f.get("agent", "Unknown")
        err = f.get("error", "Unknown error")
        ft = f.get("failure_type", "")
        if ft:
            lines.append(f"  [{agent}] {ft}: {err}")
        else:
            lines.append(f"  [{agent}] {err}")
    return "\n".join(lines)
