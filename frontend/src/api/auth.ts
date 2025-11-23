import api from "./apiClient";

export const signup = (data: { name?: string; email: string; password: string }) =>
  api.post("/api/auth/signup", data);

export const login = (data: { email: string; password: string }) =>
  api.post("/api/auth/login", data);

export const me = (token: string) =>
  api.get("/api/auth/me", { headers: { Authorization: `Bearer ${token}` }});
