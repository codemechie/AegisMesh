# core/utils.py
import re


def extract_pure_code(llm_output: str) -> str:
    """
    Cleans and extracts pure executable code from any markdown-wrapped LLM text.
    Essential for preventing sandbox compilation crashes.
    """
    if not llm_output:
        return ""

    # Regex pattern to match code blocks wrapped in ```python or ```
    markdown_code_block_pattern = r"```(?:python)?\s*(.*?)\s*```"
    match = re.search(markdown_code_block_pattern, llm_output, re.DOTALL | re.IGNORECASE)

    if match:
        # Return only the content trapped inside the backticks
        return match.group(1).strip()

    # Fallback: If no markdown blocks are found, clean leading/trailing whitespace
    return llm_output.strip()
