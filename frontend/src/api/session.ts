import api from "./apiClient";

export const createSession = (data: { title: string; visibility?: string }, token?: string) =>
  api.post("/api/sessions", data, { headers: { Authorization: `Bearer ${token}` } });

export const listSessions = (token?: string) =>
  api.get("/api/sessions", { headers: { Authorization: `Bearer ${token}` } });

export const getSessionByCode = (code: string) => api.get(`/api/sessions/code/${code}`);

export const getSessionFeedbacks = (id: string, token?: string) =>
  api.get(`/api/sessions/${id}/feedbacks`, { headers: { Authorization: `Bearer ${token}` } });

export const getAnalytics = (id: string, token?: string) =>
  api.get(`/api/sessions/${id}/analytics`, { headers: { Authorization: `Bearer ${token}` } });
