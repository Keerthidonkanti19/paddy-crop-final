// src/pages/Profile.jsx
import React, { useEffect, useState, useContext } from "react";
import TopBar from "../components/TopBar";
import api from "../api/apiClient";
import { AuthContext } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";

export default function Profile() {
  const { t } = useTranslation("common");
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/users/${user.id}/history`);
        setHistory(res.data.history || []);
      } catch (err) {
        setHistory([]);
      }
    }
    if (user) load();
  }, [user]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <TopBar />
      <main className="container" style={{ paddingTop: 20 }}>
        <div className="card">
          <h2>{user?.full_name}</h2>
          <a href="/" style={{ color: "var(--primary)" }}>{t("profile.go_home")}</a>

          <h3 style={{ marginTop: 12 }}>{t("profile.history")}</h3>
          {history.length === 0 ? <p style={{ color: "var(--muted)" }}>No history yet.</p> :
            history.map(h => (
              <div key={h.prediction_id} className="history-item" style={{ marginTop: 8 }}>
                <img src={h.image_url} alt="" />
                <div>
                  <div style={{ fontWeight: 600 }}>{h.disease}</div>
                  <div style={{ color: "var(--muted)", fontSize: 13 }}>{new Date(h.created_at).toLocaleString()}</div>
                </div>
              </div>
            ))
          }
        </div>
      </main>
    </div>
  );
}
