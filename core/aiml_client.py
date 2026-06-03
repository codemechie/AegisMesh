# core/aiml_client.py
import os
import json


class MockCompletions:
    def create(self, model: str, messages: list, response_format: dict = None):
        """Simulates deterministic enterprise JSON payloads instantly without network lag."""
        print(f"[MOCK CLIENT] Intercepted call for model '{model}'")

        if "qwen" in model:
            mock_patch = {
                "patch_id": "patch-mock-uuid-112233",
                "proposed_code": "def secure_function(user_input):\n    # Sanitized via parameterized input placeholders\n    cursor.execute('SELECT * FROM users WHERE id = %s', (user_input,))",
                "architectural_changes": "Migrated from unsafe Python f-string construction to structural query parameter bindings.",
                "dependencies_added": []
            }
            return MockResponse(json.dumps(mock_patch))

        elif "deepseek" in model:
            user_prompt = messages[-1]["content"]
            is_re_evaluation = "PREVIOUS PATCH EXPLOITED" in user_prompt

            if not is_re_evaluation:
                mock_critique = {
                    "patch_id": "patch-mock-uuid-112233",
                    "is_secure": False,
                    "exploit_found": "Passed secondary payload injection through character truncation on line 3.",
                    "graph_of_thoughts": [
                        {"thought_id": "T1", "hypothesis": "Testing SQLi basic bypass",
                         "evaluation_result": "Blocked by parameters", "parent_thoughts": []},
                        {"thought_id": "T2", "hypothesis": "Testing truncation overflows",
                         "evaluation_result": "Vulnerable!", "parent_thoughts": ["T1"]}
                    ]
                }
            else:
                mock_critique = {
                    "patch_id": "patch-mock-uuid-445566",
                    "is_secure": True,
                    "exploit_found": None,
                    "graph_of_thoughts": [
                        {"thought_id": "T1", "hypothesis": "Re-testing truncation overflows",
                         "evaluation_result": "Completely secure", "parent_thoughts": []}
                    ]
                }
            return MockResponse(json.dumps(mock_critique))


class MockChat:
    def __init__(self):
        self.completions = MockCompletions()


class MockResponse:
    def __init__(self, content_string):
        self.choices = [MockChoice(content_string)]


class MockChoice:
    def __init__(self, content_string):
        self.message = MockMessage(content_string)


class MockMessage:
    def __init__(self, content_string):
        self.content = content_string


class AIMLClient:
    """The central SDK wrapper switch used across all agents."""

    def __init__(self, api_key: str):
        self.api_key = api_key
        # Check an environment flag to toggle the real API
        if os.getenv("USE_REAL_AI_ML_API") == "TRUE":
            print("[LLM ENGINE] Connecting to live AI/ML API cloud endpoint...")
            # Here you would initialize the real OpenAI/AI_ML_API standard package
            self.chat = None  # Real client initialization goes here on June 12
        else:
            print("[LLM ENGINE] Operating in offline MOCK mode. Zero credit consumption.")
            self.chat = MockChat()


# Export a single global instance for the whole project structure to tap into
ai_client = AIMLClient(api_key=os.getenv("AI_ML_API_KEY", "mock_key_placeholder"))
