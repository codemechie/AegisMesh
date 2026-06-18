import uuid
from core.band_mesh import BandMeshChannel
from schemas.telemetry import BenchmarkTelemetry


def make_mesh():
    return BandMeshChannel(session_id=f"test-{uuid.uuid4()}")


def vuln_payload():
    return {
        "source_file": {"file_path": "test.py", "raw_code": "x=1", "language": "python"},
        "vulnerability": {"description": "bug", "target_lines": [1], "severity": "HIGH"}
    }


class TestSharedContextReliabilityFields:
    def test_shared_context_contains_reliability_fields(self):
        mesh = make_mesh()
        assert "mesh_iteration" in mesh.shared_context
        assert "max_mesh_iterations" in mesh.shared_context
        assert "agent_failures" in mesh.shared_context
        assert mesh.shared_context["mesh_iteration"] == 0
        assert mesh.shared_context["max_mesh_iterations"] == 8
        assert mesh.shared_context["agent_failures"] == []


class TestIterationCounting:
    def test_vulnerability_triaged_increments_iteration(self):
        mesh = make_mesh()
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        assert mesh.shared_context["mesh_iteration"] == 1
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        assert mesh.shared_context["mesh_iteration"] == 2


class TestEscalationGuard:
    def test_escalation_required_after_iteration_limit(self):
        mesh = make_mesh()
        mesh.shared_context["max_mesh_iterations"] = 2
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        assert mesh.shared_context["status"] == "ESCALATION_REQUIRED"


class TestListenerExceptionIsolation:
    def test_listener_exception_does_not_raise(self):
        mesh = make_mesh()

        def bad_listener(channel, payload):
            raise RuntimeError("boom")

        mesh.subscribe("PATCH_PROPOSED", bad_listener)
        mesh.broadcast("PATCH_PROPOSED", {"patch": {"patch_id": "p1"}})

    def test_listener_failure_recorded(self):
        mesh = make_mesh()

        def bad_listener(channel, payload):
            raise RuntimeError("boom")

        mesh.subscribe("PATCH_PROPOSED", bad_listener)
        mesh.broadcast("PATCH_PROPOSED", {"patch": {"patch_id": "p1"}})
        assert len(mesh.shared_context["agent_failures"]) == 1
        assert mesh.shared_context["agent_failures"][0]["event_type"] == "PATCH_PROPOSED"
        assert "boom" in mesh.shared_context["agent_failures"][0]["error"]

    def test_subsequent_listeners_still_execute(self):
        mesh = make_mesh()
        b_executed = []

        def listener_a(channel, payload):
            raise RuntimeError("fail")

        def listener_b(channel, payload):
            b_executed.append(True)

        mesh.subscribe("AUDIT_COMPLETED", listener_a)
        mesh.subscribe("AUDIT_COMPLETED", listener_b)
        mesh.broadcast("AUDIT_COMPLETED", {"critique": {"is_secure": True, "finding_type": "INFORMATIONAL"}})
        assert len(b_executed) == 1


class TestEventProvenance:
    def test_event_history_initializes_empty(self):
        mesh = make_mesh()
        assert mesh.shared_context["event_history"] == []

    def test_broadcast_appends_event_history(self):
        mesh = make_mesh()
        mesh.broadcast("PATCH_PROPOSED", {"patch": {"patch_id": "p1"}})
        assert len(mesh.shared_context["event_history"]) == 1
        assert mesh.shared_context["event_history"][0]["event_type"] == "PATCH_PROPOSED"

    def test_event_contains_metadata(self):
        mesh = make_mesh()
        mesh.broadcast("AUDIT_COMPLETED", {"critique": {"is_secure": True, "finding_type": "INFORMATIONAL"}})
        record = mesh.shared_context["event_history"][0]
        assert "event_id" in record
        assert "timestamp" in record
        assert "event_type" in record
        assert "payload" in record
        assert "parent_event_id" in record

    def test_first_event_has_no_parent(self):
        mesh = make_mesh()
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        assert mesh.shared_context["event_history"][0]["parent_event_id"] is None

    def test_subsequent_events_link_to_previous(self):
        mesh = make_mesh()
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        mesh.broadcast("PATCH_PROPOSED", {"patch": {"patch_id": "p1"}})
        mesh.broadcast("AUDIT_COMPLETED", {"critique": {"is_secure": True, "finding_type": "INFORMATIONAL"}})
        e1 = mesh.shared_context["event_history"][0]
        e2 = mesh.shared_context["event_history"][1]
        e3 = mesh.shared_context["event_history"][2]
        assert e2["parent_event_id"] == e1["event_id"]
        assert e3["parent_event_id"] == e2["event_id"]

    def test_event_ids_are_unique(self):
        mesh = make_mesh()
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        mesh.broadcast("PATCH_PROPOSED", {"patch": {"patch_id": "p1"}})
        mesh.broadcast("AUDIT_COMPLETED", {"critique": {"is_secure": True, "finding_type": "INFORMATIONAL"}})
        ids = [e["event_id"] for e in mesh.shared_context["event_history"]]
        assert len(set(ids)) == len(ids)

    def test_last_event_id_tracks_latest_event(self):
        mesh = make_mesh()
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        mesh.broadcast("PATCH_PROPOSED", {"patch": {"patch_id": "p1"}})
        latest = mesh.shared_context["event_history"][-1]["event_id"]
        assert mesh.shared_context["last_event_id"] == latest


class TestBenchmarkTelemetry:
    def test_telemetry_initializes_with_defaults(self):
        mesh = make_mesh()
        bt = mesh.shared_context["benchmark_telemetry"]
        assert bt["blue_model"] == "alibaba/qwen3-coder-480b-a35b-instruct"
        assert bt["red_model"] == "deepseek/deepseek-chat"
        assert bt["mesh_iterations"] == 0
        assert bt["verified_exploits"] == 0
        assert bt["speculative_risks"] == 0
        assert bt["informational_findings"] == 0
        assert bt["final_status"] is None
        assert bt["time_started"] is None
        assert bt["time_completed"] is None

    def test_time_started_set_on_first_event(self):
        mesh = make_mesh()
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        assert mesh.shared_context["benchmark_telemetry"]["time_started"] is not None

    def test_telemetry_tracks_iterations(self):
        mesh = make_mesh()
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        assert mesh.shared_context["benchmark_telemetry"]["mesh_iterations"] == 1

    def test_telemetry_counts_verified_exploit(self):
        mesh = make_mesh()
        mesh.broadcast("AUDIT_COMPLETED", {"critique": {
            "is_secure": False, "finding_type": "VERIFIED_EXPLOIT", "confidence": "HIGH",
            "evidence": [{"file": "x.py", "line": 1, "reason": "test"}]
        }})
        bt = mesh.shared_context["benchmark_telemetry"]
        assert bt["verified_exploits"] == 1
        assert bt["speculative_risks"] == 0
        assert bt["informational_findings"] == 0

    def test_telemetry_counts_speculative_risk(self):
        mesh = make_mesh()
        mesh.broadcast("AUDIT_COMPLETED", {"critique": {
            "is_secure": True, "finding_type": "SPECULATIVE_RISK", "confidence": "MEDIUM", "evidence": []
        }})
        bt = mesh.shared_context["benchmark_telemetry"]
        assert bt["verified_exploits"] == 0
        assert bt["speculative_risks"] == 1
        assert bt["informational_findings"] == 0

    def test_telemetry_counts_informational(self):
        mesh = make_mesh()
        mesh.broadcast("AUDIT_COMPLETED", {"critique": {
            "is_secure": True, "finding_type": "INFORMATIONAL", "confidence": "LOW", "evidence": []
        }})
        bt = mesh.shared_context["benchmark_telemetry"]
        assert bt["verified_exploits"] == 0
        assert bt["speculative_risks"] == 0
        assert bt["informational_findings"] == 1

    def test_telemetry_counts_all_types(self):
        mesh = make_mesh()
        mesh.broadcast("AUDIT_COMPLETED", {"critique": {
            "is_secure": False, "finding_type": "VERIFIED_EXPLOIT", "confidence": "HIGH",
            "evidence": [{"file": "x.py", "line": 1, "reason": "test"}]
        }})
        mesh.broadcast("AUDIT_COMPLETED", {"critique": {
            "is_secure": True, "finding_type": "SPECULATIVE_RISK", "confidence": "MEDIUM", "evidence": []
        }})
        mesh.broadcast("AUDIT_COMPLETED", {"critique": {
            "is_secure": True, "finding_type": "INFORMATIONAL", "confidence": "LOW", "evidence": []
        }})
        bt = mesh.shared_context["benchmark_telemetry"]
        assert bt["verified_exploits"] == 1
        assert bt["speculative_risks"] == 1
        assert bt["informational_findings"] == 1

    def test_final_status_secured_on_convergence(self):
        mesh = make_mesh()
        mesh.broadcast("AUDIT_COMPLETED", {"critique": {
            "is_secure": True, "finding_type": "SPECULATIVE_RISK", "confidence": "MEDIUM", "evidence": []
        }})
        assert mesh.shared_context["benchmark_telemetry"]["final_status"] == "SECURED"
        assert mesh.shared_context["benchmark_telemetry"]["time_completed"] is not None

    def test_final_status_escalation(self):
        mesh = make_mesh()
        mesh.shared_context["max_mesh_iterations"] = 1
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        assert mesh.shared_context["benchmark_telemetry"]["final_status"] == "ESCALATION_REQUIRED"
        assert mesh.shared_context["benchmark_telemetry"]["time_completed"] is not None

    def test_escalation_triggers_security_report_request(self):
        mesh = make_mesh()
        mesh.shared_context["max_mesh_iterations"] = 1
        si_invoked = []
        def si_listener(channel, payload):
            si_invoked.append(payload)
        mesh.subscribe("SECURITY_REPORT_REQUESTED", si_listener)
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        assert len(si_invoked) == 1
        assert si_invoked[0]["triggered_by"] == "ESCALATION_GUARD"
        assert si_invoked[0]["convergence_status"] == "ESCALATION_REQUIRED"

    def test_escalation_report_request_in_event_history(self):
        mesh = make_mesh()
        mesh.shared_context["max_mesh_iterations"] = 1
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        events = [e for e in mesh.shared_context["event_history"]
                  if e["event_type"] == "SECURITY_REPORT_REQUESTED"]
        assert len(events) == 1
        assert events[0]["payload"]["triggered_by"] == "ESCALATION_GUARD"

    def test_escalation_report_has_iteration_context(self):
        mesh = make_mesh()
        mesh.shared_context["max_mesh_iterations"] = 3
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        events = [e for e in mesh.shared_context["event_history"]
                  if e["event_type"] == "SECURITY_REPORT_REQUESTED"]
        assert len(events) == 1
        assert events[0]["payload"]["mesh_iteration"] == 4
        assert events[0]["payload"]["max_mesh_iterations"] == 3

    def test_convergence_still_triggers_security_report(self):
        mesh = make_mesh()
        si_invoked = []
        def si_listener(channel, payload):
            si_invoked.append(payload)
        mesh.subscribe("SECURITY_REPORT_REQUESTED", si_listener)
        mesh.broadcast("AUDIT_COMPLETED", {"critique": {
            "is_secure": True, "finding_type": "SPECULATIVE_RISK", "confidence": "MEDIUM", "evidence": []
        }})
        assert len(si_invoked) == 1
        assert si_invoked[0]["triggered_by"] == "AUDIT_COMPLETED"
        assert si_invoked[0]["convergence_status"] == "SECURED"

    def test_telemetry_has_all_required_fields(self):
        mesh = make_mesh()
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        mesh.broadcast("PATCH_PROPOSED", {"patch": {"patch_id": "p1"}})
        mesh.broadcast("AUDIT_COMPLETED", {"critique": {
            "is_secure": True, "finding_type": "INFORMATIONAL", "confidence": "LOW", "evidence": []
        }})
        bt = mesh.shared_context["benchmark_telemetry"]
        for key in ("blue_model", "red_model", "mesh_iterations", "verified_exploits",
                    "speculative_risks", "informational_findings", "audit_degradations",
                    "invalid_evidence_count", "evidence_downgrades", "final_status",
                    "time_started", "time_completed"):
            assert key in bt, f"Missing telemetry field: {key}"


class TestContextDriftPrevention:
    """Verify original vulnerability context is preserved across remediation iterations."""

    ORIGINAL_VULN = {"description": "Raw string concatenation in SQL query.", "target_lines": [1, 2], "severity": "HIGH"}

    def _exploit_payload(self, iteration: int):
        """Simulate a re-iteration broadcast with exploit context (as Red Auditor would emit)."""
        return {
            "source_file": {"file_path": "test.py", "raw_code": "x=1", "language": "python"},
            "vulnerability": self.ORIGINAL_VULN,
            "exploit_context": {
                "message": f"PREVIOUS PATCH EXPLOITED! Vector: sqli_escape_{iteration}",
                "severity": "CRITICAL",
                "exploit_found": f"sqli_escape_{iteration}",
                "iteration": iteration
            }
        }

    def test_original_vulnerability_preserved_across_iterations(self):
        mesh = make_mesh()
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        original = mesh.shared_context["original_vulnerability"]
        assert original["description"] == "bug"
        for i in range(1, 4):
            mesh.broadcast("VULNERABILITY_TRIAGED", self._exploit_payload(i))
            assert mesh.shared_context["original_vulnerability"] == original
            assert mesh.shared_context["original_vulnerability"]["description"] == "bug"

    def test_vulnerability_always_equals_original_never_mutated(self):
        mesh = make_mesh()
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        for i in range(1, 4):
            mesh.broadcast("VULNERABILITY_TRIAGED", self._exploit_payload(i))
            assert mesh.shared_context["vulnerability"]["description"] == "bug"
            assert mesh.shared_context["vulnerability"] == mesh.shared_context["original_vulnerability"]

    def test_active_vulnerability_always_equals_original(self):
        mesh = make_mesh()
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        for i in range(1, 4):
            mesh.broadcast("VULNERABILITY_TRIAGED", self._exploit_payload(i))
            assert mesh.shared_context["active_vulnerability"] == mesh.shared_context["original_vulnerability"]

    def test_exploit_chain_grows_with_exploit_context(self):
        mesh = make_mesh()
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        assert len(mesh.shared_context["exploit_chain"]) == 0
        mesh.broadcast("VULNERABILITY_TRIAGED", self._exploit_payload(1))
        assert len(mesh.shared_context["exploit_chain"]) == 1
        mesh.broadcast("VULNERABILITY_TRIAGED", self._exploit_payload(2))
        assert len(mesh.shared_context["exploit_chain"]) == 2
        mesh.broadcast("VULNERABILITY_TRIAGED", self._exploit_payload(3))
        assert len(mesh.shared_context["exploit_chain"]) == 3

    def test_exploit_chain_entry_format(self):
        mesh = make_mesh()
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        mesh.broadcast("VULNERABILITY_TRIAGED", self._exploit_payload(1))
        entry = mesh.shared_context["exploit_chain"][0]
        assert "description" in entry
        assert "severity" in entry
        assert "exploit_found" in entry
        assert "iteration" in entry
        assert "PREVIOUS PATCH EXPLOITED" in entry["description"]
        assert entry["severity"] == "CRITICAL"
        assert entry["exploit_found"] == "sqli_escape_1"
        assert entry["iteration"] == 1

    def test_exploit_chain_not_grown_without_exploit_context(self):
        mesh = make_mesh()
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        assert len(mesh.shared_context["exploit_chain"]) == 0

    def test_multiple_exploit_entries_have_correct_iterations(self):
        mesh = make_mesh()
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        for i in range(1, 4):
            mesh.broadcast("VULNERABILITY_TRIAGED", self._exploit_payload(i))
        for i, entry in enumerate(mesh.shared_context["exploit_chain"], 1):
            assert entry["iteration"] == i
            assert entry["exploit_found"] == f"sqli_escape_{i}"

    def test_exploit_chain_compatible_with_si_formatter(self):
        mesh = make_mesh()
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        mesh.broadcast("VULNERABILITY_TRIAGED", self._exploit_payload(1))
        mesh.broadcast("VULNERABILITY_TRIAGED", self._exploit_payload(2))
        from agents.security_intelligence.agent import _format_exploit_chain
        formatted = _format_exploit_chain(mesh.shared_context["exploit_chain"])
        assert "PREVIOUS PATCH EXPLOITED" in formatted
        assert "CRITICAL" in formatted
        assert formatted.startswith("  1.")
        assert "  2." in formatted

    def test_convergence_still_possible_after_reiterations(self):
        mesh = make_mesh()
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        mesh.broadcast("VULNERABILITY_TRIAGED", self._exploit_payload(1))
        mesh.broadcast("AUDIT_COMPLETED", {"critique": {
            "is_secure": True, "finding_type": "SPECULATIVE_RISK", "confidence": "MEDIUM", "evidence": []
        }})
        assert mesh.shared_context["status"] == "SECURED"
