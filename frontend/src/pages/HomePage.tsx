import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Camera,
  Mic,
  MicOff,
  Upload,
  Volume2,
  Leaf,
  MessageCircle,
} from "lucide-react";

import { TopBar } from "../components/TopBar";
import {
  mediaUrl,
  predictImage,
  askFarmerAssistant,
  type PredictResponse,
} from "../api/client";

import { useVoiceWeb } from "../hooks/useVoiceWeb";

export default function HomePage() {
  const { t, i18n } = useTranslation();

  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // IMPORTANT FIX
  const recognitionRef = useRef<any>(null);

  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [predictError, setPredictError] = useState<string | null>(null);
  const [camOpen, setCamOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantLoading, setAssistantLoading] = useState(false);

  const [chatHistory, setChatHistory] = useState<
    { question: string; answer: string }[]
  >([]);

  const speakPayload =
    result &&
    ({
      disease: result.predicted_disease,
      fertilizers: result.fertilizers ?? "",
      pesticides: result.pesticides ?? "",
      confidence: result.confidence_score
        ? `${result.confidence_score.toFixed(2)}%`
        : "N/A",
    } as const);

  const voice = useVoiceWeb(speakPayload);

  // ---------------- PREDICTION ----------------
  const runPredict = async (file: File) => {
    setLastFile(file);
    setBusy(true);
    setResult(null);
    setPredictError(null);

    try {
      const data = await predictImage(file, i18n.language);
      setResult(data);
      setSelectedFile(null);
      setPreviewUrl("");
      localStorage.setItem(
  "lastPrediction",
  JSON.stringify(data)
);
    } catch (err: unknown) {
      setResult(null);

      const e = err as {
        response?: {
          data?: {
            detail?: unknown;
          };
        };
        message?: string;
        code?: string;
      };

      const d = e.response?.data?.detail;

      let msg =
        typeof d === "string"
          ? d
          : Array.isArray(d)
          ? d
              .map((x: { msg?: string }) => x.msg)
              .filter(Boolean)
              .join(", ")
          : null;

      if (!msg && (e.code === "ERR_NETWORK" || e.message === "Network Error")) {
        msg = t("networkError");
      }

      setPredictError(msg ?? "Prediction failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  // ---------------- CAMERA ----------------
  const stopCam = () => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCamOpen(false);
  };

  useEffect(() => {
    if (camOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(console.error);
    }
  }, [camOpen]);

  useEffect(() => {
  const saved = localStorage.getItem("lastPrediction");
  console.log("Loaded:", saved);
  if (saved) {
    try {
      setResult(JSON.parse(saved));
    } catch {
      localStorage.removeItem("lastPrediction");
    }
  }
}, []);

  useEffect(() => {
    if (lastFile && result) {
      void runPredict(lastFile);
    }
  }, [i18n.language]);

  const openCam = async () => {
    try {
      const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: isMobile ? { facingMode: "environment" } : true,
        audio: false,
      });

      streamRef.current = stream;
      setCamOpen(true);
    } catch (err) {
      console.error(err);
      alert(t("errors.cameraDenied"));
    }
  };

  const captureFrame = async () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, "image/jpeg", 0.85)
    );

    stopCam();

    if (blob) {
      // const file = new File([blob], "capture.jpg", {
      //   type: "image/jpeg",
      // });

      // void runPredict(file);

      const file = new File([blob], "capture.jpg", {
  type: "image/jpeg",
});
setResult(null);
localStorage.removeItem("lastPrediction");
setPredictError(null);
setSelectedFile(file);
setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // ---------------- FIXED FARMER AI ASSISTANT ----------------
    const startAssistantListening = () => {
    console.log("Assistant function called");

  // kill old recognition first
  if (recognitionRef.current) {
    try {
      recognitionRef.current.abort();
    } catch (e) {}

    recognitionRef.current = null;
  }

  if (assistantLoading) return;

  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech recognition is not supported in this browser.");
    return;
  }

  // 5 language support
  const langMap: Record<string, string> = {
    en: "en-IN",
    te: "te-IN",
    hi: "hi-IN",
    ta: "ta-IN",
    kn: "kn-IN",
  };

  // ALWAYS create fresh instance
  const recognition = new SpeechRecognition();

  // save reference so Close button can stop it
  recognitionRef.current = recognition;

  recognition.lang = langMap[i18n.language] || "en-IN";

  // allow more time to speak
  recognition.continuous = false;

  // final result only
  recognition.interimResults = false;

  recognition.onstart = () => {
  console.log("MIC STARTED SUCCESSFULLY");
};

  // -------- ERROR HANDLING --------
  recognition.onerror = (event: any) => {
    console.log("Speech error:", event.error);

    // user manually closed popup
    if (event.error === "aborted") return;

    // Chrome randomly throws this
    if (event.error === "no-speech") {
      console.log("No speech detected");
      setAssistantLoading(false);
      return;
    }

    // Chrome bug (sometimes false network error)
    if (event.error === "network") {
      console.log("Chrome Speech API network issue");
      setAssistantLoading(false);
      return;
    }

    console.log("Speech recognition failed");
    setAssistantLoading(false);
  };

  // -------- SPEECH ENDED --------
  recognition.onend = () => {
    console.log("Recognition ended");
    setAssistantLoading(false);
  };

  // -------- USER SPOKE --------
  recognition.onresult = async (event: any) => {
    // stop recognition after getting result
    recognition.stop();

    // setAssistantLoading(true);

    const question = event.results[0][0].transcript;

    console.log("User asked:", question);

    try {
      // send question to backend
      const response = await askFarmerAssistant({
        disease: result?.predicted_disease || "",
        confidence: String(result?.confidence_score || ""),
        fertilizers: result?.fertilizers || "",
        pesticides: result?.pesticides || "",
        question,
        language: i18n.language,
      });

      // save chat
      setChatHistory((prev) => [
        ...prev,
        {
          question,
          answer: response.answer,
        },
      ]);


    } catch (error) {
      console.log(error);

      setChatHistory((prev) => [
        ...prev,
        {
          question,
          answer: "Failed to get AI response",
        },
      ]);
    } finally {
      setAssistantLoading(false);
    }
  };

  // stop old speech before listening
  window.speechSynthesis.cancel();

  console.log("Starting microphone...");

  setAssistantLoading(true);

  // start safely
  setTimeout(() => {
    try {
      recognition.start();
    } catch (err) {
      console.log("Start error:", err);
      setAssistantLoading(false);
    }
  }, 200);
};

  return (
  <div className="px-10 py-4 bg-gray-50 min-h-screen">
    <TopBar />

    {/* Center Card */}
    <div className="flex justify-center mt-8">
      <div className="bg-green-50 px-10 py-6 rounded-2xl flex items-center gap-4 shadow-sm">
        <Leaf className="text-green-600 w-8 h-8" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            KhetSaathi
          </h1>
          <p className="text-gray-500">Crop Disease Detection</p>
        </div>
      </div>
    </div>

    {/* Upload + Camera */}
    <div className="mt-14 space-y-8">

      {/* Upload */}
      <button
        type="button"
        disabled={busy}
        onClick={() => fileRef.current?.click()}
        className="w-full border-2 border-dashed border-green-300 rounded-2xl py-14 text-center bg-white hover:bg-green-50"
      >
        <Upload className="mx-auto text-green-600 h-8 w-8" />

        <h2 className="mt-4 text-2xl font-medium">
          {t("uploadImage")}
        </h2>

        <p className="mt-2 text-gray-500">
          {t("uploadHint")}
        </p>
      </button>

      {/* OR */}
      <div className="flex items-center">
        <hr className="flex-1" />
        <span className="mx-4 text-gray-500">or</span>
        <hr className="flex-1" />
      </div>

      {/* Camera */}
      <button
        type="button"
        disabled={busy}
        onClick={() => void openCam()}
        className="w-full border-2 border-dashed border-green-300 rounded-2xl py-14 text-center bg-white hover:bg-green-50"
      >
        <Camera className="mx-auto text-green-600 h-8 w-8" />

        <h2 className="mt-4 text-2xl font-medium">
          {t("captureImage")}
        </h2>

        <p className="mt-2 text-gray-500">
          {t("captureHint")}
        </p>
      </button>
    </div>

    {/* Hidden Input */}
    <input
      ref={fileRef}
      type="file"
      accept="image/*"
      className="hidden"
      // onChange={(e) => {
      //   const f = e.target.files?.[0];
      //   if (f) {
      //     void runPredict(f);
      //   }
      //   e.target.value = "";
      // }}
      onChange={(e) => {
  const f = e.target.files?.[0];

  if (f) {
    setResult(null);   
    localStorage.removeItem("lastPrediction");       // Clear previous result
    setPredictError(null); 
    setSelectedFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }

  e.target.value = "";
}}
    />

    {selectedFile && (
  <div className="mt-8">
    <img
      src={previewUrl}
      alt="Preview"
      className="w-full max-h-80 object-contain rounded-2xl border"
    />
  </div>
)}

{/* {selectedFile && !busy && (
  <button
    onClick={() => void runPredict(selectedFile)}
    className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl"
  >
    🔍 Analyze Image
  </button>
)} */}
  {selectedFile && !busy && !result && (
  <button
    onClick={() => void runPredict(selectedFile)}
    className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl"
  >
    🔍 {t("analyze")}
  </button>
)}

    {/* Camera Modal */}
    {camOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl">

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-[300px] rounded-lg object-cover"
          />

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="flex-1 rounded-lg bg-gray-100 py-2 text-sm font-medium"
              onClick={stopCam}
            >
              {t("cancel")}
            </button>

            <button
              type="button"
              className="flex-1 rounded-lg bg-green-600 py-2 text-sm font-semibold text-white"
              onClick={() => void captureFrame()}
            >
              {t("usePhoto")}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Loading */}
    {busy && (
      <p className="mt-6 text-center text-sm text-gray-600">
        {t("analyzing")}
      </p>
    )}

    {/* Error */}
    {predictError && !busy && (
      <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {predictError}
      </div>
    )}

    {/* Prediction Result */}
    {result && !busy && (
      <section className="mt-8 space-y-6">

        <div className="rounded-3xl overflow-hidden shadow-sm">
          <img
            src={mediaUrl(result.image_path)}
            alt=""
            className="w-full h-64 object-cover"
          />
        </div>

        <div className="bg-green-50 border border-green-200 rounded-3xl p-8">

          <div className="flex justify-between items-center mb-6">

            <div className="flex items-center gap-3">
              <span className="text-green-700 text-xl">🛡️</span>

              <h2 className="font-bold text-2xl text-gray-900">
                {t("diseaseDetected")}
              </h2>
            </div>

            <button onClick={() => voice.speakResult()}>
              <Volume2 className="text-green-700 w-6 h-6" />
            </button>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-8">
            {result.predicted_disease}
          </h1>

          <div className="flex justify-between mb-2">
            <span className="text-gray-600 text-lg">
              {t("confidence")}
            </span>

            <span className="font-bold text-lg">
              {result.confidence_score
                ? `${result.confidence_score.toFixed(0)}%`
                : "N/A"}
            </span>
          </div>

          <div className="w-full h-3 bg-green-200 rounded-full">
            <div
              className="h-3 bg-green-600 rounded-full"
              style={{
                width: `${result.confidence_score || 0}%`,
              }}
            />
          </div>
        </div>

        <div className="bg-white border rounded-3xl p-6">

          <div className="pb-5 border-b">
            <h3 className="font-bold text-xl mb-2">
              🌱 {t("recommendedFertilizers")}
            </h3>

            <p className="text-gray-600 text-lg">
              {result.fertilizers}
            </p>
          </div>

          <div className="pt-5">
            <h3 className="font-bold text-xl mb-2">
              🐛 {t("recommendedPesticides")}
            </h3>

            <p className="text-gray-600 text-lg">
              {result.pesticides}
            </p>
          </div>
        </div>

        {result.warning && (
          <p className="text-orange-600 font-semibold text-lg">
            ⚠️ {result.warning}
          </p>
        )}
      </section>
    )}

    {/* Voice Buttons */}
    <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">

      <button
        type="button"
        onClick={() => voice.speakResult()}
        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white"
      >
        <Volume2 className="h-4 w-4" />
        {t("speakResult")}
      </button>

      <button
        type="button"
        onClick={() => voice.stopSpeaking()}
        className="rounded-lg bg-gray-100 px-3 py-2 text-sm"
      >
        {t("stopSpeaking")}
      </button>

      {voice.supported && (
        <button
          type="button"
          onClick={() =>
            voice.listening
              ? voice.stopListening()
              : voice.startListening()
          }
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm"
        >
          {voice.listening ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}

          {voice.listening
            ? t("listening")
            : t("voiceHelp")}
        </button>
      )}
    </div>

    {/* Floating Chat Button */}
    <button
      onClick={() => {
        if (result) {
          setAssistantOpen(true);
          setChatHistory([]);
        }
      }}
      className="fixed bottom-6 right-6 bg-green-600 p-5 rounded-full shadow-lg"
    >
      <MessageCircle className="text-white" />
    </button>

    {/* AI Assistant Popup */}
    {assistantOpen && result && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

        <div className="bg-white w-[500px] max-h-[80vh] overflow-y-auto rounded-2xl p-6 shadow-xl">

          <h2 className="text-2xl font-bold text-green-700 mb-4">
            🌾 {t("farmerAssistant")}
          </h2>

          <div className="bg-green-50 rounded-xl p-4 mb-4">
            <p>
              <strong>{t("disease")}:</strong> {result.predicted_disease}
            </p>

            <p>
              <strong>{t("confidence")}:</strong> {result.confidence_score}%
            </p>

            <p>
              <strong>{t("fertilizers")}:</strong> {result.fertilizers}
            </p>

            <p>
              <strong>{t("pesticides")}:</strong> {result.pesticides}
            </p>
          </div>

          <p className="text-gray-600 mb-4">
            🎤 {t("askDiseaseQuestion")}
          </p>

          {/* Chat History */}
          {chatHistory.map((chat, index) => (
            <div key={index} className="mb-4">

              <div className="bg-blue-50 p-3 rounded-lg mb-2">
                <p>
                  <strong>{t("youAsked")}:</strong> {chat.question}
                </p>
              </div>

              <div className="bg-gray-100 rounded-xl p-4">
                <p className="font-semibold text-green-700 mb-2">
                  {t("aiSolution")}
                </p>

                <p className="text-gray-700">
                  {chat.answer}
                </p>
              </div>
            </div>
          ))}

          {/* Loading */}
          {assistantLoading && (
            <div className="bg-yellow-50 p-3 rounded-lg mb-3">
              <p>🤖 {t("aiThinking")}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-4">

            <button
  onClick={() => {
    console.log("BUTTON CLICKED");
    startAssistantListening();
  }}
  className="bg-green-600 text-white px-4 py-2 rounded-lg"
  disabled={assistantLoading}
>
  {assistantLoading
    ? t("processing")
    : t("startSpeaking")}
</button>

            {/* FIXED CLOSE BUTTON */}
            <button
              onClick={() => {
  window.speechSynthesis.cancel();

  if (recognitionRef.current) {
    try {
      recognitionRef.current.abort();
    } catch {}

    recognitionRef.current = null;
  }

  setAssistantLoading(false);
  setChatHistory([]);
  setAssistantOpen(false);
}}
              className="bg-gray-200 px-4 py-2 rounded-lg"
            >
              {t("close")}
            </button>

          </div>
        </div>
      </div>
    )}
  </div>
);
}