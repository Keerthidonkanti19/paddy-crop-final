import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi' | 'te' | 'ta' | 'kn';

interface Translations {
  [key: string]: {
    [lang in Language]?: string;
  };
}

const translations: Translations = {
  welcome: {
    en: 'Welcome',
    hi: 'स्वागत है',
    te: 'స్వాగతం',
    ta: 'வரவேற்கிறோம்',
  },
  login: {
    en: 'Login',
    hi: 'लॉग इन करें',
    te: 'లాగిన్',
    ta: 'உள்நுழை',
  },
  username: {
    en: 'Username',
    hi: 'उपयोगकर्ता नाम',
    te: 'వినియోగదారు పేరు',
    ta: 'பயனர் பெயர்',
  },
  uploadImage: {
    en: 'Upload Image',
    hi: 'छवि अपलोड करें',
    te: 'చిత్రాన్ని అప్‌లోడ్ చేయండి',
    ta: 'படத்தை பதிவேற்றவும்',
  },
  capturePhoto: {
    en: 'Capture Photo',
    hi: 'फोटो कैप्चर करें',
    te: 'ఫోటో తీయండి',
    ta: 'புகைப்படம் எடுக்கவும்',
  },
  detectDisease: {
    en: 'Detect Disease',
    hi: 'रोग का पता लगाएं',
    te: 'వ్యాధిని గుర్తించండి',
    ta: 'நோயைக் கண்டறியவும்',
  },
  diseaseDetected: {
    en: 'Disease Detected',
    hi: 'रोग का पता चला',
    te: 'వ్యాధి గుర్తించబడింది',
    ta: 'நோய் கண்டறியப்பட்டது',
  },
  fertilizers: {
    en: 'Recommended Fertilizers',
    hi: 'अनुशंसित उर्वरक',
    te: 'సిఫార్సు చేసిన ఎరువులు',
    ta: 'பரிந்துரைக்கப்பட்ட உரங்கள்',
  },
  pesticides: {
    en: 'Recommended Pesticides',
    hi: 'अनुशंसित कीटनाशक',
    te: 'సిఫార్సు చేసిన పురుగుమందులు',
    ta: 'பரிந்துரைக்கப்பட்ட பூச்சிக்கொல்லிகள்',
  },
  profile: {
    en: 'Profile',
    hi: 'प्रोफ़ाइल',
    te: 'ప్రొఫైల్',
    ta: 'சுயவிவரம்',
  },
  history: {
    en: 'History',
    hi: 'इतिहास',
    te: 'చరిత్ర',
    ta: 'வரலாறு',
  },
  home: {
    en: 'Home',
    hi: 'होम',
    te: 'హోమ్',
    ta: 'முகப்பு',
  },
  logout: {
    en: 'Logout',
    hi: 'लॉग आउट',
    te: 'లాగ్ అవుట్',
    ta: 'வெளியேறு',
  },
  healthy: {
    en: 'Healthy',
    hi: 'स्वस्थ',
    te: 'ఆరోగ్యకరమైన',
    ta: 'ஆரோக்கியமான',
  },
  cropHealth: {
    en: 'Crop Health Insights',
    hi: 'फसल स्वास्थ्य जानकारी',
    te: 'పంట ఆరోగ్య అంతర్దృష్టులు',
    ta: 'பயிர் ஆரோக்கிய நுண்ணறிவுகள்',
  },
  voiceAssistant: {
    en: 'Voice Assistant',
    hi: 'वॉयस असिस्टेंट',
    te: 'వాయిస్ అసిస్టెంట్',
    ta: 'குரல் உதவியாளர்',
  },
  speakResult: {
    en: 'Speak Result',
    hi: 'परिणाम बोलें',
    te: 'ఫలితం చెప్పండి',
    ta: 'முடிவைப் பேசு',
  },
  selectLanguage: {
    en: 'Select Language',
    hi: 'भाषा चुनें',
    te: 'భాషను ఎంచుకోండి',
    ta: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    kn: 'ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
  },
  paddyDiseaseDetector: {
    en: 'Paddy Disease Detector',
    hi: 'धान रोग डिटेक्टर',
    te: 'వరి వ్యాధి డిటెక్టర్',
    ta: 'நெல் நோய் கண்டறிதல்',
    kn: 'ಭತ್ತ ರೋಗ ಪತ್ತೆಗಾರ',
  },
  helpFarmers: {
    en: 'Helping farmers identify crop diseases and get treatment guidance',
    hi: 'किसानों को फसल रोगों की पहचान करने और उपचार मार्गदर्शन प्राप्त करने में मदद',
    te: 'రైతులకు పంట వ్యాధులను గుర్తించి చికిత్స మార్గదర్శకత్వం పొందడంలో సహాయం',
    ta: 'பயிர் நோய்களைக் கண்டறிந்து சிகிச்சை வழிகாட்டுதலைப் பெற விவசாயிகளுக்கு உதவுதல்',
    kn: 'ರೈತರು ಬೆಳೆ ರೋಗಗಳನ್ನು ಗುರುತಿಸಿ ಚಿಕಿತ್ಸೆಯ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಲು ಸಹಾಯ',
  },
  enterUsername: {
    en: 'Enter your username to continue',
    hi: 'जारी रखने के लिए अपना उपयोगकर्ता नाम दर्ज करें',
    te: 'కొనసాగించడానికి మీ వినియోగదారు పేరు నమోదు చేయండి',
    ta: 'தொடர உங்கள் பயனர் பெயரை உள்ளிடவும்',
  },
  severity: {
    en: 'Severity',
    hi: 'गंभीरता',
    te: 'తీవ్రత',
    ta: 'தீவிரம்',
  },
  dosage: {
    en: 'Dosage',
    hi: 'खुराक',
    te: 'మోతాదు',
    ta: 'அளவு',
  },
  application: {
    en: 'Application',
    hi: 'प्रयोग',
    te: 'అప్లికేషన్',
    ta: 'பயன்பாடு',
  },
  prevention: {
    en: 'Prevention',
    hi: 'रोकथाम',
    te: 'నివారణ',
    ta: 'தடுப்பு',
  },
  noFertilizersNeeded: {
    en: 'No specific fertilizers recommended for healthy crops',
    hi: 'स्वस्थ फसलों के लिए कोई विशेष उर्वरक अनुशंसित नहीं',
    te: 'ఆరోగ్యకరమైన పంటలకు ప్రత్యేక ఎరువులు సిఫార్సు చేయబడలేదు',
    ta: 'ஆரோக்கியமான பயிர்களுக்கு குறிப்பிட்ட உரங்கள் பரிந்துரைக்கப்படவில்லை',
  },
  noPesticidesNeeded: {
    en: 'No pesticides needed for healthy crops',
    hi: 'स्वस्थ फसलों के लिए कीटनाशकों की आवश्यकता नहीं',
    te: 'ఆరోగ్యకరమైన పంటలకు పురుగుమందులు అవసరం లేదు',
    ta: 'ஆரோக்கியமான பயிர்களுக்கு பூச்சிக்கொல்லிகள் தேவையில்லை',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  languages: { code: Language; name: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const languages = [
    { code: 'en' as Language, name: 'English' },
    { code: 'hi' as Language, name: 'हिंदी' },
    { code: 'te' as Language, name: 'తెలుగు' },
    { code: 'ta' as Language, name: 'தமிழ்' },
    { code: 'kn' as Language, name: 'ಕನ್ನಡ' },
  ];

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
