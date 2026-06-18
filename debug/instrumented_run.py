"""
AegisMesh Convergence Debug Instrumentation
Runs the BandMeshChannel with the problematic 3-vulnerability sample.
Captures ALL state transitions, agent I/O, and iteration data.
Does NOT modify any production code.
"""
import sys, os, uuid, json, textwrap, time
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.band_mesh import BandMeshChannel
from core.model_config import get_blue_model, get_red_model, get_si_model
from schemas.models import FileContext, VulnerabilityReport, PatchProposal
from agents.blue_coder.agent import blue_coder_app
from agents.red_auditor.engine import execute_adversarial_audit
from agents.security_intelligence.agent import generate_security_report
from integrations.band import setup_band_mirror

# =========================================================================
# PROBLEMATIC SAMPLE (3 vulnerabilities - the exact test input used)
# =========================================================================
PROBLEMATIC_SAMPLE_CODE = textwrap.dedent("""\
import sqlite3
import os

def get_user(username):
    # Vulnerability 1: SQL Injection
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    query = "SELECT * FROM users WHERE username = '" + username + "'"
    cursor.execute(query)
    return cursor.fetchone()

def delete_file(filepath):
    # Vulnerability 2: Path Traversal
    if os.path.exists(filepath):
        os.remove(filepath)
        return "Deleted"
    return "Not Found"

def run_command(cmd):
    # Vulnerability 3: Command Injection
    os.system("echo " + cmd)
""")

# =========================================================================
# ITERATION CAPTURE
# =========================================================================
ITERATIONS = []

def capture_iteration(number, blue_in, blue_out, red_in, red_out):
    ITERATIONS.append({
        "number": number,
        "blue_input": blue_in,
        "blue_output": blue_out,
        "red_input": red_in,
        "red_output": red_out,
        "finding_type": red_out.get("finding_type") if red_out else None,
        "confidence": red_out.get("confidence") if red_out else None,
    })

# =========================================================================
# INSTRUMENTED MAIN
# =========================================================================
def instrumented_main():
    print("=" * 70)
    print("AEGISMESH CONVERGENCE DEBUG INVESTIGATION")
    print("=" * 70)

    session_id = f"debug-{uuid.uuid4()}"
    start_time = datetime.now(timezone.utc)

    # 1. Create mesh channel
    band_mesh = BandMeshChannel(session_id=session_id)
    band_mesh.shared_context["active_models"] = {
        "blue": get_blue_model(),
        "red": get_red_model(),
        "security_intelligence": get_si_model(),
    }
    band_mesh.shared_context["time_started"] = start_time.isoformat()
    # active_vulnerability tracks original after first broadcast
    band_mesh.shared_context["active_vulnerability"] = None

    print(f"\nSession ID: {session_id}")
    print(f"Start Time: {start_time.isoformat()}")
    print(f"Blue Model: {get_blue_model()}")
    print(f"Red Model:  {get_red_model()}")
    print(f"SI Model:   {get_si_model()}")
    print(f"Max Mesh Iterations: {band_mesh.shared_context['max_mesh_iterations']}")

    # 2. Register BAND mirror (will fail gracefully if credentials invalid)
    try:
        band_mirror = setup_band_mirror(band_mesh)
    except Exception as e:
        print(f"[DEBUG] BAND mirror setup skipped: {e}")
        band_mirror = None

    # 3. Define instrumented Blue Coder Service
    def instrumented_blue_service(channel, payload):
        channel.log_system_event("Blue Coder Service",
                                 "Intercepted vulnerability task. Initializing LangGraph state-loop...")
        source_file = FileContext.model_validate(payload["source_file"])
        vulnerability = VulnerabilityReport.model_validate(payload["vulnerability"])
        iter_num = channel.shared_context["mesh_iteration"]

        blue_input = {
            "source_file": source_file.model_dump() if hasattr(source_file, 'model_dump') else str(source_file),
            "vulnerability": vulnerability.model_dump() if hasattr(vulnerability, 'model_dump') else str(vulnerability),
            "exploit_chain": channel.shared_context.get("exploit_chain", []),
        }

        inputs = {
            "source_file": source_file,
            "vulnerability": vulnerability,
            "current_patch": None,
            "compiler_logs": None,
            "iteration_count": 0,
            "max_iterations": 3,
            "exploit_chain": channel.shared_context.get("exploit_chain", [])
        }
        graph_output = blue_coder_app.invoke(inputs)
        final_patch = graph_output.get("current_patch")

        blue_output = None
        if final_patch:
            blue_output = final_patch.model_dump() if hasattr(final_patch, 'model_dump') else str(final_patch)
            channel.log_system_event("Blue Coder Service",
                                     "LangGraph patch compile loops completed successfully.")
            channel.broadcast("PATCH_PROPOSED", {"patch": final_patch.model_dump()})
        else:
            blue_output = {"error": "No patch produced"}
            channel.log_system_event("Blue Coder Service",
                                     "CRITICAL: LangGraph loop failed to produce a valid compile fix.")

        channel.log_system_event("CONTEXT", f"Iteration {iter_num} context check:")
        show_context(channel)

        # Capture iteration data (red_in/red_out filled later by instrumentation hook)
        capture_iteration(iter_num, blue_input, blue_output, None, None)

    def show_context(channel):
        sc = channel.shared_context
        print(f"  [CONTEXT] vulnerability['description'] == original? "
              f"{sc['vulnerability']['description'] == sc['original_vulnerability']['description']}")
        print(f"  [CONTEXT] active_vulnerability == original? "
              f"{sc['active_vulnerability'] == sc['original_vulnerability']}")
        print(f"  [CONTEXT] exploit_chain entries: {len(sc.get('exploit_chain', []))}")
        for j, e in enumerate(sc.get("exploit_chain", [])):
            print(f"    [{j}] iter={e.get('iteration')} desc={e.get('description','')[:80]}")

    # 4. Define instrumented Red Auditor Service
    def instrumented_red_service(channel, payload):
        channel.log_system_event("Red Auditor Service",
                                 "Intercepted new patch proposal. Executing GoT analysis...")
        patch_obj = PatchProposal.model_validate(payload["patch"])
        orig_vuln_desc = channel.shared_context["original_vulnerability"]["description"]

        red_input = {
            "patch_id": patch_obj.patch_id,
            "patch_code": patch_obj.proposed_code,
            "original_vulnerability": orig_vuln_desc,
            "mesh_iteration": channel.shared_context["mesh_iteration"]
        }

        def record_failure(err):
            from datetime import datetime, timezone
            bt = channel.shared_context["benchmark_telemetry"]
            bt["audit_degradations"] = bt.get("audit_degradations", 0) + 1
            channel.shared_context.setdefault("agent_failures", []).append({
                "agent": "red_auditor",
                "failure_type": "AUDIT_DEGRADATION",
                "reason": str(err),
                "recovered": True,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
            channel.log_system_event("Red Auditor", "AUDIT_DEGRADATION recorded.")

        critique = execute_adversarial_audit(
            patch_obj, orig_vuln_desc,
            record_failure=record_failure
        )

        # Evidence grounding validation — reject hallucinated evidence
        source_file = channel.shared_context.get("source_file", {})
        source_code = source_file.get("raw_code", "") if isinstance(source_file, dict) else ""
        source_file_path = source_file.get("file_path", "") if isinstance(source_file, dict) else ""
        invalid_count, downgraded = critique.validate_evidence(source_code, source_file_path)

        red_output = critique.model_dump() if hasattr(critique, 'model_dump') else str(critique)

        # Update the last iteration's red data
        for it in reversed(ITERATIONS):
            if it["red_input"] is None:
                it["red_input"] = red_input
                it["red_output"] = red_output
                it["finding_type"] = red_output.get("finding_type")
                it["confidence"] = red_output.get("confidence")
                break

        channel.broadcast("AUDIT_COMPLETED", {"critique": red_output})

        channel.log_system_event("CONTEXT", f"Iteration {channel.shared_context['mesh_iteration']} post-audit context:")
        show_context(channel)

        # Log findings
        print(f"\n[DEBUG ITERATION {channel.shared_context['mesh_iteration']}] "
              f"Finding: {red_output.get('finding_type')} | "
              f"Confidence: {red_output.get('confidence')} | "
              f"is_secure: {red_output.get('is_secure')}")

        if critique.finding_type == "VERIFIED_EXPLOIT":
            evidence = red_output.get("evidence", [])
            print(f"[DEBUG] VERIFIED_EXPLOIT — Evidence count: {len(evidence)}")
            if evidence:
                for e in evidence:
                    print(f"  Evidence: {e.get('file')}:{e.get('line')} — {e.get('reason', '')[:100]}")
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
                                     "SPECULATIVE_RISK — No patch regeneration needed.")
        elif critique.finding_type == "INFORMATIONAL":
            channel.log_system_event("Red Auditor Service",
                                     "INFORMATIONAL — No patch regeneration needed.")

    # 5. Define instrumented Security Intelligence Service
    def instrumented_si_service(channel, payload):
        channel.log_system_event("Security Intelligence Service",
                                 "SECURITY_REPORT_REQUESTED received. Generating Security Intelligence Report...")
        try:
            report = generate_security_report(channel)
            channel.shared_context["security_report"] = report.model_dump()
            channel.log_system_event("Security Intelligence Service",
                                     f"Report generated: Score {report.security_score}/100, Risk {report.risk_level}")
            channel.broadcast("SECURITY_REPORT_GENERATED", {"report": report.model_dump()})
        except Exception as e:
            channel.log_system_event("Security Intelligence Service",
                                     f"REPORT GENERATION FAILED: {e}")
            import traceback
            traceback.print_exc()

    # 6. Subscribe instrumented services
    band_mesh.subscribe("VULNERABILITY_TRIAGED", instrumented_blue_service)
    band_mesh.subscribe("PATCH_PROPOSED", instrumented_red_service)
    band_mesh.subscribe("SECURITY_REPORT_REQUESTED", instrumented_si_service)

    # 7. Seed with problematic sample
    vulnerable_mock_file = FileContext(
        file_path="server/app.py",
        raw_code=PROBLEMATIC_SAMPLE_CODE,
        language="python"
    )
    detected_vulnerability = VulnerabilityReport(
        description=(
            "Multiple vulnerabilities detected in server/app.py: "
            "1) SQL Injection in get_user() via string concatenation, "
            "2) Path Traversal in delete_file() with unsanitized input, "
            "3) Command Injection in run_command() via os.system()"
        ),
        target_lines=[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        severity="CRITICAL"
    )

    print("\n--- Seeding Problematic Vulnerability Sample ---")
    band_mesh.shared_context["source_file"] = vulnerable_mock_file.model_dump()
    band_mesh.shared_context["vulnerability"] = detected_vulnerability.model_dump()
    band_mesh.shared_context["original_vulnerability"] = detected_vulnerability.model_dump()
    print("\n[CONTEXT] Initial context after seeding:")
    ov = band_mesh.shared_context["original_vulnerability"]
    v = band_mesh.shared_context["vulnerability"]
    print(f"  original_vulnerability description: {ov['description'][:80]}...")
    print(f"  vulnerability description:          {v['description'][:80]}...")
    print(f"  Equal? {ov['description'] == v['description']}")

    band_mesh.broadcast("VULNERABILITY_TRIAGED", {
        "source_file": vulnerable_mock_file.model_dump(),
        "vulnerability": detected_vulnerability.model_dump()
    })

    # 8. Terminal status mirror
    if band_mirror is not None:
        try:
            band_mirror.maybe_mirror_terminal_status(band_mesh.shared_context)
        except Exception as e:
            print(f"[DEBUG] Terminal status mirror failed: {e}")

    end_time = datetime.now(timezone.utc)
    total_runtime = (end_time - start_time).total_seconds()

    # =========================================================================
    # OUTPUT: Full execution metadata
    # =========================================================================
    print("\n" + "=" * 70)
    print("EXECUTION COMPLETE — CAPTURED METADATA")
    print("=" * 70)
    print(f"session_id:       {session_id}")
    print(f"start_time:       {start_time.isoformat()}")
    print(f"end_time:         {end_time.isoformat()}")
    print(f"total_runtime_s:  {total_runtime:.2f}")
    print(f"\n[CONTEXT] Final context after run:")
    ov = band_mesh.shared_context.get("original_vulnerability")
    v = band_mesh.shared_context.get("vulnerability")
    av = band_mesh.shared_context.get("active_vulnerability")
    if ov:
        print(f"  original_vulnerability description: {ov['description'][:80]}...")
    if v:
        print(f"  vulnerability description:          {v['description'][:80]}...")
    if av:
        print(f"  active_vulnerability description:   {av['description'][:80]}...")
    print(f"  vulnerability == original? {bool(v and ov and v['description'] == ov['description'])}")
    print(f"final_status:     {band_mesh.shared_context['status']}")
    print(f"mesh_iterations:  {band_mesh.shared_context['mesh_iteration']}")
    print(f"max_iterations:   {band_mesh.shared_context['max_mesh_iterations']}")
    print(f"exploit_chain:    {len(band_mesh.shared_context.get('exploit_chain', []))} entries")

    bt = band_mesh.shared_context.get("benchmark_telemetry", {})
    print(f"\nBenchmark Telemetry:")
    for k, v in bt.items():
        print(f"  {k}: {v}")

    print(f"\nAgent Failures: {len(band_mesh.shared_context.get('agent_failures', []))}")
    for f in band_mesh.shared_context.get("agent_failures", []):
        print(f"  [{f.get('agent')}] {f.get('failure_type', '')}: {f.get('reason', f.get('error', ''))}")

    print(f"\nAudit History: {len(band_mesh.shared_context.get('audit_history', []))} entries")
    for i, a in enumerate(band_mesh.shared_context.get("audit_history", [])):
        print(f"  Audit {i+1}: {a.get('finding_type')} | confidence={a.get('confidence')} | evidence={len(a.get('evidence', []))}")

    security_report = band_mesh.shared_context.get("security_report")
    if security_report:
        print(f"\nSecurity Report:")
        print(f"  Score: {security_report.get('security_score')}")
        print(f"  Risk Level: {security_report.get('risk_level')}")
        print(f"  Recommendation: {security_report.get('deployment_recommendation')}")
        print(f"  Confidence: {security_report.get('confidence')}")
    else:
        print(f"\nSecurity Report: NOT GENERATED (Assessment Pending)")

    # =========================================================================
    # Dump full context for dossier
    # =========================================================================
    dump = {
        "session_id": session_id,
        "start_time": start_time.isoformat(),
        "end_time": end_time.isoformat(),
        "total_runtime_s": total_runtime,
        "final_status": band_mesh.shared_context["status"],
        "mesh_iterations": band_mesh.shared_context["mesh_iteration"],
        "max_mesh_iterations": band_mesh.shared_context["max_mesh_iterations"],
        "iterations": ITERATIONS,
        "benchmark_telemetry": bt,
        "audit_history": band_mesh.shared_context.get("audit_history", []),
        "event_history": band_mesh.shared_context.get("event_history", []),
        "agent_failures": band_mesh.shared_context.get("agent_failures", []),
        "exploit_chain": band_mesh.shared_context.get("exploit_chain", []),
        "security_report": band_mesh.shared_context.get("security_report"),
        "original_vulnerability": band_mesh.shared_context.get("original_vulnerability"),
        "active_vulnerability": band_mesh.shared_context.get("active_vulnerability"),
        "latest_patch": band_mesh.shared_context.get("latest_patch"),
        "system_logs": band_mesh.shared_context.get("system_logs", []),
    }

    dump_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "run_dump.json")
    with open(dump_path, "w") as f:
        json.dump(dump, f, indent=2, default=str)
    print(f"\nFull state dump written to: {dump_path}")

    return band_mesh, dump


if __name__ == "__main__":
    instrumented_main()
