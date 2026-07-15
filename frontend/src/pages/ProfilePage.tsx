// // import { useEffect, useMemo, useState } from "react";
// import { useEffect, useState } from "react";
// // import { Link, useLocation } from "react-router-dom";
// import { useLocation } from "react-router-dom";
// import { ListChecks, FlaskConical } from "lucide-react";
// import { useTranslation } from "react-i18next";
// // import {
// //   ArcElement,
// //   CategoryScale,
// //   Chart as ChartJS,
// //   Filler,
// //   Legend,
// //   LinearScale,
// //   LineElement,
// //   PointElement,
// //   Title,
// //   Tooltip,
// // } from "chart.js";
// // import { Line, Pie } from "react-chartjs-2";
// // import { Home, ListChecks, FlaskConical } from "lucide-react";
// import { TopBar } from "../components/TopBar";
// import { useAuth } from "../contexts/AuthContext";
// import { fetchHistory, mediaUrl, type HistoryItem } from "../api/client";

// // ChartJS.register(
// //   ArcElement,
// //   Tooltip,
// //   Legend,
// //   CategoryScale,
// //   LinearScale,
// //   PointElement,
// //   LineElement,
// //   Title,
// //   Filler,
// // );

// export default function ProfilePage() {
//   const { t } = useTranslation();
//   const { user } = useAuth();
//   const location = useLocation();
//   const [history, setHistory] = useState<HistoryItem[]>([]);
//   const [loadError, setLoadError] = useState<string | null>(null);

//   // Refetch whenever user lands on /profile (e.g. after new predictions on Home).
//   useEffect(() => {
//     if (!user || location.pathname !== "/profile") return;
//     let cancelled = false;
//     setLoadError(null);
//     void (async () => {
//       try {
//         const rows = await fetchHistory(user.userId);
//         if (!cancelled) setHistory(rows);
//       } catch {
//         if (!cancelled) setLoadError(t("networkError"));
//       }
//     })();
//     return () => {
//       cancelled = true;
//     };
//   }, [user, location.pathname, location.key, t]);

//   // const pieData = useMemo(() => {
//   //   const counts: Record<string, number> = {};
//   //   for (const h of history) {
//   //     counts[h.predicted_disease] = (counts[h.predicted_disease] ?? 0) + 1;
//   //   }
//   //   const labels = Object.keys(counts);
//   //   const data = labels.map((k) => counts[k]!);
//   //   const colors = ["#ef4444", "#f97316", "#a855f7", "#22c55e", "#0ea5e9", "#eab308", "#64748b"];
//   //   return {
//   //     labels,
//   //     datasets: [
//   //       {
//   //         data,
//   //         backgroundColor: labels.map((_, i) => colors[i % colors.length]),
//   //         borderWidth: 1,
//   //       },
//   //     ],
//   //   };
//   // }, [history]);

//   // const lineData = useMemo(() => {
//   //   const byDay: Record<string, number> = {};
//   //   for (const h of history) {
//   //     const d = new Date(h.timestamp);
//   //     const key = d.toISOString().slice(0, 10);
//   //     byDay[key] = (byDay[key] ?? 0) + 1;
//   //   }
//   //   const keys = Object.keys(byDay).sort();
//   //   const last = keys.slice(-14);
//   //   return {
//   //     labels: last,
//   //     datasets: [
//   //       {
//   //         label: t("chartTrendLine"),
//   //         data: last.map((k) => byDay[k] ?? 0),
//   //         borderColor: "#2d7a4d",
//   //         backgroundColor: "rgba(45,122,77,0.1)",
//   //         tension: 0.25,
//   //         fill: true,
//   //       },
//   //     ],
//   //   };
//   // }, [history, t]);

//   if (!user) return null;

//   // return (
//   //   <div>
//   //     <TopBar />

//   //     <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
//   //       <h1 className="text-xl font-bold text-gray-900">{t("profileTitle")}</h1>
//   //       <p className="mt-1 text-sm text-gray-600">
//   //         <span className="font-medium">{user.username}</span> · {user.mobile_number}
//   //       </p>
//   //       <p className="mt-4 text-3xl font-bold text-[#2d7a4d]">{history.length}</p>
//   //       <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t("totalScans")}</p>
//   //     </div>

//   //     {loadError && <p className="mb-4 text-sm text-red-600">{loadError}</p>}

//   //     {/* {history.length > 0 && (
//   //       <div className="mb-8 grid gap-6 lg:grid-cols-2">
//   //         <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
//   //           <h2 className="mb-2 text-sm font-bold text-gray-900">{t("chartDiseasePie")}</h2>
//   //           <div className="mx-auto h-64 max-w-xs">
//   //             <Pie data={pieData} options={{ plugins: { legend: { position: "bottom" } } }} />
//   //           </div>
//   //         </div>
//   //         <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
//   //           <h2 className="mb-2 text-sm font-bold text-gray-900">{t("chartTrendLine")}</h2>
//   //           <div className="h-64">
//   //             <Line
//   //               data={lineData}
//   //               options={{
//   //                 responsive: true,
//   //                 maintainAspectRatio: false,
//   //                 scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
//   //                 plugins: { legend: { display: false } },
//   //               }}
//   //             />
//   //           </div>
//   //         </div>
//   //       </div>
//   //     )} */}

//   //     <h2 className="mb-3 text-lg font-bold text-gray-900">{t("historyTitle")}</h2>
//   //     {history.length === 0 && !loadError && (
//   //       <p className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
//   //         {t("noHistory")}
//   //       </p>
//   //     )}
//   //     <ul className="space-y-4">
//   //       {history.map((row) => (
//   //         <li
//   //           key={row.id}
//   //           className="flex gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:gap-4"
//   //         >
//   //           <img
//   //             src={mediaUrl(row.image_path)}
//   //             alt=""
//   //             className="h-20 w-20 shrink-0 rounded-lg object-cover sm:h-24 sm:w-24"
//   //           />
//   //           <div className="min-w-0 flex-1 text-sm">
//   //             <p className="font-semibold text-gray-900">{row.predicted_disease}</p>
//   //             <p className="mt-1 flex items-start gap-2 text-gray-600">
//   //               <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
//   //               {row.fertilizers}
//   //             </p>
//   //             <p className="mt-1 flex items-start gap-2 text-gray-600">
//   //               <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
//   //               {row.pesticides}
//   //             </p>
//   //             <p className="mt-2 text-xs text-gray-400">
//   //               {new Date(row.timestamp).toLocaleString()} · {t("confidence")}: {row.confidence_score}
//   //             </p>
//   //           </div>
//   //         </li>
//   //       ))}
//   //     </ul>

//   //     {/* <Link
//   //       to="/home"
//   //       className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2d7a4d] py-3.5 text-center font-semibold text-white shadow-sm"
//   //     > */}
//   //       <Home className="h-5 w-5" />
//   //       {t("goHome")}
//   //     </Link>
//   //   </div>
//   // );

//   return (
//   <div className="bg-[#f6faf7] min-h-screen">

//     <TopBar />

//     <div className="max-w-6xl mx-auto px-6 py-8">

//       {/* Profile Card */}

//       <div className="rounded-3xl overflow-hidden shadow-sm border bg-white">

//         {/* Green top section */}

//         <div className="h-20 bg-green-50"></div>

//         {/* Main profile */}

//         <div className="px-8 pb-8 relative">

//           {/* Profile icon */}

//           <div className="absolute -top-10 left-8 bg-green-600 w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg">

//             <span className="text-white text-3xl">👤</span>

//           </div>


//           <div className="pt-14">

//             <h1 className="text-4xl font-bold text-gray-900">

//               {user.username}

//             </h1>


//             <p className="mt-3 text-xl text-gray-600">

//               📱 {user.mobile_number}

//             </p>


//             <div className="mt-6">

//               <p className="text-5xl font-bold text-green-600">

//                 {history.length}

//               </p>

//               <p className="text-sm uppercase tracking-widest text-gray-500">

//                 TOTAL DETECTIONS

//               </p>

//             </div>

//           </div>

//         </div>

//       </div>


//       {/* History Title */}

//       <h2 className="mt-10 mb-6 text-4xl font-bold flex items-center gap-3">

//         🕒 Detection History

//       </h2>


//       {/* No History */}

//       {history.length === 0 && !loadError && (

//         <p className="rounded-xl bg-white p-6 text-center">

//           {t("noHistory")}

//         </p>

//       )}


//       {/* History Cards */}

//       <div className="space-y-6">

//         {history.map((row) => (

//           <div
//             key={row.id}
//             className="bg-white rounded-3xl border shadow-sm p-5 flex gap-5"
//           >

//             {/* Image */}

//             <img
//               src={mediaUrl(row.image_path)}
//               alt=""
//               className="w-24 h-24 rounded-2xl object-cover"
//             />


//             {/* Content */}

//             <div className="flex-1">

//               {/* Disease + confidence */}

//               <div className="flex items-center gap-4">

//                 <span className="bg-green-100 text-green-700 px-4 py-1 rounded-xl font-semibold">

//                   {row.predicted_disease}

//                 </span>

//                 <span className="text-xl text-gray-600">

//                   {row.confidence_score}%

//                 </span>

//               </div>


//               {/* Fertilizers */}

//               <p className="mt-3 text-gray-600">

//                 🔥 {row.fertilizers}

//               </p>


//               {/* Pesticides */}

//               <p className="mt-2 text-gray-600">

//                 ⚗️ {row.pesticides}

//               </p>


//               {/* Time */}

//               <p className="mt-3 text-sm text-gray-400">

//                 {new Date(row.timestamp).toLocaleString()}

//               </p>

//             </div>

//           </div>

//         ))}

//       </div>

//     </div>

//   </div>
// );
// }

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
