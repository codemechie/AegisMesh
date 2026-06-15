from pydantic import BaseModel, Field
from typing import List


class SecurityIntelligenceReport(BaseModel):
    security_score: int = Field(..., description="Overall security score from 0 (worst) to 100 (best)")
    confidence: float = Field(..., description="Confidence in the assessment, 0.0 to 1.0")
    risk_level: str = Field(..., description="Risk classification: SEVERE, CRITICAL, HIGH, MEDIUM, or LOW")
    deployment_recommendation: str = Field(..., description="Actionable deployment recommendation")
    verified_exploits: int = Field(..., description="Count of confirmed exploit findings")
    speculative_risks: int = Field(..., description="Count of speculative risk findings")
    informational_findings: int = Field(..., description="Count of informational findings")
    audit_degradations: int = Field(..., description="Count of Stage 4 fallback recoveries")
    reasoning: List[str] = Field(..., description="Deterministic reasoning steps derived from telemetry")
    remaining_risks: List[str] = Field(..., description="Outstanding security risks not yet remediated")
