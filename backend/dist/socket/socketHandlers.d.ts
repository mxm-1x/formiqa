import { Server } from "socket.io";
interface JoinSessionPayload {
    sessionCode: string;
}
interface SubmitFeedbackPayload {
    type: string;
    emoji?: string;
    message?: string;
}
interface ServerToClientEvents {
    "presence-update": (payload: {
        onlineCount: number;
    }) => void;
    "session-joined": (payload: any) => void;
    "new-feedback": (payload: any) => void;
    "feedback-submitted": (payload: any) => void;
    error: (payload: {
        message: string;
    }) => void;
}
interface ClientToServerEvents {
    "join-session": (payload: JoinSessionPayload) => void;
    "submit-feedback": (payload: SubmitFeedbackPayload) => void;
}
export declare const registerSocketHandlers: (io: Server<ClientToServerEvents, ServerToClientEvents>) => void;
export {};
//# sourceMappingURL=socketHandlers.d.ts.map