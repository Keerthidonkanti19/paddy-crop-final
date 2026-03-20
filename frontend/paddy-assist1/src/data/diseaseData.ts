export interface DiseaseInfo {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  severity: 'low' | 'medium' | 'high';
  fertilizers: {
    name: string;
    dosage: string;
    application: Record<string, string>;
  }[];
  pesticides: {
    name: string;
    dosage: string;
    application: Record<string, string>;
  }[];
  preventionTips: Record<string, string[]>;
}

export const diseases: Record<string, DiseaseInfo> = {
  blast: {
    id: 'blast',
    name: {
      en: 'Rice Blast',
      hi: 'धान का झुलसा रोग',
      te: 'వరి బ్లాస్ట్ వ్యాధి',
      ta: 'நெல் வெடிப்பு நோய்',
    },
    description: {
      en: 'A fungal disease caused by Magnaporthe oryzae that affects leaves, stems, and grains.',
      hi: 'मैग्नापोर्थ ओरिजे द्वारा होने वाला कवक रोग जो पत्तियों, तनों और दानों को प्रभावित करता है।',
      te: 'మాగ్నపోర్థే ఒరైజే వల్ల కలిగే శిలీంధ్ర వ్యాధి, ఇది ఆకులు, కాండాలు మరియు గింజలను ప్రభావితం చేస్తుంది.',
      ta: 'மாக்னபோர்த் ஓரிசே என்ற பூஞ்சையால் ஏற்படும் நோய், இலைகள், தண்டுகள் மற்றும் தானியங்களை பாதிக்கிறது.',
    },
    severity: 'high',
    fertilizers: [
      {
        name: 'Potassium Chloride',
        dosage: '40-50 kg/ha',
        application: {
          en: 'Apply during tillering stage',
          hi: 'कल्ले निकलने के समय लगाएं',
          te: 'పిలకలు వేసే దశలో వేయండి',
          ta: 'கிளைப்பருவத்தில் பயன்படுத்தவும்',
        },
      },
      {
        name: 'Silica Fertilizer',
        dosage: '200 kg/ha',
        application: {
          en: 'Basal application',
          hi: 'आधारीय प्रयोग',
          te: 'బేసల్ అప్లికేషన్',
          ta: 'அடி உரமாக பயன்படுத்தவும்',
        },
      },
    ],
    pesticides: [
      {
        name: 'Tricyclazole 75% WP',
        dosage: '0.6 g/L water',
        application: {
          en: 'Foliar spray at disease onset',
          hi: 'रोग शुरू होने पर पत्तियों पर छिड़काव',
          te: 'వ్యాధి ప్రారంభంలో ఆకులపై పిచికారీ',
          ta: 'நோய் தொடக்கத்தில் இலைகளில் தெளிக்கவும்',
        },
      },
      {
        name: 'Isoprothiolane 40% EC',
        dosage: '1.5 mL/L water',
        application: {
          en: 'Spray at 15-day intervals',
          hi: '15 दिन के अंतराल पर छिड़काव',
          te: '15 రోజుల వ్యవధిలో పిచికారీ',
          ta: '15 நாட்கள் இடைவெளியில் தெளிக்கவும்',
        },
      },
    ],
    preventionTips: {
      en: [
        'Use resistant varieties',
        'Avoid excess nitrogen fertilization',
        'Maintain proper water management',
      ],
      hi: [
        'प्रतिरोधी किस्मों का उपयोग करें',
        'अधिक नाइट्रोजन उर्वरक से बचें',
        'उचित जल प्रबंधन बनाए रखें',
      ],
      te: [
        'నిరోధక రకాలను ఉపయోగించండి',
        'అధిక నత్రజని ఎరువులు వేయకండి',
        'సరైన నీటి నిర్వహణ చేయండి',
      ],
      ta: [
        'எதிர்ப்பு ரகங்களை பயன்படுத்தவும்',
        'அதிக நைட்ரஜன் உரமிடுவதை தவிர்க்கவும்',
        'சரியான நீர் மேலாண்மையை பராமரிக்கவும்',
      ],
    },
  },
  bacterial_blight: {
    id: 'bacterial_blight',
    name: {
      en: 'Bacterial Leaf Blight',
      hi: 'जीवाणु पत्ती झुलसा',
      te: 'బాక్టీరియల్ ఆకు ఎండు తెగులు',
      ta: 'பாக்டீரியா இலை கருகல்',
    },
    description: {
      en: 'Caused by Xanthomonas oryzae, resulting in wilting and yellowing of leaves.',
      hi: 'जैंथोमोनास ओरिजे के कारण होता है, जिससे पत्तियां मुरझा जाती हैं और पीली हो जाती हैं।',
      te: 'జాంథోమోనాస్ ఒరైజే వల్ల కలుగుతుంది, ఆకులు వాడిపోవడం మరియు పసుపు రంగులోకి మారడం జరుగుతుంది.',
      ta: 'சாந்தோமோனாஸ் ஓரிசே என்ற பாக்டீரியாவால் ஏற்படுகிறது, இலைகள் வாடி மஞ்சள் நிறமாகும்.',
    },
    severity: 'high',
    fertilizers: [
      {
        name: 'Balanced NPK (10-26-26)',
        dosage: '100 kg/ha',
        application: {
          en: 'Split application',
          hi: 'विभाजित मात्रा में प्रयोग',
          te: 'విభజించి వేయండి',
          ta: 'பிரித்து பயன்படுத்தவும்',
        },
      },
      {
        name: 'Zinc Sulphate',
        dosage: '25 kg/ha',
        application: {
          en: 'Basal dose',
          hi: 'आधारीय खुराक',
          te: 'బేసల్ మోతాదు',
          ta: 'அடி உரம்',
        },
      },
    ],
    pesticides: [
      {
        name: 'Streptomycin Sulphate',
        dosage: '0.5 g/L water',
        application: {
          en: 'Spray at disease appearance',
          hi: 'रोग दिखने पर छिड़काव',
          te: 'వ్యాధి కనిపించినప్పుడు పిచికారీ',
          ta: 'நோய் தோன்றும்போது தெளிக்கவும்',
        },
      },
      {
        name: 'Copper Oxychloride',
        dosage: '2.5 g/L water',
        application: {
          en: 'Preventive spray',
          hi: 'निवारक छिड़काव',
          te: 'నివారణ పిచికారీ',
          ta: 'தடுப்பு தெளிப்பு',
        },
      },
    ],
    preventionTips: {
      en: [
        'Use certified disease-free seeds',
        'Avoid clipping of seedlings during transplanting',
        'Ensure proper drainage',
      ],
      hi: [
        'प्रमाणित रोग-मुक्त बीजों का उपयोग करें',
        'रोपाई के दौरान पौधों की कटाई से बचें',
        'उचित जल निकासी सुनिश्चित करें',
      ],
      te: [
        'ధృవీకరించబడిన వ్యాధి-రహిత విత్తనాలను ఉపయోగించండి',
        'నాట్లు వేసేటప్పుడు మొక్కలను కత్తిరించకండి',
        'సరైన డ్రైనేజీ ఉండేలా చూసుకోండి',
      ],
      ta: [
        'சான்றளிக்கப்பட்ட நோயற்ற விதைகளை பயன்படுத்தவும்',
        'நடவு செய்யும்போது நாற்றுகளை வெட்டுவதை தவிர்க்கவும்',
        'சரியான வடிகால் வசதியை உறுதிசெய்யவும்',
      ],
    },
  },
  brown_spot: {
    id: 'brown_spot',
    name: {
      en: 'Brown Spot',
      hi: 'भूरा धब्बा रोग',
      te: 'గోధుమ మచ్చ వ్యాధి',
      ta: 'பழுப்பு புள்ளி நோய்',
    },
    description: {
      en: 'Fungal disease caused by Bipolaris oryzae, characterized by brown oval spots on leaves.',
      hi: 'बाइपोलारिस ओरिजे द्वारा होने वाला कवक रोग, पत्तियों पर भूरे अंडाकार धब्बे इसकी विशेषता है।',
      te: 'బైపోలారిస్ ఒరైజే వల్ల కలిగే శిలీంధ్ర వ్యాధి, ఆకులపై గోధుమ రంగు అండాకార మచ్చలు కనిపిస్తాయి.',
      ta: 'பைபோலாரிஸ் ஓரிசே என்ற பூஞ்சையால் ஏற்படும் நோய், இலைகளில் பழுப்பு நிற நீள்வட்ட புள்ளிகள் தோன்றும்.',
    },
    severity: 'medium',
    fertilizers: [
      {
        name: 'Urea',
        dosage: '130 kg/ha',
        application: {
          en: 'Split into 3 doses',
          hi: '3 खुराकों में विभाजित करें',
          te: '3 మోతాదులుగా విభజించండి',
          ta: '3 தவணைகளாக பிரிக்கவும்',
        },
      },
      {
        name: 'Potash',
        dosage: '60 kg/ha',
        application: {
          en: 'Basal and top dressing',
          hi: 'आधारीय और ऊपरी प्रयोग',
          te: 'బేసల్ మరియు టాప్ డ్రెస్సింగ్',
          ta: 'அடி உரம் மற்றும் மேல் உரம்',
        },
      },
    ],
    pesticides: [
      {
        name: 'Mancozeb 75% WP',
        dosage: '2 g/L water',
        application: {
          en: 'Foliar spray',
          hi: 'पत्तियों पर छिड़काव',
          te: 'ఆకులపై పిచికారీ',
          ta: 'இலைகளில் தெளிக்கவும்',
        },
      },
      {
        name: 'Propiconazole 25% EC',
        dosage: '1 mL/L water',
        application: {
          en: 'Spray at 10-day intervals',
          hi: '10 दिन के अंतराल पर छिड़काव',
          te: '10 రోజుల వ్యవధిలో పిచికారీ',
          ta: '10 நாட்கள் இடைவெளியில் தெளிக்கவும்',
        },
      },
    ],
    preventionTips: {
      en: [
        'Treat seeds with fungicides before sowing',
        'Maintain adequate soil nutrition',
        'Remove and destroy infected plant debris',
      ],
      hi: [
        'बुवाई से पहले बीजों को फफूंदनाशक से उपचारित करें',
        'मिट्टी में पर्याप्त पोषण बनाए रखें',
        'संक्रमित पौधों के अवशेषों को हटाएं और नष्ट करें',
      ],
      te: [
        'విత్తడానికి ముందు విత్తనాలను శిలీంధ్రనాశకంతో శుద్ధి చేయండి',
        'మట్టిలో తగిన పోషణను నిర్వహించండి',
        'వ్యాధి సోకిన మొక్కల అవశేషాలను తొలగించి నాశనం చేయండి',
      ],
      ta: [
        'விதைப்பதற்கு முன் பூஞ்சைக்கொல்லியால் விதைகளை பதப்படுத்தவும்',
        'மண்ணில் போதுமான ஊட்டச்சத்தை பராமரிக்கவும்',
        'நோய்த்தொற்று உள்ள தாவர எச்சங்களை அகற்றி அழிக்கவும்',
      ],
    },
  },
  sheath_blight: {
    id: 'sheath_blight',
    name: {
      en: 'Sheath Blight',
      hi: 'आवरण झुलसा रोग',
      te: 'షీత్ బ్లైట్ వ్యాధి',
      ta: 'உறை கருகல் நோய்',
    },
    description: {
      en: 'Caused by Rhizoctonia solani, affecting leaf sheaths and causing lodging.',
      hi: 'राइज़ोक्टोनिया सोलानी के कारण होता है, जो पत्ती के आवरण को प्रभावित करता है और पौधों को गिरा देता है।',
      te: 'రైజోక్టోనియా సోలానీ వల్ల కలుగుతుంది, ఆకు షీత్‌లను ప్రభావితం చేస్తుంది మరియు మొక్కలు పడిపోతాయి.',
      ta: 'ரைசோக்டோனியா சோலானி என்ற பூஞ்சையால் ஏற்படுகிறது, இலை உறைகளை பாதித்து செடிகள் சாய்வதற்கு காரணமாகிறது.',
    },
    severity: 'medium',
    fertilizers: [
      {
        name: 'Phosphorus Fertilizer',
        dosage: '50 kg/ha',
        application: {
          en: 'Basal application',
          hi: 'आधारीय प्रयोग',
          te: 'బేసల్ అప్లికేషన్',
          ta: 'அடி உரமாக பயன்படுத்தவும்',
        },
      },
      {
        name: 'Organic Compost',
        dosage: '5 tonnes/ha',
        application: {
          en: 'Before transplanting',
          hi: 'रोपाई से पहले',
          te: 'నాట్లు వేయడానికి ముందు',
          ta: 'நடவு செய்வதற்கு முன்',
        },
      },
    ],
    pesticides: [
      {
        name: 'Hexaconazole 5% SC',
        dosage: '2 mL/L water',
        application: {
          en: 'Spray at boot stage',
          hi: 'बूट अवस्था में छिड़काव',
          te: 'బూట్ దశలో పిచికారీ',
          ta: 'பூட் நிலையில் தெளிக்கவும்',
        },
      },
      {
        name: 'Validamycin 3% L',
        dosage: '2 mL/L water',
        application: {
          en: 'Apply at disease onset',
          hi: 'रोग शुरू होने पर लगाएं',
          te: 'వ్యాధి ప్రారంభంలో వేయండి',
          ta: 'நோய் தொடக்கத்தில் பயன்படுத்தவும்',
        },
      },
    ],
    preventionTips: {
      en: [
        'Avoid dense planting',
        'Reduce nitrogen application',
        'Use wide spacing between plants',
      ],
      hi: [
        'घने रोपण से बचें',
        'नाइट्रोजन प्रयोग कम करें',
        'पौधों के बीच अधिक दूरी रखें',
      ],
      te: [
        'దట్టంగా నాటడం మానుకోండి',
        'నత్రజని వాడకం తగ్గించండి',
        'మొక్కల మధ్య ఎక్కువ దూరం ఉంచండి',
      ],
      ta: [
        'நெருக்கமான நடவை தவிர்க்கவும்',
        'நைட்ரஜன் உரமிடுவதை குறைக்கவும்',
        'செடிகளுக்கு இடையே அதிக இடைவெளி விடவும்',
      ],
    },
  },
  healthy: {
    id: 'healthy',
    name: {
      en: 'Healthy Crop',
      hi: 'स्वस्थ फसल',
      te: 'ఆరోగ్యకరమైన పంట',
      ta: 'ஆரோக்கியமான பயிர்',
    },
    description: {
      en: 'No disease detected. Your crop appears to be healthy.',
      hi: 'कोई रोग नहीं पाया गया। आपकी फसल स्वस्थ दिखाई दे रही है।',
      te: 'ఏ వ్యాధి కనుగొనబడలేదు. మీ పంట ఆరోగ్యంగా కనిపిస్తోంది.',
      ta: 'எந்த நோயும் கண்டறியப்படவில்லை. உங்கள் பயிர் ஆரோக்கியமாக உள்ளது.',
    },
    severity: 'low',
    fertilizers: [
      {
        name: 'NPK 20-20-20',
        dosage: '100 kg/ha',
        application: {
          en: 'Regular maintenance dose',
          hi: 'नियमित रखरखाव खुराक',
          te: 'సాధారణ నిర్వహణ మోతాదు',
          ta: 'வழக்கமான பராமரிப்பு அளவு',
        },
      },
      {
        name: 'Micronutrient Mix',
        dosage: '5 kg/ha',
        application: {
          en: 'Foliar spray monthly',
          hi: 'मासिक पत्तियों पर छिड़काव',
          te: 'నెలవారీ ఆకులపై పిచికారీ',
          ta: 'மாதாந்திர இலை தெளிப்பு',
        },
      },
    ],
    pesticides: [],
    preventionTips: {
      en: [
        'Continue regular monitoring',
        'Maintain proper water management',
        'Follow integrated pest management practices',
      ],
      hi: [
        'नियमित निगरानी जारी रखें',
        'उचित जल प्रबंधन बनाए रखें',
        'एकीकृत कीट प्रबंधन का पालन करें',
      ],
      te: [
        'క్రమం తప్పకుండా పర్యవేక్షణ కొనసాగించండి',
        'సరైన నీటి నిర్వహణ చేయండి',
        'సమీకృత తెగులు నిర్వహణ పద్ధతులను పాటించండి',
      ],
      ta: [
        'தொடர்ந்து கண்காணிப்பை மேற்கொள்ளவும்',
        'சரியான நீர் மேலாண்மையை பராமரிக்கவும்',
        'ஒருங்கிணைந்த பூச்சி மேலாண்மை நடைமுறைகளை பின்பற்றவும்',
      ],
    },
  },
};

export const mockDetection = (): DiseaseInfo => {
  const diseaseKeys = Object.keys(diseases);
  const randomKey = diseaseKeys[Math.floor(Math.random() * diseaseKeys.length)];
  return diseases[randomKey];
};
