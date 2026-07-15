# backend/app/services/recommendations.py

from app.services.groq_service import get_ai_recommendation
from app.services.recommendations_static import (
    get_recommendation as static_rec
)


def get_recommendation(
    disease_name: str,
    lang: str = "en"
):
    print("RECOMMENDATION LANG =", lang)
    
    try:

        ai_data = get_ai_recommendation(
            disease_name,
            lang
        )

        return {
            "fertilizers": ai_data["fertilizers"],
            "pesticides": ai_data["pesticides"],
            "disease_label_i18n": {
                lang: disease_name
            }
        }

    except Exception as e:

        print("GROQ FAILED:", e)

        return static_rec(
            disease_name,
            lang
        )