"""Eval çalıştırıcı.

Kullanım (ai-backend klasöründen):
  python -m evals.run_eval                    # her örnek 1 kez
  python -m evals.run_eval --repeat 5         # her örnek 5 kez: tutarlılık ölçümü
  python -m evals.run_eval --only tr-04,en-03 # sadece bazı örnekler
  python -m evals.run_eval --tag negation     # sadece bir etiket

Her çalıştırma evals/results/<zaman>_<prompt>_<model>.json olarak kaydedilir.
Prompt'u değiştir -> tekrar çalıştır -> iki dosyayı karşılaştır. İşte "eval ile geliştirme" budur.
"""

import argparse
import json
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from pathlib import Path

from app.extractor import EFFORT, PROMPT_VERSION, extract
from app.llm import model_name, provider

from .scoring import aggregate, consistency, score_case

HERE = Path(__file__).parent
DATASET = HERE / "dataset.jsonl"
RESULTS_DIR = HERE / "results"


def load_cases(only: str | None, tag: str | None) -> list[dict]:
    cases = [json.loads(line) for line in DATASET.read_text().splitlines() if line.strip()]
    if only:
        ids = set(only.split(","))
        cases = [c for c in cases if c["id"] in ids]
    if tag:
        cases = [c for c in cases if tag in c["tags"]]
    return cases


def run_one(case: dict) -> dict:
    try:
        r = extract(case["text"])
        return {
            "predicted": r.data.model_dump(),
            "latency_ms": r.latency_ms,
            "input_tokens": r.input_tokens,
            "output_tokens": r.output_tokens,
        }
    except Exception as e:  # eval hiçbir örnekte durmamalı; hatayı kaydedip devam ediyoruz
        return {"error": f"{type(e).__name__}: {e}"}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--repeat", type=int, default=1)
    ap.add_argument("--only")
    ap.add_argument("--tag")
    ap.add_argument("--workers", type=int, default=4)
    args = ap.parse_args()

    cases = load_cases(args.only, args.tag)
    jobs = [(c, i) for c in cases for i in range(args.repeat)]
    print(f"{len(cases)} örnek x {args.repeat} = {len(jobs)} çağrı | "
          f"model={model_name()} effort={EFFORT} prompt={PROMPT_VERSION} provider={provider()}")

    t0 = time.perf_counter()
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        outputs = list(pool.map(lambda job: run_one(job[0]), jobs))
    wall = time.perf_counter() - t0

    per_case: dict[str, list[dict]] = {c["id"]: [] for c in cases}
    for (case, _), out in zip(jobs, outputs):
        per_case[case["id"]].append(out)

    scored, details = [], []
    for case in cases:
        runs = per_case[case["id"]]
        first = runs[0]
        entry = {"id": case["id"], "tags": case["tags"]}
        if "error" in first:
            entry["error"] = first["error"]
        else:
            entry["score"] = score_case(case["expected"], first["predicted"])
        scored.append(entry)

        ok_runs = [r["predicted"] for r in runs if "predicted" in r]
        details.append({
            **entry,
            "text": case["text"],
            "expected": case["expected"],
            "runs": runs,
            "consistency": consistency(ok_runs) if args.repeat > 1 else None,
        })

    summary = aggregate(scored)
    ok_outputs = [o for o in outputs if "predicted" in o]
    if ok_outputs:
        summary["avg_latency_ms"] = sum(o["latency_ms"] for o in ok_outputs) / len(ok_outputs)
        summary["total_input_tokens"] = sum(o["input_tokens"] for o in ok_outputs)
        summary["total_output_tokens"] = sum(o["output_tokens"] for o in ok_outputs)
    summary["wall_seconds"] = round(wall, 1)
    if args.repeat > 1:
        agreements = [d["consistency"]["agreement"] for d in details if d["consistency"]]
        summary["mean_agreement"] = sum(agreements) / len(agreements) if agreements else None
        summary["unstable_cases"] = [d["id"] for d in details
                                     if d["consistency"] and d["consistency"]["distinct"] > 1]

    print_report(summary, details)

    RESULTS_DIR.mkdir(exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    out_path = RESULTS_DIR / f"{stamp}_{PROMPT_VERSION}_{model_name()}_{EFFORT}.json"
    out_path.write_text(json.dumps({
        "config": {"model": model_name(), "effort": EFFORT, "prompt_version": PROMPT_VERSION,
                   "provider": provider(), "repeat": args.repeat},
        "summary": summary,
        "cases": details,
    }, ensure_ascii=False, indent=2))
    print(f"\nKaydedildi: {out_path}")
    return 0


def print_report(summary: dict, details: list[dict]) -> None:
    pct = lambda x: f"{x * 100:5.1f}%"
    print("\n=== SONUÇ ===")
    if summary.get("errors"):
        print(f"Hata: {summary['errors']}/{summary['n']}")
    for d in details:
        if "error" in d:
            print(f"[{d['id']}] HATA: {d['error']}")
    if "exact_acc" not in summary:
        return
    print(f"Tam eşleşme      : {pct(summary['exact_acc'])}")
    for f in ("mood", "crampSeverity", "flow", "otherSymptoms"):
        print(f"  {f:<15}: {pct(summary[f + '_acc'])}")
    s = summary["symptoms"]
    print(f"  belirtiler P/R/F1: {pct(s['precision'])} / {pct(s['recall'])} / {pct(s['f1'])}")
    print("Etikete göre tam eşleşme:")
    for tag, v in summary["exact_by_tag"].items():
        print(f"  {tag:<16} {pct(v)}")
    if summary.get("mean_agreement") is not None:
        print(f"Tutarlılık (ort.): {pct(summary['mean_agreement'])} | "
              f"kararsız örnekler: {', '.join(summary['unstable_cases']) or 'yok'}")

    misses = [d for d in details if "score" in d and not d["score"]["exact"]]
    if misses:
        print("\n--- Yanlışlar (incele, prompt'u ya da etiketi düzelt) ---")
        for d in misses:
            pred = d["runs"][0]["predicted"]
            wrong = [f for f in ("mood", "crampSeverity", "flow", "otherSymptoms") if not d["score"][f]]
            print(f"[{d['id']}] {d['text']}")
            for f in wrong:
                print(f"    {f}: beklenen={d['expected'][f]!r}  tahmin={pred[f]!r}")


if __name__ == "__main__":
    sys.exit(main())
