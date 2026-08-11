
// frontend/src/pages/ProfilePage.tsx

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { User } from "lucide-react";

import { TopBar } from "../components/TopBar";
import { useAuth } from "../contexts/AuthContext";
import {
  fetchHistory,
  mediaUrl,
  type HistoryItem,
} from "../api/client";

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadError, setLoadError] =
    useState<string | null>(null);

  // Fetch history
  useEffect(() => {
    if (!user || location.pathname !== "/profile")
      return;

    let cancelled = false;

    setLoadError(null);

    void (async () => {
      try {
        const rows = await fetchHistory(
          user.userId
        );

        if (!cancelled) {
          setHistory(rows);
        }
      } catch {
        if (!cancelled) {
          setLoadError(t("networkError"));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    user,
    location.pathname,
    location.key,
    t,
  ]);

  if (!user) return null;

  return (
    <div className="bg-[#f7faf8] min-h-screen">

      {/* Navbar */}
      <TopBar />

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Profile Card */}
        <div className="rounded-3xl overflow-hidden border bg-white shadow-sm">

          {/* Top Green Area */}
          <div className="h-24 bg-green-50"></div>

          {/* Main Profile Section */}
          <div className="px-8 pb-8 relative">

            {/* Profile Icon */}
            <div className="absolute -top-10 left-8 bg-green-600 w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg">

              <User className="text-white w-10 h-10" />

            </div>

            <div className="pt-16">

              {/* Username */}
              <h1 className="text-4xl font-bold text-gray-900">
                {user.username}
              </h1>

              {/* Mobile */}
              <p className="mt-3 text-xl text-gray-600">
                📱 {user.mobile_number}
              </p>

              {/* Total Detections */}
              <div className="mt-6">

                <p className="text-5xl font-bold text-green-600">
                  {history.length}
                </p>

                <p className="text-sm uppercase tracking-widest text-gray-500">
                  TOTAL DETECTIONS
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* Error */}
        {loadError && (
          <p className="mt-4 text-red-600">
            {loadError}
          </p>
        )}

        {/* History Header */}
        <div className="mt-10 mb-6 flex items-center gap-3">

          <div className="w-10 h-10 rounded-full border-2 border-green-600 flex items-center justify-center">

            ⏰

          </div>

          <h2 className="text-3xl font-bold text-gray-900">
            Detection History
          </h2>

        </div>

        {/* No History */}
        {history.length === 0 &&
          !loadError && (
            <p className="rounded-xl bg-white p-6 text-center text-gray-500">

              {t("noHistory")}

            </p>
          )}

        {/* History Cards */}
        <div className="space-y-6">

          {history.map((row) => (

            <div
              key={row.id}
              className="bg-white rounded-3xl border shadow-sm p-5 flex gap-5"
            >

              {/* Disease Image */}
              <img
                src={mediaUrl(
                  row.image_path
                )}
                alt=""
                className="w-24 h-24 rounded-2xl object-cover"
              />

              {/* Details */}
              <div className="flex-1">

                {/* Disease + Confidence */}
                <div className="flex items-center gap-4 flex-wrap">

                  <span className="bg-green-100 text-green-700 px-4 py-1 rounded-xl font-semibold">

                    {row.predicted_disease}

                  </span>

                  <span className="text-lg text-gray-600">

                    {row.confidence_score}%

                  </span>

                </div>

                {/* Fertilizers */}
                <p className="mt-3 text-gray-600">

                  🌱 {row.fertilizers}

                </p>

                {/* Pesticides */}
                <p className="mt-2 text-gray-600">

                  🧪 {row.pesticides}

                </p>

                {/* Time */}
                <p className="mt-3 text-sm text-gray-400">

                  {new Date(
                    row.timestamp
                  ).toLocaleString()}

                </p>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}
