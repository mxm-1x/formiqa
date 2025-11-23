import React, { createContext, useContext, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

type SocketCtx = {
  socket: Socket | null;
};

const SocketContext = createContext<SocketCtx>({ socket: null });

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socketRef = useRef<Socket | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    // Connect once; send token if want to authenticate sockets later
    const url = import.meta.env.VITE_API_URL as string || "http://localhost:4000";
    const s = io(url, {
      transports: ["websocket"],
      auth: token ? { token } : undefined,
    });
    socketRef.current = s;

    s.on("connect", () => console.log("Socket connected", s.id));
    s.on("disconnect", () => console.log("Socket disconnected"));

    return () => {
      s.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return <SocketContext.Provider value={{ socket: socketRef.current }}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
