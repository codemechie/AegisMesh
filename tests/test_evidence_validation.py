import warnings
from schemas.models import AuditCritique, Evidence, ThoughtNode


SAMPLE_CODE = "line1\nline2\nline3\nline4\nline5\nline6\nline7\nline8\nline9\nline10"
SAMPLE_PATH = "server/app.py"

SAMPLE_20LINE_CODE = "\n".join(f"line{i}" for i in range(1, 21))
SAMPLE_3VULN_PATH = "server/app.py"


def make_critique(
    finding_type: str = "VERIFIED_EXPLOIT",
    evidence: list = None,
    patch_id: str = "patch-test-uuid",
) -> AuditCritique:
    return AuditCritique(
        patch_id=patch_id,
        is_secure=False,
        finding_type=finding_type,
        confidence="HIGH",
        evidence=evidence or [],
        exploit_found="Test exploit",
        graph_of_thoughts=[
            ThoughtNode(
                thought_id="T1",
                hypothesis="Test",
                evaluation_result="Result",
                parent_thoughts=[],
            )
        ],
    )


class TestValidateEvidenceValidEvidence:
    def test_valid_evidence_same_file_valid_line(self):
        critique = make_critique(
            evidence=[
                Evidence(file=SAMPLE_PATH, line=3, reason="Line 3 is vulnerable")
            ]
        )
        invalid_count, downgraded = critique.validate_evidence(SAMPLE_CODE, SAMPLE_PATH)
        assert invalid_count == 0
        assert downgraded is False
        assert len(critique.evidence) == 1
        assert critique.finding_type == "VERIFIED_EXPLOIT"

    def test_valid_evidence_first_line(self):
        critique = make_critique(
            evidence=[
                Evidence(file=SAMPLE_PATH, line=1, reason="First line vulnerable")
            ]
        )
        invalid_count, downgraded = critique.validate_evidence(SAMPLE_CODE, SAMPLE_PATH)
        assert invalid_count == 0
        assert len(critique.evidence) == 1

    def test_valid_evidence_last_line(self):
        critique = make_critique(
            evidence=[
                Evidence(file=SAMPLE_PATH, line=10, reason="Last line vulnerable")
            ]
        )
        invalid_count, downgraded = critique.validate_evidence(SAMPLE_CODE, SAMPLE_PATH)
        assert invalid_count == 0
        assert len(critique.evidence) == 1

    def test_multiple_valid_evidence_all_kept(self):
        critique = make_critique(
            evidence=[
                Evidence(file=SAMPLE_PATH, line=1, reason="Issue A"),
                Evidence(file=SAMPLE_PATH, line=5, reason="Issue B"),
                Evidence(file=SAMPLE_PATH, line=10, reason="Issue C"),
            ]
        )
        invalid_count, downgraded = critique.validate_evidence(SAMPLE_CODE, SAMPLE_PATH)
        assert invalid_count == 0
        assert len(critique.evidence) == 3
        assert critique.finding_type == "VERIFIED_EXPLOIT"


class TestValidateEvidenceInvalidLineNumbers:
    def test_line_number_exceeds_file_length(self):
        critique = make_critique(
            evidence=[
                Evidence(file=SAMPLE_PATH, line=31, reason="Out of bounds line")
            ]
        )
        invalid_count, downgraded = critique.validate_evidence(SAMPLE_20LINE_CODE, SAMPLE_3VULN_PATH)
        assert invalid_count == 1
        assert downgraded is True
        assert len(critique.evidence) == 0
        assert critique.finding_type == "SPECULATIVE_RISK"

    def test_negative_line_number(self):
        critique = make_critique(
            evidence=[
                Evidence(file=SAMPLE_PATH, line=-5, reason="Negative line number")
            ]
        )
        invalid_count, downgraded = critique.validate_evidence(SAMPLE_CODE, SAMPLE_PATH)
        assert invalid_count == 1
        assert downgraded is True
        assert len(critique.evidence) == 0
        assert critique.finding_type == "SPECULATIVE_RISK"

    def test_line_number_zero(self):
        critique = make_critique(
            evidence=[
                Evidence(file=SAMPLE_PATH, line=0, reason="Zero line number")
            ]
        )
        invalid_count, downgraded = critique.validate_evidence(SAMPLE_CODE, SAMPLE_PATH)
        assert invalid_count == 1
        assert downgraded is True
        assert len(critique.evidence) == 0
        assert critique.finding_type == "SPECULATIVE_RISK"


class TestValidateEvidenceInvalidFileReferences:
    def test_wrong_file_path(self):
        critique = make_critique(
            evidence=[
                Evidence(file="wrong/path.py", line=3, reason="Wrong file reference")
            ]
        )
        invalid_count, downgraded = critique.validate_evidence(SAMPLE_CODE, SAMPLE_PATH)
        assert invalid_count == 1
        assert downgraded is True
        assert len(critique.evidence) == 0
        assert critique.finding_type == "SPECULATIVE_RISK"

    def test_empty_file_path(self):
        critique = make_critique(
            evidence=[
                Evidence(file="", line=3, reason="Empty file path")
            ]
        )
        invalid_count, downgraded = critique.validate_evidence(SAMPLE_CODE, SAMPLE_PATH)
        assert invalid_count == 1
        assert len(critique.evidence) == 0


class TestValidateEvidenceMixedValidity:
    def test_mixed_valid_and_invalid_evidence_keeps_verified_exploit(self):
        critique = make_critique(
            evidence=[
                Evidence(file=SAMPLE_PATH, line=3, reason="Valid evidence"),
                Evidence(file=SAMPLE_PATH, line=99, reason="Invalid line"),
                Evidence(file="other.py", line=1, reason="Wrong file"),
            ]
        )
        invalid_count, downgraded = critique.validate_evidence(SAMPLE_CODE, SAMPLE_PATH)
        assert invalid_count == 2
        assert downgraded is False
        assert len(critique.evidence) == 1
        assert critique.evidence[0].line == 3
        assert critique.finding_type == "VERIFIED_EXPLOIT"

    def test_mixed_negative_and_valid_line(self):
        critique = make_critique(
            evidence=[
                Evidence(file=SAMPLE_PATH, line=-1, reason="Negative"),
                Evidence(file=SAMPLE_PATH, line=5, reason="Valid"),
            ]
        )
        invalid_count, downgraded = critique.validate_evidence(SAMPLE_CODE, SAMPLE_PATH)
        assert invalid_count == 1
        assert downgraded is False
        assert len(critique.evidence) == 1
        assert critique.evidence[0].line == 5
        assert critique.finding_type == "VERIFIED_EXPLOIT"


class TestValidateEvidenceNoEvidence:
    def test_empty_evidence_list(self):
        critique = make_critique(evidence=[])
        invalid_count, downgraded = critique.validate_evidence(SAMPLE_CODE, SAMPLE_PATH)
        assert invalid_count == 0
        assert downgraded is False
        assert len(critique.evidence) == 0
        assert critique.finding_type == "SPECULATIVE_RISK"

    def test_empty_evidence_still_handled_by_model_validator(self):
        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            critique = AuditCritique(
                patch_id="patch-empty",
                is_secure=False,
                finding_type="VERIFIED_EXPLOIT",
                confidence="HIGH",
                evidence=[],
                exploit_found=None,
                graph_of_thoughts=[],
            )
        assert critique.finding_type == "SPECULATIVE_RISK"
        assert len(w) >= 1
        assert "no evidence provided" in str(w[-1].message)


class TestValidateEvidenceOtherFindingTypes:
    def test_speculative_risk_not_downgraded(self):
        critique = make_critique(
            finding_type="SPECULATIVE_RISK",
            evidence=[
                Evidence(file=SAMPLE_PATH, line=99, reason="Invalid but speculative")
            ]
        )
        invalid_count, downgraded = critique.validate_evidence(SAMPLE_CODE, SAMPLE_PATH)
        assert invalid_count == 1
        assert downgraded is False
        assert len(critique.evidence) == 0
        assert critique.finding_type == "SPECULATIVE_RISK"

    def test_informational_not_downgraded(self):
        critique = make_critique(
            finding_type="INFORMATIONAL",
            evidence=[
                Evidence(file=SAMPLE_PATH, line=99, reason="Invalid but informational")
            ]
        )
        invalid_count, downgraded = critique.validate_evidence(SAMPLE_CODE, SAMPLE_PATH)
        assert invalid_count == 1
        assert downgraded is False
        assert len(critique.evidence) == 0
        assert critique.finding_type == "INFORMATIONAL"


class TestValidateEvidencePreservesValidEvidenceOnly:
    def test_only_invalid_removed_valid_preserved(self):
        critique = make_critique(
            evidence=[
                Evidence(file=SAMPLE_PATH, line=1, reason="Valid"),
                Evidence(file=SAMPLE_PATH, line=99, reason="Invalid"),
            ]
        )
        invalid_count, downgraded = critique.validate_evidence(SAMPLE_CODE, SAMPLE_PATH)
        assert invalid_count == 1
        assert downgraded is False
        assert len(critique.evidence) == 1
        assert critique.evidence[0].line == 1
        assert critique.evidence[0].file == SAMPLE_PATH


class TestValidateEvidenceEmptySourceCode:
    def test_empty_source_code_all_lines_invalid(self):
        critique = make_critique(
            evidence=[
                Evidence(file=SAMPLE_PATH, line=1, reason="Line 1 but empty source")
            ]
        )
        invalid_count, downgraded = critique.validate_evidence("", SAMPLE_PATH)
        assert invalid_count == 1
        assert downgraded is True
        assert len(critique.evidence) == 0
        assert critique.finding_type == "SPECULATIVE_RISK"

    def test_empty_source_with_line_zero(self):
        critique = make_critique(
            evidence=[
                Evidence(file=SAMPLE_PATH, line=0, reason="Line zero empty source")
            ]
        )
        invalid_count, downgraded = critique.validate_evidence("", SAMPLE_PATH)
        assert invalid_count == 1
        assert len(critique.evidence) == 0


class TestValidateEvidenceLargeLineNumbers:
    def test_very_large_line_number_downgrades(self):
        critique = make_critique(
            evidence=[
                Evidence(file=SAMPLE_PATH, line=999999, reason="Huge line number")
            ]
        )
        invalid_count, downgraded = critique.validate_evidence(SAMPLE_CODE, SAMPLE_PATH)
        assert invalid_count == 1
        assert downgraded is True
        assert critique.finding_type == "SPECULATIVE_RISK"


class TestValidateEvidenceNoSideEffectsOnValidCritique:
    def test_completely_valid_critique_unchanged(self):
        evidence = [
            Evidence(file=SAMPLE_PATH, line=2, reason="Issue"),
            Evidence(file=SAMPLE_PATH, line=8, reason="Issue"),
        ]
        critique = make_critique(evidence=evidence)
        original_type = critique.finding_type
        original_count = len(critique.evidence)
        invalid_count, downgraded = critique.validate_evidence(SAMPLE_CODE, SAMPLE_PATH)
        assert invalid_count == 0
        assert downgraded is False
        assert critique.finding_type == original_type
        assert len(critique.evidence) == original_count
