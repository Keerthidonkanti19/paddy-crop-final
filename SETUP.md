# Paddy Crop Disease Detection — Full-Stack Setup

This project includes a **React + Tailwind** frontend, **FastAPI** backend, **PostgreSQL** database, **TensorFlow** CNN inference (weights in `ml-api/model/`), **OpenCV** preprocessing, **i18next** (5 languages), **Chart.js** charts, **Web Speech API** voice features, and **OTP** via **Twilio** (with a safe **development fallback** that logs OTPs to the server console when Twilio is not configured).

---

## 1. Prerequisites

- **Python 3.10+** (3.11 recommended for TensorFlow wheels)
- **Node.js 20+** and npm
- **PostgreSQL 14+**
- Trained model files: `ml-api/model/paddy_model.h5` and `ml-api/model/class_indices.json` (already expected by the backend)

---

## 2. PostgreSQL database

1. Create a database (example name `paddy_crop_disease_db`):

```sql
CREATE DATABASE paddy_crop_disease_db;
```

2. Apply the schema (creates `users`, `otp_codes`, `detection_history`):

```bash
psql -U postgres -d paddy_crop_disease_db -f backend/schema.sql
```

Or run the SQL in `backend/schema.sql` from any PostgreSQL client.

---

## 3. Backend (FastAPI)

1. Create a virtual environment and install dependencies:

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

2. Copy environment file and edit values:

```bash
copy .env.example .env
```

Set at least:

- `DATABASE_URL` — PostgreSQL connection string  
- `JWT_SECRET` — long random string  
- `OTP_PEPPER` — random string used to hash OTPs  
- **Optional Twilio** (production SMS): `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` (E.164, e.g. `+1xxxxxxxxxx`)  
- `CORS_ORIGINS` — include your frontend URL, e.g. `http://localhost:5173`

3. Run the API (from the `backend` folder):

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Development OTP:** If Twilio variables are **not** set, the API still generates a real 6-digit OTP and stores it hashed in `otp_codes`, but the SMS body is **only logged** to the terminal (`WARNING` log with the OTP text). Use that OTP in the Sign Up screen.

**API endpoints**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/send-otp` | Sign up: send OTP (`username`, `mobile_number`) |
| POST | `/verify-otp` | Sign up: verify OTP and create user; returns JWT |
| POST | `/login` | Login with `username`, `mobile_number`; returns JWT |
| POST | `/predict` | Multipart `file` + Bearer token; query `lang` = `en` \| `te` \| `hi` \| `ta` \| `kn` |
| GET | `/history/{user_id}` | Bearer token required; `user_id` must match token |

---

## 4. Frontend (React + Vite)

1. Install and configure:

```bash
cd frontend
copy .env.example .env
npm install
```

Set `VITE_API_URL` in `.env` to your API base (default `http://127.0.0.1:8000`).

2. Development server:

```bash
npm run dev
```

3. Production build:

```bash
npm run build
npm run preview
```

---

## 5. Authentication flows

- **Sign Up:** User chooses **Sign Up**, enters username and mobile, taps **Send OTP**, enters the 6-digit code, taps **Verify & create account**. JWT is stored in `localStorage` for later requests.  
- **Login:** User chooses **Login**, enters the same username and mobile registered earlier, taps **Login** (no OTP).

---

## 6. Twilio vs Firebase

- **Implemented:** Twilio SMS when `TWILIO_*` env vars are set.  
- **Firebase Phone Auth** is not wired in this repo (it is usually implemented in the client with Firebase SDK and optional Cloud Functions). To use Firebase instead, you would replace the `send_sms_twilio` path in `backend/app/services/otp_service.py` with your Firebase/FCM or callable-function integration and keep the same `/send-otp` and `/verify-otp` contracts.

---

## 7. Multilingual content

- **UI:** `frontend/src/locales/*.json` (en, te, hi, ta, kn) via **i18next**; selected language is stored under `paddy_i18n_lang` in `localStorage`.  
- **Recommendations / disease display on predict:** `backend/app/services/recommendations.py` plus optional overrides in `backend/app/data/recommendations_i18n.json`. The `/predict` endpoint accepts `lang` to return localized fertilizer/pesticide text where available.

---

## 8. Voice assistant

- **Text-to-speech:** “Read result aloud” on the home result card (uses the browser’s `speechSynthesis` in the selected language).  
- **Speech-to-text:** Mic button uses `SpeechRecognition` / `webkitSpeechRecognition` where supported; phrases like “home”, “profile”, and “read result” are handled in `frontend/src/hooks/useVoiceWeb.ts`.

---

## 9. Troubleshooting

| Issue | Suggestion |
|--------|------------|
| TensorFlow / model load errors | Confirm `ml-api/model/paddy_model.h5` exists and matches the architecture in `backend/app/ml_model.py`. |
| CORS errors | Add your exact frontend origin to `CORS_ORIGINS` in backend `.env`. |
| OTP never arrives | Check Twilio credentials and sender number; in dev, read OTP from API logs. |
| Chart empty on profile | Run at least one successful `/predict` while logged in so `detection_history` has rows. |

---

## 10. Project layout (relevant parts)

- `backend/app/main.py` — FastAPI app, CORS, static uploads  
- `backend/app/db_models.py` — SQLAlchemy models  
- `backend/app/ml_model.py` — TensorFlow + OpenCV pipeline  
- `backend/app/routers/` — Auth and prediction routes  
- `backend/schema.sql` — PostgreSQL DDL  
- `frontend/src/` — React app, i18n, API client, pages  

For rural / low-bandwidth use, prefer smaller JPEG captures from the camera UI and deploy the API close to users (same region) to reduce latency.
