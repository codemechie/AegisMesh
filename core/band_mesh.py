# core/band_mesh.py

import uuid
from datetime import datetime, timezone
from typing import Dict, List, Callable


class BandMeshChannel:
    """Simulates the enterprise BAND multi-agent shared-context communication bus."""

    def __init__(self, session_id: str):
        self.session_id = session_id
        # Shared telemetry state visible to all authenticated agents on the mesh
        from core.model_config import get_blue_model, get_red_model, get_si_model
        self.shared_context: Dict = {
            "session_id": session_id,
            "active_models": {
                "blue": get_blue_model(),
                "red": get_red_model(),
                "security_intelligence": get_si_model(),
            },
            "status": "INITIALIZED",
            "source_file": None,
            "vulnerability": None,
            "latest_patch": None,
            "audit_history": [],
            "system_logs": [],
            "mesh_iteration": 0,
            "max_mesh_iterations": 8,
            "agent_failures": [],
            "original_vulnerability": None,
            "active_vulnerability": None,
            "exploit_chain": [],
            "event_history": [],
            "last_event_id": None,
            "benchmark_telemetry": {
                "blue_model": "alibaba/qwen3-coder-480b-a35b-instruct",
                "red_model": "deepseek/deepseek-chat",
                "mesh_iterations": 0,
                "verified_exploits": 0,
                "speculative_risks": 0,
                "informational_findings": 0,
                "audit_degradations": 0,
                "final_status": None,
                "time_started": None,
                "time_completed": None
            }
        }
        # Event subscription registry for full-duplex agent communication
        self._listeners: Dict[str, List[Callable]] = {
            "VULNERABILITY_TRIAGED": [],
            "PATCH_PROPOSED": [],
            "AUDIT_COMPLETED": [],
            "SECURITY_REPORT_REQUESTED": [],
            "SECURITY_REPORT_GENERATED": []
        }

    def log_system_event(self, agent_name: str, message: str):
        """Appends real-time telemetry logs for the Streamlit dashboard stream."""
        log_entry = f"[{agent_name.upper()}] {message}"
        print(f"[BAND MESH] {log_entry}")
        self.shared_context["system_logs"].append(log_entry)

    def _record_agent_failure(self, agent_name: str, event_type: str, error_message: str):
        self.shared_context["agent_failures"].append({
            "agent": agent_name,
            "event_type": event_type,
            "error": error_message
        })
        self.log_system_event("Mesh Bus",
                              f"Listener failure on {event_type}: "
                              f"{agent_name} — {error_message}")

    def subscribe(self, event_type: str, callback: Callable):
        """Allows an agent to listen for specific tasks dropped onto the mesh."""
        if event_type in self._listeners:
            self._listeners[event_type].append(callback)

    def _update_benchmark_telemetry(self):
        bt = self.shared_context["benchmark_telemetry"]
        bt["mesh_iterations"] = self.shared_context["mesh_iteration"]

        counts = {"VERIFIED_EXPLOIT": 0, "SPECULATIVE_RISK": 0, "INFORMATIONAL": 0}
        for c in self.shared_context["audit_history"]:
            ft = c.get("finding_type")
            if ft in counts:
                counts[ft] += 1
        bt["verified_exploits"] = counts["VERIFIED_EXPLOIT"]
        bt["speculative_risks"] = counts["SPECULATIVE_RISK"]
        bt["informational_findings"] = counts["INFORMATIONAL"]
        bt["audit_degradations"] = sum(
            1 for f in self.shared_context.get("agent_failures", [])
            if f.get("failure_type") == "AUDIT_DEGRADATION"
        )

        if self.shared_context["status"] in ("SECURED", "ESCALATION_REQUIRED"):
            bt["final_status"] = bt["final_status"] or self.shared_context["status"]
            bt["time_completed"] = bt["time_completed"] or datetime.now(timezone.utc).isoformat()

    def _validate_active_models(self):
        am = self.shared_context.get("active_models", {})
        required = {"blue", "red", "security_intelligence"}
        missing = required - set(am.keys())
        empty = [k for k in required if k in am and not am[k]]
        if missing or empty:
            msg = []
            if missing:
                msg.append(f"Missing model keys: {missing}")
            if empty:
                msg.append(f"Empty model values: {empty}")
            raise RuntimeError(f"Active model validation failed: {'; '.join(msg)}. "
                               "Set BLUE_MODEL, RED_MODEL, SECURITY_INTELLIGENCE_MODEL env vars.")
        self.log_system_event("Mesh Bus", f"Active models validated: blue={am['blue']}, red={am['red']}, security_intelligence={am['security_intelligence']}")

    def broadcast(self, event_type: str, payload: dict):
        """Publishes a structured schema update onto the shared agentic layer."""
        if event_type == "VULNERABILITY_TRIAGED" and self.shared_context["mesh_iteration"] == 0:
            self._validate_active_models()
        self.log_system_event("Mesh Bus", f"Broadcasting {event_type} event payload...")
        event_id = str(uuid.uuid4())
        parent_event_id = self.shared_context["last_event_id"]
        self.shared_context["event_history"].append({
            "event_id": event_id,
            "parent_event_id": parent_event_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event_type": event_type,
            "payload": payload
        })
        self.shared_context["last_event_id"] = event_id

        # Synchronize central state memory based on the event payload types
        if event_type == "VULNERABILITY_TRIAGED":
            self.shared_context["mesh_iteration"] += 1
            if self.shared_context["benchmark_telemetry"]["time_started"] is None:
                self.shared_context["benchmark_telemetry"]["time_started"] = datetime.now(timezone.utc).isoformat()
            if self.shared_context["mesh_iteration"] > self.shared_context["max_mesh_iterations"]:
                self.shared_context["status"] = "ESCALATION_REQUIRED"
                self._update_benchmark_telemetry()
                self.log_system_event("Mesh Bus",
                                      f"ESCALATION_REQUIRED — iteration {self.shared_context['mesh_iteration']} "
                                      f"exceeded max {self.shared_context['max_mesh_iterations']}. "
                                      f"Iteration guard engaged. Blocking further dispatch.")
                return
            incoming = payload["vulnerability"]
            if self.shared_context["original_vulnerability"] is not None and incoming != self.shared_context["original_vulnerability"]:
                if not self.shared_context["exploit_chain"] or self.shared_context["exploit_chain"][-1] != incoming:
                    self.shared_context["exploit_chain"].append(incoming)
            self.shared_context["source_file"] = payload["source_file"]
            self.shared_context["vulnerability"] = incoming
            self.shared_context["active_vulnerability"] = incoming
            if self.shared_context["original_vulnerability"] is None:
                self.shared_context["original_vulnerability"] = incoming
            self.shared_context["status"] = "UNDER_REVIEW"
        elif event_type == "PATCH_PROPOSED":
            self.shared_context["latest_patch"] = payload["patch"]
            self.shared_context["status"] = "AUDITING"
        elif event_type == "AUDIT_COMPLETED":
            self.shared_context["audit_history"].append(payload["critique"])
            ft = payload["critique"]["finding_type"]
            if ft == "VERIFIED_EXPLOIT":
                self.shared_context["status"] = "PATCH_REJECTED"
            else:
                self.shared_context["status"] = "SECURED"
                self.broadcast("SECURITY_REPORT_REQUESTED", {
                    "triggered_by": "AUDIT_COMPLETED",
                    "convergence_status": "SECURED",
                    "mesh_iteration": self.shared_context["mesh_iteration"],
                    "source_audit": payload["critique"]
                })

        self._update_benchmark_telemetry()

        # Trigger all registered agent callbacks asynchronously / reactively
        for listener in self._listeners.get(event_type, []):
            try:
                listener(self, payload)
            except Exception as e:
                name = getattr(listener, "__name__", None)
                if name is None:
                    name = getattr(getattr(listener, "__class__", None), "__name__", "unknown_listener")
                self._record_agent_failure(name, event_type, str(e))
