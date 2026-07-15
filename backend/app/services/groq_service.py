# backend/app/services/groq_service.py

import os
import json

from groq import Groq
from dotenv import load_dotenv


load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

MODEL = os.getenv(
    "GROQ_MODEL",
    # "llama-3.1-8b-instant"
    # "GROQ_MODEL=llama3-70b-8192"
    "GROQ_MODEL=llama-3.3-70b-versatile"
)
LANGUAGE_MAP = {
    "en": "English",
    "te": "Telugu",
    "hi": "Hindi",
    "ta": "Tamil",
    "kn": "Kannada"
}


def get_ai_recommendation(
    disease_name: str,
    lang: str = "en"
):
    print("GROQ LANG =", lang)
    prompt = f"""
You are an agricultural assistant.

Disease detected: {disease_name}

IMPORTANT LANGUAGE RULE:

You MUST answer ONLY in {LANGUAGE_MAP.get(lang)} language.

Forbidden:

- English sentences
- English explanation words
- Mixing other languages

Allowed:

- Product names only can stay English:
NPK
Copper Sulphate
Urea
DAP
Potash

Example for Hindi:

BAD:

Use Copper Sulphate spray every 5 days.

GOOD:

हर 5 दिन में Copper Sulphate का छिड़काव करें।

Return ONLY JSON.

{{
  "fertilizers": "...",
  "pesticides": "..."
}}

No explanation outside JSON.
"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.7
    )

    text = response.choices[0].message.content
    print("RAW GROQ =", text)

    try:
        data = json.loads(text)
        return data

    except Exception:
        raise Exception(
            "Invalid JSON returned by Groq"
        )