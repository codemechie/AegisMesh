# tests/test_utils.py
from core.utils import extract_pure_code

def test_extracts_wrapped_markdown_code():
    dirty_input = "Sure! Here is your fix:\n```python\ndef secure():\n    return True\n```\nHope this helps!"
    expected = "def secure():\n    return True"
    assert extract_pure_code(dirty_input) == expected

def test_extract_fallback_plain_text():
    plain_input = "def secure():\n    return True"
    assert extract_pure_code(plain_input) == plain_input
