import api from "./apiClient";

export const getSessionAnalytics = (sessionId: string, token: string) =>
    api.get(`/api/sessions/${sessionId}/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
    });
