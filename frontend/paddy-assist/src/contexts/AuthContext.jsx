import React, { createContext, useState, useEffect } from "react";
import api from "../api/apiClient";
export const AuthContext = createContext({ user: null });

export function AuthProvider({ children }){
  const [user, setUser] = useState(()=> {
    try { return JSON.parse(localStorage.getItem("user")) || null } catch { return null }
  });

  useEffect(()=> {
    if(user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  },[user]);

  const login = async (fullName) => {
    // try server login; fallback to local user so UI works offline
    try {
      const res = await api.post("/auth/login", { full_name: fullName });
      setUser(res.data);
      return res.data;
    } catch (err) {
      const fallback = { id: "local-"+Date.now(), full_name: fullName, lang: localStorage.getItem("appLang")||"en" };
      setUser(fallback);
      return fallback;
    }
  };

  const logout = ()=> setUser(null);
  const updateLang = async (lang) => {
    if(!user) return;
    setUser(prev=>({...prev, lang}));
    try { await api.post(`/users/${user.id}/lang`, { lang }) } catch {}
  };

  return <AuthContext.Provider value={{ user, login, logout, updateLang, setUser }}>{children}</AuthContext.Provider>
}
