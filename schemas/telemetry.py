from pydantic import BaseModel, Field
from typing import Optional


class BenchmarkTelemetry(BaseModel):
    blue_model: str = Field(default="alibaba/qwen3-coder-480b-a35b-instruct", description="The model used by Blue Coder")
    red_model: str = Field(default="deepseek/deepseek-chat", description="The model used by Red Auditor")
    mesh_iterations: int = Field(default=0, description="Number of mesh iterations")
    verified_exploits: int = Field(default=0, description="Count of VERIFIED_EXPLOIT findings")
    speculative_risks: int = Field(default=0, description="Count of SPECULATIVE_RISK findings")
    informational_findings: int = Field(default=0, description="Count of INFORMATIONAL findings")
    audit_degradations: int = Field(default=0, description="Count of Stage 4 fallback recoveries due to unparsable LLM output")
    final_status: Optional[str] = Field(None, description="Final mesh status after run completion")
    time_started: Optional[str] = Field(None, description="ISO 8601 timestamp when the run started")
    time_completed: Optional[str] = Field(None, description="ISO 8601 timestamp when the run completed")


class BandTelemetry(BaseModel):
    band_room_created: int = Field(default=0, description="1 if a BAND room was created for this session")
    band_messages_sent: int = Field(default=0, description="Number of events mirrored to BAND")
    band_failures: int = Field(default=0, description="Number of BAND mirror failures")
    band_room_id: Optional[str] = Field(None, description="BAND room ID for this session")
    band_room_url: Optional[str] = Field(None, description="BAND dashboard URL for this session")
