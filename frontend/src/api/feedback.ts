import api from "./apiClient";

export const submitFeedback = (code: string, payload: any) =>
  api.post(`/api/feedback/${code}`, payload);
