# core/aiml_client.py
import os
import json
import re
from dotenv import load_dotenv
import openai

load_dotenv()


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

        elif "deepseek" in model or "gpt" in model:
            user_prompt = messages[-1]["content"]
            if "Security Intelligence Report Generation" in user_prompt:
                is_escalation = "ESCALATION_REQUIRED" in user_prompt
                if is_escalation:
                    mock_report = {
                        "security_score": 25,
                        "confidence": 0.75,
                        "risk_level": "CRITICAL",
                        "deployment_recommendation": "ESCALATE_REVIEW",
                        "executive_summary": "The autonomous security mesh exhausted its iteration budget without achieving full convergence. Multiple verified exploits were detected and remediation attempts failed to neutralize all attack vectors. Manual security review and intervention are required before deployment can proceed.",
                        "model": "deepseek/deepseek-chat",
                        "verified_exploits": 1,
                        "speculative_risks": 0,
                        "informational_findings": 0,
                        "audit_degradations": 0,
                        "reasoning": [
                            "Mesh exceeded maximum iteration budget without full convergence.",
                            "One or more verified exploits remain unpatched after exhausting remediation cycles.",
                            "Security posture could not be fully assessed due to incomplete remediation.",
                            "Human expert review is required to determine next steps."
                        ],
                        "remaining_risks": [
                            "Remediation failed to converge — verified exploits remain in the codebase.",
                            "Manual security audit required to identify and patch remaining vulnerabilities."
                        ]
                    }
                else:
                    mock_report = {
                        "security_score": 72,
                        "confidence": 0.85,
                        "risk_level": "MEDIUM",
                        "deployment_recommendation": "APPROVE_WITH_MONITORING",
                        "executive_summary": "The mesh successfully remediated the identified SQL injection vulnerability after two iterations. One verified exploit was found and patched. Residual speculative risks remain but are not demonstrable in the supplied code. Overall security posture is acceptable with continued monitoring.",
                        "model": "deepseek/deepseek-chat",
                        "verified_exploits": 1,
                        "speculative_risks": 1,
                        "informational_findings": 0,
                        "audit_degradations": 0,
                        "reasoning": [
                            "One verified exploit was remediated by the Blue Coder in iteration 1.",
                            "Red Auditor confirmed the patch was secure in iteration 2.",
                            "Residual speculative risk was identified but not demonstrable.",
                            "Multiple remediation cycles were required before convergence."
                        ],
                        "remaining_risks": [
                            "Speculative risk remains: potential edge case in input sanitization."
                        ]
                    }
                return MockResponse(json.dumps(mock_report))

            user_prompt = messages[-1]["content"]
            is_re_evaluation = "PREVIOUS PATCH EXPLOITED" in user_prompt

            if not is_re_evaluation:
                mock_critique = {
                    "patch_id": "patch-mock-uuid-112233",
                    "is_secure": False,
                    "finding_type": "VERIFIED_EXPLOIT",
                    "confidence": "HIGH",
                    "evidence": [
                        {"file": "submitted.py", "line": 3, "reason": "Character truncation allows payload injection past parameterized boundary"}
                    ],
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
                    "finding_type": "INFORMATIONAL",
                    "confidence": "HIGH",
                    "evidence": [],
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


def extract_json(text: str) -> str:
    text = re.sub(r'^```(?:json)?\s*', '', text.strip())
    text = re.sub(r'\s*```$', '', text)
    return text.strip()


class AIMLClient:
    """The central SDK wrapper switch used across all agents."""

    def __init__(self, api_key: str):
        self.api_key = api_key or os.getenv("AI_ML_API_KEY")
        if os.getenv("USE_REAL_AI_ML_API") == "TRUE":
            base_url = os.getenv("AI_ML_API_BASE_URL", "https://api.openai.com/v1")
            print(f"[LLM ENGINE] Connecting to live AI/ML API endpoint: {base_url}", flush=True)
            self.chat = openai.OpenAI(
                api_key=self.api_key,
                base_url=base_url,
                timeout=90,
            ).chat
        else:
            print("[LLM ENGINE] Operating in offline MOCK mode. Zero credit consumption.")
            self.chat = MockChat()


# Export a single global instance for the whole project structure to tap into
ai_client = AIMLClient(api_key=os.getenv("AI_ML_API_KEY", "mock_key_placeholder"))
