# PeriodApp AI Backend: LLM öğrenme projesi

Kullanıcının serbest yazdığı günlük notu ("karnım çok ağrıyor, akıntı yoğun, moralim bozuk")
uygulamanın `SymptomLog` kaydına çeviren bir Python servisi ve bu servisi ölçen bir eval seti.

```
not (serbest metin) ──► Claude + structured outputs ──► { mood, crampSeverity, flow, otherSymptoms }
                                                              │
                         evals/dataset.jsonl (elle etiketli) ─┴─► puan: doğruluk, P/R/F1, tutarlılık
```

## Kurulum

```bash
cd ai-backend
pip install -r requirements.txt
cp .env.example .env     # anahtarını yaz, sonra:  export $(cat .env | xargs)
```

Sağlayıcı seçimi `app/llm.py` içinde yapılır:
- `ANTHROPIC_API_KEY`: doğrudan Claude API
- `ANTHROPIC_FOUNDRY_RESOURCE` + `ANTHROPIC_FOUNDRY_API_KEY`: **Microsoft Foundry (Azure)** üzerinden Claude. İş ilanındaki "MSFT Foundry" deneyimi buradan gelir.

## Çalıştırma

```bash
pytest                                   # puanlama mantığının testleri (LLM çağırmaz, ücretsiz)
python -m evals.run_eval                 # tüm eval seti, 38 çağrı
python -m evals.run_eval --repeat 5      # her örnek 5 kez: model tutarlı mı?
python -m evals.run_eval --tag negation  # sadece bir zorluk türü
uvicorn app.main:app --reload            # HTTP API: POST /extract {"text": "..."}
```

## Dosyalar

| Dosya | Ne işe yarar |
|---|---|
| `app/schema.py` | Çıktı şeması (Pydantic). Uygulamadaki `SymptomLog` ile aynı alanlar. |
| `app/extractor.py` | Prompt ve LLM çağrısı. `PROMPT_VERSION` her prompt değişikliğinde artırılır. |
| `app/llm.py` | İstemci fabrikası (Claude API veya Foundry). |
| `app/main.py` | FastAPI uç noktası ve hata eşleme (429, 502, 503). |
| `evals/dataset.jsonl` | 38 elle etiketlenmiş örnek: TR/EN/FR/DE, olumsuzluk, belirsizlik, prompt injection... |
| `evals/scoring.py` | Puanlama: alan doğruluğu, belirtiler için precision/recall, tutarlılık. |
| `evals/run_eval.py` | Seti çalıştırır, raporlar ve `evals/results/` içine kaydeder. |

## Öğrenme döngüsü (asıl ders burası)

1. `python -m evals.run_eval` ile **baseline** al.
2. "Yanlışlar" listesini oku. Her yanlış için sor: **model mi hatalı, etiket mi hatalı, yoksa soru mu belirsiz?**
   (`amb-*` örnekleri bilerek belirsiz bırakıldı; insanlar bile anlaşamaz.)
3. Tek bir değişiklik yap: prompt kuralı ekle, örnek ekle, `EXTRACTOR_EFFORT` veya `EXTRACTOR_MODEL` değiştir.
4. `PROMPT_VERSION`'u artır ve tekrar çalıştır. Sonuç dosyalarını karşılaştır.
5. Bir şey iyileşirken başka bir şey bozuldu mu? (`exact_by_tag` buna bakmak için var.)

Denemeye değer sorular:
- `EXTRACTOR_EFFORT=low` ile `medium` arasında doğruluk farkı var mı? Gecikme ve token farkı ne kadar?
- `EXTRACTOR_MODEL=claude-haiku-5-5` ile Opus arasında fark var mı? Ucuz model bu görev için yeterli mi?
- `--repeat 5` ile hangi örnekler kararsız? Neden? (İpucu: genelde belirsiz olanlar. Bu 3. aşamanın konusu.)

## Yol haritası

- [x] **1. Aşama:** serbest metinden yapılandırılmış veriye çıkarım (structured outputs)
- [x] **2. Aşama:** eval seti ve puanlama
- [ ] **3. Aşama:** tutarsızlık analizi (`--repeat` ile başla)
- [ ] **4. Aşama:** RAG (güvenilir kaynaklardan cevap) ve tool calling (kullanıcının döngü verisi)
- [ ] **5. Aşama:** webhook, kuyruk ve worker ile haftalık özet
- [ ] **6. Aşama:** "metinden JSON'a çıkarım ve eval" kodunu yeniden kullanılabilir modüle çevirmek

> Not: Bu bir sağlık uygulaması. Asistan teşhis koymaz ve tavsiye vermez; `tr-15` örneği bunu test etmeye başlar.
