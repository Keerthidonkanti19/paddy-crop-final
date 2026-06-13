import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Camera, Mic, MicOff, Upload, Volume2 } from "lucide-react";
import { TopBar } from "../components/TopBar";
import { mediaUrl, predictImage, type PredictResponse } from "../api/client";
import { useVoiceWeb } from "../hooks/useVoiceWeb";

export default function HomePage() {
  const { t, i18n } = useTranslation();

  const fileRef = useRef<HTMLInputElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  const streamRef = useRef<MediaStream | null>(null);

  const [busy, setBusy] = useState(false);

  const [result, setResult] =
    useState<PredictResponse | null>(null);

  const [predictError, setPredictError] =
    useState<string | null>(null);

  const [camOpen, setCamOpen] = useState(false);

  // ---------------------------------------------------
  // Voice Payload
  // ---------------------------------------------------
  const speakPayload =
    result &&
    ({
      disease:
        result.disease_label_i18n?.en ??
        result.predicted_disease,

      fertilizers:
        result.fertilizers ?? "",

      pesticides:
        result.pesticides ?? "",

      confidence:
        result.confidence_score
          ? `${(
              result.confidence_score 
            ).toFixed(2)}%`
          : "N/A",
    } as const);

  const voice = useVoiceWeb(speakPayload);

  // ---------------------------------------------------
  // Prediction Function
  // ---------------------------------------------------
  const runPredict = async (file: File) => {

    setBusy(true);

    setResult(null);

    setPredictError(null);

    try {

      const data = await predictImage(
        file,
        i18n.language
      );

      setResult(data);

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
                .map(
                  (
                    x: {
                      msg?: string;
                    }
                  ) => x.msg
                )
                .filter(Boolean)
                .join(", ")
            : null;

      if (
        !msg &&
        (
          e.code === "ERR_NETWORK" ||
          e.message === "Network Error"
        )
      ) {
        msg = t("networkError");
      }

      setPredictError(
        msg ??
          "Prediction failed. Please try again."
      );

    } finally {

      setBusy(false);
    }
  };

  // ---------------------------------------------------
  // Stop Camera
  // ---------------------------------------------------
  const stopCam = () => {

    streamRef.current
      ?.getTracks()
      .forEach((tr) => tr.stop());

    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCamOpen(false);
  };
  // 
  useEffect(() => {
  if (
    camOpen &&
    videoRef.current &&
    streamRef.current
  ) {
    videoRef.current.srcObject =
      streamRef.current;

    videoRef.current
      .play()
      .catch(console.error);
  }
}, [camOpen]);

  // ---------------------------------------------------
  // Open Camera
  // ---------------------------------------------------
  // const openCam = async () => {

  //   try {

      // const stream =
      //   await navigator.mediaDevices.getUserMedia({
        // laptop
        //   video: {
        //     facingMode: "environment"
        //  }
        
        //mobile
      //     video: {
      //       facingMode: "user",
      //     },

      //     audio: false,
      //   });
      

  //     streamRef.current = stream;

  //     if (videoRef.current) {

  //       videoRef.current.srcObject = stream;

  //       await videoRef.current.play();
  //     }

  //     setCamOpen(true);

  //   } catch {

  //     alert(t("errors.cameraDenied"));
  //   }
  // };

  const openCam = async () => {
  try {
    const isMobile =
      /Android|iPhone|iPad/i.test(
        navigator.userAgent
      );

    const stream =
      await navigator.mediaDevices.getUserMedia({
        video: isMobile
          ? { facingMode: "environment" }
          : true,
        audio: false,
      });

    streamRef.current = stream;

    // FIRST open modal
    setCamOpen(true);

  } catch (err) {
    console.error(err);
    alert(t("errors.cameraDenied"));
  }
};

  // ---------------------------------------------------
  // Capture Camera Frame
  // ---------------------------------------------------
  const captureFrame = async () => {

    const video = videoRef.current;

    if (!video) return;

    const canvas =
      document.createElement("canvas");

    canvas.width =
      video.videoWidth || 640;

    canvas.height =
      video.videoHeight || 480;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const blob =
      await new Promise<Blob | null>(
        (res) =>
          canvas.toBlob(
            res,
            "image/jpeg",
            0.85
          )
      );

    stopCam();

    if (blob) {

      const file = new File(
        [blob],
        "capture.jpg",
        {
          type: "image/jpeg",
        }
      );

      void runPredict(file);
    }
  };

  return (
    <div>

      <TopBar />

      {/* Title */}
      <h1 className="mb-4 text-lg font-bold text-gray-900 sm:text-xl">

        {t("homeTitle")}

      </h1>

      {/* Hidden File Input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {

          const f =
            e.target.files?.[0];

          if (f) {
            void runPredict(f);
          }

          e.target.value = "";
        }}
      />

      {/* Upload & Camera Cards */}
      <div className="grid gap-4 sm:grid-cols-2">

        {/* Upload */}
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            fileRef.current?.click()
          }
          className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 bg-white p-8 text-center shadow-sm hover:border-[#2d7a4d]/40 disabled:opacity-50"
        >

          <Upload className="h-10 w-10 text-[#2d7a4d]" />

          <span className="font-semibold text-gray-900">

            {t("uploadImage")}

          </span>

          <span className="text-xs text-gray-500">

            {t("uploadHint")}

          </span>

        </button>

        {/* Camera */}
        <button
          type="button"
          disabled={busy}
          onClick={() => void openCam()}
          className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 bg-white p-8 text-center shadow-sm hover:border-[#2d7a4d]/40 disabled:opacity-50"
        >

          <Camera className="h-10 w-10 text-[#2d7a4d]" />

          <span className="font-semibold text-gray-900">

            {t("captureImage")}

          </span>

          <span className="text-xs text-gray-500">

            {t("captureHint")}

          </span>

        </button>

      </div>

      {/* Camera Modal */}
      {camOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl">

            {/* <video
              ref={videoRef}
              className="aspect-video w-full rounded-lg bg-black object-cover"
              playsInline
              muted
            /> */}

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-[300px] border-2 border-red-500"
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
                className="flex-1 rounded-lg bg-[#2d7a4d] py-2 text-sm font-semibold text-white"
                onClick={() =>
                  void captureFrame()
                }
              >

                {t("usePhoto")}

              </button>

            </div>

          </div>

        </div>
      )}

      {/* Loading */}
      {busy && (
        <p
          className="mt-6 text-center text-sm text-gray-600"
          aria-live="polite"
        >

          {t("analyzing")}

        </p>
      )}

      {/* Error */}
      {predictError && !busy && (
        <div
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >

          {predictError}

        </div>
      )}

      {/* Prediction Result */}
      {result && !busy && (
        <section className="mt-8 space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">

          <h2 className="text-lg font-bold text-gray-900">

            {t("resultTitle")}

          </h2>

          <img
            src={mediaUrl(result.image_path)}
            alt=""
            className="mx-auto max-h-48 rounded-lg object-contain"
          />

          <dl className="space-y-4 text-sm">

            {/* Disease */}
            <div>

              <dt className="font-medium text-gray-500">

                {t("disease")}

              </dt>

              <dd className="text-lg font-semibold text-gray-900">

                {result.disease_label_i18n?.en ??
                  result.predicted_disease}

              </dd>

            </div>

            {/* Confidence */}
<div>

  <dt className="font-medium text-gray-500">
    {t("confidence")}
  </dt>

  <dd className="text-gray-900">
    {result.confidence_score
      ? `${(
          result.confidence_score
        ).toFixed(2)}%`
      : "N/A"}
  </dd>

  {/* Warning */}
  {result.warning && (
    <p className="mt-2 text-orange-600 font-semibold">
      ⚠️ {result.warning}
    </p>
  )}

</div>

            {/* Fertilizers */}
            <div>

              <dt className="font-medium text-gray-500">

                {t("fertilizers")}

              </dt>

              <dd className="text-gray-900">

                {result.fertilizers}

              </dd>

            </div>

            {/* Pesticides */}
            <div>

              <dt className="font-medium text-gray-500">

                {t("pesticides")}

              </dt>

              <dd className="text-gray-900">

                {result.pesticides}

              </dd>

            </div>

          </dl>

          {/* Voice Controls */}
          <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">

            <button
              type="button"
              onClick={() =>
                voice.speakResult()
              }
              className="inline-flex items-center gap-2 rounded-lg bg-[#2d7a4d] px-3 py-2 text-sm font-medium text-white"
            >

              <Volume2 className="h-4 w-4" />

              {t("speakResult")}

            </button>

            <button
              type="button"
              onClick={() =>
                voice.stopSpeaking()
              }
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

        </section>
      )}

    </div>
  );
}
