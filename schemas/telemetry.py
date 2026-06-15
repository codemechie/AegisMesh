from pydantic import BaseModel, Field
from typing import Optional


class BenchmarkTelemetry(BaseModel):
    blue_model: str = Field(default="Qwen-2.5-Coder-72B", description="The model used by Blue Coder")
    red_model: str = Field(default="DeepSeek-R1", description="The model used by Red Auditor")
    mesh_iterations: int = Field(default=0, description="Number of mesh iterations")
    verified_exploits: int = Field(default=0, description="Count of VERIFIED_EXPLOIT findings")
    speculative_risks: int = Field(default=0, description="Count of SPECULATIVE_RISK findings")
    informational_findings: int = Field(default=0, description="Count of INFORMATIONAL findings")
    audit_degradations: int = Field(default=0, description="Count of Stage 4 fallback recoveries due to unparsable LLM output")
    final_status: Optional[str] = Field(None, description="Final mesh status after run completion")
    time_started: Optional[str] = Field(None, description="ISO 8601 timestamp when the run started")
    time_completed: Optional[str] = Field(None, description="ISO 8601 timestamp when the run completed")
