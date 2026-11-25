from evals.scoring import aggregate, consistency, score_case

EXP = {"mood": "sad", "crampSeverity": 3, "flow": "heavy", "otherSymptoms": ["headache"]}


def test_exact_match():
    s = score_case(EXP, dict(EXP))
    assert s["exact"] and s["sym_tp"] == 1 and s["sym_fp"] == 0


def test_null_is_an_answer():
    exp = {**EXP, "mood": None}
    s = score_case(exp, {**EXP, "mood": "sad"})
    assert not s["mood"] and not s["exact"]


def test_symptom_hallucination_counts_as_fp():
    s = score_case(EXP, {**EXP, "otherSymptoms": ["headache", "acne"]})
    assert s["sym_fp"] == 1 and s["sym_fn"] == 0 and not s["otherSymptoms"]


def test_symptom_order_does_not_matter():
    exp = {**EXP, "otherSymptoms": ["a", "b"]}
    assert score_case(exp, {**exp, "otherSymptoms": ["b", "a"]})["exact"]


def test_aggregate_skips_errors_and_groups_tags():
    scored = [
        {"id": "1", "tags": ["x"], "score": score_case(EXP, EXP)},
        {"id": "2", "tags": ["x", "y"], "score": score_case(EXP, {**EXP, "flow": "light"})},
        {"id": "3", "tags": ["y"], "error": "boom"},
    ]
    s = aggregate(scored)
    assert s["n"] == 3 and s["errors"] == 1
    assert s["exact_acc"] == 0.5 and s["flow_acc"] == 0.5
    assert s["exact_by_tag"] == {"x": 0.5, "y": 0.0}


def test_consistency():
    a = {"mood": "sad", "crampSeverity": 1, "flow": None, "otherSymptoms": ["b", "a"]}
    b = {**a, "otherSymptoms": ["a", "b"]}  # aynı cevap, farklı sıra
    c = {**a, "crampSeverity": 2}
    r = consistency([a, b, c, a])
    assert r["agreement"] == 0.75 and r["distinct"] == 2
