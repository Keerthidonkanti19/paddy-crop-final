# backend/app/services/recommendations_static.py

from __future__ import annotations


# ---------------------------------------------------
# English Recommendation Texts
# ---------------------------------------------------
_EN_TEXTS: dict[str, dict[str, str]] = {

    "Bacterial Blight": {
        "label": "Bacterial Blight",

        "fertilizers": (
            "Avoid excess nitrogen fertilizer. "
            "Apply balanced NPK and maintain proper drainage."
        ),

        "pesticides": (
            "Use copper oxychloride-based bactericides "
            "as per agricultural recommendations."
        ),
    },

    "Brown Spot": {
        "label": "Brown Spot",

        "fertilizers": (
            "Apply balanced potassium and silica-rich fertilizers. "
            "Maintain healthy soil nutrition."
        ),

        "pesticides": (
            "Use Propiconazole or Azoxystrobin-based fungicides "
            "as recommended."
        ),
    },

    "Healthy": {
        "label": "Healthy",

        "fertilizers": (
            "Continue balanced fertilization "
            "according to soil test recommendations."
        ),

        "pesticides": (
            "No pesticide needed. Continue regular monitoring."
        ),
    },

    "Leaf Blast": {
        "label": "Leaf Blast",

        "fertilizers": (
            "Avoid excessive nitrogen application. "
            "Maintain proper potassium levels."
        ),

        "pesticides": (
            "Use Tricyclazole or Tebuconazole fungicides "
            "as per local agricultural guidelines."
        ),
    },
    
    "Tungro": {
        "label": "Tungro",

        "fertilizers": (
            "Apply balanced nutrients and remove infected plants early. "
            "Maintain proper field sanitation."
        ),

        "pesticides": (
            "Control green leafhopper vectors using recommended insecticides "
            "under agricultural guidance."
        ),
    },

    "Uncertain": {
        "label": "Uncertain",

        "fertilizers": (
            "Please upload a clearer close-up image "
            "of a single rice leaf."
        ),

        "pesticides": (
            "Disease could not be identified confidently."
        ),
    },
}


# ---------------------------------------------------
# Recommendation Function
# ---------------------------------------------------
def get_recommendation(
    disease_name: str,
    lang: str = "en",
):

    disease_data = _EN_TEXTS.get(
        disease_name,
        _EN_TEXTS["Uncertain"],
    )

    return {

        "fertilizers": disease_data["fertilizers"],

        "pesticides": disease_data["pesticides"],

        "disease_label_i18n": {
            "en": disease_data["label"],
        },
    }
