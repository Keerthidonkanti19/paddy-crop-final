import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";
import { Home, ListChecks, FlaskConical } from "lucide-react";
import { TopBar } from "../components/TopBar";
import { useAuth } from "../contexts/AuthContext";
import { fetchHistory, mediaUrl, type HistoryItem } from "../api/client";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler,
);

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Refetch whenever user lands on /profile (e.g. after new predictions on Home).
  useEffect(() => {
    if (!user || location.pathname !== "/profile") return;
    let cancelled = false;
    setLoadError(null);
    void (async () => {
      try {
        const rows = await fetchHistory(user.userId);
        if (!cancelled) setHistory(rows);
      } catch {
        if (!cancelled) setLoadError(t("networkError"));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, location.pathname, location.key, t]);

  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const h of history) {
      counts[h.predicted_disease] = (counts[h.predicted_disease] ?? 0) + 1;
    }
    const labels = Object.keys(counts);
    const data = labels.map((k) => counts[k]!);
    const colors = ["#ef4444", "#f97316", "#a855f7", "#22c55e", "#0ea5e9", "#eab308", "#64748b"];
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: labels.map((_, i) => colors[i % colors.length]),
          borderWidth: 1,
        },
      ],
    };
  }, [history]);

  const lineData = useMemo(() => {
    const byDay: Record<string, number> = {};
    for (const h of history) {
      const d = new Date(h.timestamp);
      const key = d.toISOString().slice(0, 10);
      byDay[key] = (byDay[key] ?? 0) + 1;
    }
    const keys = Object.keys(byDay).sort();
    const last = keys.slice(-14);
    return {
      labels: last,
      datasets: [
        {
          label: t("chartTrendLine"),
          data: last.map((k) => byDay[k] ?? 0),
          borderColor: "#2d7a4d",
          backgroundColor: "rgba(45,122,77,0.1)",
          tension: 0.25,
          fill: true,
        },
      ],
    };
  }, [history, t]);

  if (!user) return null;

  return (
    <div>
      <TopBar />

      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">{t("profileTitle")}</h1>
        <p className="mt-1 text-sm text-gray-600">
          <span className="font-medium">{user.username}</span> · {user.mobile_number}
        </p>
        <p className="mt-4 text-3xl font-bold text-[#2d7a4d]">{history.length}</p>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t("totalScans")}</p>
      </div>

      {loadError && <p className="mb-4 text-sm text-red-600">{loadError}</p>}

      {history.length > 0 && (
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-bold text-gray-900">{t("chartDiseasePie")}</h2>
            <div className="mx-auto h-64 max-w-xs">
              <Pie data={pieData} options={{ plugins: { legend: { position: "bottom" } } }} />
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-bold text-gray-900">{t("chartTrendLine")}</h2>
            <div className="h-64">
              <Line
                data={lineData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
          </div>
        </div>
      )}

      <h2 className="mb-3 text-lg font-bold text-gray-900">{t("historyTitle")}</h2>
      {history.length === 0 && !loadError && (
        <p className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
          {t("noHistory")}
        </p>
      )}
      <ul className="space-y-4">
        {history.map((row) => (
          <li
            key={row.id}
            className="flex gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:gap-4"
          >
            <img
              src={mediaUrl(row.image_path)}
              alt=""
              className="h-20 w-20 shrink-0 rounded-lg object-cover sm:h-24 sm:w-24"
            />
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-semibold text-gray-900">{row.predicted_disease}</p>
              <p className="mt-1 flex items-start gap-2 text-gray-600">
                <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                {row.fertilizers}
              </p>
              <p className="mt-1 flex items-start gap-2 text-gray-600">
                <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                {row.pesticides}
              </p>
              <p className="mt-2 text-xs text-gray-400">
                {new Date(row.timestamp).toLocaleString()} · {t("confidence")}: {row.confidence_score}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <Link
        to="/home"
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2d7a4d] py-3.5 text-center font-semibold text-white shadow-sm"
      >
        <Home className="h-5 w-5" />
        {t("goHome")}
      </Link>
    </div>
  );
}
