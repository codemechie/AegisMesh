# BAND Mesh — Adversarial Agentic Security Patching Network

[![Python 3.10+](https://img.shields.io/badge/python-3.10%2B-blue)](https://www.python.org/)
[![LangGraph](https://img.shields.io/badge/LangGraph-✓-brightgreen)](https://langchain-ai.github.io/langgraph/)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.42-red)](https://streamlit.io/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**BAND Mesh** is an in-process multi-agent system that autonomously patches security vulnerabilities through an adversarial red-team/blue-team feedback loop. Two AI agents — a **Blue Coder** (code generator) and a **Red Auditor** (adversarial security tester) — collaborate over a shared event bus to iteratively produce hardened, exploit-resistant patches.

---

## Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │              BAND Mesh Channel               │
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
```

## Adversarial Feedback Loop

The core innovation: a **closed-loop exploit-and-repair cycle** that mirrors real-world red-team exercises.

```
VULNERABILITY_TRIAGED
        │
        ▼
┌─────────────────────┐
│  Blue Coder invoked │── LLM → PatchProposal
│  (≤ 3 compile iters)│── compile() check
└─────────┬───────────┘
          │ broadcasts PATCH_PROPOSED
          ▼
┌─────────────────────┐
│  Red Auditor invoked│── LLM → AuditCritique
│  (Graph-of-Thoughts)│    with GoT DAG
└─────────┬───────────┘
          │
          ├── is_secure=true  →  SECURED  ✅
          │
          └── is_secure=false →  PATCH_REJECTED
               │  Exploit vector rebroadcast as
               │  VULNERABILITY_TRIAGED (CRITICAL)
               ▼
          (loop back — Blue Coder retries informed by exploit)
```

## Getting Started

### Prerequisites

```bash
python >= 3.10
```

### Installation

```bash
git clone https://github.com/yourusername/band-mesh.git
cd band-mesh
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### Run (CLI)

```bash
python main.py
```

This seeds a mock SQL injection vulnerability and runs the full adversarial lifecycle — patch, audit, exploit feedback, re-patch, secure.

### Run (Dashboard)

```bash
streamlit run dashboard/app.py
```

The Streamlit dashboard provides:
- Live telemetry log terminal
- Finalized patch code viewer
- Graph-of-Thoughts tree visualization via Graphviz

### Live LLM Mode

By default, the system runs in **mock mode** (zero-cost, deterministic JSON). To use real models:

```bash
export USE_REAL_AI_ML_API=TRUE
export AI_ML_API_KEY=your_api_key_here
python main.py
```

- Blue Coder uses `qwen-2.5-coder-72b-instruct`
- Red Auditor uses `deepseek-r1`

---

## Project Structure

```
band-mesh/
├── core/
│   ├── __init__.py
│   ├── band_mesh.py          # Pub/sub event bus + shared state
│   └── aiml_client.py        # LLM client (mock/real switching)
├── agents/
│   ├── blue_coder/
│   │   ├── __init__.py
│   │   ├── agent.py          # LangGraph StateGraph definition
│   │   └── graph.py          # BlueCoderState TypedDict
│   └── red_auditor/
│       ├── __init__.py
│       ├── engine.py         # GoT adversarial audit function
│       └── prompts.py        # System prompt for DeepSeek-R1
├── schemas/
│   ├── __init__.py
│   ├── models.py             # Pydantic models
│   └── telemetry.py          # (reserved for telemetry schema)
├── dashboard/
│   └── app.py                # Streamlit UI
├── tests/
│   └── test_agents.py        # (test scaffolding)
├── main.py                   # CLI entry point
├── requirements.txt
└── README.md
```

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **In-process event bus** | Avoids distributed-system complexity; shared `dict` is synchronously mutated for full determinism |
| **LangGraph for Blue Coder** | State machine with conditional routing enables compile-verify-retry loops trivially |
| **Graph-of-Thoughts for Red Auditor** | DAG-based reasoning forces exploration of multiple attack surfaces simultaneously |
| **Mock mode by default** | Zero API cost during development; one env var to switch to live models |
| **Adversarial feedback loop** | Each rejection includes the exploit vector, making subsequent patches strictly better |

## Schemas

| Model | Purpose |
|-------|---------|
| `FileContext` | Source file metadata (path, code, language) |
| `VulnerabilityReport` | Bug/vulnerability description with severity |
| `PatchProposal` | LLM-generated fix with code and architectural notes |
| `ThoughtNode` | Single node in the GoT reasoning DAG |
| `AuditCritique` | Verdict with exploit vector and full GoT tree |

## Contributing

Contributions are welcome. If you find a bug or have an idea for improvement, please open an issue or submit a pull request.

## License

MIT
