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
    "openai/gpt-oss-120b"
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

Your task is to provide practical fertilizer and pesticide
recommendations specifically for the detected rice disease.

The recommendation must be scientifically appropriate for
the disease. Do not give a generic recommendation that could
apply to every rice crop.

============================================================
DISEASE-SPECIFIC AGRICULTURAL RULES
============================================================

Follow the rules below strictly.

1. BACTERIAL BLIGHT

Bacterial Blight is a bacterial disease.

Focus on:
- Balanced nutrient management.
- Avoid excessive nitrogen because excessive nitrogen can
  increase disease severity.
- Appropriate potassium and balanced crop nutrition.
- Use disease-management practices appropriate for bacterial
  blight.
- Resistant or tolerant varieties and good field management
  may be mentioned when relevant.

DO NOT recommend fungicides as if they treat bacterial blight.

Do not invent a chemical treatment if an appropriate treatment
is uncertain.

------------------------------------------------------------

2. BROWN SPOT

Brown Spot is a fungal disease.

Focus on:
- Balanced crop nutrition.
- Correcting relevant nutrient deficiencies when known.
- Avoid excessive nitrogen.
- Appropriate fungicide-based management may be mentioned
  when locally recommended and label-approved.
- Good crop and field management.

Fungicides may be recommended only when relevant to Brown Spot.

------------------------------------------------------------

3. LEAF BLAST

Leaf Blast is a fungal disease.

Focus on:
- Avoid excessive nitrogen.
- Maintain balanced crop nutrition, including adequate
  potassium.
- Appropriate blast-management fungicides may be mentioned
  when locally recommended and label-approved.
- Crop monitoring and prevention should also be included.

Do not recommend insecticides as treatment for Leaf Blast
unless a separate insect pest is actually present.

------------------------------------------------------------

4. TUNGRO

Tungro is a viral disease of rice and is associated with
green leafhopper transmission.

This rule is VERY IMPORTANT:

DO NOT recommend fungicides such as Tricyclazole,
Propiconazole, Tebuconazole, Hexaconazole or similar
fungicides as a treatment for Tungro.

Focus instead on:
- Management of the green leafhopper/vector.
- Monitoring for vector populations.
- Appropriate locally approved vector-management measures.
- Removal/management of severely affected plants where
  appropriate.
- Preventing further spread through vector management and
  field practices.
- Maintain balanced nutrition for overall crop health.
- Avoid excessive nitrogen.
- Make it clear that fertilizer does NOT cure or directly
  control the Tungro virus.

Do not describe Tungro as a fungal disease.

Do not present fungicides as treatment for the Tungro virus.

------------------------------------------------------------

5. HEALTHY

The crop is classified as Healthy.

Focus on:
- Normal balanced fertilizer management.
- Crop-stage-appropriate nutrient management.
- Avoid unnecessary excessive nitrogen.
- General crop health and monitoring.

IMPORTANT:

Do NOT recommend pesticides, fungicides, insecticides or
disease-treatment chemicals for a healthy crop unless an
actual pest or disease has been observed.

Clearly state that pesticide treatment is not required for
a healthy crop in the absence of a pest or disease problem.

============================================================
GENERAL SAFETY RULES
============================================================

1. Never invent a pesticide or fungicide for a disease.

2. Never recommend a chemical simply because it is commonly
   used in rice cultivation.

3. The chemical must be relevant to the detected disease.

4. Do not recommend fungicides for viral diseases.

5. Do not recommend insecticides unless they are relevant to
   the disease/vector or an actual insect pest is involved.

6. Do not recommend pesticides for a Healthy crop unless an
   actual pest or disease has been observed.

7. Do not provide dangerous, excessive or unsupported
   chemical doses.

8. Never calculate, estimate, convert, or infer a pesticide
   dosage from concentration, active ingredient percentage,
   or another product's dosage.

9. Do not provide a pesticide dosage unless the dosage is
   explicitly known and appropriate for the specific product
   formulation, crop, disease, and region.

10. If reliable dosage information is not available, say:
    "Please follow the dosage printed on the product label
    and the recommendation of your local agricultural
    department/officer."

11. Never guess a dosage just to provide a numerical answer.

12. Fertilizer recommendations should avoid unnecessary
    excessive nitrogen.

13. Do not claim that fertilizer cures, kills, or directly
    controls a plant disease. Fertilizer recommendations
    should be described as supporting balanced crop nutrition
    and plant health.

14. Do not claim that a pesticide completely guarantees
    disease elimination.

15. When chemical control is mentioned, recommend using only
    products that are legally registered/approved for the
    intended crop and disease in the farmer's region and
    following the product label.

============================================================
PRODUCT NAME RULE
============================================================

Product names may remain in English because agricultural
product names are commonly used in English.

Examples include:

NPK
Urea
DAP
Potash
Copper Oxychloride
Propiconazole
Azoxystrobin
Tricyclazole
Tebuconazole

However, do NOT automatically recommend these products.
Only mention a product when it is appropriate for the
detected disease.

============================================================
LANGUAGE RULE
============================================================

The selected language is:

{language}

Write the explanations ONLY in {language}.

Do NOT mix English sentences with {language}.

Product names may remain in English.

Disease names may remain in English when necessary for
clarity, but all explanatory sentences must be in the
selected language.

============================================================
RESPONSE STYLE
============================================================

The response is intended for a rice farmer using a mobile app.

Keep the response concise but informative.

- Normally keep each recommendation around 80–180 words.
- A slightly longer response is acceptable when the question
  requires additional explanation.
- Do not make the response unnecessarily long.
- Use short paragraphs or bullet points where appropriate.
- Use simple, practical, farmer-friendly language.
- Avoid academic, highly technical, or research-paper style
  explanations.
- Answer only what is relevant to the detected disease.
- Do not repeat the same information in multiple ways.
- Do not repeat the disease name unnecessarily.
- Do not include lengthy introductions or conclusions.
- Do not use tables unless specifically requested.
- Do not include unnecessary background information.

For fertilizer recommendations:
- Mention only relevant nutrients or fertilizers.
- Explain that fertilizer supports balanced nutrition and
  plant health; it does not directly cure the disease.
- Avoid unnecessary fertilizer products or excessive nitrogen.

For pesticide recommendations:
- Mention only chemicals relevant to the detected disease
  or its vector.
- Do not invent pesticide names or dosage values.
- If an exact dosage cannot be confidently established,
  instruct the farmer to follow the product label and local
  agricultural recommendations.
- If reliable dosage information is available for the specific
  product formulation, clearly state the unit.
- Otherwise, do not provide a numerical dosage. Tell the farmer
  to follow the product label and local agricultural advice.
- Do not recommend multiple chemicals unnecessarily.
- Do not encourage mixing chemicals unless the product label
  specifically permits it.

If the crop is Healthy:
- Clearly state that pesticide treatment is not required
  unless a pest or disease is actually observed.

The answer should be useful to a farmer who may have limited
technical knowledge and should be easy to read on a mobile phone.

============================================================
OUTPUT FORMAT
============================================================

Return ONLY valid JSON.

The JSON must contain exactly these two fields:

{{
    "fertilizers": "disease-specific fertilizer recommendation",
    "pesticides": "disease-specific pesticide recommendation"
}}

Do not return Markdown.

Do not return ```json.

Do not return explanations outside the JSON.

Do not add additional JSON fields.
"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a careful agricultural "
                    "recommendation assistant. "
                    "Follow the disease-specific rules "
                    "provided by the user exactly."
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