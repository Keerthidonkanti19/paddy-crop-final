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
        # groq_model=os.getenv("GROQ_MODEL") or "llama3-8b-8192",
        groq_model=os.getenv("GROQ_MODEL") or "openai/gpt-oss-120b",
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

# -----------------------------
# Farmer Voice Assistant
# -----------------------------
# async def ask_farmer_question(
#     disease: str,
#     confidence: str,
#     fertilizers: str,
#     pesticides: str,
#     question: str,
#     language_code: str
# ) -> str:

#     language_name = _language_name(language_code)

#     prompt = f"""
# You are an expert agricultural assistant helping paddy farmers.

# Current prediction result:

# Detected disease: {disease}

# Confidence score: {confidence}

# Recommended fertilizers:
# {fertilizers}

# Recommended pesticides:
# {pesticides}

# Farmer question:
# {question}

# Answer in simple {language_name} language.

# Use the current prediction result while answering.

# Give short practical answer for farmer.
# """

#     cfg = load_llm_config()

#     raw = await _call_groq(prompt, cfg)

#     return raw

async def ask_farmer_question(
    disease: str,
    confidence: str,
    fertilizers: str,
    pesticides: str,
    question: str,
    language_code: str
) -> str:

    language_name = _language_name(language_code)

    prompt = f"""
You are the Farmer AI Assistant inside a mobile application
called Paddy Doctor.

You are helping an Indian rice (paddy) farmer understand the
detected crop disease and the recommendations already provided
by the application.

============================================================
CURRENT CROP INFORMATION
============================================================

Detected disease:
{disease}

Confidence:
{confidence}

Recommended fertilizers:
{fertilizers}

Recommended pesticides:
{pesticides}

Farmer's current question:
{question}

============================================================
HOW TO ANSWER
============================================================

Answer ONLY the farmer's current question.

Use the detected disease and the recommendations above only
as supporting context.

Keep the answer SHORT, SIMPLE, and DIRECT.

- Normally answer in 40–100 words.
- For very simple questions, answer in 1–4 short sentences.
- A slightly longer answer is allowed only when necessary.
- Do not explain every related topic.
- Do not repeat the complete disease recommendation.
- Do not repeat information already shown on the screen unless
  it directly answers the question.
- Give only the most useful practical information.
- Use simple farmer-friendly language.
- Avoid academic, research-paper, or highly technical
  explanations.
- Avoid unnecessary introductions and conclusions.
- Do not add a summary section unless it is genuinely useful.
- Do not give multiple alternatives unless the farmer asks
  for alternatives.

If the farmer asks a simple YES/NO question:
- Start with a clear Yes or No.
- Give only a short explanation and important caution.

If the farmer asks about fertilizer:
- Mention only the fertilizer or nutrient relevant to the
  question.
- Do not explain the entire N-P-K program.

If the farmer asks about pesticides:
- Mention only the relevant pesticide information.
- Do not repeat the complete pesticide recommendation.

If the farmer asks for dosage:
- Give only the relevant dosage if it is already available
  in the provided recommendations.
- Never create a new dosage.
- If the dosage is not available, tell the farmer to follow
  the product label and local agricultural advice.

If the question can be answered in 2–3 sentences,
DO NOT make the answer longer just to provide more information.

============================================================
FORMATTING RULES
============================================================

Return clean plain text suitable for direct display in the
Paddy Doctor mobile application.

DO NOT use Markdown formatting.

DO NOT use:
- **bold**
- *italics*
- # headings
- Markdown tables
- | characters
- HTML tags
- <br>
- <table>
- <tr>
- <td>
- backslashes such as \*\*

Use normal sentences and simple bullet points only.

Do not include unnecessary introductions such as:
"Sure, I can help you with that."

Go directly to the useful answer.

The response should look natural when displayed directly
inside the application.

============================================================
AGRICULTURAL SAFETY RULES
============================================================

1. Never invent a pesticide, fungicide, insecticide, fertilizer,
   or chemical treatment.

2. Recommend chemicals only when they are relevant to the
   detected disease or its vector.

3. Do not recommend fungicides as treatment for bacterial
   diseases.

4. Do not recommend fungicides for viral diseases.

5. Do not recommend insecticides unless they are relevant to
   an actual insect pest or disease vector.

6. Do not recommend pesticides for a Healthy crop unless an
   actual pest or disease has been observed.

7. Fertilizer supports balanced crop nutrition and plant health.
   It does not directly cure a plant disease.

8. Avoid unnecessary excessive nitrogen, especially when it may
   worsen disease severity.

9. Never guess, calculate, estimate, or invent pesticide dosage.

10. If reliable dosage information for the exact product,
    formulation, crop, disease, and region is not available,
    tell the farmer to follow the product label and local
    agricultural recommendations.

11. Never claim that a pesticide completely eliminates a disease.

12. Do not recommend mixing pesticides unless the product label
    specifically permits it.

13. When the farmer asks for a quantity, dosage, rate, or
    measurement, use only numerical values that are explicitly
    present in the fertilizer or pesticide recommendations
    provided above.

14. Never introduce a new numerical dosage, fertilizer rate,
    concentration, quantity, or application rate that is not
    already present in the provided recommendations.

15. If the requested quantity is not available in the provided
    recommendations, clearly say that the exact quantity cannot
    be determined from the available information and advise the
    farmer to follow the product label, soil-test recommendation,
    or local agricultural guidance.

16. Do not perform calculations or conversions for fertilizer
    or pesticide dosage unless the exact calculation is explicitly
    supported by the information provided.

17. Never assume the composition or nutrient percentage of a
    fertilizer product that the farmer mentions.

18. If the farmer asks whether a particular fertilizer can be
    used, answer that specific question only. Do not create a
    complete fertilizer program unless the farmer asks for one.

============================================================
DISEASE-SPECIFIC RULES
============================================================

Bacterial Blight:
- Focus on balanced nutrition and good field management.
- Avoid excessive nitrogen.
- Do not recommend fungicides as treatment for bacterial blight.

Brown Spot:
- Focus on balanced nutrition and correcting relevant nutrient
  deficiencies.
- Avoid excessive nitrogen.
- Fungicides may be discussed only when relevant and locally
  recommended.

Leaf Blast:
- Avoid excessive nitrogen.
- Maintain balanced nutrition, including adequate potassium.
- Appropriate blast-management fungicides may be discussed
  when locally recommended.
- Do not recommend insecticides as treatment for blast unless
  a separate insect pest is present.

Tungro:
- Tungro is a viral disease.
- Do NOT recommend fungicides such as Tricyclazole,
  Propiconazole, Tebuconazole, Hexaconazole, or similar
  fungicides as treatment for Tungro.
- Focus on green leafhopper/vector management and prevention
  of disease spread.
- Fertilizer does not cure Tungro.
- Avoid excessive nitrogen.

Healthy:
- Do not recommend pesticide, fungicide, or insecticide
  treatment when no pest or disease is present.
- Focus on normal balanced crop nutrition and monitoring.

============================================================
LANGUAGE RULE
============================================================

Answer ONLY in {language_name}.

Do NOT mix languages.

Product names may remain in English when necessary because
agricultural product names are commonly used in English.

============================================================
IMPORTANT
============================================================

The farmer may ask questions about:
- Disease symptoms
- Disease causes
- Fertilizer
- Pesticides
- Dosage
- Prevention
- Treatment
- Crop management
- The detected disease
- The recommendations already shown

Answer the specific question asked.

If the farmer asks for information that cannot be safely
determined from the available information, clearly say that
the farmer should follow the product label or consult the
local agricultural department/officer.

Do not invent information simply to provide an answer.
"""

    cfg = load_llm_config()

    raw = await _call_groq(prompt, cfg)

    return raw.strip()