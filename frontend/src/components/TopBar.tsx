import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Globe, LogOut, User, Home, Leaf } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const LANGS = [
  { code: "en", label: "English" },
  { code: "te", label: "తెలుగు" },
  { code: "hi", label: "हिन्दी" },
  { code: "ta", label: "தமிழ்" },
  { code: "kn", label: "ಕನ್ನಡ" },
];

export function TopBar() {
  const { i18n } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex justify-between items-center px-10 py-4 border-b bg-white">

      {/* LEFT LOGO */}

      <div className="flex items-center gap-3">
        <div className="bg-green-600 p-3 rounded-xl">
          <Leaf className="text-white w-6 h-6" />
        </div>

        <div>
          <h1 className="font-bold text-xl">Paddy Doctor</h1>
          <p className="text-gray-500 text-sm">
            Crop Disease Detection
          </p>
        </div>
      </div>


      {/* RIGHT MENU */}

      <div className="flex items-center gap-5">

        {/* HOME */}

        <Link
          to="/home"
          className={`flex items-center gap-2 px-5 py-3 rounded-xl ${
            location.pathname === "/home"
              ? "bg-green-600 text-white"
              : "text-gray-700"
          }`}
        >
          <Home size={18} />
          Home
        </Link>


        {/* PROFILE */}

        {/* <Link
          to="/profile"
          className="flex items-center gap-2 text-gray-700"
        >
          <User size={18} />
          Profile
        </Link> */}

        <Link
  to="/profile"
  className={`flex items-center gap-2 px-5 py-3 rounded-xl ${
    location.pathname === "/profile"
      ? "bg-green-600 text-white"
      : "text-gray-700"
  }`}
>
  <User size={18} />
  Profile
</Link>


        {/* LANGUAGE */}

        <div className="border rounded-xl px-3 py-2 flex items-center gap-2">

          <Globe size={18} className="text-green-700" />

          <select
            value={i18n.language}
            onChange={(e) => void i18n.changeLanguage(e.target.value)}
            className="bg-transparent outline-none"
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>

        </div>


        {/* LOGOUT */}

        <button
  onClick={() => {
    logout();
    navigate("/");
  }}
  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
>
  <LogOut className="w-5 h-5" />
  <span className="font-medium">Logout</span>
</button>

      </div>
    </div>
  );
}
