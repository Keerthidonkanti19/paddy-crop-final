import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const langVoiceMap: Record<string, string> = {
  en: "en-IN",
  te: "te-IN",
  hi: "hi-IN",
  ta: "ta-IN",
  kn: "kn-IN",
};

type ResultSpeak = {
  disease: string;
  fertilizers: string;
  pesticides: string;
  confidence: string;
} | null;

type SpeechRecCtor = new () => {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

function getSpeechRecognition(): SpeechRecCtor | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecCtor;
    webkitSpeechRecognition?: SpeechRecCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition;
}

export function useVoiceWeb(result: ResultSpeak) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);

  const speakResult = useCallback(() => {
    if (!result) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(
      `${t("disease")}: ${result.disease}. ${t("confidence")}: ${result.confidence}. ` +
        `${t("fertilizers")}: ${result.fertilizers}. ${t("pesticides")}: ${result.pesticides}.`,
    );
    u.lang = langVoiceMap[i18n.language] ?? "en-IN";
    window.speechSynthesis.speak(u);
  }, [result, t, i18n.language]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
  }, []);

  const startListening = useCallback(() => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = langVoiceMap[i18n.language] ?? "en-IN";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (ev) => {
      const text = ev.results[0]?.[0]?.transcript?.toLowerCase() ?? "";
      if (text.includes(t("homeCmd"))) navigate("/home");
      else if (text.includes(t("profileCmd"))) navigate("/profile");
      else if (text.includes("read") && text.includes("result")) speakResult();
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    try {
      setListening(true);
      rec.start();
    } catch {
      setListening(false);
    }
  }, [i18n.language, navigate, speakResult, t]);

  const stopListening = useCallback(() => {
    setListening(false);
  }, []);

  const supported = Boolean(getSpeechRecognition());

  return { listening, speakResult, stopSpeaking, startListening, stopListening, supported };
}
