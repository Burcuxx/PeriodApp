"""LLM istemcisi: tek bir yerden oluşturulur, böylece sağlayıcı değiştirmek kolaydır.

- ANTHROPIC_FOUNDRY_RESOURCE tanımlıysa Claude'u Microsoft Foundry (Azure) üzerinden çağırırız.
- Değilse doğrudan Claude API'yi kullanırız (ANTHROPIC_API_KEY).
"""

import os
from functools import lru_cache

import anthropic

DEFAULT_MODEL = "claude-opus-5-5"


def model_name() -> str:
    return os.environ.get("EXTRACTOR_MODEL", DEFAULT_MODEL)


def provider() -> str:
    return "foundry" if os.environ.get("ANTHROPIC_FOUNDRY_RESOURCE") else "anthropic"


@lru_cache(maxsize=1)
def get_client() -> anthropic.Anthropic:
    if provider() == "foundry":
        return anthropic.AnthropicFoundry(
            resource=os.environ["ANTHROPIC_FOUNDRY_RESOURCE"],
            api_key=os.environ.get("ANTHROPIC_FOUNDRY_API_KEY"),
        )
    return anthropic.Anthropic()
