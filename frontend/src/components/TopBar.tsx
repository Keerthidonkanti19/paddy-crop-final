import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Globe, LogOut, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const LANGS = [
  { code: "en", label: "English" },
  { code: "te", label: "తెలుగు" },
  { code: "hi", label: "हिन्दी" },
  { code: "ta", label: "தமிழ்" },
  { code: "kn", label: "ಕನ್ನಡ" },
];

export function TopBar() {
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="mb-6 flex flex-wrap items-center justify-end gap-2">
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1.5 shadow-sm">
        <Globe className="h-4 w-4 text-[#2d7a4d]" aria-hidden />
        <label htmlFor="lang" className="sr-only">
          {t("language")}
        </label>
        <select
          id="lang"
          value={i18n.language}
          onChange={(e) => void i18n.changeLanguage(e.target.value)}
          className="max-w-[140px] bg-transparent text-sm text-gray-800 outline-none"
        >
          {LANGS.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </div>
      <Link
        to="/profile"
        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
      >
        <User className="h-4 w-4 text-[#2d7a4d]" />
        {t("profile")}
      </Link>
      <button
        type="button"
        onClick={() => {
          logout();
          navigate("/");
        }}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
      >
        <LogOut className="h-4 w-4" />
        {t("logout")}
      </button>
    </div>
  );
}
