// frontend/src/pages/PredictPage.tsx

import { useState } from "react";

type PredictionResult = {
  id: number;

  image_path: string;

  predicted_disease: string;

  confidence_score: number;

  fertilizers?: string;

  pesticides?: string;

  disease_label_i18n?: Record<string, string>;

  probabilities?: Record<string, number>;

  warning?: string;
};

export default function PredictPage() {
  // ---------------------------------------------------
  // States
  // ---------------------------------------------------
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string>("");

  const [result, setResult] =
    useState<PredictionResult | null>(null);

  const [loading, setLoading] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string>("");

  // ---------------------------------------------------
  // Handle Image Selection
  // ---------------------------------------------------
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);

    setPreviewUrl(URL.createObjectURL(file));

    setResult(null);

    setError("");
  };

  // ---------------------------------------------------
  // Handle Prediction
  // ---------------------------------------------------
  const handlePredict = async () => {

    if (!selectedFile) {
      setError("Please upload an image");
      return;
    }

    try {

      setLoading(true);

      setError("");

      const formData = new FormData();

      formData.append("file", selectedFile);

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://127.0.0.1:8000/predict",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Prediction failed");
      }

      const data = await response.json();

      console.log("API RESPONSE =", data);

      setResult(data);

    } catch (err) {

      console.error(err);

      setError("Prediction failed. Please try again.");

    } finally {

      setLoading(false);
    }
  };

  // ---------------------------------------------------
  // UI
  // ---------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6">

        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-6">
          🌾 changed
        </h1>

        {/* Upload Input */}
        <div className="mb-6">

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full border border-gray-300 rounded-lg p-3"
          />

        </div>

        {/* Image Preview */}
        {previewUrl && (
          <div className="mb-6">

            <img
              src={previewUrl}
              alt="Preview"
              className="w-full max-h-[400px] object-contain rounded-xl border"
            />

          </div>
        )}

        {/* Predict Button */}
        <button
          onClick={handlePredict}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition"
        >
          {loading ? "Predicting..." : "Predict Disease"}
        </button>

        {/* Error */}
        {error && (
          <div className="mt-4 text-red-600 font-medium">
            {error}
          </div>
        )}

        {/* Prediction Result */}
        {result && (
          <div className="mt-8 bg-gray-50 rounded-2xl p-6 border">

            <h2 className="text-2xl font-bold mb-4">
              🌾 Disease Detected
            </h2>

            <p className="text-xl font-semibold text-green-700 mb-4">
              {result.predicted_disease}
            </p>

            {/* Confidence */}
            <div className="mb-4">

              <h3 className="font-semibold text-lg">
                🎯 Confidence
              </h3>

              <p className="text-lg">
                {result.confidence_score}%
              </p>
              
              {/* Warning message */}
                  {result.warning && (
                  <p className="text-orange-600 font-semibold mt-2">
                  ⚠️ {result.warning}
                  </p>
              )}
            </div>


            {/* Fertilizers */}
            <div className="mb-4">

              <h3 className="font-semibold text-lg">
                💊 Recommended Fertilizers
              </h3>

              <p>
                {result.fertilizers || "No recommendation available"}
              </p>

            </div>

            {/* Pesticides */}
            <div className="mb-4">

              <h3 className="font-semibold text-lg">
                🧪 Recommended Pesticides
              </h3>

              <p>
                {result.pesticides || "No recommendation available"}
              </p>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}