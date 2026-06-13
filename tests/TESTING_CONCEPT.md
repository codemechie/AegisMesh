# Testing Concept: Fixtures

**What they are** — Pytest fixtures are reusable factory functions that provide test
dependencies (model instances, state dicts, etc.) without repeating setup code.

**Why they help** — Without fixtures, every test manually constructs the same objects:

```python
def test_something():
    fc = FileContext(file_path="...", raw_code="...", language="python")
    vr = VulnerabilityReport(description="...", target_lines=[1,2], severity="HIGH")
    state = {"source_file": fc, "vulnerability": vr, ...}
    # ... test logic ...
```

With fixtures, that boilerplate lives in `conftest.py` once:

```python
def test_something(blue_coder_state):
    # blue_coder_state is ready to use
    result = compile_verification_node(blue_coder_state)
    assert result["compiler_logs"] == "SUCCESS"
```

**Benefits**:
1. **Faster test writing** — no copy-paste of constructor calls
2. **Lighter test files** — focus on assertions, not setup
3. **Single source of truth** — change a default in one place, all tests pick it up
4. **Composable** — fixtures can depend on other fixtures (e.g. `patch_proposal` can be used standalone or composed into a state)
