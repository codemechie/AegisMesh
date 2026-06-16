import json
import logging

from .band_client import BandClient
from .band_room_manager import BandRoomManager

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Agent styling for human-readable BAND messages
# ---------------------------------------------------------------------------
AGENT_STYLE = {
    "blue": ("BlueCoderAgent", "\U0001F7E6"),
    "red": ("RedAuditorAgent", "\U0001F7E5"),
    "si": ("SecurityIntelligence", "\U0001F7E8"),
}

# ---------------------------------------------------------------------------
# Event mirror configuration
# Each entry maps a shared_context event_type to its mirror behaviour.
# ---------------------------------------------------------------------------
EVENT_MIRROR_CONFIG = {
    "VULNERABILITY_TRIAGED": {
        "display": "VULNERABILITY_TRIAGED",
        "emoji": "\U0001F50D",
        "mention_key": None,
        "agent_key": None,
    },
    "PATCH_PROPOSED": {
        "display": "PATCH_GENERATED",
        "emoji": "\U0001F6E0",
        "mention_key": "red",
        "agent_key": "blue",
    },
    "AUDIT_COMPLETED": {
        "display": "AUDIT_COMPLETED",
        "emoji": "\U0001F50E",
        "mention_key": "si",
        "agent_key": "red",
    },
    "SECURITY_REPORT_GENERATED": {
        "display": "SECURITY_REPORT_GENERATED",
        "emoji": "\U0001F4CB",
        "mention_key": "blue",
        "agent_key": "si",
    },
}

# Status-based events (not real broadcast events)
TERMINAL_EVENTS = {
    "SECURED": {
        "display": "SECURED",
        "emoji": "\u2705",
        "mention_key": None,
    },
    "ESCALATION_REQUIRED": {
        "display": "ESCALATION_REQUIRED",
        "emoji": "\u26A0\uFE0F",
        "mention_key": None,
    },
}


class BandEventMirror:
    """Mirrors AegisMesh execution events to a BAND room.

    Hooks into the existing broadcast/subscribe pattern in
    BandMeshChannel.  Every mirror operation is wrapped in try/except
    so that a BAND failure never blocks the mesh.

    Usage::

        client = BandClient()
        manager = BandRoomManager(client)
        mirror = BandEventMirror(client, manager)
        mirror.setup(mesh)           # subscribe to all events
        # ... run mesh ...
        mirror.maybe_mirror_terminal_status(mesh.shared_context)
    """

    def __init__(
        self, client: BandClient, room_manager: BandRoomManager
    ):
        self._client = client
        self._room_manager = room_manager
        self._mirrored_statuses: set[str] = set()

        # Telemetry counters (also stored in shared_context band_telemetry)
        self.band_room_created: int = 0
        self.band_messages_sent: int = 0
        self.band_failures: int = 0

    # ------------------------------------------------------------------
    # Setup — subscribe to all mesh events
    # ------------------------------------------------------------------
    def setup(self, mesh) -> None:
        """Subscribe to every event type in EVENT_MIRROR_CONFIG.

        Call this *before* agent service initialisation so the mirror
        callback fires first (ensuring the room exists before agents
        begin processing).
        """
        for event_type in EVENT_MIRROR_CONFIG:
            mesh.subscribe(
                event_type, self._make_mirror_callback(event_type)
            )

    # ------------------------------------------------------------------
    # Terminal status mirroring (called after broadcast() returns)
    # ------------------------------------------------------------------
    def maybe_mirror_terminal_status(self, shared_context: dict) -> None:
        """Mirror SECURED or ESCALATION_REQUIRED if not already done.

        These statuses are set inside broadcast() but are not themselves
        broadcast events, so they must be handled post-hoc.
        """
        status = shared_context.get("status")
        if status in TERMINAL_EVENTS and status not in self._mirrored_statuses:
            self._mirror_status_event(status, shared_context)

    # ------------------------------------------------------------------
    # Internal — create mirror callback for an event type
    # ------------------------------------------------------------------
    def _make_mirror_callback(self, event_type: str):
        config = EVENT_MIRROR_CONFIG[event_type]

        def mirror(channel, payload):
            try:
                # ---- Phase 1: ensure room exists (once per session) ----
                if not self._room_manager.is_ready:
                    self._ensure_room(channel)

                # ---- Phase 2: build and send the mirrored message ----
                mention_ids = self._resolve_mention_ids(config)
                content = self._format_event_message(config, payload)

                success, msg_id = self._client.send_message(
                    self._room_manager.room_id,
                    content,
                    mention_ids=mention_ids,
                )
                if success:
                    self.band_messages_sent += 1
                else:
                    self.band_failures += 1

                # ---- Phase 3: update shared_context telemetry ----
                self._sync_telemetry(channel)

                # ---- Phase 4: detect SECURED terminal status ----
                if (
                    channel.shared_context.get("status") == "SECURED"
                    and "SECURED" not in self._mirrored_statuses
                ):
                    self._mirror_status_event(
                        "SECURED", channel.shared_context
                    )

            except Exception as exc:
                self.band_failures += 1
                logger.warning(
                    "BAND mirror failed for %s: %s", event_type, exc
                )
                self._record_failure(channel, event_type, exc)

        return mirror

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------
    def _ensure_room(self, channel) -> None:
        """Create the BAND room and set shared_context fields."""
        participant_ids = [
            self._client.agent_id,
            self._client.red_agent_id,
            self._client.si_agent_id,
        ]
        participant_ids = [pid for pid in participant_ids if pid]

        session_id = channel.shared_context.get("session_id", "unknown")
        ok, room_id = self._room_manager.ensure_room(
            session_id, participant_ids
        )
        if ok:
            self.band_room_created = 1
        channel.shared_context["band_room_id"] = self._room_manager.room_id
        channel.shared_context["band_room_url"] = self._room_manager.room_url

    def _resolve_mention_ids(
        self, config: dict
    ) -> list[str] | None:
        mention_key = config.get("mention_key")
        if mention_key is None:
            return None
        agent_id_map = {
            "blue": self._client.agent_id,
            "red": self._client.red_agent_id,
            "si": self._client.si_agent_id,
        }
        mid = agent_id_map.get(mention_key)
        return [mid] if mid else None

    def _format_event_message(
        self, config: dict, payload: dict
    ) -> str:
        """Build a concise, human-readable BAND message from the event payload.

        Full payload data remains in shared_context.  Only key fields
        are mirrored to BAND for judge-friendly readability.
        """
        agent_key = config.get("agent_key")
        if agent_key and agent_key in AGENT_STYLE:
            name, emoji = AGENT_STYLE[agent_key]
            header = f"{emoji} {name}"
        else:
            header = config.get("emoji", "") or ""

        display = config["display"]
        summary = self._summarize_payload(display, payload)
        body = json.dumps(summary, indent=2)

        parts = [p for p in (header, display, body) if p]
        return "\n\n".join(parts)

    def _summarize_payload(
        self, display: str, payload: dict
    ) -> dict:
        """Extract only the human-relevant fields from an event payload.

        The full payload is always preserved in shared_context.
        This method returns a lightweight dict suitable for BAND.
        """
        if display == "VULNERABILITY_TRIAGED":
            vuln = payload.get("vulnerability", {})
            return {
                "event": display,
                "vulnerability": vuln.get("description", ""),
                "severity": vuln.get("severity", ""),
            }

        if display == "PATCH_GENERATED":
            patch = payload.get("patch", {})
            arch = patch.get("architectural_changes", "")
            return {
                "event": display,
                "agent": "BlueCoderAgent",
                "patch_id": patch.get("patch_id", ""),
                "summary": arch[:200] if arch else "Patch generated (code omitted)",
            }

        if display == "AUDIT_COMPLETED":
            critique = payload.get("critique", {})
            return {
                "event": display,
                "agent": "RedAuditorAgent",
                "finding_type": critique.get("finding_type", ""),
                "confidence": critique.get("confidence", ""),
                "is_secure": critique.get("is_secure"),
            }

        if display == "SECURITY_REPORT_GENERATED":
            report = payload.get("report", {})
            return {
                "event": display,
                "agent": "SecurityIntelligenceAgent",
                "security_score": report.get("security_score"),
                "risk_level": report.get("risk_level"),
                "recommendation": report.get("deployment_recommendation"),
            }

        # Fallback — full payload (should not reach here)
        return {"event": display}

    def _mirror_status_event(
        self, status: str, shared_context: dict
    ) -> None:
        """Send a terminal status message to the BAND room."""
        config = TERMINAL_EVENTS.get(status)
        if not config:
            return

        if not self._room_manager.is_ready:
            return

        try:
            content = self._format_terminal_message(config, shared_context)
            success, _ = self._client.send_message(
                self._room_manager.room_id, content
            )
            if success:
                self.band_messages_sent += 1
                self._mirrored_statuses.add(status)
            else:
                self.band_failures += 1
        except Exception as exc:
            self.band_failures += 1
            logger.warning(
                "BAND status mirror failed for %s: %s", status, exc
            )

    def _format_terminal_message(
        self, config: dict, shared_context: dict
    ) -> str:
        """Build a human-readable terminal status message."""
        emoji = config.get("emoji", "")
        display = config["display"]

        bt = shared_context.get("benchmark_telemetry", {})
        body = json.dumps(
            {
                "status": display,
                "final_status": bt.get("final_status"),
                "mesh_iterations": bt.get("mesh_iterations"),
                "verified_exploits": bt.get("verified_exploits"),
                "speculative_risks": bt.get("speculative_risks"),
                "security_score": (
                    shared_context.get("security_report", {}).get(
                        "security_score"
                    )
                ),
            },
            indent=2,
        )

        parts = [p for p in (f"{emoji} {display}" if emoji else display, body) if p]
        return "\n\n".join(parts)

    def _sync_telemetry(self, channel) -> None:
        """Push current BAND telemetry counters into shared_context."""
        channel.shared_context.setdefault("band_telemetry", {})
        channel.shared_context["band_telemetry"].update({
            "band_room_created": self.band_room_created,
            "band_messages_sent": self.band_messages_sent,
            "band_failures": self.band_failures,
            "band_room_id": self._room_manager.room_id,
            "band_room_url": self._room_manager.room_url,
        })

    def _record_failure(
        self, channel, event_type: str, exc: Exception
    ) -> None:
        """Append a BAND mirror failure to system_logs."""
        try:
            msg = f"[BAND MIRROR] Failed to mirror {event_type}: {exc}"
            channel.shared_context.setdefault("system_logs", []).append(msg)
        except Exception:
            pass
