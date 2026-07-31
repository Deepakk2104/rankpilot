import { createContext, useContext, useEffect, useState } from "react";
import api from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("rankpilot_user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("rankpilot_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("rankpilot_user");
    }
  }, [user]);

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("rankpilot_token", data.token);
    setUser(data.user);
  }

  async function register(email, password, name) {
    const { data } = await api.post("/auth/register", { email, password, name });
    localStorage.setItem("rankpilot_token", data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("rankpilot_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
