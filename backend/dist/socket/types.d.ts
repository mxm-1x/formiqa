export interface JoinSessionPayload {
    sessionCode: string;
}
export interface PresenceUpdatePayload {
    onlineCount: number;
}
export interface NewFeedbackPayload {
    id: string;
    message?: string;
    emoji?: string;
    sentimentScore?: number;
    createdAt: string;
}
export interface ServerToClientEvents {
    "presence-update": (data: PresenceUpdatePayload) => void;
    "new-feedback": (data: NewFeedbackPayload) => void;
    error: (msg: string) => void;
}
export interface ClientToServerEvents {
    "join-session": (data: JoinSessionPayload) => void;
}
//# sourceMappingURL=types.d.ts.map