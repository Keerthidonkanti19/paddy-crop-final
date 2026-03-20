import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export default function SpeechButton(){
  const [listening, setListening] = useState(false);
  const { i18n } = useTranslation?.() || { i18n:{ language: "en" } };

  const toggle = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Speech recognition not supported in this browser");
    if(listening){ window.speechRecognition?.abort?.(); setListening(false); return; }
    const rec = new SR();
    rec.lang = i18n.language === "hi" ? "hi-IN" : `${i18n.language}-IN`;
    rec.interimResults = false;
    rec.onstart = ()=> setListening(true);
    rec.onend = ()=> setListening(false);
    rec.onresult = (ev) => {
      const text = ev.results[0][0].transcript.toLowerCase();
      if (text.includes("analyze") || text.includes("detect")) window.dispatchEvent(new CustomEvent("voice-analyze"));
    };
    window.speechRecognition = rec;
    rec.start();
  };

  return <button onClick={toggle} aria-pressed={listening} title="Voice" style={{padding:8,borderRadius:10}}> {listening ? "🔴" : "🎙️"}</button>
}
