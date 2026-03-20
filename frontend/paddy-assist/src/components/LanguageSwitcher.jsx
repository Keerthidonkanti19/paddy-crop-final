// src/components/LanguageSwitcher.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { user, updateLang } = useContext(AuthContext);

  const changeLng = async (e) => {
    const lng = e.target.value;
    await i18n.changeLanguage(lng);
    localStorage.setItem("appLang", lng);
    document.documentElement.lang = lng;
    if (user) updateLang(lng);
  };

  return (
    <select value={i18n.language} onChange={changeLng} aria-label="Language">
      <option value="en">English</option>
      <option value="hi">हिन्दी</option>
    </select>
  );
}
