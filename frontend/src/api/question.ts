import api from "./apiClient";

export const createQuestion = (sessionId: string, payload: any, token?: string) =>
  api.post(`/api/sessions/${sessionId}/questions`, payload, { headers: { Authorization: `Bearer ${token}` } });

export const listQuestions = (sessionId: string, token?: string) =>
  api.get(`/api/sessions/${sessionId}/questions`, { headers: { Authorization: `Bearer ${token}` } });

export const activateQuestion = (questionId: string, token?: string) =>
  api.post(`/api/questions/${questionId}/activate`, {}, { headers: { Authorization: `Bearer ${token}` } });

export const submitResponse = (questionId: string, payload: any) =>
  api.post(`/api/questions/${questionId}/responses`, payload);

export const listResponses = (questionId: string, token?: string) =>
  api.get(`/api/questions/${questionId}/responses`, { headers: { Authorization: `Bearer ${token}` } });

export const endQuestion = (questionId: string, token?: string) =>
  api.post(`/api/questions/${questionId}/end`, {}, { headers: { Authorization: `Bearer ${token}` } });
