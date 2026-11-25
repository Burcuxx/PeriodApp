"""1. Aşama: Serbest metinden yapılandırılmış belirti kaydı çıkarma.

Akış:
  kullanıcı metni  ->  Claude (structured outputs)  ->  SymptomExtraction (doğrulanmış JSON)

Öğrenme notları:
  * `messages.parse(output_format=PydanticModel)` modeli şemaya UYMAYA zorlar.
    Yani geçersiz JSON veya listede olmayan bir değer gelmez; "doğru mu?" sorusu ise
    eval'in işidir (bkz. evals/).
  * Prompt'u değiştirdiğinde PROMPT_VERSION'u artır; eval sonuçları bu sürümle kaydedilir,
    böylece hangi değişikliğin neyi iyileştirdiğini görebilirsin.
"""

import os
import time
from dataclasses import dataclass

from .llm import get_client, model_name, provider
from .schema import SymptomExtraction

PROMPT_VERSION = "v1"

SYSTEM_PROMPT = """Bir regl takip uygulaması için kullanıcının günlük notunu yapılandırılmış bir kayda dönüştürüyorsun.
Not Türkçe, İngilizce, Fransızca veya Almanca olabilir.

Kurallar:
- Yalnızca metinde açıkça söylenen veya güçlü biçimde ima edilen bilgiyi çıkar. Tahmin etme; emin değilsen alanı null bırak.
- crampSeverity: kramp / karın ağrısı / regl ağrısı için. "ağrım yok" gibi açık bir olumsuzluk 0'dır; hiç bahsedilmiyorsa null.
  hafif=1, orta / idare edilebilir=2, çok kötü / dayanılmaz / ağrı kesici olmadan duramıyorum=3.
- flow: yalnızca regl kanaması/akıntısından bahsediliyorsa doldur (az/lekelenme=light, normal=medium, çok/yoğun=heavy).
- mood: tek bir baskın ruh hali seç. Ruh hali belirtilmemişse null.
- otherSymptoms: listedeki belirtilerden metinde geçenler. Bel ağrısı back_pain'dir, kramp değildir.
- Not tıbbi bir soru içerse bile sen sadece çıkarım yaparsın; tavsiye vermezsin."""

EFFORT = os.environ.get("EXTRACTOR_EFFORT", "low")  # basit çıkarım görevi: low ile başla, eval ile karşılaştır


class ExtractionError(Exception):
    pass


@dataclass
class ExtractionResult:
    data: SymptomExtraction
    model: str
    latency_ms: int
    input_tokens: int
    output_tokens: int


def extract(text: str) -> ExtractionResult:
    client = get_client()
    request = dict(
        model=model_name(),
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        output_config={"effort": EFFORT},
        messages=[{"role": "user", "content": f"<note>\n{text}\n</note>"}],
        output_format=SymptomExtraction,
    )

    start = time.perf_counter()
    if provider() == "anthropic":
        # Güvenlik sınıflandırıcısı nadiren de olsa reddederse ("refusal"),
        # sunucu aynı isteği otomatik olarak yedek bir modelde yeniden çalıştırır.
        response = client.beta.messages.parse(
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
            **request,
        )
    else:
        # Foundry'de sunucu taraflı fallback yok; reddi aşağıda hata olarak ele alıyoruz.
        response = client.messages.parse(**request)
    latency_ms = int((time.perf_counter() - start) * 1000)

    if response.stop_reason == "refusal":
        raise ExtractionError("Model isteği reddetti.")
    if response.stop_reason == "max_tokens":
        raise ExtractionError("Yanıt max_tokens sınırında kesildi.")
    if response.parsed_output is None:
        raise ExtractionError(f"Çıktı ayrıştırılamadı (stop_reason={response.stop_reason}).")

    return ExtractionResult(
        data=response.parsed_output,
        model=response.model,
        latency_ms=latency_ms,
        input_tokens=response.usage.input_tokens,
        output_tokens=response.usage.output_tokens,
    )
