// src/components/CameraModal.jsx
import React, { useRef, useEffect } from "react";

export default function CameraModal({ open, onClose, onCapture }) {
  const videoRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    let stream;
    if (open) {
      navigator.mediaDevices.getUserMedia({ video: true })
        // .then(s => {
        //   stream = s;
        //   if (videoRef.current) videoRef.current.srcObject = s;
        // })
        .then(async (s) => {
  stream = s;

  if (videoRef.current) {
    videoRef.current.srcObject = s;
    await videoRef.current.play();
  }
})
        .catch(console.error);
    }
    return () => { if (stream) stream?.getTracks()?.forEach(t => t.stop()); };
  }, [open]);

  const capture = () => {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c) return;
    c.width = v.videoWidth; c.height = v.videoHeight;
    const ctx = c.getContext("2d");
    ctx.drawImage(v, 0, 0);
    c.toBlob((blob) => {
      onCapture(blob);
      onClose();
    }, "image/jpeg", 0.9);
  };

  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <video ref={videoRef} autoPlay playsInline style={{ width: "100%" }} />
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button className="btn-primary" onClick={capture}>Capture</button>
          <button onClick={onClose}>Close</button>
        </div>
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
}
