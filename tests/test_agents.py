from agents.blue_coder.agent import write_patch_node, compile_verification_node, routing_evaluator
from schemas.models import PatchProposal


class TestCompileVerificationNode:
    def test_valid_python_returns_success(self, blue_coder_state):
        blue_coder_state["current_patch"] = PatchProposal(
            patch_id="p1",
            proposed_code="x = 1\ny = 2\nprint(x + y)",
            architectural_changes="none",
            dependencies_added=[]
        )
        result = compile_verification_node(blue_coder_state)
        assert result == {"compiler_logs": "SUCCESS"}

    def test_syntax_error_returns_error_msg(self, blue_coder_state):
        blue_coder_state["current_patch"] = PatchProposal(
            patch_id="p2",
            proposed_code="def foo(\n    pass",
            architectural_changes="none",
            dependencies_added=[]
        )
        result = compile_verification_node(blue_coder_state)
        assert "SyntaxError" in result["compiler_logs"]
        assert "line" in result["compiler_logs"]

    def test_none_patch_returns_error(self, blue_coder_state):
        blue_coder_state["current_patch"] = None
        result = compile_verification_node(blue_coder_state)
        assert result == {"compiler_logs": "ERROR: No patch available to verify"}


class TestRoutingEvaluator:
    def test_retry_on_compile_failure_below_max(self, blue_coder_state):
        blue_coder_state["compiler_logs"] = "SyntaxError on line 1"
        blue_coder_state["iteration_count"] = 1
        assert routing_evaluator(blue_coder_state) == "retry"

    def test_finalize_on_success(self, blue_coder_state):
        blue_coder_state["compiler_logs"] = "SUCCESS"
        blue_coder_state["iteration_count"] = 2
        assert routing_evaluator(blue_coder_state) == "finalize"

    def test_finalize_when_max_iterations_reached(self, blue_coder_state):
        blue_coder_state["compiler_logs"] = "SyntaxError on line 1"
        blue_coder_state["iteration_count"] = 3
        blue_coder_state["max_iterations"] = 3
        assert routing_evaluator(blue_coder_state) == "finalize"


class TestWritePatchNode:
    def test_returns_current_patch_and_incremented_count(self, blue_coder_state):
        result = write_patch_node(blue_coder_state)
        assert "current_patch" in result
        assert "iteration_count" in result
        assert isinstance(result["current_patch"], PatchProposal)
        assert len(result["current_patch"].patch_id) > 0
        assert result["iteration_count"] == 1

    def test_proposed_code_is_valid_python(self, blue_coder_state):
        result = write_patch_node(blue_coder_state)
        code = result["current_patch"].proposed_code
        compile(code, "<test>", "exec")


class TestBlueCoderAppIntegration:
    def test_full_graph_runs_and_returns_patch(self, blue_coder_state):
        from agents.blue_coder.agent import blue_coder_app
        output = blue_coder_app.invoke(blue_coder_state)
        assert "current_patch" in output
        assert "compiler_logs" in output
        assert "iteration_count" in output
        assert output["compiler_logs"] == "SUCCESS"
        assert isinstance(output["current_patch"], PatchProposal)
        assert output["iteration_count"] == 1
