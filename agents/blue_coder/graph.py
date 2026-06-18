from typing import TypedDict, Optional
from schemas.models import FileContext, PatchProposal, VulnerabilityReport


class BlueCoderState(TypedDict):
    source_file: FileContext
    vulnerability: VulnerabilityReport
    current_patch: Optional[PatchProposal]
    compiler_logs: Optional[str]
    iteration_count: int
    max_iterations: int
    exploit_chain: list
