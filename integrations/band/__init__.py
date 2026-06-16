import logging
from typing import TYPE_CHECKING

from .band_client import BandClient
from .band_room_manager import BandRoomManager
from .band_event_mirror import BandEventMirror

if TYPE_CHECKING:
    from core.band_mesh import BandMeshChannel

logger = logging.getLogger(__name__)

__all__ = [
    "BandClient",
    "BandRoomManager",
    "BandEventMirror",
    "setup_band_mirror",
]


def setup_band_mirror(mesh: "BandMeshChannel") -> BandEventMirror:
    """Create and wire a BandEventMirror into an existing mesh.

    Call this **before** agent service initialisation so the mirror
    callback fires first (room is created before agents process).

    Returns the BandEventMirror instance so callers can invoke
    ``maybe_mirror_terminal_status()`` after ``broadcast()`` returns.
    """
    client = BandClient()
    if not client.api_key:
        logger.info("BAND credentials not configured; mirror disabled.")
        return None

    room_manager = BandRoomManager(client)
    mirror = BandEventMirror(client, room_manager)
    mirror.setup(mesh)
    logger.info("BAND event mirror registered on mesh %s", mesh.session_id)
    return mirror
