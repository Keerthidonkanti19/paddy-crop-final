// app.js

// Change this if your backend runs on a different host/port
const API_BASE_URL = "http://localhost:8000"; // empty string = same origin, so /predict, /predictions

// ---------- Upload Page Logic ----------
document.addEventListener("DOMContentLoaded", () => {
  const uploadForm = document.getElementById("upload-form");
  const fileInput = document.getElementById("file-input");

  const previewContainer = document.getElementById("preview-container");
  const imagePreview = document.getElementById("image-preview");

  const resultBox = document.getElementById("result");
  const diseaseSpan = document.getElementById("disease-name");
  const confidenceSpan = document.getElementById("confidence");

  const errorBox = document.getElementById("error-message");

  // Some elements exist only on index.html, so guard them
  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) {
        previewContainer.classList.add("hidden");
        return;
      }
      const reader = new FileReader();
      reader.onload = function (event) {
        imagePreview.src = event.target.result;
        previewContainer.classList.remove("hidden");
      };
      reader.readAsDataURL(file);
    });
  }

  if (uploadForm) {
    uploadForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Reset UI
      errorBox.classList.add("hidden");
      resultBox.classList.add("hidden");
      errorBox.textContent = "";

      const file = fileInput.files[0];
      if (!file) {
        errorBox.textContent = "Please select an image file.";
        errorBox.classList.remove("hidden");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch(API_BASE_URL + "/predict", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Prediction failed");
        }

        const data = await response.json();

        diseaseSpan.textContent = data.disease || "Unknown";
        if (data.confidence !== undefined) {
          const percentage = parseFloat(data.confidence) * 100;
          confidenceSpan.textContent = percentage.toFixed(2) + " %";
        } else {
          confidenceSpan.textContent = "N/A";
        }

        resultBox.classList.remove("hidden");
      } catch (err) {
        console.error(err);
        errorBox.textContent = "Error: " + err.message;
        errorBox.classList.remove("hidden");
      }
    });
  }
});

// ---------- Dashboard Logic ----------
async function loadPredictions() {
  const listContainer = document.getElementById("predictions-list");
  const errorBox = document.getElementById("dashboard-error");

  if (!listContainer) return;

  listContainer.innerHTML = "<p>Loading predictions...</p>";
  errorBox.classList.add("hidden");
  errorBox.textContent = "";

  try {
    const response = await fetch(API_BASE_URL + "/predictions");
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Could not fetch predictions");
    }

    const predictions = await response.json();

    if (!Array.isArray(predictions) || predictions.length === 0) {
      listContainer.innerHTML = "<p>No predictions yet. Upload an image first.</p>";
      return;
    }

    listContainer.innerHTML = "";

    predictions.forEach((item) => {
      const card = document.createElement("div");
      card.className = "prediction-card";

      const img = document.createElement("img");
      img.src = API_BASE_URL + item.image_path;  // frontend uses "http://localhost:8000/uploads/xyz.jpg"
      img.alt = item.disease || "Leaf image";

      const info = document.createElement("div");
      info.className = "prediction-info";

      const disease = document.createElement("h3");
      disease.textContent = item.disease || "Unknown disease";

      const confidence = document.createElement("p");
      confidence.innerHTML = `<strong>Confidence:</strong> ${item.confidence}`;

      const timestamp = document.createElement("p");
      timestamp.className = "timestamp";

      info.appendChild(disease);
      info.appendChild(confidence);
      info.appendChild(timestamp);

      card.appendChild(img);
      card.appendChild(info);

      listContainer.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    listContainer.innerHTML = "";
    errorBox.textContent = "Error: " + err.message;
    errorBox.classList.remove("hidden");
  }
}
