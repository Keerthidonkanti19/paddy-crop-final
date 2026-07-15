import axios from "axios";

/** In dev, default to Vite proxy `/api` → backend (see vite.config.ts). In production use VITE_API_URL from build. */
function getApiBaseURL(): string {
  const env = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  // if (import.meta.env.DEV) {
  //   if (env && import.meta.env.VITE_DEV_DIRECT_API === "true") {
  //     return env.replace(/\/$/, "");
  //   }
  //   return "/api";
  // }
  if (import.meta.env.DEV) {
  return "http://127.0.0.1:8000";
}
  const prod = env && env.length > 0 ? env : "http://127.0.0.1:8000";
  return prod.replace(/\/$/, "");
}

const baseURL = getApiBaseURL();

export const api = axios.create({
  baseURL,
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export type TokenResponse = {
  access_token: string;
  token_type: string;
  user_id: number;
  username: string;
  mobile_number: string;
};

export type PredictResponse = {
  id: number;
  image_path: string;
  predicted_disease: string;
  confidence_score: string | null;
  fertilizers: string | null;
  pesticides: string | null;
  disease_label_i18n: string | null;
  warning?: string;
};

export type HistoryItem = {
  id: number;
  image_path: string;
  predicted_disease: string;
  fertilizers: string | null;
  pesticides: string | null;
  confidence_score: string | null;
  timestamp: string;
};

export async function signupRequest(username: string, mobile_number: string) {
  const { data } = await api.post<TokenResponse>("/signup", { username, mobile_number });
  return data;
}

export async function loginRequest(mobile_number: string) {
  const { data } = await api.post<TokenResponse>("/login", { mobile_number });
  return data;
}

export async function predictImage(file: File, lang: string) {
  const fd = new FormData();
  fd.append("file", file);
  const { data } = await api.post<PredictResponse>("/predict", fd, {
    params: { lang },
    timeout: 120_000,
  });
  return data;
}

export async function fetchHistory(userId: number) {
  const { data } = await api.get<HistoryItem[]>(`/history/${userId}`, {
    params: { _t: Date.now() },
    headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
  });
  return data;
}

export function mediaUrl(path: string) {
  if (path.startsWith("http")) return path;
  return `${baseURL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function askFarmerAssistant(
  payload: {
    disease: string;
    confidence: string;
    fertilizers: string;
    pesticides: string;
    question: string;
    language: string;
  }
) {
  const { data } = await api.post(
    "/ask-farmer-assistant",
    payload
  );

  return data;
}