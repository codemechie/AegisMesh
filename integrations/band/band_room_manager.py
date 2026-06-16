import logging

from .band_client import ROOM_URL_TEMPLATE, BandClient

logger = logging.getLogger(__name__)


class BandRoomManager:
    """Idempotent room lifecycle manager.

    Ensures a BAND room is created at most once per session and that
    the three AegisMesh agents are added as participants.
    """

    def __init__(self, client: BandClient):
        self._client = client
        self._room_id: str | None = None
        self._room_url: str | None = None

    # ------------------------------------------------------------------
    # Properties
    # ------------------------------------------------------------------
    @property
    def room_id(self) -> str | None:
        return self._room_id

    @property
    def room_url(self) -> str | None:
        return self._room_url

    @property
    def is_ready(self) -> bool:
        return self._room_id is not None

    # ------------------------------------------------------------------
    # Room creation (idempotent)
    # ------------------------------------------------------------------
    def ensure_room(
        self,
        session_id: str,
        participant_ids: list[str],
    ) -> tuple[bool, str | None]:
        """Create the BAND room once and add participants.

        Safe to call multiple times — only the first call creates the
        room.  Subsequent calls return the cached (room_id, room_url).

        Args:
            session_id: Human-readable session label.
            participant_ids: Agent IDs to add as participants.

        Returns:
            (True, room_id) on success, (False, None) on failure.
        """
        if self._room_id is not None:
            return True, self._room_id

        success, result = self._client.create_room()
        if not success:
            return False, None

        room_id: str = result
        self._room_id = room_id
        self._room_url = ROOM_URL_TEMPLATE.format(room_id=room_id)

        # Add participants — log but never fail the room creation
        for pid in participant_ids:
            if pid:
                self._client.add_participant(room_id, pid)

        logger.info(
            "BAND room created: %s (session=%s)", self._room_url, session_id
        )
        return True, room_id

    # ------------------------------------------------------------------
    # Reset (for testing)
    # ------------------------------------------------------------------
    def reset(self) -> None:
        self._room_id = None
        self._room_url = None
