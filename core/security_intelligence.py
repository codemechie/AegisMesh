from schemas.security_report import SecurityIntelligenceReport


def generate_security_report(shared_context: dict) -> SecurityIntelligenceReport:
    bt = shared_context.get("benchmark_telemetry", {})
    audit_history = shared_context.get("audit_history", [])
    exploit_chain = shared_context.get("exploit_chain", [])
    agent_failures = shared_context.get("agent_failures", [])
    status = shared_context.get("status", "UNKNOWN")
    mesh_iter = shared_context.get("mesh_iteration", 0)
    max_iter = shared_context.get("max_mesh_iterations", 8)

    verified = bt.get("verified_exploits", 0)
    speculative = bt.get("speculative_risks", 0)
    informational = bt.get("informational_findings", 0)
    degradations = bt.get("audit_degradations", 0)
    final_status = bt.get("final_status") or status

    score = 100
    score -= verified * 30
    score -= speculative * 10
    score -= degradations * 15
    iterations_ratio = mesh_iter / max(max_iter, 1)
    if iterations_ratio > 0.5:
        score -= int(iterations_ratio * 10)
    if final_status == "ESCALATION_REQUIRED":
        score -= 20
    score = max(0, min(100, score))

    confidence = _compute_confidence(audit_history, degradations)

    risk_level = _risk_level(score)

    deployment_recommendation = _recommendation(risk_level)

    reasoning = _build_reasoning(
        score, confidence, risk_level, verified, speculative, informational,
        degradations, mesh_iter, final_status, audit_history
    )

    remaining_risks = _remaining_risks(exploit_chain, audit_history, final_status)

    return SecurityIntelligenceReport(
        security_score=score,
        confidence=confidence,
        risk_level=risk_level,
        deployment_recommendation=deployment_recommendation,
        verified_exploits=verified,
        speculative_risks=speculative,
        informational_findings=informational,
        audit_degradations=degradations,
        reasoning=reasoning,
        remaining_risks=remaining_risks
    )


def _compute_confidence(audit_history: list, degradations: int) -> float:
    if not audit_history:
        return 0.0
    weights = {"HIGH": 1.0, "MEDIUM": 0.6, "LOW": 0.3}
    total_weight = sum(weights.get(a.get("confidence", "LOW"), 0.3) for a in audit_history)
    avg = total_weight / len(audit_history)
    degradation_penalty = degradations * 0.1
    return round(max(0.0, min(1.0, avg - degradation_penalty)), 2)


def _risk_level(score: int) -> str:
    if score >= 85:
        return "LOW"
    elif score >= 65:
        return "MEDIUM"
    elif score >= 45:
        return "HIGH"
    elif score >= 25:
        return "CRITICAL"
    return "SEVERE"


def _recommendation(risk_level: str) -> str:
    return {
        "LOW": "Approved for deployment — no blockers identified.",
        "MEDIUM": "Deploy with monitoring — residual risks are acceptable with oversight.",
        "HIGH": "Remediate before deployment — outstanding risks require attention.",
        "CRITICAL": "Do not deploy — verified exploits present critical threat surface.",
        "SEVERE": "Immediate escalation required — trust boundary has been breached."
    }.get(risk_level, "Insufficient data to generate recommendation.")


def _build_reasoning(
    score: int, confidence: float, risk_level: str,
    verified: int, speculative: int, informational: int,
    degradations: int, iterations: int, final_status: str,
    audit_history: list
) -> list:
    reasoning = []

    reasoning.append(
        f"Security score {score}/100 is classified as {risk_level} risk "
        f"with {confidence:.0%} confidence."
    )

    if verified > 0:
        reasoning.append(
            f"Found {verified} verified exploit(s) — each confirmed vulnerability "
            f"reduces the security score by 30 points."
        )
    if speculative > 0:
        reasoning.append(
            f"Identified {speculative} speculative risk(s) — potential concerns "
            f"that could not be fully demonstrated from supplied code."
        )
    if informational > 0:
        reasoning.append(
            f"Recorded {informational} informational finding(s) — non-blocking "
            f"recommendations for hardening."
        )
    if degradations > 0:
        reasoning.append(
            f"Detected {degradations} audit degradation(s) — the auditor encountered "
            f"unparsable LLM output and relied on fallback recovery."
        )

    reasoning.append(
        f"Mesh completed in {iterations} iteration(s) "
        f"with status: {final_status}."
    )

    if audit_history:
        high_conf = sum(1 for a in audit_history if a.get("confidence") == "HIGH")
        total = len(audit_history)
        reasoning.append(
            f"Across {total} audit(s), {high_conf} had HIGH confidence."
        )

    return reasoning


def _remaining_risks(exploit_chain: list, audit_history: list, final_status: str) -> list:
    risks = []

    if exploit_chain:
        for entry in exploit_chain:
            desc = entry.get("description", "Unknown exploit")
            severity = entry.get("severity", "UNKNOWN")
            risks.append(f"Exploit chain entry: {desc} (severity: {severity})")

    for a in audit_history:
        ft = a.get("finding_type")
        if ft == "VERIFIED_EXPLOIT" and a.get("exploit_found"):
            risks.append(f"Verified: {a['exploit_found']}")
        elif ft == "SPECULATIVE_RISK" and a.get("exploit_found"):
            risks.append(f"Speculative: {a['exploit_found']}")

    if final_status == "ESCALATION_REQUIRED":
        risks.append("Mesh exceeded maximum iterations — escalation required.")

    if not risks:
        risks.append("No remaining risks identified.")

    return risks
