import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../auth/AuthContext.jsx";

export function useSocket(roomId) {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) {
      setSocket(null);
      return;
    }

    const connection = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
    });
    setSocket(connection);
    connection.emit("room:join", roomId);

    const onMessage = (message) => {
      setMessages((previousMessages) => [...previousMessages, message]);
    };
    connection.on("chat:message", onMessage);

    return () => {
      connection.off("chat:message", onMessage);
      connection.disconnect();
    };
  }, [token, roomId]);

  const sendMessage = useCallback(
    (text) => socket?.emit("chat:message", { roomId, text }),
    [socket, roomId]
  );

  return { messages, sendMessage };
}
