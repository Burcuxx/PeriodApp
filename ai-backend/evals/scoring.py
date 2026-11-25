"""Puanlama fonksiyonları. Saf Python, LLM çağırmaz, bu yüzden birim testi yazılabilir.

Ölçtüklerimiz:
  * Alan doğruluğu (mood / crampSeverity / flow): beklenen == tahmin (null da bir cevaptır!)
  * otherSymptoms: küme karşılaştırması -> precision / recall / F1
      precision düşük  -> model olmayan belirti uyduruyor (halüsinasyon)
      recall düşük     -> model geçen belirtiyi kaçırıyor
  * Tam eşleşme: kaydın tamamı doğru mu? En sert metrik.
  * Tutarlılık: aynı metin N kez çalıştırılınca cevaplar aynı mı? (3. aşamanın ön izlemesi)
"""

from collections import Counter, defaultdict

SCALAR_FIELDS = ("mood", "crampSeverity", "flow")


def score_case(expected: dict, predicted: dict) -> dict:
    result = {f: expected.get(f) == predicted.get(f) for f in SCALAR_FIELDS}

    exp_set = set(expected.get("otherSymptoms") or [])
    pred_set = set(predicted.get("otherSymptoms") or [])
    tp = len(exp_set & pred_set)
    result["sym_tp"] = tp
    result["sym_fp"] = len(pred_set - exp_set)
    result["sym_fn"] = len(exp_set - pred_set)
    result["otherSymptoms"] = exp_set == pred_set

    result["exact"] = all(result[f] for f in (*SCALAR_FIELDS, "otherSymptoms"))
    return result


def _prf(tp: int, fp: int, fn: int) -> dict:
    precision = tp / (tp + fp) if tp + fp else 1.0
    recall = tp / (tp + fn) if tp + fn else 1.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    return {"precision": precision, "recall": recall, "f1": f1}


def aggregate(scored: list[dict]) -> dict:
    """scored: [{"id", "tags", "score": score_case(...)}] (hatalı olanlarda "error")."""
    ok = [s for s in scored if "score" in s]
    n = len(ok)
    summary: dict = {"n": len(scored), "errors": len(scored) - n}
    if n == 0:
        return summary

    for f in (*SCALAR_FIELDS, "otherSymptoms", "exact"):
        summary[f"{f}_acc"] = sum(s["score"][f] for s in ok) / n

    tp = sum(s["score"]["sym_tp"] for s in ok)
    fp = sum(s["score"]["sym_fp"] for s in ok)
    fn = sum(s["score"]["sym_fn"] for s in ok)
    summary["symptoms"] = _prf(tp, fp, fn)

    by_tag: dict[str, list[bool]] = defaultdict(list)
    for s in ok:
        for tag in s["tags"]:
            by_tag[tag].append(s["score"]["exact"])
    summary["exact_by_tag"] = {t: sum(v) / len(v) for t, v in sorted(by_tag.items())}
    return summary


def _canonical(pred: dict) -> tuple:
    return (
        pred.get("mood"),
        pred.get("crampSeverity"),
        pred.get("flow"),
        tuple(sorted(pred.get("otherSymptoms") or [])),
    )


def consistency(runs: list[dict]) -> dict:
    """Aynı girdinin N çıktısı. Tüm çalıştırmalar aynı cevabı verdiyse agreement=1.0."""
    if not runs:
        return {"agreement": 0.0, "distinct": 0, "majority": None}
    counts = Counter(_canonical(r) for r in runs)
    top, top_count = counts.most_common(1)[0]
    return {
        "agreement": top_count / len(runs),
        "distinct": len(counts),
        "majority": top,
    }
