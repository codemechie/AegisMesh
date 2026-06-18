"""
Evidence Validation Audit Harness
Runs the AegisMesh 10 times with varied vulnerability seeds.
Collects evidence validation stats for every VERIFIED_EXPLOIT finding.
Generates debug/EVIDENCE_VALIDATION_AUDIT.md
"""
import sys, os, json, textwrap, time, uuid
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.band_mesh import BandMeshChannel
from core.model_config import get_blue_model, get_red_model, get_si_model
from schemas.models import FileContext, VulnerabilityReport, PatchProposal
from agents.blue_coder.agent import blue_coder_app
from agents.red_auditor.engine import execute_adversarial_audit
from agents.security_intelligence.agent import generate_security_report

# =========================================================================
# 10 VARIED VULNERABILITY SAMPLES
# =========================================================================
SAMPLES = [
    {  # 1: SQL Injection
        "file_path": "server/db.py",
        "raw_code": textwrap.dedent("""\
            import sqlite3
            def get_user(username):
                conn = sqlite3.connect('app.db')
                cur = conn.cursor()
                query = "SELECT * FROM users WHERE name = '" + username + "'"
                cur.execute(query)
                return cur.fetchone()
        """),
        "language": "python",
        "vuln_description": "SQL Injection in get_user(): unsanitized string concatenation in SQL query.",
        "severity": "CRITICAL",
        "target_lines": [5, 6]
    },
    {  # 2: Path Traversal
        "file_path": "server/files.py",
        "raw_code": textwrap.dedent("""\
            import os
            def read_log(name):
                path = "/var/logs/" + name
                if os.path.exists(path):
                    with open(path) as f:
                        return f.read()
                return ""
        """),
        "language": "python",
        "vuln_description": "Path Traversal in read_log(): unsanitized filename concatenation allows directory escape.",
        "severity": "HIGH",
        "target_lines": [3, 4]
    },
    {  # 3: Command Injection
        "file_path": "server/exec.py",
        "raw_code": textwrap.dedent("""\
            import os
            def ping_host(host):
                os.system("ping -c 1 " + host)
        """),
        "language": "python",
        "vuln_description": "Command Injection in ping_host(): unsanitized host passed to os.system().",
        "severity": "CRITICAL",
        "target_lines": [2, 3]
    },
    {  # 4: XSS
        "file_path": "server/render.py",
        "raw_code": textwrap.dedent("""\
            def render_page(username):
                html = "<html><body>Hello " + username + "</body></html>"
                return html
        """),
        "language": "python",
        "vuln_description": "Cross-Site Scripting in render_page(): unsanitized username concatenated into HTML.",
        "severity": "HIGH",
        "target_lines": [2]
    },
    {  # 5: Insecure Deserialization
        "file_path": "server/data.py",
        "raw_code": textwrap.dedent("""\
            import pickle
            def load_config(raw):
                return pickle.loads(raw)
        """),
        "language": "python",
        "vuln_description": "Insecure Deserialization in load_config(): pickle.loads() on untrusted input allows RCE.",
        "severity": "CRITICAL",
        "target_lines": [2, 3]
    },
    {  # 6: Hardcoded Credentials
        "file_path": "server/auth.py",
        "raw_code": textwrap.dedent("""\
            API_SECRET = "sk-live-abcdef1234567890"
            DB_PASSWORD = "password123"
            def authenticate(token):
                return token == API_SECRET
        """),
        "language": "python",
        "vuln_description": "Hardcoded credentials: API secret and database password exposed in source code.",
        "severity": "HIGH",
        "target_lines": [1, 2]
    },
    {  # 7: CSRF
        "file_path": "server/transfer.py",
        "raw_code": textwrap.dedent("""\
            from flask import request
            def transfer_money():
                to = request.form["to"]
                amount = request.form["amount"]
                execute_transfer(to, amount)
                return "OK"
        """),
        "language": "python",
        "vuln_description": "Missing CSRF protection in transfer_money(): no token validation on state-changing endpoint.",
        "severity": "MEDIUM",
        "target_lines": [3, 4, 5]
    },
    {  # 8: XXE
        "file_path": "server/xmlparser.py",
        "raw_code": textwrap.dedent("""\
            import xml.etree.ElementTree as ET
            def parse_config(xml_data):
                root = ET.fromstring(xml_data)
                return root.findtext("secret")
        """),
        "language": "python",
        "vuln_description": "XXE in parse_config(): XML parsing with external entities enabled, allows file disclosure.",
        "severity": "HIGH",
        "target_lines": [2, 3]
    },
    {  # 9: SSRF
        "file_path": "server/fetch.py",
        "raw_code": textwrap.dedent("""\
            import requests
            def fetch_url(url):
                resp = requests.get(url, timeout=5)
                return resp.text
        """),
        "language": "python",
        "vuln_description": "SSRF in fetch_url(): user-controlled URL passed to requests.get() without validation.",
        "severity": "HIGH",
        "target_lines": [2, 3]
    },
    {  # 10: eval() Injection
        "file_path": "server/calc.py",
        "raw_code": textwrap.dedent("""\
            def calculate(expr):
                return eval(expr)
        """),
        "language": "python",
        "vuln_description": "Code Injection in calculate(): user-supplied expression passed to eval() allows arbitrary code execution.",
        "severity": "CRITICAL",
        "target_lines": [1, 2]
    },
]

# =========================================================================
# EVIDENCE AUDIT LOG
# =========================================================================
evidence_log = []
errors = []


def run_once(sample, run_number):
    """Run the mesh once with the given sample and collect evidence stats."""
    session_id = f"audit-run-{run_number}-{uuid.uuid4().hex[:8]}"
    mesh = BandMeshChannel(session_id=session_id)
    mesh.shared_context["active_models"] = {
        "blue": get_blue_model(),
        "red": get_red_model(),
        "security_intelligence": get_si_model(),
    }

    run_entries = []

    vulnerable_file = FileContext(
        file_path=sample["file_path"],
        raw_code=sample["raw_code"],
        language=sample["language"]
    )
    vulnerability = VulnerabilityReport(
        description=sample["vuln_description"],
        target_lines=sample["target_lines"],
        severity=sample["severity"]
    )

    # Blue Coder
    def blue_service(channel, payload):
        source_file = FileContext.model_validate(payload["source_file"])
        vuln = VulnerabilityReport.model_validate(payload["vulnerability"])
        inputs = {
            "source_file": source_file,
            "vulnerability": vuln,
            "current_patch": None,
            "compiler_logs": None,
            "iteration_count": 0,
            "max_iterations": 3,
            "exploit_chain": channel.shared_context.get("exploit_chain", [])
        }
        graph_out = blue_coder_app.invoke(inputs)
        final_patch = graph_out.get("current_patch")
        if final_patch:
            channel.broadcast("PATCH_PROPOSED", {"patch": final_patch.model_dump()})

    # Red Auditor with evidence capture
    def red_service(channel, payload):
        patch_obj = PatchProposal.model_validate(payload["patch"])
        orig_vuln_desc = channel.shared_context["original_vulnerability"]["description"]

        def record_failure(err):
            pass

        critique = execute_adversarial_audit(
            patch_obj, orig_vuln_desc,
            record_failure=record_failure
        )

        source_file_data = channel.shared_context.get("source_file", {})
        source_code = source_file_data.get("raw_code", "") if isinstance(source_file_data, dict) else ""
        source_file_path = source_file_data.get("file_path", "") if isinstance(source_file_data, dict) else ""
        original_finding_type = critique.finding_type
        evidence_before = [
            {"file": e.file, "line": e.line, "reason": e.reason[:80]} for e in critique.evidence
        ]
        total_evidence_before = len(critique.evidence)
        invalid_count, downgraded = critique.validate_evidence(source_code, source_file_path)

        valid_evidence = len(critique.evidence)
        total_evidence = total_evidence_before
        mesh_iter = channel.shared_context["mesh_iteration"]

        evidence_entry = {
            "run": run_number,
            "sample_type": sample["vuln_description"][:50],
            "iteration": mesh_iter,
            "original_finding_type": original_finding_type,
            "finding_type": critique.finding_type,
            "total_evidence": total_evidence,
            "valid_evidence": valid_evidence,
            "invalid_evidence": invalid_count,
            "downgraded": downgraded,
            "downgrade_decision": "Downgraded to SPECULATIVE_RISK" if downgraded else "No downgrade needed",
            "final_classification": "SPECULATIVE_RISK (downgraded)" if downgraded else critique.finding_type,
            "evidence_details": evidence_before
        }
        run_entries.append(evidence_entry)

        channel.broadcast("AUDIT_COMPLETED", {"critique": critique.model_dump()})

        if critique.finding_type == "VERIFIED_EXPLOIT":
            channel.broadcast("VULNERABILITY_TRIAGED", {
                "source_file": channel.shared_context["source_file"],
                "vulnerability": channel.shared_context["original_vulnerability"],
                "exploit_context": {
                    "message": f"PREVIOUS PATCH EXPLOITED! Vector: {critique.exploit_found}" if critique.exploit_found else "Patch exploited",
                    "severity": "CRITICAL",
                    "exploit_found": critique.exploit_found or "",
                    "iteration": channel.shared_context["mesh_iteration"]
                }
            })

    # Security Intelligence
    def si_service(channel, payload):
        try:
            report = generate_security_report(channel)
            channel.shared_context["security_report"] = report.model_dump()
            channel.broadcast("SECURITY_REPORT_GENERATED", {"report": report.model_dump()})
        except Exception as e:
            pass

    mesh.subscribe("VULNERABILITY_TRIAGED", blue_service)
    mesh.subscribe("PATCH_PROPOSED", red_service)
    mesh.subscribe("SECURITY_REPORT_REQUESTED", si_service)

    mesh.broadcast("VULNERABILITY_TRIAGED", {
        "source_file": vulnerable_file.model_dump(),
        "vulnerability": vulnerability.model_dump()
    })

    return run_entries, mesh


def main():
    start_time = time.time()
    print("=" * 70)
    print("EVIDENCE VALIDATION AUDIT — 10 RUNS")
    print("=" * 70)
    print(f"Blue Model: {get_blue_model()}")
    print(f"Red Model:  {get_red_model()}")
    print(f"SI Model:   {get_si_model()}")
    print()

    all_entries = []

    for run_num, sample in enumerate(SAMPLES, 1):
        run_start = time.time()
        print(f"[Run {run_num}/10] Seeding: {sample['file_path']} — {sample['vuln_description'][:60]}...")
        try:
            entries, mesh = run_once(sample, run_num)
            elapsed = time.time() - run_start
            print(f"  Completed in {elapsed:.1f}s — {mesh.shared_context['status']} — {len(entries)} finding(s)")
            for e in entries:
                print(f"    Iter {e['iteration']}: {e['finding_type']} | ev={e['total_evidence']} "
                      f"valid={e['valid_evidence']} invalid={e['invalid_evidence']} "
                      f"downgraded={e['downgraded']}")
            all_entries.extend(entries)
        except Exception as ex:
            elapsed = time.time() - run_start
            print(f"  FAILED after {elapsed:.1f}s: {ex}")
            errors.append({"run": run_num, "error": str(ex)})

    total_time = time.time() - start_time
    print(f"\nAll runs completed in {total_time:.1f}s")

    # =========================================================================
    # GENERATE REPORT
    # =========================================================================
    total_iterations = len(all_entries)
    verified_exploits = [e for e in all_entries if e["original_finding_type"] == "VERIFIED_EXPLOIT"]
    downgraded = [e for e in all_entries if e["downgraded"]]
    total_evidence_items = sum(e["total_evidence"] for e in all_entries)
    invalid_evidence_items = sum(e["invalid_evidence"] for e in all_entries)
    hallucination_rate = (invalid_evidence_items / total_evidence_items * 100) if total_evidence_items else 0

    lines = []
    def w(s=""):
        lines.append(s)

    w("# Evidence Validation Audit")
    w()
    w("Auto-generated by `debug/run_evidence_audit.py` — 10 runs with varied vulnerability seeds.")
    w()
    w("## Summary")
    w()
    w("| Metric | Value |")
    w("|--------|-------|")
    w(f"| Total Runs | {len(SAMPLES)} |")
    w(f"| Total Mesh Iterations | {total_iterations} |")
    w(f"| Total VERIFIED_EXPLOIT Findings | {len(verified_exploits)} |")
    w(f"| Downgraded to SPECULATIVE_RISK | {len(downgraded)} |")
    w(f"| Total Evidence Items Submitted | {total_evidence_items} |")
    w(f"| Invalid (Hallucinated) Evidence Items | {invalid_evidence_items} |")
    w(f"| Evidence Hallucination Rate | {hallucination_rate:.1f}% |")
    w(f"| Total Runtime | {total_time:.1f}s |")
    if errors:
        w(f"| Failed Runs | {len(errors)} |")
    w()
    w("## Per-Run Breakdown")
    w()

    for run_num, sample in enumerate(SAMPLES, 1):
        run_entries = [e for e in all_entries if e["run"] == run_num]
        w(f"### Run {run_num} — {sample['file_path']}")
        w()
        w(f"**Vulnerability:** {sample['vuln_description']}")
        w()
        w(f"```python")
        w(f"{sample['raw_code'].rstrip()}")
        w(f"```")
        w()
        if not run_entries:
            w("*No audit findings recorded (run may have failed).*")
            w()
            continue
        w("| Iter | Original Finding | Tot Ev | Valid Ev | Invalid Ev | Downgraded? | Final Classification |")
        w("|------|-----------------|--------|----------|------------|-------------|---------------------|")
        for e in run_entries:
            w(f"| {e['iteration']} | {e['original_finding_type']} | {e['total_evidence']} | "
              f"{e['valid_evidence']} | {e['invalid_evidence']} | "
              f"{'Yes' if e['downgraded'] else 'No'} | {e['final_classification']} |")
        w()

    findings_with_evidence = [e for e in all_entries if e["evidence_details"]]
    if findings_with_evidence:
        w("## Hallucination Analysis (Findings With Evidence)")
        w()
        w("| Run | Iter | Original Finding | File Claimed | Line Claimed | Source File | Actual Lines | Valid? |")
        w("|-----|------|-----------------|-------------|-------------|-------------|--------------|--------|")
        for e in findings_with_evidence:
            run_num = e["run"]
            sample = SAMPLES[run_num - 1]
            source_lines = len(sample["raw_code"].splitlines())
            for det in e["evidence_details"]:
                is_real = 1 <= det["line"] <= source_lines and det["file"] == sample["file_path"]
                w(f"| {e['run']} | {e['iteration']} | {e['original_finding_type']} | "
                  f"{det['file']} | {det['line']} | "
                  f"{sample['file_path']} | {source_lines} | "
                  f"{'[VALID]' if is_real else '[INVALID]'} |")
        w()

    w("## Full Evidence Detail (All Findings)")
    w()
    w("| Run | Sample | Iter | Original Finding | Final | Tot Ev | Valid | Invalid | Downgraded? | Evidence Items |")
    w("|-----|--------|------|-----------------|-------|--------|-------|---------|-------------|---------------|")
    for e in all_entries:
        sample_label = SAMPLES[e["run"] - 1]["file_path"]
        detail = "; ".join(f"{d['file']}:{d['line']}" for d in e["evidence_details"]) if e["evidence_details"] else "(none)"
        w(f"| {e['run']} | {sample_label} | {e['iteration']} | {e['original_finding_type']} | "
          f"{e['final_classification']} | {e['total_evidence']} | {e['valid_evidence']} | {e['invalid_evidence']} | "
          f"{'Yes' if e['downgraded'] else 'No'} | {detail} |")
    w()

    if errors:
        w("## Errors")
        w()
        w("| Run | Error |")
        w("|-----|-------|")
        for err in errors:
            w(f"| {err['run']} | {err['error']} |")
        w()

    w("---")
    w()
    w(f"*Report generated at {datetime.now(timezone.utc).isoformat()}*")

    report_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "EVIDENCE_VALIDATION_AUDIT.md")
    with open(report_path, "w") as f:
        f.write("\n".join(lines))
    print(f"\nReport written to: {report_path}")


if __name__ == "__main__":
    main()
