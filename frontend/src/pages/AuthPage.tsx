import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { signupRequest } from "../api/client";
import { useAuth } from "../contexts/AuthContext";

function formatApiError(err: unknown, fallback: string): string {
  const e = err as {
    response?: { data?: { detail?: unknown } };
    message?: string;
    code?: string;
  };
  if (e.code === "ERR_NETWORK" || e.message === "Network Error") {
    return "Cannot reach the API. Start the backend on port 8000 (uvicorn), restart npm run dev, then try again. In dev, requests use the Vite proxy at /api.";
  }
  const d = e.response?.data?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) {
    return d.map((x: { msg?: string }) => x.msg).filter(Boolean).join(", ") || fallback;
  }
  return fallback;
}

export default function AuthPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login, setSession } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  const handleSignup = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await signupRequest(username.trim(), mobileNumber.trim());
      setSession(data);
      navigate("/home", { replace: true });
    } catch (err: unknown) {
      setError(formatApiError(err, "Sign up failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      await login(mobileNumber.trim());
      navigate("/home", { replace: true });
    } catch (err: unknown) {
      setError(formatApiError(err, "User not found"));
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = isLogin
    ? mobileNumber.trim().length >= 10
    : username.trim().length >= 2 && mobileNumber.trim().length >= 10;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <h1 className="mb-2 text-center text-3xl font-bold">Paddy Doctor</h1>

        <p className="mb-6 text-center text-gray-500">Paddy Crop Disease Detection</p>

        {!isLogin && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
        )}

        <div className="mb-4">
          <input
            type="text"
            placeholder="Mobile Number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            inputMode="numeric"
            autoComplete="tel"
            className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-100 p-3 text-red-700" role="alert">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={() => void (isLogin ? handleLogin() : handleSignup())}
          disabled={loading || !canSubmit}
          className="w-full rounded-xl bg-green-700 p-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
        </button>

        <div className="mt-6 text-center">
          {isLogin ? (
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError("");
              }}
              className="font-medium text-green-700"
            >
              Need an account? Sign Up
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
              className="font-medium text-green-700"
            >
              Already have an account? Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
