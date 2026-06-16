"""
Centralized model configuration for AegisMesh.

Reads BLUE_MODEL, RED_MODEL, and SECURITY_INTELLIGENCE_MODEL
from environment variables. Falls back to the benchmark-winning defaults.
"""

import os

_DEFAULT_BLUE = "alibaba/qwen3-coder-480b-a35b-instruct"
_DEFAULT_RED = "deepseek/deepseek-chat"
_DEFAULT_SI = "openai/gpt-4o"


def get_blue_model() -> str:
    return os.getenv("BLUE_MODEL", _DEFAULT_BLUE)


def get_red_model() -> str:
    return os.getenv("RED_MODEL", _DEFAULT_RED)


def get_si_model() -> str:
    return os.getenv("SECURITY_INTELLIGENCE_MODEL", _DEFAULT_SI)


def get_all_models() -> dict:
    return {
        "blue": get_blue_model(),
        "red": get_red_model(),
        "security_intelligence": get_si_model(),
    }
