import os
import json

from groq import Groq
from dotenv import load_dotenv


load_dotenv()


# ============================================================
# GROQ CLIENT
# ============================================================

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


MODEL = os.getenv(
    "GROQ_MODEL",
    "llama-3.3-70b-versatile"
)


# ============================================================
# LANGUAGE MAP
# ============================================================

LANGUAGE_MAP = {
    "en": "English",
    "te": "Telugu",
    "hi": "Hindi",
    "ta": "Tamil",
    "kn": "Kannada",
}


# ============================================================
# AI RECOMMENDATION
# ============================================================

def get_ai_recommendation(
    disease_name: str,
    lang: str = "en"
):

    language = LANGUAGE_MAP.get(
        lang,
        "English"
    )

    print("========================================")
    print("GROQ RECOMMENDATION")
    print("Disease :", disease_name)
    print("Language:", language)
    print("========================================")

    prompt = f"""
You are an expert agricultural assistant specializing in
paddy (rice) crop diseases.

The AI image classification model has detected this disease:

DISEASE:
{disease_name}

Your task is to provide fertilizer and pesticide recommendations
SPECIFICALLY FOR THIS DISEASE.

IMPORTANT:
Do NOT give generic recommendations that could apply to any
paddy crop.

The recommendations MUST be relevant to:
{disease_name}

Consider:
- The nature of the disease
- Appropriate fertilizer/nutrient management
- Appropriate pesticide/fungicide/insecticide management
- Prevention and disease management principles

PRODUCT NAMES MAY REMAIN IN ENGLISH because they are commonly
used agricultural product names.

Examples of product names:
NPK
Urea
DAP
Potash
Copper Oxychloride
Propiconazole
Azoxystrobin
Tricyclazole
Tebuconazole

IMPORTANT SAFETY RULES:

1. Do not invent a pesticide for a disease if it is not
   appropriate for that disease.

2. Do not recommend pesticides for a healthy crop.

3. For Healthy, clearly state that pesticides are not required
   unless a pest or disease is actually observed.

4. Do not provide dangerous or excessive chemical doses.

5. If dosage information is uncertain, do not invent a number.
   Instead say to follow the product label and local agricultural
   recommendations.

6. Fertilizer recommendations must be disease-specific and should
   avoid unnecessary excessive nitrogen.

7. Recommendations should be practical for rice farmers.

LANGUAGE RULE:

You MUST write the explanations ONLY in {language}.

Do not mix English sentences with {language}.

Product names may remain in English.

Return ONLY valid JSON.

The JSON must have exactly these fields:

{{
    "fertilizers": "disease-specific fertilizer recommendation",
    "pesticides": "disease-specific pesticide recommendation"
}}

Do not return markdown.

Do not return ```json.

Do not provide explanations outside the JSON.
"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a careful agricultural "
                    "recommendation assistant."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2,
    )

    text = response.choices[0].message.content.strip()

    print("RAW GROQ RESPONSE:")
    print(text)

    # ========================================================
    # CLEAN POSSIBLE MARKDOWN
    # ========================================================

    if text.startswith("```"):
        text = text.replace(
            "```json",
            ""
        ).replace(
            "```",
            ""
        ).strip()

    # ========================================================
    # PARSE JSON
    # ========================================================

    try:

        data = json.loads(text)

    except json.JSONDecodeError as e:

        print(
            "GROQ JSON ERROR:",
            e
        )

        raise Exception(
            "Invalid JSON returned by Groq"
        )

    # ========================================================
    # VALIDATE RESPONSE
    # ========================================================

    if "fertilizers" not in data:
        raise Exception(
            "Groq response missing fertilizers"
        )

    if "pesticides" not in data:
        raise Exception(
            "Groq response missing pesticides"
        )

    return {
        "fertilizers": str(
            data["fertilizers"]
        ),
        "pesticides": str(
            data["pesticides"]
        ),
    }