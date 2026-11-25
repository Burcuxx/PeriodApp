"""Çıktı şeması: LLM'in döndürmesi gereken yapı.

Alanlar mobil uygulamadaki `SymptomLog` tipiyle (src/types/index.ts) birebir eşleşir,
böylece backend'in çıktısı doğrudan uygulamaya kaydedilebilir.

Neden sabit listeler (Literal) kullanıyoruz?
  Serbest metin ("baş ağrısı", "başım zonkluyor", "migren") puanlanamaz.
  Sabit bir sözlük hem uygulamada gösterilebilir hem de eval'de doğru/yanlış
  diye ölçülebilir. Structured outputs bu listelerin dışına çıkmayı engeller.
"""

from typing import Literal, Optional

from pydantic import BaseModel, Field

Mood = Literal["happy", "calm", "sad", "irritable", "anxious", "energetic"]
Flow = Literal["light", "medium", "heavy"]
OtherSymptom = Literal[
    "headache",
    "bloating",
    "fatigue",
    "acne",
    "back_pain",
    "breast_tenderness",
    "nausea",
    "insomnia",
    "cravings",
]


class SymptomExtraction(BaseModel):
    mood: Optional[Mood] = Field(
        None, description="Baskın ruh hali. Metinde yoksa null."
    )
    crampSeverity: Optional[Literal[0, 1, 2, 3]] = Field(
        None,
        description="Kramp/karın ağrısı: 0=yok, 1=hafif, 2=orta, 3=şiddetli. Bahsedilmiyorsa null.",
    )
    flow: Optional[Flow] = Field(
        None, description="Regl akışı. Bahsedilmiyorsa null."
    )
    otherSymptoms: list[OtherSymptom] = Field(
        default_factory=list, description="Metinde geçen diğer belirtiler."
    )
