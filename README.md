# AegisMesh — Adversarial Autonomous Security Remediation Mesh

[![Python 3.10+](https://img.shields.io/badge/python-3.10%2B-blue)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.136-009688)](https://fastapi.tiangolo.com/)
[![Tailwind v4](https://img.shields.io/badge/Tailwind-v4-06B6D4)](https://tailwindcss.com/)
[![LangGraph](https://img.shields.io/badge/LangGraph-✓-brightgreen)](https://langchain-ai.github.io/langgraph/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**AegisMesh** is an autonomous adversarial security remediation mesh that generates patches, challenges them through independent red-team analysis, and produces deployment-ready security assessments.

A vulnerability enters the mesh. The **Blue Coder Agent** generates a patch. The **Red Auditor Agent** attempts to break it. The **Security Intelligence Agent** evaluates the result and produces an executive deployment decision. All three agents collaborate over a shared event bus — no human in the loop.

---

## Why AegisMesh Is Different

Most automated remediation systems follow a single step:

```
Generate Patch → Done
```

AegisMesh implements a full adversarial lifecycle:

```
Generate Patch
    ↓
Attack Patch
    ↓
Assess Risk
    ↓
Decide Deployment
```

The difference is architectural: each agent is independently specialized and cannot overrule the others. The Blue Agent cannot approve its own patch. The Red Agent cannot generate a fix. The Security Intelligence Agent holds the final deployment authority. This separation of powers mirrors production security operations.

---

## Architecture

```
                     ┌──────────────────────────────────────────────────┐
                     │               AegisMesh Channel                  │
                     │   (Pub/Sub Event Bus + Shared State)             │
                     │                                                  │
                     │   Events: VULNERABILITY_TRIAGED                  │
                     │           PATCH_PROPOSED                         │
                     │           AUDIT_COMPLETED                        │
                     │           SECURITY_REPORT_REQUESTED              │
                     │           SECURITY_REPORT_GENERATED              │
                     └──────┬─────────────────────┬─────────────────────┘
                            │                     │
              ┌─────────────▼──────────┐  ┌───────▼──────────────────┐
              │   Blue Coder Agent     │  │   Red Auditor Agent      │
              │  (Qwen3-Coder-480B)    │  │  (DeepSeek Chat)         │
              │                        │  │                          │
              │  LangGraph State-      │  │  Graph-of-Thoughts       │
              │  Machine:              │  │  Adversarial Audit:      │
              │  1. patcher_agent      │  │  Multiple attack vectors │
              │  2. compiler_validator  │  │  explored simultaneously │
              │  3. routing_evaluator  │  │  DAG reasoning tree      │
              └─────────────┬──────────┘  └───────┬──────────────────┘
                            │                     │
                            └──────────┬──────────┘
                                       │
                            ┌──────────▼──────────┐
                            │  Security            │
                            │  Intelligence Agent  │
                            │  (GPT-4o)            │
                            │                      │
                            │  Security scoring    │
                            │  Risk assessment     │
                            │  Executive summary   │
                            │  Deployment decision │
                            └──────────┬──────────┘
                                       │
                            ┌──────────▼──────────┐
                            │     FastAPI Layer    │
                            │   POST /api/run      │
                            └──────────┬──────────┘
                                       │
                            ┌──────────▼──────────┐
                            │   React Dashboard   │
                            │  (Vite + Tailwind)  │
                            └─────────────────────┘
```

### Agent Roles

| Agent | Model | Role |
|-------|-------|------|
| **Blue Coder Agent** | `alibaba/qwen3-coder-480b-a35b-instruct` | Generates code patches with compile verification, up to 3 retry iterations |
| **Red Auditor Agent** | `deepseek/deepseek-chat` | Adversarially audits patches using Graph-of-Thoughts DAG reasoning |
| **Security Intelligence Agent** | `openai/gpt-4o` | Produces security score, risk assessment, executive summary, and deployment recommendation |

### Adversarial Loop

```
VULNERABILITY_TRIAGED
    ↓
Blue Coder Agent
    ↓  PATCH_PROPOSED
Red Auditor Agent
    ↓
  ┌── VERIFIED_EXPLOIT → rebroadcast VULNERABILITY_TRIAGED with exploit vector → retry
  ├── SPECULATIVE_RISK → recorded, loop ends
  └── INFORMATIONAL    → recorded, loop ends
    ↓
Security Intelligence Agent
    ↓
  DEPLOYMENT RECOMMENDATION: APPROVE | APPROVE_WITH_MONITORING | ESCALATION_REQUIRED
```

Only `VERIFIED_EXPLOIT` continues the remediation loop. `SPECULATIVE_RISK` and `INFORMATIONAL` findings are recorded but do not trigger a new patch cycle. This prevents infinite loops on non-deterministic findings.

---

## Security Intelligence Agent

The Security Intelligence Agent is the final authority for deployment decisions. After the adversarial loop converges, it evaluates the complete execution context and produces:

| Output | Description |
|--------|-------------|
| **Security Score** | 0–100 quantitative security posture score |
| **Confidence** | 0.0–1.0 confidence in the assessment |
| **Risk Level** | CRITICAL, HIGH, MEDIUM, or LOW |
| **Deployment Recommendation** | APPROVE, APPROVE_WITH_MONITORING, ESCALATE_REVIEW, or BLOCK |
| **Executive Summary** | Narrative summary for non-technical stakeholders |
| **Reasoning** | List of reasoning steps behind the assessment |
| **Remaining Risks** | Outstanding security concerns not remediated |

The Security Intelligence Agent is the only agent with authority to issue deployment recommendations. The Blue Agent generates fixes. The Red Agent validates them. The Security Intelligence Agent decides.

### Finding Classification

| Classification | Meaning | Effect |
|---|---|---|
| **VERIFIED_EXPLOIT** | Demonstrable exploit found in the submitted code | Patch rejected, remediation loop continues |
| **SPECULATIVE_RISK** | Plausible attack vector, not demonstrable with supplied code | Recorded, loop ends |
| **INFORMATIONAL** | Non-blocking recommendation or observation | Recorded, loop ends |

A `VERIFIED_EXPLOIT` without supporting evidence is automatically downgraded to `SPECULATIVE_RISK` by the audit schema validator.

### Audit Recovery Pipeline

When the Red Auditor returns malformed JSON (a known failure mode with LLM outputs), the recovery pipeline engages:

```
Stage 1  →  Normal JSON parsing
Stage 2  →  Regex-based JSON extraction from markdown
Stage 3  →  Repair attempt (truncation, quote fixing)
Stage 4  →  Fallback critique generation
```

Each recovery stage increments the `audit_degradations` counter. The pipeline prevents mesh deadlocks from single malformed responses. Recovery telemetry is recorded in `agent_failures` with type `AUDIT_DEGRADATION`.

---

## Quick Start

### Prerequisites

```bash
python >= 3.10
node >= 20
```

### Backend

```bash
git clone https://github.com/yourusername/aegismesh.git
cd aegismesh
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
python api.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Usage

### REST API

```bash
curl -X POST http://localhost:8000/api/run \
  -H "Content-Type: application/json" \
  -d '{
    "source_code": "query = f\"SELECT * FROM users WHERE id = {user_input}\"",
    "vulnerability": "SQL Injection"
  }'
```

Returns the full `MeshContext` — event history, exploit chain, audit history, patch, security report, and telemetry.

### CLI Mode

```bash
python main.py
```

Seeds a mock SQL injection vulnerability and runs the full adversarial lifecycle directly in the terminal.

### Live LLM Mode

```bash
USE_REAL_AI_ML_API=TRUE AI_ML_API_KEY=your_key_here python main.py
```

Model selection is environment-driven. See [Model Configuration](#model-configuration).

---

## Model Configuration

Models are configured through environment variables and centralized in `core/model_config.py`:

| Variable | Default | Agent |
|---|---|---|
| `BLUE_MODEL` | `alibaba/qwen3-coder-480b-a35b-instruct` | Blue Coder Agent |
| `RED_MODEL` | `deepseek/deepseek-chat` | Red Auditor Agent |
| `SECURITY_INTELLIGENCE_MODEL` | `openai/gpt-4o` | Security Intelligence Agent |

The `core/model_config.py` module provides `get_blue_model()`, `get_red_model()`, and `get_si_model()` accessors used throughout the system. Active model names are included in the API response as `active_models` and rendered in the frontend dashboard.

---

## Benchmark Results

### SQL Injection

```
Source:     query = f"SELECT * FROM users WHERE id = {user_input}"
Status:     SECURED
Score:      100/100
Risk:       LOW
Recommend:  APPROVE
```

### Command Injection

```
Source:     import os; os.system(f"ping {user_input}")
Status:     SECURED
Score:      95/100
Risk:       LOW
Recommend:  APPROVE_WITH_MONITORING
```

### Path Traversal

```
Source:     open(f"/var/data/{filename}", "r")
Status:     SECURED
Score:      85/100
Risk:       MEDIUM
Recommend:  APPROVE_WITH_MONITORING
```

### Telemetry

| Metric | SQL Injection | Command Injection | Path Traversal |
|--------|---------------|-------------------|----------------|
| Mesh Iterations | 1 | 2 | 2 |
| Verified Exploits | 0 | 0 | 0 |
| Speculative Risks | 1 | 2 | 2 |
| Informational | 0 | 0 | 0 |
| Audit Degradations | 0 | 0 | 0 |
| Latency (mock mode) | ~0.3s | ~0.5s | ~0.5s |

---

## Security Intelligence Dashboard

The React dashboard (Vite + Tailwind v4 + TypeScript) presents mesh execution results in a narrative flow optimized for deployment-decision visibility and demo presentation.

### Panel Order

```
Security Intelligence Hero Panel
  ↓  Executive assessment, score, recommendation
Patch Viewer
  ↓  Generated code patch with Blue Agent attribution
Event Timeline
  ↓  Color-coded event stream with audit findings
Remediation Story
  ↓  Vulnerability → Blue → Red → Security Intelligence → Status
Security Convergence
  ↓  Audit iteration progression with Red Agent attribution
Mesh Health
  ↓  System metrics (status, iterations, events, failures)
Agent Failures
  ↓  Failure telemetry (or green "all clear")
Agent Mesh Execution Flow
  ↓  Full pipeline visualization with model attribution
```

### Key Panels

| Panel | Description |
|-------|-------------|
| **Security Intelligence Hero** | Decision banner, agent workflow snapshot, security score, executive summary, confidence/risk/recommendation KPIs, findings summary, agent models, reasoning accordion, remaining risks |
| **Remediation Story** | Narrative 5-step flow: Vulnerability → Blue Agent → Red Agent → Security Intelligence → Final Status |
| **Agent Mesh Execution Flow** | Vertical pipeline visualization showing each agent's action, model, findings, and the deployment decision |
| **Patch Viewer** | Generated patch in dark code block with Blue Agent model badge |
| **Event Timeline** | Reverse-chronological event stream with color-coded audit finding badges |

---

## Project Structure

```
aegismesh/
├── core/
│   ├── band_mesh.py            # Pub/sub event bus + shared state + provenance
│   ├── aiml_client.py          # LLM client (mock/real switching)
│   └── model_config.py         # Centralized model configuration (BLUE_MODEL, RED_MODEL, SECURITY_INTELLIGENCE_MODEL)
├── agents/
│   ├── blue_coder/
│   │   ├── agent.py            # LangGraph StateGraph definition
│   │   └── graph.py            # BlueCoderState TypedDict
│   ├── red_auditor/
│   │   ├── engine.py           # GoT adversarial audit function
│   │   └── prompts.py          # System prompt for DeepSeek Chat
│   └── security_intelligence/
│       ├── agent.py            # Security report generation
│       └── prompts.py          # Security Intelligence system prompt
├── schemas/
│   ├── models.py               # Pydantic models (FileContext, VulnerabilityReport, etc.)
│   └── security_report.py      # SecurityIntelligenceReport model
├── frontend/
│   ├── src/
│   │   ├── api/aegismesh.ts    # Typed fetch wrapper
│   │   ├── types/mesh.ts       # TypeScript MeshContext types
│   │   ├── components/         # Dashboard panels (10 components)
│   │   ├── graph/              # Agent Mesh Execution Flow
│   │   └── pages/Dashboard.tsx # Main dashboard layout
│   ├── package.json
│   └── vite.config.ts
├── dashboard/
│   └── app.py                  # Legacy Streamlit dashboard
├── scripts/
│   └── model_benchmark.py      # Benchmark runner
├── tests/
│   ├── test_agents.py          # Blue Coder graph tests
│   ├── test_band_mesh.py       # Mesh reliability + provenance tests
│   └── test_utils.py           # Utility tests
├── api.py                      # FastAPI server
├── main.py                     # CLI entry point
└── requirements.txt
```

---

## API Reference

### `POST /api/run`

**Request:**
```json
{
  "source_code": "string",
  "vulnerability": "string"
}
```

**Response:** `MeshContext`

| Field | Type | Description |
|---|---|---|
| `session_id` | `string` | Unique session identifier |
| `status` | `string` | `INITIALIZED`, `UNDER_REVIEW`, `AUDITING`, `SECURED`, `PATCH_REJECTED`, `ESCALATION_REQUIRED` |
| `active_models` | `ActiveModels` | Model names for all three agents |
| `security_report` | `SecurityIntelligenceReport \| null` | Security Intelligence assessment with score, risk, recommendation |
| `source_file` | `FileContext` | Submitted source file metadata |
| `vulnerability` | `VulnerabilityReport` | Current vulnerability description |
| `latest_patch` | `PatchProposal \| null` | Most recent generated patch |
| `original_vulnerability` | `VulnerabilityReport` | Frozen first-triage vulnerability |
| `exploit_chain` | `ExploitChainEntry[]` | Append-only list of exploit vectors |
| `audit_history` | `AuditCritique[]` | All audit iterations with GoT reasoning trees |
| `event_history` | `EventRecord[]` | Full event log with event_id, parent_event_id, timestamp |
| `agent_failures` | `AgentFailure[]` | Isolated listener error telemetry |
| `benchmark_telemetry` | `BenchmarkTelemetry` | Execution metrics (iterations, finding counts, models) |
| `mesh_iteration` | `number` | Current adversarial loop iteration |
| `max_mesh_iterations` | `number` | Escalation guard limit (default 8) |

---

## Testing

```bash
python -m pytest tests/ -v
```

34 tests across 3 test files:

| File | Tests | Coverage |
|------|-------|----------|
| `test_agents.py` | 6 | Blue Coder LangGraph: compile validation, routing, patch generation |
| `test_band_mesh.py` | 24 | Mesh reliability: iteration counting, escalation guard, callback isolation, event provenance, exploit chain tracking |
| `test_utils.py` | 4 | Markdown code extraction utilities |

---

## Tech Stack

### Backend
- **Python 3.10+** — Runtime
- **FastAPI** — REST API layer
- **LangGraph** — Blue Coder state machine
- **Pydantic** — Schema validation
- **Uvicorn** — ASGI server

### Frontend
- **React 19** — UI framework
- **TypeScript** — Type safety
- **Vite** — Build tool
- **Tailwind v4** — Styling
- **TanStack Query** — Server state management
- **Lucide React** — Icon library

---

## Design Decisions

| Decision | Rationale |
|---|---|
| **Three-agent architecture** | Separation of powers: patch generation, adversarial validation, and deployment assessment are independent, mirroring production security operations |
| **Adversarial feedback loop** | Each rejection includes the exploit vector, making subsequent patches strictly better; only VERIFIED_EXPLOIT continues the loop |
| **In-process event bus** | Avoids distributed-system complexity; shared dict is synchronously mutated for full determinism |
| **Security Intelligence as final authority** | Prevents the patch generator from approving its own output; deployment decisions come from an independent assessor |
| **Graph-of-Thoughts auditing** | DAG-based reasoning forces exploration of multiple attack surfaces simultaneously |
| **Audit recovery pipeline** | 4-stage fallback prevents mesh deadlocks from malformed LLM responses |
| **Mock mode by default** | Zero API cost during development; one env var to switch to live models |
| **Event provenance (UUID + parent pointer)** | Enables full causal graph reconstruction without external storage |
| **Callback isolation with telemetry** | One failing agent never crashes the mesh; errors are recorded for debugging |
| **Dark-first React UI** | Premium security operations console aesthetic using Tailwind v4 |
| **TanStack Query for API state** | Built-in loading/success/error states without a state management library |
| **Dual UI (CLI + REST + Dashboard)** | Supports local development, API integration, and visual exploration |

---

## Architecture Summary

AegisMesh delivers three capabilities in a single autonomous system:

1. **Autonomous Remediation** — The Blue Coder Agent generates and compiles patches without human intervention, using LangGraph state-machine orchestration with compile verification.

2. **Adversarial Validation** — The Red Auditor Agent independently attacks each patch using Graph-of-Thoughts reasoning, ensuring no single agent can approve its own output.

3. **Deployment Intelligence** — The Security Intelligence Agent evaluates the full execution context and produces a security score, risk assessment, executive summary, and deployment recommendation — the final decision authority.

---

## License

MIT
