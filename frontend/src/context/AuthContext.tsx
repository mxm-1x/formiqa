import React, { createContext, useContext, useEffect, useState } from "react";
import { login as apiLogin, me as apiMe } from "../api/auth";
import api from "../api/apiClient";
import { signup as apiSignup } from "../api/auth";

type User = { id: string; name?: string; email: string; role?: string } | null;

type AuthState = {
  token: string | null;
  user: User;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string|undefined, email:string, password:string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    (async () => {
      if (token) {
        try {
          const res = await apiMe(token);
          setUser(res.data.user);
        } catch {
          setToken(null);
          setUser(null);
          localStorage.removeItem("token");
        }
      }
    })();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await apiLogin({ email, password });
    const t = res.data.token;
    setToken(t);
    localStorage.setItem("token", t);
    setUser(res.data.user);
  };

  const signup = async (name: string|undefined, email: string, password: string) => {
    const res = await apiSignup({ name, email, password });
    const t = res.data.token;
    setToken(t);
    localStorage.setItem("token", t);
    setUser(res.data.user);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ token, user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
