import uuid
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from core.band_mesh import BandMeshChannel
from schemas.models import FileContext, VulnerabilityReport
from main import initialize_blue_coder_service, initialize_red_auditor_service

app = FastAPI(title="AegisMesh API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class RunRequest(BaseModel):
    source_code: str
    vulnerability: str


@app.post("/api/run")
def run_mesh(request: RunRequest):
    session_id = f"session-{uuid.uuid4()}"
    mesh = BandMeshChannel(session_id=session_id)

    initialize_blue_coder_service(mesh)
    initialize_red_auditor_service(mesh)

    source_file = FileContext(
        file_path="submitted.py",
        raw_code=request.source_code,
        language="python"
    )

    vuln = VulnerabilityReport(
        description=request.vulnerability,
        target_lines=[1],
        severity="HIGH"
    )

    mesh.broadcast("VULNERABILITY_TRIAGED", {
        "source_file": source_file.model_dump(),
        "vulnerability": vuln.model_dump()
    })

    return mesh.shared_context


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
