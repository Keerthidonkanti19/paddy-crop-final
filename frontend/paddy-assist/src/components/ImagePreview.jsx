// src/components/ImagePreview.jsx
import React from "react";

export default function ImagePreview({ src, onAnalyze, loading }) {
  return (
    <div className="card">
      <img src={src} alt="preview" className="preview" />
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button className="btn-primary" onClick={onAnalyze} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Image"}
        </button>
      </div>
    </div>
  );
}

