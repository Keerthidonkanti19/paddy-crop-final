# backend/app/services/groq_service.py

# import os
# import json

# from groq import Groq
# from dotenv import load_dotenv


# load_dotenv()

# client = Groq(
#     api_key=os.getenv("GROQ_API_KEY")
# )

# MODEL = os.getenv(
#     "GROQ_MODEL",
#     "llama-3.1-8b-instant"
# )


# def get_ai_recommendation(
#     disease_name: str
# ):

#     prompt = f"""
# Rice crop disease detected: {disease_name}

# Give agricultural recommendations.

# Return ONLY valid JSON.

# Format:

# {{
#   "fertilizers": "best fertilizer recommendation",
#   "pesticides": "best pesticide recommendation"
# }}

# Do not add explanation outside JSON.
# Keep answer simple for farmers.
# """


#     response = client.chat.completions.create(
#         model=MODEL,
#         messages=[
#             {
#                 "role": "user",
#                 "content": prompt
#             }
#         ],
#         temperature=0.3
#     )

#     text = response.choices[0].message.content

#     try:
#         data = json.loads(text)
#         return data

#     except Exception:
#         raise Exception(
#             "Invalid JSON returned by Groq"
#         )
    
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
    "llama-3.1-8b-instant"
)


def get_ai_recommendation(
    disease_name: str
):

    prompt = f"""
You are an expert agricultural advisor helping Indian rice farmers.

Rice crop disease detected: {disease_name}

Provide practical and farmer-friendly recommendations.

Give:

1. Best fertilizer recommendation
2. Best pesticide recommendation

Rules:

- Keep recommendations low-cost and practical
- Suggest commonly used agricultural products
- Keep language simple so farmers can understand
- Do NOT give long explanations

Return ONLY valid JSON in this exact format:

{{
  "fertilizers": "your fertilizer recommendation",
  "pesticides": "your pesticide recommendation"
}}

Do not write anything outside JSON.
"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3
    )

    text = response.choices[0].message.content

    try:
        data = json.loads(text)
        return data

    except Exception:
        raise Exception(
            "Invalid JSON returned by Groq"
        )