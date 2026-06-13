import uuid
from core.band_mesh import BandMeshChannel


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
        mesh.broadcast("AUDIT_COMPLETED", {"critique": {"is_secure": True}})
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
        mesh.broadcast("AUDIT_COMPLETED", {"critique": {"is_secure": True}})
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
        mesh.broadcast("AUDIT_COMPLETED", {"critique": {"is_secure": True}})
        e1 = mesh.shared_context["event_history"][0]
        e2 = mesh.shared_context["event_history"][1]
        e3 = mesh.shared_context["event_history"][2]
        assert e2["parent_event_id"] == e1["event_id"]
        assert e3["parent_event_id"] == e2["event_id"]

    def test_event_ids_are_unique(self):
        mesh = make_mesh()
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        mesh.broadcast("PATCH_PROPOSED", {"patch": {"patch_id": "p1"}})
        mesh.broadcast("AUDIT_COMPLETED", {"critique": {"is_secure": True}})
        ids = [e["event_id"] for e in mesh.shared_context["event_history"]]
        assert len(set(ids)) == len(ids)

    def test_last_event_id_tracks_latest_event(self):
        mesh = make_mesh()
        mesh.broadcast("VULNERABILITY_TRIAGED", vuln_payload())
        mesh.broadcast("PATCH_PROPOSED", {"patch": {"patch_id": "p1"}})
        latest = mesh.shared_context["event_history"][-1]["event_id"]
        assert mesh.shared_context["last_event_id"] == latest
