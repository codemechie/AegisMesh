# main.py

import uuid
from core.band_mesh import BandMeshChannel
from core.model_config import get_blue_model, get_red_model, get_si_model
from schemas.models import FileContext, VulnerabilityReport, PatchProposal, Evidence
from agents.blue_coder.agent import blue_coder_app  # Compiled LangGraph from agent.py
from agents.red_auditor.engine import execute_adversarial_audit  # Implemented in Phase 2, Step 3
from agents.security_intelligence.agent import generate_security_report  # Security Intelligence Agent
from integrations.band import setup_band_mirror


def initialize_blue_coder_service(mesh: BandMeshChannel):
    """Hooks the Blue Coder LangGraph engine directly into the BAND mesh."""

    def on_vulnerability_discovered(channel: BandMeshChannel, payload: dict):
        # Triggered whenever Agent 1 (Routing Triager) drops a bug onto the mesh
        channel.log_system_event("Blue Coder Service",
                                 "Intercepted vulnerability task. Initializing LangGraph state-loop...")

        # Invoke the internal LangGraph engine built in Step 2.1
        inputs = {
            "source_file": FileContext.model_validate(payload["source_file"]),
            "vulnerability": VulnerabilityReport.model_validate(payload["vulnerability"]),
            "current_patch": None,
            "compiler_logs": None,
            "iteration_count": 0,
            "max_iterations": 3,
            "exploit_chain": channel.shared_context.get("exploit_chain", [])
        }

        graph_output = blue_coder_app.invoke(inputs)
        final_patch = graph_output.get("current_patch")

        if final_patch:
            channel.log_system_event("Blue Coder Service", "LangGraph patch compile loops completed successfully.")
            # Handoff the work back to the mesh for the Auditor to process
            channel.broadcast("PATCH_PROPOSED", {"patch": final_patch.model_dump()})
        else:
            channel.log_system_event("Blue Coder Service",
                                     "CRITICAL: LangGraph loop failed to produce a valid compile fix.")

    # Bind the listener to the mesh bus
    mesh.subscribe("VULNERABILITY_TRIAGED", on_vulnerability_discovered)


def _record_audit_degradation(channel: BandMeshChannel):
    from datetime import datetime, timezone
    bt = channel.shared_context["benchmark_telemetry"]
    bt["audit_degradations"] = bt.get("audit_degradations", 0) + 1
    channel.shared_context.setdefault("agent_failures", []).append({
        "agent": "Red Auditor Agent",
        "event_type": "AUDIT_DEGRADATION",
        "error": "Malformed JSON response — Stage 4 fallback used",
        "failure_type": "AUDIT_DEGRADATION",
        "reason": "Malformed JSON response",
        "recovered": True,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    channel.log_system_event("Red Auditor", "AUDIT_DEGRADATION — Stage 4 fallback used. Telemetry recorded.")


def initialize_red_auditor_service(mesh: BandMeshChannel):
    """Hooks the Red Auditor GoT engine directly into the BAND mesh."""

    def on_patch_submitted(channel: BandMeshChannel, payload: dict):
        # Triggered whenever the Blue Coder posts a patch proposal to the channel
        channel.log_system_event("Red Auditor Service",
                                 "Intercepted new patch proposal. Executing GoT analysis...")

        # Reconstruct the Pydantic classes out of the shared mesh data pool
        patch_obj = PatchProposal.model_validate(payload["patch"])
        orig_vuln_desc = channel.shared_context["original_vulnerability"]["description"]

        # Run the adversarial analysis from Phase 2, Step 3
        critique = execute_adversarial_audit(
            patch_obj, orig_vuln_desc,
            record_failure=lambda err: _record_audit_degradation(channel)
        )

        # Evidence grounding validation — reject hallucinated evidence
        source_file = channel.shared_context.get("source_file", {})
        source_code = source_file.get("raw_code", "") if isinstance(source_file, dict) else getattr(source_file, "raw_code", "")
        source_file_path = source_file.get("file_path", "") if isinstance(source_file, dict) else getattr(source_file, "file_path", "")
        invalid_count, downgraded = critique.validate_evidence(source_code, source_file_path)

        if invalid_count > 0:
            channel.shared_context["invalid_evidence_count"] = (
                channel.shared_context.get("invalid_evidence_count", 0) + invalid_count
            )
            if downgraded:
                channel.shared_context["evidence_downgrades"] = (
                    channel.shared_context.get("evidence_downgrades", 0) + 1
                )
                channel.log_system_event(
                    "Red Auditor Service",
                    f"EVIDENCE_DOWNGRADE — VERIFIED_EXPLOIT downgraded to SPECULATIVE_RISK: "
                    f"{invalid_count} evidence item(s) failed source validation"
                )
            else:
                channel.log_system_event(
                    "Red Auditor Service",
                    f"INVALID_EVIDENCE — Removed {invalid_count} hallucinated evidence item(s) from critique"
                )

        # Broadcast the results back out to the mesh
        channel.broadcast("AUDIT_COMPLETED", {"critique": critique.model_dump()})

        # Only VERIFIED_EXPLOIT triggers patch regeneration
        if critique.finding_type == "VERIFIED_EXPLOIT":
            channel.log_system_event("Red Auditor Service",
                                     "VERIFIED_EXPLOIT — Routing fix vector back to Blue Coder.")

            channel.broadcast("VULNERABILITY_TRIAGED", {
                "source_file": channel.shared_context["source_file"],
                "vulnerability": channel.shared_context["original_vulnerability"],
                "exploit_context": {
                    "message": f"PREVIOUS PATCH EXPLOITED! Vector: {critique.exploit_found}",
                    "severity": "CRITICAL",
                    "exploit_found": critique.exploit_found,
                    "iteration": channel.shared_context["mesh_iteration"]
                }
            })
        elif critique.finding_type == "SPECULATIVE_RISK":
            channel.log_system_event("Red Auditor Service",
                                     "SPECULATIVE_RISK — No patch regeneration needed. Recording in audit history.")
        elif critique.finding_type == "INFORMATIONAL":
            channel.log_system_event("Red Auditor Service",
                                     "INFORMATIONAL — No patch regeneration needed. Recording in audit history.")

    mesh.subscribe("PATCH_PROPOSED", on_patch_submitted)


def initialize_security_intelligence_service(mesh: BandMeshChannel):
    """Hooks the Security Intelligence Agent into the BAND mesh."""

    def on_security_report_requested(channel: BandMeshChannel, payload: dict):
        channel.log_system_event("Security Intelligence Service",
                                 "SECURITY_REPORT_REQUESTED received. Generating Security Intelligence Report...")

        report = generate_security_report(channel)

        channel.shared_context["security_report"] = report.model_dump()

        channel.log_system_event("Security Intelligence Service",
                                 f"Report generated: Score {report.security_score}/100, Risk {report.risk_level}")

        channel.broadcast("SECURITY_REPORT_GENERATED", {"report": report.model_dump()})

    mesh.subscribe("SECURITY_REPORT_REQUESTED", on_security_report_requested)


# main.py (Execution block)

if __name__ == "__main__":
    print("Booting Enterprise Adversarial Agentic Mesh...")

    # 1. Load active models from environment config
    blue_model = get_blue_model()
    red_model = get_red_model()
    si_model = get_si_model()

    print(f"  Blue Coder model:  {blue_model}")
    print(f"  Red Auditor model: {red_model}")
    print(f"  SI Agent model:    {si_model}")

    # 2. Initialize a distinct session room inside BAND
    session_id = f"session-{uuid.uuid4()}"
    band_mesh = BandMeshChannel(session_id=session_id)
    band_mesh.shared_context["active_models"] = {
        "blue": blue_model,
        "red": red_model,
        "security_intelligence": si_model,
    }

    # 2a. Register BAND event mirror (before agent services so room
    #     is created before the first event triggers callbacks)
    band_mirror = setup_band_mirror(band_mesh)

    # 2b. Start up our asynchronous agent event consumers
    initialize_blue_coder_service(band_mesh)
    initialize_red_auditor_service(band_mesh)
    initialize_security_intelligence_service(band_mesh)

    # 3. Simulate Agent 1 (Routing Triager) dropping an ingested target bug onto the bus
    vulnerable_mock_file = FileContext(
        file_path="server/app.py",
        raw_code="query = f'SELECT * FROM users WHERE id = {user_input}'\ncursor.execute(query)",
        language="python"
    )

    detected_vulnerability = VulnerabilityReport(
        description="Raw string concatenation detected in database execution string. High risk of remote SQL injection escape.",
        target_lines=[1, 2],
        severity="HIGH"
    )

    print("\n--- Seeding Initial Mesh Context (Agent 1 Handoff) ---")
    band_mesh.broadcast("VULNERABILITY_TRIAGED", {
        "source_file": vulnerable_mock_file.model_dump(),
        "vulnerability": detected_vulnerability.model_dump()
    })

    # Mirror terminal status (SECURED / ESCALATION_REQUIRED) if not
    # already handled by the event mirror callbacks.
    if band_mirror is not None:
        band_mirror.maybe_mirror_terminal_status(band_mesh.shared_context)
