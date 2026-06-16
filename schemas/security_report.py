from pydantic import BaseModel, Field
from typing import List


class SecurityIntelligenceReport(BaseModel):
    security_score: int = Field(..., description="Overall security score from 0 (worst) to 100 (best)")
    confidence: float = Field(..., description="Confidence in the assessment, 0.0 to 1.0")
    risk_level: str = Field(..., description="Risk classification: CRITICAL, HIGH, MEDIUM, or LOW")
    deployment_recommendation: str = Field(..., description="Deployment recommendation: APPROVE, APPROVE_WITH_MONITORING, ESCALATE_REVIEW, or BLOCK")
    executive_summary: str = Field(..., description="Narrative executive summary of the security assessment")
    model: str = Field(default="openai/gpt-4o", description="The AI model that generated this report")
    verified_exploits: int = Field(..., description="Count of confirmed exploit findings")
    speculative_risks: int = Field(..., description="Count of speculative risk findings")
    informational_findings: int = Field(..., description="Count of informational findings")
    audit_degradations: int = Field(..., description="Count of Stage 4 fallback recoveries")
    reasoning: List[str] = Field(..., description="Reasoning steps behind the security assessment")
    remaining_risks: List[str] = Field(..., description="Outstanding security risks not yet remediated")
