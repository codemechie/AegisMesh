import pytest
from schemas.models import FileContext, VulnerabilityReport, PatchProposal, AuditCritique, ThoughtNode
from agents.blue_coder.graph import BlueCoderState


@pytest.fixture
def file_context() -> FileContext:
    return FileContext(
        file_path="test/app.py",
        raw_code="query = f'SELECT * FROM users WHERE id = {user_input}'\ncursor.execute(query)",
        language="python"
    )


@pytest.fixture
def vulnerability_report() -> VulnerabilityReport:
    return VulnerabilityReport(
        description="Raw string concatenation in SQL query — SQL injection risk",
        target_lines=[1, 2],
        severity="HIGH"
    )


@pytest.fixture
def patch_proposal() -> PatchProposal:
    return PatchProposal(
        patch_id="patch-test-uuid",
        proposed_code="cursor.execute('SELECT * FROM users WHERE id = %s', (user_input,))",
        architectural_changes="Replaced f-string with parameterized query",
        dependencies_added=[]
    )


@pytest.fixture
def blue_coder_state(file_context, vulnerability_report) -> BlueCoderState:
    return {
        "source_file": file_context,
        "vulnerability": vulnerability_report,
        "current_patch": None,
        "compiler_logs": None,
        "iteration_count": 0,
        "max_iterations": 3
    }
