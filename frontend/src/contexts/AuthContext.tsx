import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { loginRequest, setAuthToken, type TokenResponse } from "../api/client";

const STORAGE_TOKEN = "paddy_access_token";
const STORAGE_USER = "paddy_user";

export type AuthUser = {
  userId: number;
  username: string;
  mobile_number: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setSession: (t: TokenResponse) => void;
  login: (mobile: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readStored(): { token: string | null; user: AuthUser | null } {
  try {
    const token = localStorage.getItem(STORAGE_TOKEN);
    const raw = localStorage.getItem(STORAGE_USER);
    if (!token || !raw) return { token: null, user: null };
    const user = JSON.parse(raw) as AuthUser;
    setAuthToken(token);
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [{ token, user }, setState] = useState(readStored);

  const persist = useCallback((t: TokenResponse | null) => {
    if (!t) {
      localStorage.removeItem(STORAGE_TOKEN);
      localStorage.removeItem(STORAGE_USER);
      setAuthToken(null);
      setState({ token: null, user: null });
      return;
    }
    const u: AuthUser = {
      userId: t.user_id,
      username: t.username,
      mobile_number: t.mobile_number,
    };
    localStorage.setItem(STORAGE_TOKEN, t.access_token);
    localStorage.setItem(STORAGE_USER, JSON.stringify(u));
    setAuthToken(t.access_token);
    setState({ token: t.access_token, user: u });
  }, []);

  const setSession = useCallback(
    (t: TokenResponse) => {
      persist(t);
    },
    [persist],
  );

  const login = useCallback(
    async (mobile: string) => {
      const data = await loginRequest(mobile);
      persist(data);
    },
    [persist],
  );

  const logout = useCallback(() => {
    persist(null);
  }, [persist]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      setSession,
      login,
      logout,
    }),
    [user, token, setSession, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
