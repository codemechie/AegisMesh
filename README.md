# AegisMesh — Adversarial Autonomous Security Remediation Mesh

[![Python 3.10+](https://img.shields.io/badge/python-3.10%2B-blue)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.136-009688)](https://fastapi.tiangolo.com/)
[![Tailwind v4](https://img.shields.io/badge/Tailwind-v4-06B6D4)](https://tailwindcss.com/)
[![LangGraph](https://img.shields.io/badge/LangGraph-✓-brightgreen)](https://langchain-ai.github.io/langgraph/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**AegisMesh** is an in-process multi-agent system that autonomously patches security vulnerabilities through an adversarial red-team/blue-team feedback loop. Two AI agents — a **Blue Coder** (code generator) and a **Red Auditor** (adversarial security tester) — collaborate over a shared event bus to iteratively produce hardened, exploit-resistant patches. Results are surfaced through a dark-theme security operations dashboard.

---

## Demo

![AegisMesh Dashboard](https://via.placeholder.com/800x450?text=AegisMesh+Dashboard+Screenshot)

| Panel | What it shows |
|---|---|
| **Mesh Health** | Status, iteration count, event count, failure count |
| **Event Timeline** | Color-coded event stream (red/blue/green dots) |
| **Exploit Chain** | Original vulnerability → exploit vectors → final status |
| **Patch Viewer** | Generated patch code in dark code block |
| **Security Convergence** | Audit iteration progression (Vulnerable → Secure) |
| **Causal Execution Graph** | React Flow DAG of event lineage |
| **Agent Failures** | Failure telemetry table (or green "all clear") |

---

## Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │              AegisMesh Channel               │
                    │  (Pub/Sub Event Bus + Shared State)          │
                    │                                              │
                    │  Events: VULNERABILITY_TRIAGED               │
                    │          PATCH_PROPOSED                      │
                    │          AUDIT_COMPLETED                     │
                    └──────┬───────────────────────┬───────────────┘
                           │                       │
              subscribes   │                       │  subscribes
              to:          │                       │  to:
         VULNERABILITY_TRIAGED              PATCH_PROPOSED
                           │                       │
               ┌────────────▼──────────┐  ┌─────────▼──────────────┐
               │   Blue Coder Agent    │  │   Red Auditor Agent    │
               │  (Qwen-2.5-Coder)     │  │  (DeepSeek-R1)         │
               │                      │  │                        │
               │  LangGraph State-    │  │  Graph-of-Thoughts     │
               │  Machine:            │  │  Adversarial Audit:    │
               │  1. patcher_agent    │  │  - Multiple attack     │
               │  2. compiler_validator│  │    vectors explored    │
               │  3. routing_evaluator │  │    simultaneously      │
               │                      │  │  - DAG reasoning tree  │
               └──────────────────────┘  └────────────────────────┘
                           │                       │
                           └──────────┬────────────┘
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

---

## Key Differentiators

| # | Differentiator | Why it matters |
|---|---|---|
| 1 | **Adversarial Feedback Loop** | Blue Coder patches → Red Auditor exploits → rebroadcast → retry. Mirrors real red-team exercises. |
| 2 | **Event Provenance** | Every broadcast stores `event_id`, `parent_event_id`, `timestamp` — full causal chain. |
| 3 | **Exploit Chain Tracking** | `original_vulnerability` is frozen on first triage; each exploit vector is appended immutably. |
| 4 | **Causal Execution Graph** | React Flow visualization renders the event DAG from `parent_event_id` links. |
| 5 | **Mesh Escalation Guard** | Self-preservation at 8 iterations — prevents runaway agent loops. |
| 6 | **Callback Isolation** | One failing listener never crashes another; failures recorded in `agent_failures` telemetry. |
| 7 | **Security Convergence Panel** | Visual red→green progression across audit iterations. |
| 8 | **Dark SOC Console** | Premium dark-first React design (`#0a0f1a` palette, Tailwind v4, React Flow). |
| 9 | **Dual UI** | CLI (`main.py`), REST API (`api.py`), and React Dashboard (`frontend/`). |
| 10 | **Graph-of-Thoughts Auditing** | DAG-based multi-vector adversarial reasoning — explores multiple attack surfaces simultaneously. |
| 11 | **Mock-first Architecture** | Zero-cost deterministic mode by default; one env var to switch to live LLMs. |

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

Returns the full `MeshContext` — event history, exploit chain, audit history, patch, and telemetry.

### CLI Mode

```bash
python main.py
```

Seeds a mock SQL injection vulnerability and runs the full adversarial lifecycle directly in the terminal.

### Live LLM Mode

```bash
USE_REAL_AI_ML_API=TRUE AI_ML_API_KEY=your_key_here python main.py
```

- Blue Coder uses `qwen-2.5-coder-72b-instruct`
- Red Auditor uses `deepseek-r1`

---

## Project Structure

```
aegismesh/
├── core/
│   ├── band_mesh.py            # Pub/sub event bus + shared state + provenance
│   └── aiml_client.py          # LLM client (mock/real switching)
├── agents/
│   ├── blue_coder/
│   │   ├── agent.py            # LangGraph StateGraph definition
│   │   └── graph.py            # BlueCoderState TypedDict
│   └── red_auditor/
│       ├── engine.py           # GoT adversarial audit function
│       └── prompts.py          # System prompt for DeepSeek-R1
├── schemas/
│   ├── models.py               # Pydantic models
│   └── telemetry.py            # (reserved for telemetry schema)
├── frontend/
│   ├── src/
│   │   ├── api/aegismesh.ts    # Typed fetch wrapper
│   │   ├── types/mesh.ts       # TypeScript MeshContext types
│   │   ├── components/         # 7 dashboard panels
│   │   ├── graph/              # React Flow lineage graph
│   │   └── pages/Dashboard.tsx # Main dashboard layout
│   ├── package.json
│   └── vite.config.ts
├── dashboard/
│   └── app.py                  # Legacy Streamlit dashboard
├── tests/
│   ├── test_agents.py          # Blue Coder graph tests
│   ├── test_band_mesh.py       # Mesh reliability + provenance tests
│   └── test_utils.py           # Utility tests
├── api.py                      # FastAPI server
├── main.py                     # CLI entry point
└── requirements.txt
```

---

## Frontend Dashboard Panels

| Panel | File | Description |
|---|---|---|
| RunForm | `components/RunForm.tsx` | Source code textarea + vulnerability input + submit |
| MeshHealth | `components/MeshHealthCard.tsx` | Status, iterations, event/failure counts as metric cards |
| EventTimeline | `components/EventTimeline.tsx` | Color-coded event stream with dot indicators |
| ExploitChain | `components/ExploitChain.tsx` | Original vuln → exploit progression → final status |
| PatchViewer | `components/PatchViewer.tsx` | Generated patch in dark code block |
| SecurityConvergence | `components/SecurityConvergence.tsx` | Audit iteration red→green progression |
| AgentFailures | `components/AgentFailures.tsx` | Failure telemetry table |
| EventLineageGraph | `graph/EventLineageGraph.tsx` | React Flow causal DAG |

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
| `source_file` | `FileContext` | Submitted source file metadata |
| `vulnerability` | `VulnerabilityReport` | Current vulnerability description |
| `latest_patch` | `PatchProposal \| null` | Most recent generated patch |
| `original_vulnerability` | `VulnerabilityReport` | Frozen first-triage vulnerability |
| `active_vulnerability` | `VulnerabilityReport` | Current (possibly mutated) vulnerability |
| `exploit_chain` | `ExploitChainEntry[]` | Append-only list of exploit vectors |
| `audit_history` | `AuditCritique[]` | All audit iterations with GoT reasoning trees |
| `event_history` | `EventRecord[]` | Full event log with `event_id`, `parent_event_id`, `timestamp` |
| `last_event_id` | `string \| null` | Pointer to most recent event |
| `agent_failures` | `AgentFailure[]` | Isolated listener error telemetry |
| `system_logs` | `string[]` | Real-time telemetry log |
| `mesh_iteration` | `number` | Current adversarial loop iteration |
| `max_mesh_iterations` | `number` | Escalation guard limit (default 8) |

---

## How It Works

### Event Bus (`BandMeshChannel`)

The core `core/band_mesh.py` implements a pub/sub event bus with shared mutable state. Agents subscribe to event types and receive callbacks when events are broadcast. The bus provides:

- **Event Provenance** — every broadcast generates a UUID, captures a parent pointer, and timestamps the event
- **Escalation Guard** — after 8 `VULNERABILITY_TRIAGED` broadcasts, the mesh sets `ESCALATION_REQUIRED` and blocks further dispatch
- **Callback Isolation** — try/except around each listener so one failure never crashes another; errors recorded in `agent_failures`
- **Exploit Chain** — the first vulnerability is frozen as `original_vulnerability`; subsequent exploit vectors are appended to `exploit_chain`

### Blue Coder (LangGraph)

A LangGraph state machine with three nodes: `patcher_agent` (LLM generates patch), `compiler_validator` (syntax check), and `routing_evaluator` (retry or finalize). Runs up to 3 compile iterations per invocation.

### Red Auditor (Graph-of-Thoughts)

A DAG-based adversarial reasoning engine that explores multiple attack vectors simultaneously. Each `ThoughtNode` represents one hypothesis; parent links form a reasoning tree. The auditor returns an `AuditCritique` with verdict, exploit vector, and the full GoT tree.

### Adversarial Loop

```
VULNERABILITY_TRIAGED → Blue Coder → PATCH_PROPOSED → Red Auditor
  └── if not secure: rebroadcast VULNERABILITY_TRIAGED with exploit vector
      └── loop until SECURED or ESCALATION_REQUIRED
```

---

## Testing

```bash
python -m pytest tests/ -v
```

24 tests across 3 test files:

| File | Coverage |
|---|---|
| `test_agents.py` | Blue Coder LangGraph: compile validation, routing, patch generation |
| `test_band_mesh.py` | Mesh reliability: iteration counting, escalation guard, callback isolation, event provenance |
| `test_utils.py` | Markdown code extraction utilities |

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
- **React Flow** — Causal execution graph
- **TanStack Query** — Server state management

---

## Design Decisions

| Decision | Rationale |
|---|---|
| **In-process event bus** | Avoids distributed-system complexity; shared `dict` is synchronously mutated for full determinism |
| **LangGraph for Blue Coder** | State machine with conditional routing enables compile-verify-retry loops trivially |
| **Graph-of-Thoughts for Red Auditor** | DAG-based reasoning forces exploration of multiple attack surfaces simultaneously |
| **Mock mode by default** | Zero API cost during development; one env var to switch to live models |
| **Adversarial feedback loop** | Each rejection includes the exploit vector, making subsequent patches strictly better |
| **Event provenance (UUID + parent pointer)** | Enables full causal graph reconstruction without external storage |
| **Callback isolation with telemetry** | One failing agent never crashes the mesh; errors are recorded for debugging |
| **Dark-first React UI** | Premium security operations console aesthetic using Tailwind v4 |
| **TanStack Query for API state** | Built-in loading/success/error states without a state management library |
| **Dual UI (CLI + REST + Dashboard)** | Supports local development, API integration, and visual exploration |

---

## License

MIT
