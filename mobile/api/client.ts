import AsyncStorage from "@react-native-async-storage/async-storage";

// const API_BASE_URL = "http://192.168.29.28:8000";
const API_BASE_URL = "http://10.202.243.249:8000";

const TOKEN_KEY = "khet_saathi_access_token";
const USER_KEY = "khet_saathi_user";

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
  probabilities?: Record<string, number>;
  warning?: string;
};

export async function saveAuthData(data: TokenResponse) {
  await AsyncStorage.setItem(TOKEN_KEY, data.access_token);

  await AsyncStorage.setItem(
    USER_KEY,
    JSON.stringify({
      user_id: data.user_id,
      username: data.username,
      mobile_number: data.mobile_number,
    })
  );
}

export async function getAuthToken() {
  return await AsyncStorage.getItem(TOKEN_KEY);
}

export async function getUserData() {
  const data = await AsyncStorage.getItem(USER_KEY);

  return data ? JSON.parse(data) : null;
}

export async function logout() {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
}

export async function signupRequest(
  username: string,
  mobile_number: string
): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      mobile_number,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Signup failed (${response.status}): ${errorText}`
    );
  }

  const data: TokenResponse = await response.json();

  await saveAuthData(data);

  return data;
}

export async function loginRequest(
  mobile_number: string
): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mobile_number,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Login failed (${response.status}): ${errorText}`
    );
  }

  const data: TokenResponse = await response.json();

  await saveAuthData(data);

  return data;
}

export async function predictImage(
  imageUri: string,
  language: string = "en"
): Promise<PredictResponse> {
  const token = await getAuthToken();

  if (!token) {
    throw new Error("Please login before analyzing an image.");
  }

  const formData = new FormData();

  formData.append("file", {
    uri: imageUri,
    name: "paddy_leaf.jpg",
    type: "image/jpeg",
  } as any);

  const response = await fetch(
    `${API_BASE_URL}/predict?lang=${encodeURIComponent(language)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Prediction failed (${response.status}): ${errorText}`
    );
  }

  return await response.json();
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
  const token = await getAuthToken();

  if (!token) {
    throw new Error("Please login before using the Farmer AI Assistant.");
  }

  const response = await fetch(
    `${API_BASE_URL}/ask-farmer-assistant`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Assistant request failed (${response.status}): ${errorText}`
    );
  }

  return await response.json();
}
export type HistoryItem = {
  id: number;
  image_path: string;
  predicted_disease: string;
  fertilizers: string | null;
  pesticides: string | null;
  confidence_score: string | null;
  timestamp: string;
};

export async function fetchHistory(
  userId: number
): Promise<HistoryItem[]> {
  const token = await getAuthToken();

  if (!token) {
    throw new Error(
      "Please login before viewing prediction history."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/history/${userId}?_t=${Date.now()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `History request failed (${response.status}): ${errorText}`
    );
  }

  return await response.json();
}