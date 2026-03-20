# llm.py
import json
import os
import re
from dataclasses import dataclass
from typing import Any, Dict, List, Literal, Optional

import httpx

# -----------------------------
# Provider Types
# -----------------------------
Provider = Literal["groq"]

# -----------------------------
# Language Mapping
# -----------------------------
LANGUAGE_NAME_MAP: Dict[str, str] = {
    "en": "English",
    "hi": "Hindi",
    "te": "Telugu",
    "ta": "Tamil",
    "kn": "Kannada",
}

# -----------------------------
# Config Dataclass
# -----------------------------
@dataclass(frozen=True)
class LLMConfig:
    provider: Provider
    groq_api_key: Optional[str]
    groq_model: str

# -----------------------------
# Load Config
# -----------------------------
def load_llm_config() -> LLMConfig:
    return LLMConfig(
        provider="groq",
        groq_api_key=os.getenv("GROQ_API_KEY"),
        groq_model=os.getenv("GROQ_MODEL") or "llama3-8b-8192",
    )

# -----------------------------
# Language Helper
# -----------------------------
def _language_name(language_code: str) -> str:
    code = (language_code or "en").strip().lower()
    return LANGUAGE_NAME_MAP.get(code, code)

# -----------------------------
# Prompt Builder
# -----------------------------
def _build_prompt(disease: str, language_code: str) -> str:
    language_name = _language_name(language_code)
    disease_clean = (disease or "").strip()

    return f"""
You are an agricultural assistant for rice (paddy) farmers.

The detected rice disease is: {disease_clean}

Generate the following in {language_name}:
1. Symptoms (as bullet points)
2. Causes (as bullet points)
3. Treatment steps (include suitable fertilizers and pesticides with dosage, as numbered steps)
4. Prevention methods (as bullet points)

Return STRICT JSON only with this schema:
{{
  "symptoms": ["..."],
  "causes": ["..."],
  "treatment_steps": ["..."],
  "prevention_methods": ["..."]
}}

Make guidance practical and safe.
""".strip()

# -----------------------------
# JSON Extractor
# -----------------------------
def _extract_json_object(text: str) -> Dict[str, Any]:
    text = (text or "").strip()

    try:
        obj = json.loads(text)
        if isinstance(obj, dict):
            return obj
    except Exception:
        pass

    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        return json.loads(match.group(0))

    raise ValueError("Could not parse JSON")

# -----------------------------
# Normalize Output
# -----------------------------
def _normalize_recommendations(obj: Dict[str, Any]) -> Dict[str, List[str]]:
    def ensure_list(value: Any) -> List[str]:
        if isinstance(value, list):
            return [str(v).strip() for v in value if str(v).strip()]
        if isinstance(value, str):
            return [v.strip() for v in re.split(r"\n|-|•", value) if v.strip()]
        return []

    return {
        "symptoms": ensure_list(obj.get("symptoms")),
        "causes": ensure_list(obj.get("causes")),
        "treatment_steps": ensure_list(obj.get("treatment_steps")),
        "prevention_methods": ensure_list(obj.get("prevention_methods")),
    }

# -----------------------------
# Groq Call
# -----------------------------
async def _call_groq(prompt: str, cfg: LLMConfig) -> str:
    if not cfg.groq_api_key:
        raise RuntimeError("GROQ_API_KEY not set")

    url = "https://api.groq.com/openai/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {cfg.groq_api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": cfg.groq_model,
        "messages": [
            {"role": "system", "content": "You are a helpful agricultural assistant."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
    }

    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(url, headers=headers, json=payload)
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"]

# -----------------------------
# Main Function
# -----------------------------
async def generate_recommendations(
    disease: str,
    language_code: str
) -> Dict[str, List[str]]:

    cfg = load_llm_config()
    prompt = _build_prompt(disease, language_code)

    raw = await _call_groq(prompt, cfg)

    parsed = _extract_json_object(raw)
    return _normalize_recommendations(parsed)