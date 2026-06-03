import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import streamlit as st
import uuid
from core.band_mesh import BandMeshChannel
from schemas.models import FileContext, VulnerabilityReport
from main import initialize_blue_coder_service, initialize_red_auditor_service

# 1. Page Configuration Config
st.set_page_config(
    page_title="Adversarial Agentic Mesh Node",
    page_icon="📡",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.title("📡 BAND Mesh: Adversarial Security Patching Network")
st.caption("Powered by AI/ML API (Qwen-2.5-Coder & DeepSeek-R1) Frameworks")

# 2. Initialize Persistent Session States in Streamlit Browser Cache
if "mesh" not in st.session_state:
    session_id = f"session-{uuid.uuid4()}"
    st.session_state.mesh = BandMeshChannel(session_id=session_id)
    # Register our decoupled mesh agents to the current session instance
    initialize_blue_coder_service(st.session_state.mesh)
    initialize_red_auditor_service(st.session_state.mesh)

mesh = st.session_state.mesh

# 3. Sidebar Infrastructure Control Panel
with st.sidebar:
    st.header("⚡ Operational Controls")
    st.write(f"**Session Identity:** `{mesh.session_id}`")

    # Visual Status Rings matching the current state of the mesh bus
    status = mesh.shared_context["status"]
    if status == "INITIALIZED":
        st.info("🟢 Status: Idle / Ready")
    elif status in ["UNDER_REVIEW", "AUDITING"]:
        st.warning("⚡ Status: Execution Active")
    elif status == "SECURED":
        st.success("🛡️ Status: System Secured")
    elif status == "PATCH_REJECTED":
        st.error("🚨 Status: Exploit Flagged")

    st.divider()
    st.markdown("### Target Code Sandbox Ingestion")
    sample_code = st.text_area("Input Vulnerable Source Code Here:", value="""query = f"SELECT * FROM accounts WHERE name = '{user_input}'"
cursor.execute(query)""", height=120)

    sample_bug = st.text_input("Vulnerability Focus Target", "SQL Injection via string concatenation")

    if st.button("🚀 Execute Mesh Run Loop", use_container_width=True):
        mesh.shared_context["system_logs"] = []  # Reset prior log histories
        mesh.shared_context["audit_history"] = []

        # Inject the trigger payload directly onto the BAND mesh channel bus
        mock_file = FileContext(file_path="src/vulnerable.py", raw_code=sample_code, language="python")
        mock_bug = VulnerabilityReport(description=sample_bug, target_lines=[1, 2], severity="HIGH")

        mesh.broadcast("VULNERABILITY_TRIAGED", {
            "source_file": mock_file.model_dump(),
            "vulnerability": mock_bug.model_dump()
        })

# 4. Main View Layout Split (Two Columns)
col_left, col_right = st.columns([1, 1])

with col_left:
    st.subheader("🖥️ Dynamic Mesh Telemetry Bus")
    # Stream logs out into a clean system CLI simulation terminal element
    log_box = st.text_area(
        "Live Communication Event Stream",
        value="\n".join(mesh.shared_context["system_logs"]),
        height=320,
        disabled=True
    )

    # Display the final corrected structural patch proposal code inside a code block
    st.subheader("🛡️ Finalized Safe Code Output")
    latest_patch = mesh.shared_context["latest_patch"]
    if latest_patch:
        st.code(latest_patch["proposed_code"], language="python")
    else:
        st.info("Awaiting code mitigation loops from Agent 2...")

with col_right:
    st.subheader("🧠 DeepSeek-R1 Graph of Thoughts (GoT)")

    # Extract the nested audit histories posted onto the mesh by the Red Agent
    history = mesh.shared_context["audit_history"]
    if history:
        latest_audit = history[-1]
        st.write(f"**Audit Verdict:** {'✅ SECURE' if latest_audit['is_secure'] else '❌ VULNERABLE'}")
        if latest_audit['exploit_found']:
            st.error(f"**Exploit Path Vector:** {latest_audit['exploit_found']}")

        # Draw a visual mind map node graph of DeepSeek's thinking process using Graphviz
        st.markdown("#### Attack Hypothesis Tree Structure")
        dot_graph = "digraph G {\n"
        dot_graph += "  node [shape=box, style=filled, color=lightblue, fontname=Helvetica];\n"

        for node in latest_audit["graph_of_thoughts"]:
            t_id = node["thought_id"]
            hyp = node["hypothesis"]
            res = node["evaluation_result"]

            # Format and color nodes based on whether they hit a vulnerability
            node_color = "salmon" if "vulnerable" in res.lower() or "fail" in res.lower() else "lightgrey"
            dot_graph += f'  {t_id} [label="{hyp}\\n➔ {res}", fillcolor={node_color}];\n'

            # Draw the parent connections
            for p_id in node["parent_thoughts"]:
                dot_graph += f"  {p_id} -> {t_id};\n"

        dot_graph += "}"
        st.graphviz_chart(dot_graph)
    else:
        st.info("Graph of Thoughts rendering will display here once the adversarial audit triggers.")
