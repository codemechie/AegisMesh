import logging
import os

from dotenv import load_dotenv

logger = logging.getLogger(__name__)

ROOM_URL_TEMPLATE = "https://app.band.ai/chat/{room_id}"


class BandClient:
    """Synchronous wrapper around the BAND REST API.

    Loads credentials from .env.  Every public method returns a
    (success: bool, result_or_error) tuple for failure isolation.
    """

    def __init__(self):
        load_dotenv()
        self.api_key: str | None = os.getenv("BLUE_AGENT_API_KEY")
        self.agent_id: str | None = os.getenv("BLUE_AGENT_ID")
        self.agent_handle: str | None = os.getenv(
            "BLUE_AGENT_HANDLE", "@codemechie/bluecoderagent"
        )
        self.red_agent_id: str | None = os.getenv("RED_AGENT_ID")
        self.red_agent_handle: str | None = os.getenv(
            "RED_AGENT_HANDLE", "@codemechie/redauditoragent"
        )
        self.si_agent_id: str | None = os.getenv("SECURITY_INTELLIGENCE_AGENT_ID")
        self.si_agent_handle: str | None = os.getenv(
            "SECURITY_INTELLIGENCE_HANDLE",
            "@codemechie/securityintelligenceagent",
        )
        self.base_url: str = "https://app.band.ai"
        self._client = None

    # ------------------------------------------------------------------
    # Lazy-initialised sync RestClient
    # ------------------------------------------------------------------
    @property
    def _rest(self):
        if self._client is None:
            from thenvoi_rest import RestClient

            self._client = RestClient(
                api_key=self.api_key, base_url=self.base_url
            )
        return self._client

    # ------------------------------------------------------------------
    # Room lifecycle
    # ------------------------------------------------------------------
    def create_room(self) -> tuple[bool, str | Exception]:
        """Create a BAND chat room.

        Returns:
            (True, room_id) on success, (False, Exception) on failure.
        """
        try:
            from thenvoi_rest import ChatRoomRequest

            resp = self._rest.agent_api_chats.create_agent_chat(
                chat=ChatRoomRequest(),
            )
            room_id: str = resp.data.id
            return True, room_id
        except Exception as exc:
            logger.warning("BAND create_room failed: %s", exc)
            return False, exc

    def add_participant(self, room_id: str, participant_id: str) -> bool:
        """Add a single participant to a room.

        Returns True on success, False on failure (logged).
        """
        try:
            from thenvoi_rest import ParticipantRequest

            self._rest.agent_api_participants.add_agent_chat_participant(
                chat_id=room_id,
                participant=ParticipantRequest(
                    participant_id=participant_id, role="member"
                ),
            )
            return True
        except Exception as exc:
            logger.warning(
                "BAND add_participant %s failed: %s", participant_id, exc
            )
            return False

    # ------------------------------------------------------------------
    # Messaging
    # ------------------------------------------------------------------
    def send_message(
        self,
        room_id: str,
        content: str,
        mention_ids: list[str] | None = None,
    ) -> tuple[bool, str | Exception]:
        """Send a message to a room with optional @mentions.

        The BAND API requires at least one mention per message and
        forbids self-mentions.  Self-mentions are silently dropped;
        when no valid mentions remain, all other participants are
        mentioned as a fallback.

        Returns:
            (True, message_id) on success, (False, Exception) on failure.
        """
        try:
            from thenvoi_rest import (
                ChatMessageRequest,
                ChatMessageRequestMentionsItem,
            )

            mentions: list[ChatMessageRequestMentionsItem] = []
            if mention_ids:
                mentions = [
                    ChatMessageRequestMentionsItem(id=mid)
                    for mid in mention_ids
                    if mid != self.agent_id
                ]

            if not mentions:
                for pid in (self.red_agent_id, self.si_agent_id):
                    if pid and pid != self.agent_id:
                        mentions.append(
                            ChatMessageRequestMentionsItem(id=pid)
                        )

            resp = self._rest.agent_api_messages.create_agent_chat_message(
                chat_id=room_id,
                message=ChatMessageRequest(
                    content=content, mentions=mentions
                ),
            )
            msg_id: str = resp.data.id
            return True, msg_id
        except Exception as exc:
            logger.warning("BAND send_message failed: %s", exc)
            return False, exc
