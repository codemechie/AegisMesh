# core/band_mesh.py

from typing import Dict, List, Callable


class BandMeshChannel:
    """Simulates the enterprise BAND multi-agent shared-context communication bus."""

    def __init__(self, session_id: str):
        self.session_id = session_id
        # Shared telemetry state visible to all authenticated agents on the mesh
        self.shared_context: Dict = {
            "session_id": session_id,
            "status": "INITIALIZED",
            "source_file": None,
            "vulnerability": None,
            "latest_patch": None,
            "audit_history": [],
            "system_logs": []
        }
        # Event subscription registry for full-duplex agent communication
        self._listeners: Dict[str, List[Callable]] = {
            "VULNERABILITY_TRIAGED": [],
            "PATCH_PROPOSED": [],
            "AUDIT_COMPLETED": []
        }

    def log_system_event(self, agent_name: str, message: str):
        """Appends real-time telemetry logs for the Streamlit dashboard stream."""
        log_entry = f"[{agent_name.upper()}] {message}"
        print(f"[BAND MESH] {log_entry}")
        self.shared_context["system_logs"].append(log_entry)

    def subscribe(self, event_type: str, callback: Callable):
        """Allows an agent to listen for specific tasks dropped onto the mesh."""
        if event_type in self._listeners:
            self._listeners[event_type].append(callback)

    def broadcast(self, event_type: str, payload: dict):
        """Publishes a structured schema update onto the shared agentic layer."""
        self.log_system_event("Mesh Bus", f"Broadcasting {event_type} event payload...")

        # Synchronize central state memory based on the event payload types
        if event_type == "VULNERABILITY_TRIAGED":
            self.shared_context["source_file"] = payload["source_file"]
            self.shared_context["vulnerability"] = payload["vulnerability"]
            self.shared_context["status"] = "UNDER_REVIEW"
        elif event_type == "PATCH_PROPOSED":
            self.shared_context["latest_patch"] = payload["patch"]
            self.shared_context["status"] = "AUDITING"
        elif event_type == "AUDIT_COMPLETED":
            self.shared_context["audit_history"].append(payload["critique"])
            if payload["critique"]["is_secure"]:
                self.shared_context["status"] = "SECURED"
            else:
                self.shared_context["status"] = "PATCH_REJECTED"

        # Trigger all registered agent callbacks asynchronously / reactively
        for listener in self._listeners.get(event_type, []):
            listener(self, payload)
