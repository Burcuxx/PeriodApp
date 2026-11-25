"""HTTP API: mobil uygulama bu uç noktayı çağırır.

Çalıştırma:  uvicorn app.main:app --reload
Deneme:      curl -X POST localhost:8000/extract -H 'content-type: application/json' \
                  -d '{"text": "bugün karnım çok ağrıyor, akıntı yoğun, moralim bozuk"}'
"""

import anthropic
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from .extractor import PROMPT_VERSION, ExtractionError, extract
from .schema import SymptomExtraction

app = FastAPI(title="PeriodApp AI")


class ExtractRequest(BaseModel):
    text: str = Field(min_length=1, max_length=2000)


class ExtractResponse(BaseModel):
    log: SymptomExtraction
    model: str
    promptVersion: str
    latencyMs: int


@app.get("/health")
def health() -> dict:
    return {"ok": True}


@app.post("/extract", response_model=ExtractResponse)
def extract_endpoint(req: ExtractRequest) -> ExtractResponse:
    try:
        result = extract(req.text)
    except ExtractionError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except anthropic.RateLimitError:
        raise HTTPException(status_code=429, detail="Çok fazla istek, biraz sonra tekrar dene.")
    except anthropic.APIConnectionError:
        raise HTTPException(status_code=503, detail="LLM servisine ulaşılamadı.")
    except anthropic.APIStatusError as e:
        raise HTTPException(status_code=502, detail=f"LLM servisi hata döndürdü ({e.status_code}).")

    return ExtractResponse(
        log=result.data,
        model=result.model,
        promptVersion=PROMPT_VERSION,
        latencyMs=result.latency_ms,
    )
