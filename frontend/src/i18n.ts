import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import te from "./locales/te.json";
import hi from "./locales/hi.json";
import ta from "./locales/ta.json";
import kn from "./locales/kn.json";

const STORAGE_KEY = "paddy_i18n_lang";

const saved = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
const initial = saved && ["en", "te", "hi", "ta", "kn"].includes(saved) ? saved : "en";

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    te: { translation: te },
    hi: { translation: hi },
    ta: { translation: ta },
    kn: { translation: kn },
  },
  lng: initial,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lng) => {
  localStorage.setItem(STORAGE_KEY, lng);
});

export default i18n;
