"""
AegisMesh Model Benchmarking Harness - LIVE API MODE ONLY

Evaluates complete 3-agent architectures across model combinations
and vulnerability test cases using real AI/ML API calls.

Aborts if mock mode is detected. Does not substitute mock responses.
"""

import os
import sys
import time
import json
from datetime import datetime, timezone
from pathlib import Path

os.environ["USE_REAL_AI_ML_API"] = "TRUE"

if hasattr(sys.stdout, 'buffer'):
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from core.band_mesh import BandMeshChannel
from core.aiml_client import ai_client, MockChat
from schemas.models import FileContext, VulnerabilityReport
from main import (
    initialize_blue_coder_service,
    initialize_red_auditor_service,
    initialize_security_intelligence_service,
)

RESULTS_FILE = Path(__file__).resolve().parent.parent / "model_selection.txt"


TEST_CASES = [
    {
        "name": "sql_injection",
        "code": (
            "import sqlite3\n"
            "def get_user(name):\n"
            '    conn = sqlite3.connect("db.sqlite")\n'
            '    query = f"SELECT * FROM users WHERE name = \'{name}\'"\n'
            "    return conn.execute(query).fetchall()\n"
        ),
        "vulnerability": "SQL Injection via raw f-string concatenation in query building",
    },
    {
        "name": "command_injection",
        "code": (
            "import os\n"
            "def run_cmd(cmd):\n"
            '    os.system(f"ping {cmd}")\n'
        ),
        "vulnerability": "Command Injection via unsanitized input to os.system",
    },
    {
        "name": "path_traversal",
        "code": (
            "def read_file(filename):\n"
            '    with open(f"/var/data/{filename}") as f:\n'
            "        return f.read()\n"
        ),
        "vulnerability": "Path Traversal via unsanitized filename in file open",
    },
]

MODEL_COMBOS = [
    {
        "label": "qwen+deepseek+gpt4o",
        "blue": "alibaba/qwen3-coder-480b-a35b-instruct",
        "red": "deepseek/deepseek-chat",
        "si": "openai/gpt-4o",
    },
    {
        "label": "qwen+deepseek+deepseek",
        "blue": "alibaba/qwen3-coder-480b-a35b-instruct",
        "red": "deepseek/deepseek-chat",
        "si": "deepseek/deepseek-chat",
    },
    {
        "label": "deepseek+deepseek+deepseek",
        "blue": "deepseek/deepseek-chat",
        "red": "deepseek/deepseek-chat",
        "si": "deepseek/deepseek-chat",
    },
]


def _abort_if_mock():
    if isinstance(ai_client.chat, MockChat):
        print("\nFATAL: Mock mode detected. Benchmark requires live API calls.", flush=True)
        print("Set USE_REAL_AI_ML_API=TRUE and ensure AI_ML_API_KEY is configured.", flush=True)
        sys.exit(1)
    base_url = getattr(getattr(ai_client.chat, '_client', None), 'base_url', 'unknown')
    print(f"  API endpoint: {base_url}", flush=True)


def _get_patch_quality(result: dict) -> dict:
    sc = result.get("_shared_context", {})
    patch = sc.get("latest_patch")
    if patch is None:
        return {"patch_valid": False, "patch_code_length": 0, "patch_has_change": False}
    if hasattr(patch, "model_dump"):
        patch = patch.model_dump()
    code = patch.get("proposed_code", "")
    return {
        "patch_valid": True,
        "patch_code_length": len(code),
        "patch_has_change": len(code.strip()) > 0,
        "patch_id": patch.get("patch_id", ""),
    }


def _get_audit_quality(result: dict) -> dict:
    sc = result.get("_shared_context", {})
    history = sc.get("audit_history", [])
    findings = {"verified": 0, "speculative": 0, "informational": 0}
    for entry in history:
        ft = ""
        if isinstance(entry, dict):
            ft = entry.get("finding_type", "")
        elif hasattr(entry, "finding_type"):
            ft = entry.finding_type
        if "VERIFIED" in str(ft).upper():
            findings["verified"] += 1
        elif "SPECULATIVE" in str(ft).upper():
            findings["speculative"] += 1
        elif "INFO" in str(ft).upper():
            findings["informational"] += 1
    return findings


def _get_si_quality(result: dict) -> dict:
    sc = result.get("_shared_context", {})
    sr = sc.get("security_report")
    if sr is None:
        return {"report_generated": False}
    if hasattr(sr, "model_dump"):
        sr = sr.model_dump()
    return {
        "report_generated": True,
        "score": sr.get("security_score"),
        "risk": sr.get("risk_level"),
        "recommendation": sr.get("deployment_recommendation"),
        "confidence": sr.get("confidence"),
    }


def _safe_str(val, default=""):
    try:
        return str(val)
    except UnicodeEncodeError:
        return repr(val)


def run_single_benchmark(test_case: dict, combo: dict) -> dict:
    session_id = f"bench-live-{int(time.time() * 1e6)}"
    mesh = BandMeshChannel(session_id=session_id)

    start = time.time()

    initialize_blue_coder_service(mesh)
    initialize_red_auditor_service(mesh)
    initialize_security_intelligence_service(mesh)

    init_done = time.time()

    source_file = FileContext(
        file_path="bench_target.py",
        raw_code=test_case["code"],
        language="python",
    )
    vuln = VulnerabilityReport(
        description=test_case["vulnerability"],
        target_lines=[1],
        severity="HIGH",
    )

    broadcast_start = time.time()
    try:
        mesh.broadcast("VULNERABILITY_TRIAGED", {
            "source_file": source_file.model_dump(),
            "vulnerability": vuln.model_dump(),
        })
    except Exception as e:
        broadcast_done = time.time()
        return {
            "overall_result": "FAILED",
            "error": _safe_str(e),
            "test_case": test_case["name"],
            "model_combo": combo["label"],
            "blue_model": combo["blue"],
            "red_model": combo["red"],
            "si_model": combo["si"],
            "latency_init": round(init_done - start, 3),
            "latency_mesh": round(broadcast_done - broadcast_start, 3),
            "latency_total": round(broadcast_done - start, 3),
        }
    broadcast_done = time.time()

    sc = mesh.shared_context
    agent_fails = sc.get("agent_failures", [])
    bt = sc.get("benchmark_telemetry", {})

    failures = len(agent_fails)
    has_api_error = any(
        "API" in _safe_str(f.get("error", ""))
        or "ConnectionError" in _safe_str(f.get("error", ""))
        or "timeout" in _safe_str(f.get("error", "")).lower()
        or "400" in _safe_str(f.get("error", ""))
        or "500" in _safe_str(f.get("error", ""))
        for f in agent_fails
    ) if agent_fails else False
    overall = "FAILED" if has_api_error or failures > 2 else sc.get("status", "UNKNOWN")

    iterations = sc.get("mesh_iteration", 0)
    final_status = bt.get("final_status", "N/A")

    result = {
        "overall_result": overall,
        "test_case": test_case["name"],
        "model_combo": combo["label"],
        "blue_model": combo["blue"],
        "red_model": combo["red"],
        "si_model": combo["si"],
        "status": sc.get("status", "UNKNOWN"),
        "final_status": final_status,
        "mesh_iterations": iterations,
        "mesh_converged": sc.get("mesh_converged", False),
        "agent_failures": failures,
        "agent_failure_details": [_safe_str(f.get("error", "")) for f in agent_fails] if agent_fails else [],
        "latency_init": round(init_done - start, 3),
        "latency_mesh": round(broadcast_done - broadcast_start, 3),
        "latency_total": round(broadcast_done - start, 3),
        "verified_exploits": bt.get("verified_exploits", 0),
        "speculative_risks": bt.get("speculative_risks", 0),
        "informational_findings": bt.get("informational_findings", 0),
        "audit_degradations": bt.get("audit_degradations", 0),
        "audit_count": len(sc.get("audit_history", [])),
        "_shared_context": sc,
        "error": None,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    patch_q = _get_patch_quality(result)
    audit_q = _get_audit_quality(result)
    si_q = _get_si_quality(result)

    result.update(patch_q)
    result.update({f"audit_{k}": v for k, v in audit_q.items()})
    result.update({f"si_{k}": v for k, v in si_q.items()})

    return result


def format_result_line(result: dict) -> str:
    fields = [
        str(result.get("timestamp", "?")),
        str(result.get("test_case", "?")),
        str(result.get("model_combo", "?")),
        str(result.get("blue_model", "?")),
        str(result.get("red_model", "?")),
        str(result.get("si_model", "?")),
        str(result.get("overall_result", "?")),
        str(result.get("status", "?")),
        str(result.get("latency_total", 0)),
        str(result.get("latency_mesh", 0)),
        str(result.get("mesh_iterations", 0)),
        str(result.get("patch_valid", False)),
        str(result.get("patch_code_length", 0)),
        str(result.get("patch_id", "")),
        str(result.get("audit_verified", 0)),
        str(result.get("audit_speculative", 0)),
        str(result.get("audit_informational", 0)),
        str(result.get("audit_count", 0)),
        str(result.get("audit_degradations", 0)),
        str(result.get("si_report_generated", False)),
        str(result.get("si_score", "")),
        str(result.get("si_risk", "")),
        str(result.get("si_recommendation", "")),
        str(result.get("agent_failures", 0)),
    ]
    return "|".join(fields)


def write_header():
    if not RESULTS_FILE.exists():
        with open(RESULTS_FILE, "w", encoding="utf-8") as f:
            f.write("# AegisMesh Model Selection Benchmark - LIVE API\n")
            f.write("# timestamp|test_case|combo|blue|red|si|result|status|lat_total|lat_mesh|iters|patch_valid|patch_len|patch_id|audit_v|audit_s|audit_i|audit_n|deg|si_gen|si_score|si_risk|si_rec|failures\n")
            f.write("#\n")


def append_result(result: dict):
    failures = result.get("agent_failure_details", [])
    failed_block = ""
    if failures:
        failed_block = "  ERRORS: " + "; ".join(failures[:3])

    line = format_result_line(result)
    comment = (
        f"  # {result.get('test_case', '?')} / {result.get('model_combo', '?')}"
        f"  -> {result.get('overall_result', '?')}"
        f"  [{result.get('latency_total', '?')}s]"
        f"{failed_block}\n"
    )
    with open(RESULTS_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")
        f.write(comment)


def run_benchmark():
    print("=" * 72, flush=True)
    print("AegisMesh Model Benchmarking Harness - LIVE API", flush=True)
    print("=" * 72, flush=True)

    print("Verifying real API mode...", flush=True)
    _abort_if_mock()

    print(f"\nTest cases: {len(TEST_CASES)}", flush=True)
    print(f"Model combos: {len(MODEL_COMBOS)}", flush=True)
    print(f"Total runs: {len(TEST_CASES) * len(MODEL_COMBOS)}", flush=True)
    print("-" * 72, flush=True)

    write_header()

    stats = {"passed": 0, "failed": 0, "errors": 0}
    total = len(TEST_CASES) * len(MODEL_COMBOS)
    count = 0

    for combo in MODEL_COMBOS:
        combo_label = combo["label"]
        print(f"\n--- Model Combination: {combo_label} ---", flush=True)
        print(f"    Blue: {combo['blue']}", flush=True)
        print(f"    Red:  {combo['red']}", flush=True)
        print(f"    SI:   {combo['si']}", flush=True)

        for case in TEST_CASES:
            count += 1
            case_name = case["name"]
            print(f"\n[{count}/{total}] {case_name} ...", flush=True)

            start = time.time()
            result = run_single_benchmark(case, combo)
            elapsed = time.time() - start

            overall = result.get("overall_result", "ERROR")
            if overall == "FAILED":
                stats["failed"] += 1
                errs = result.get("agent_failure_details", [])
                err_str = errs[0] if errs else result.get("error", "unknown")
                print(f"  FAILED ({elapsed:.1f}s) - {err_str}", flush=True)
            elif "ERROR" in str(overall).upper() or result.get("error"):
                stats["errors"] += 1
                print(f"  ERROR ({elapsed:.1f}s) - {result.get('error', 'unknown')}", flush=True)
            else:
                stats["passed"] += 1
                pid = result.get("patch_id", "")[:20]
                pq = "[OK]" if result.get("patch_valid") else "[FAIL]"
                siq = "[OK]" if result.get("si_report_generated") else "[FAIL]"
                si_score = result.get("si_score", "?")
                print(
                    f"  {overall} ({elapsed:.1f}s)"
                    f"  patch={pq} si={siq}({si_score})"
                    f"  iters={result.get('mesh_iterations', '?')}"
                    f"  lat={result.get('latency_total', '?')}s"
                    f"  deg={result.get('audit_degradations', 0)}"
                    f"  pid={pid}",
                    flush=True,
                )

            append_result(result)

    print("\n" + "=" * 72, flush=True)
    print(f"Benchmark complete.  Passed: {stats['passed']}  Failed: {stats['failed']}  Errors: {stats['errors']}", flush=True)
    print(f"Results appended to {RESULTS_FILE}", flush=True)


if __name__ == "__main__":
    run_benchmark()
