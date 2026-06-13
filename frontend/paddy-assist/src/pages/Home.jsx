// src/pages/Home.jsx
import React, { useState, useContext, useRef, useEffect } from "react";
import TopBar from "../components/TopBar";
import { AuthContext } from "../contexts/AuthContext";
import api from "../api/apiClient";

export default function Home() {
  const { user } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const openFile = () => fileInputRef.current?.click?.();

  const onCapture = async () => {
    console.log("CAPTURE BUTTON CLICKED");
    // quick capture using MediaDevices if available
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const track = stream.getVideoTracks()[0];
      // some browsers support ImageCapture
      try {
        const ImageCaptureClass = window.ImageCapture;
        if (ImageCaptureClass) {
          const imageCapture = new ImageCapture(track);
          const blob = await imageCapture.takePhoto();
          if (blob) {
            const f = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
            setFile(f);
            setPreview(URL.createObjectURL(f));
          }
        } else {
          // fallback: draw video to canvas (simple)
          const video = document.createElement("video");
          video.srcObject = stream;
          await video.play();
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg"));
          if (blob) {
            const f = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
            setFile(f);
            setPreview(URL.createObjectURL(f));
          }
          video.pause();
          video.srcObject = null;
        }
      } finally {
        track.stop();
      }
    } catch (err) {
      console.error(err);
      alert("Camera access failed or not available.");
    }
  };

  const handleAnalyze = async () => {
    if (!file) return alert("Choose or capture an image first.");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (user?.id) fd.append("user_id", user.id);
      // try real backend; may fail if backend missing
      const upload = await api.post("/uploads", fd);
      const pred = await api.post("/predict", { upload_id: upload.data.upload_id });
      alert(`Detected: ${pred.data.disease} (conf ${(pred.data.confidence*100).toFixed(1)}%)`);
    } catch (err) {
      console.error(err);
      alert("Analysis failed (no backend).");
    } finally {
      setLoading(false);
    }
  };

  // simple mic fallback
  const fallbackMic = async () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    const rec = new SR();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.onresult = (ev) => {
      const text = ev.results[0][0].transcript.toLowerCase();
      if (text.includes("analyze") || text.includes("detect")) {
        handleAnalyze();
      } else {
        alert("Heard: " + text);
      }
    };
    rec.onerror = (e) => { console.error(e); alert("Speech error"); };
    rec.start();
  };

  return (
    <>
      <TopBar />
      <div className="container" style={{ paddingTop: 28 }}>
        <div className="center-card">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
          <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "center", flexWrap:"wrap" }}>
            <button className="btn" onClick={openFile}>Choose File</button>
            <button className="btn" onClick={onCapture}>Capture</button>
            <button className="btn" onClick={fallbackMic} title="Voice">🎙️</button>
            <button className="btn" onClick={handleAnalyze} disabled={loading} style={{ background:"#1f9d58" }}>
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </div>

          <div style={{ marginTop: 18 }}>
            {preview ? (
              <div style={{ display:"flex", justifyContent:"center" }}>
                <img src={preview} alt="preview" className="preview" style={{maxWidth:320, borderRadius:12}}/>
              </div>
            ) : (
              <div style={{ padding:28, textAlign:"center", color:"#7b8794" }}>
                No image selected — choose or capture to analyze.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
