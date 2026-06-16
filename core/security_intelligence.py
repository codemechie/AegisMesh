def prepare_security_context(shared_context: dict) -> dict:
    return {
        "audit_history": shared_context.get("audit_history", []),
        "benchmark_telemetry": shared_context.get("benchmark_telemetry", {}),
        "exploit_chain": shared_context.get("exploit_chain", []),
        "agent_failures": shared_context.get("agent_failures", []),
        "final_status": shared_context.get("status", "UNKNOWN"),
        "mesh_iteration": shared_context.get("mesh_iteration", 0),
        "max_mesh_iterations": shared_context.get("max_mesh_iterations", 8)
    }
