# main.py

import uuid
from core.band_mesh import BandMeshChannel
from schemas.models import FileContext, VulnerabilityReport, PatchProposal
from agents.blue_coder.agent import blue_coder_app  # Compiled LangGraph from agent.py
from agents.red_auditor.engine import execute_adversarial_audit  # Implemented in Phase 2, Step 3


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
            "max_iterations": 3
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


def initialize_red_auditor_service(mesh: BandMeshChannel):
    """Hooks the Red Auditor GoT engine directly into the BAND mesh."""

    def on_patch_submitted(channel: BandMeshChannel, payload: dict):
        # Triggered whenever the Blue Coder posts a patch proposal to the channel
        channel.log_system_event("Red Auditor Service",
                                 "Intercepted new patch proposal. Executing DeepSeek-R1 GoT analysis...")

        # Reconstruct the Pydantic classes out of the shared mesh data pool
        patch_obj = PatchProposal.model_validate(payload["patch"])
        orig_vuln_desc = channel.shared_context["vulnerability"]["description"]

        # Run the adversarial analysis from Phase 2, Step 3
        critique = execute_adversarial_audit(patch_obj, orig_vuln_desc)

        # Broadcast the results back out to the mesh
        channel.broadcast("AUDIT_COMPLETED", {"critique": critique.model_dump()})

        # IF the patch is rejected, route it right back to the coder with the exploit details!
        if not critique.is_secure:
            channel.log_system_event("Red Auditor Service",
                                     "Exploit feedback loop triggered. Routing fix vector back to Blue Coder.")
            channel.broadcast("VULNERABILITY_TRIAGED", {
                "source_file": channel.shared_context["source_file"],
                "vulnerability": {
                    "severity": "CRITICAL",
                    "description": f"PREVIOUS PATCH EXPLOITED! Vector: {critique.exploit_found}",
                    "target_lines": channel.shared_context["vulnerability"]["target_lines"]
                }
            })

    mesh.subscribe("PATCH_PROPOSED", on_patch_submitted)


# main.py (Execution block)

if __name__ == "__main__":
    print("Booting Enterprise Adversarial Agentic Mesh...")

    # 1. Initialize a distinct session room inside BAND
    session_id = f"session-{uuid.uuid4()}"
    band_mesh = BandMeshChannel(session_id=session_id)

    # 2. Start up our asynchronous agent event consumers
    initialize_blue_coder_service(band_mesh)
    initialize_red_auditor_service(band_mesh)

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
