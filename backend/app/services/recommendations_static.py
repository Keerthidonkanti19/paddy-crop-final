# backend/app/services/recommendations_static.py

from __future__ import annotations


# ---------------------------------------------------
# Multilingual Static Recommendations
# ---------------------------------------------------
_TEXTS: dict[str, dict[str, dict[str, str]]] = {

    # =====================================================
    # ENGLISH
    # =====================================================
    "en": {

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
                "Use Tricyclazole or Tebuconazole fungicides."
            ),
        },

        "Tungro": {
            "label": "Tungro",
            "fertilizers": (
                "Apply balanced nutrients and remove infected plants early."
            ),
            "pesticides": (
                "Control green leafhopper vectors using recommended insecticides."
            ),
        },

        "Uncertain": {
            "label": "Uncertain",
            "fertilizers": "Please upload a clearer leaf image.",
            "pesticides": "Disease could not be identified confidently."
        }
    },

    # =====================================================
    # TELUGU
    # =====================================================
    "te": {

        "Bacterial Blight": {
            "label": "ఆకుల బ్యాక్టీరియా ఎండురోగం",
            "fertilizers": (
                "అధిక నత్రజని ఎరువులు వేయకండి. "
                "సమతుల్య NPK ఎరువులు వాడండి."
            ),
            "pesticides": (
                "కాపర్ ఆక్సీక్లోరైడ్ ఆధారిత మందులు పిచికారీ చేయండి."
            ),
        },

        "Brown Spot": {
            "label": "గోధుమ మచ్చ తెగులు",
            "fertilizers": (
                "పొటాషియం మరియు సిలికా ఉన్న ఎరువులు వాడండి."
            ),
            "pesticides": (
                "ప్రొపికోనాజోల్ లేదా అజోక్సిస్ట్రోబిన్ మందులు వాడండి."
            ),
        },

        "Healthy": {
            "label": "ఆరోగ్యకరమైన పంట",
            "fertilizers": (
                "నేల పరీక్ష ప్రకారం సమతుల్య ఎరువులు కొనసాగించండి."
            ),
            "pesticides": (
                "పురుగుమందులు అవసరం లేదు. పంటను గమనించండి."
            ),
        },

        "Leaf Blast": {
            "label": "ఆకుమచ్చ తెగులు",
            "fertilizers": (
                "అధిక యూరియా వేయకండి. పొటాష్ సరిపడా వాడండి."
            ),
            "pesticides": (
                "ట్రైసైక్లాజోల్ లేదా టెబ్యూకోనాజోల్ మందులు వాడండి."
            ),
        },

        "Tungro": {
            "label": "టంగ్రో వైరస్ తెగులు",
            "fertilizers": (
                "సమతుల్య పోషకాలు ఇవ్వండి. సోకిన మొక్కలను తొలగించండి."
            ),
            "pesticides": (
                "గ్రీన్ లీఫ్ హాపర్ నియంత్రణకు తగిన మందులు వాడండి."
            ),
        },

        "Uncertain": {
            "label": "తెలియని సమస్య",
            "fertilizers": "దయచేసి స్పష్టమైన ఆకు చిత్రం అప్లోడ్ చేయండి.",
            "pesticides": "వ్యాధిని ఖచ్చితంగా గుర్తించలేకపోయాం."
        }
    },

    # =====================================================
    # HINDI
    # =====================================================
    "hi": {

        "Bacterial Blight": {
            "label": "पत्ती का बैक्टीरियल झुलसा रोग",
            "fertilizers": "अधिक नाइट्रोजन उर्वरक न डालें। संतुलित NPK डालें।",
            "pesticides": "कॉपर ऑक्सीक्लोराइड आधारित दवा का उपयोग करें।"
        },

        "Brown Spot": {
            "label": "भूरा धब्बा रोग",
            "fertilizers": "पोटाश और सिलिका युक्त उर्वरक डालें।",
            "pesticides": "प्रोपिकोनाजोल या अजोक्षीस्ट्रोबिन का प्रयोग करें।"
        },

        "Healthy": {
            "label": "स्वस्थ फसल",
            "fertilizers": "मिट्टी परीक्षण के अनुसार उर्वरक डालते रहें।",
            "pesticides": "कीटनाशक की आवश्यकता नहीं है।"
        },

        "Leaf Blast": {
            "label": "ब्लास्ट रोग",
            "fertilizers": "अधिक यूरिया न डालें। पोटाश संतुलित रखें।",
            "pesticides": "ट्राइसाइक्लाजोल या टेबुकोनाजोल का उपयोग करें।"
        },

        "Tungro": {
            "label": "टंग्रो वायरस रोग",
            "fertilizers": "संतुलित पोषक तत्व दें। संक्रमित पौधे हटाएं।",
            "pesticides": "ग्रीन लीफ हॉपर नियंत्रण हेतु दवा का प्रयोग करें।"
        },

        "Uncertain": {
            "label": "अस्पष्ट रोग",
            "fertilizers": "कृपया साफ पत्ती की फोटो अपलोड करें।",
            "pesticides": "रोग की पहचान स्पष्ट नहीं है।"
        }
    },

    # =====================================================
    # TAMIL
    # =====================================================
    "ta": {

        "Bacterial Blight": {
            "label": "பாக்டீரியா இலை கருகல் நோய்",
            "fertilizers": "அதிக நைட்ரஜன் உரம் இட வேண்டாம். சமநிலை NPK பயன்படுத்தவும்.",
            "pesticides": "காப்பர் ஆக்ஸிகுளோரைடு மருந்து பயன்படுத்தவும்."
        },

        "Brown Spot": {
            "label": "பழுப்பு புள்ளி நோய்",
            "fertilizers": "பொட்டாசியம் மற்றும் சிலிகா உரம் பயன்படுத்தவும்.",
            "pesticides": "பிரோபிகோனசோல் அல்லது அசோக்ஸிஸ்ட்ரோபின் பயன்படுத்தவும்."
        },

        "Healthy": {
            "label": "ஆரோக்கியமான பயிர்",
            "fertilizers": "மண் பரிசோதனைப்படி உரம் தொடரவும்.",
            "pesticides": "பூச்சிக்கொல்லி தேவையில்லை."
        },

        "Leaf Blast": {
            "label": "இலை வெடிப்பு நோய்",
            "fertilizers": "அதிக யூரியா இட வேண்டாம்.",
            "pesticides": "டிரைசைக்ளசோல் அல்லது டெபுகோனசோல் பயன்படுத்தவும்."
        },

        "Tungro": {
            "label": "டங்க்ரோ வைரஸ் நோய்",
            "fertilizers": "சமநிலை ஊட்டச்சத்து கொடுக்கவும்.",
            "pesticides": "கிரீன் லீஃப் ஹாப்பர் கட்டுப்படுத்த மருந்து பயன்படுத்தவும்."
        },

        "Uncertain": {
            "label": "தெரியாத நோய்",
            "fertilizers": "தெளிவான இலை படத்தை பதிவேற்றவும்.",
            "pesticides": "நோய் சரியாக கண்டறியப்படவில்லை."
        }
    },

    # =====================================================
    # KANNADA
    # =====================================================
    "kn": {

        "Bacterial Blight": {
            "label": "ಬ್ಯಾಕ್ಟೀರಿಯಾ ಎಲೆ ಒಣರೋಗ",
            "fertilizers": "ಹೆಚ್ಚು ನೈಟ್ರೋಜನ್ ಗೊಬ್ಬರ ಬೇಡ. ಸಮತೋಲನ NPK ಬಳಸಿ.",
            "pesticides": "ಕಾಪರ್ ಆಕ್ಸಿಕ್ಲೋರೈಡ್ ಆಧಾರಿತ ಔಷಧಿ ಬಳಸಿ."
        },

        "Brown Spot": {
            "label": "ಕಂದು ಮಚ್ಚೆ ರೋಗ",
            "fertilizers": "ಪೊಟಾಶ್ ಮತ್ತು ಸಿಲಿಕಾ ಇರುವ ಗೊಬ್ಬರ ಬಳಸಿ.",
            "pesticides": "ಪ್ರೊಪಿಕೊನಜೋಲ್ ಅಥವಾ ಅಜೋಕ್ಸಿಸ್ಟ್ರೋಬಿನ್ ಬಳಸಿ."
        },

        "Healthy": {
            "label": "ಆರೋಗ್ಯಕರ ಬೆಳೆ",
            "fertilizers": "ಮಣ್ಣಿನ ಪರೀಕ್ಷೆಯಂತೆ ಗೊಬ್ಬರ ಮುಂದುವರಿಸಿ.",
            "pesticides": "ಔಷಧಿ ಅಗತ್ಯವಿಲ್ಲ."
        },

        "Leaf Blast": {
            "label": "ಎಲೆ ಬ್ಲಾಸ್ಟ್ ರೋಗ",
            "fertilizers": "ಹೆಚ್ಚು ಯೂರಿಯಾ ಬಳಸದಿರಿ.",
            "pesticides": "ಟ್ರೈಸೈಕ್ಲಾಜೋಲ್ ಅಥವಾ ಟೆಬ್ಯುಕೋನಾಜೋಲ್ ಬಳಸಿ."
        },

        "Tungro": {
            "label": "ಟಂಗ್ರೋ ವೈರಸ್ ರೋಗ",
            "fertilizers": "ಸಮತೋಲನ ಪೋಷಕಾಂಶ ನೀಡಿ.",
            "pesticides": "ಗ್ರೀನ್ ಲೀಫ್ ಹಾಪರ್ ನಿಯಂತ್ರಣಕ್ಕೆ ಔಷಧಿ ಬಳಸಿ."
        },

        "Uncertain": {
            "label": "ಅಸ್ಪಷ್ಟ ರೋಗ",
            "fertilizers": "ದಯವಿಟ್ಟು ಸ್ಪಷ್ಟವಾದ ಎಲೆ ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
            "pesticides": "ರೋಗವನ್ನು ಖಚಿತವಾಗಿ ಗುರುತಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ."
        }
    }
}


# ---------------------------------------------------
# Recommendation Function
# ---------------------------------------------------
def get_recommendation(
    disease_name: str,
    lang: str = "en",
):

    language_data = _TEXTS.get(
        lang,
        _TEXTS["en"]
    )

    disease_data = language_data.get(
        disease_name,
        language_data["Uncertain"]
    )

    return {
        "fertilizers": disease_data["fertilizers"],
        "pesticides": disease_data["pesticides"],
        "disease_label_i18n": {
            lang: disease_data["label"]
        },
    }