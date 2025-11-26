export interface JoinSessionPayload {
    sessionCode: string;
}
export interface SubmitFeedbackPayload {
    type: string;
    emoji?: string;
    message?: string;
}
export interface PresenceUpdatePayload {
    onlineCount: number;
}
export interface NewFeedbackPayload {
    id: string;
    message?: string | null;
    emoji?: string | null;
    sentimentScore?: number | null;
    createdAt: string;
}
export interface NewQuestionPayload {
    id: string;
    sessionId: string;
    type: string;
    title: string;
    options: string[];
    createdAt: string;
}
export interface QuestionEndedPayload {
    questionId: string;
}
export interface NewResponsePayload {
    id: string;
    questionId: string;
    selectedOpt?: string;
    textAnswer?: string;
    sentimentScore?: number;
    createdAt: string;
}
export interface SessionJoinedPayload {
    session: {
        id: string;
        code: string;
        title: string;
    };
    activeQuestions: Array<{
        id: string;
        sessionId: string;
        type: string;
        title: string;
        options: string[];
        isActive: boolean;
        createdAt: Date;
    }>;
}
export interface FeedbackSubmittedPayload {
    success: boolean;
    feedbackId: string;
}
export interface ErrorPayload {
    message: string;
}
export interface ServerToClientEvents {
    "presence-update": (data: PresenceUpdatePayload) => void;
    "new-feedback": (data: NewFeedbackPayload) => void;
    "new-question": (data: NewQuestionPayload) => void;
    "question-activated": (data: NewQuestionPayload) => void;
    "question-ended": (data: QuestionEndedPayload) => void;
    "new-response": (data: NewResponsePayload) => void;
    "session-joined": (data: SessionJoinedPayload) => void;
    "feedback-submitted": (data: FeedbackSubmittedPayload) => void;
    error: (data: ErrorPayload) => void;
}
export interface ClientToServerEvents {
    "join-session": (data: JoinSessionPayload) => void;
    "submit-feedback": (data: SubmitFeedbackPayload) => void;
}
//# sourceMappingURL=types.d.ts.map