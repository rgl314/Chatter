import { useEffect, useState, useRef, useCallback } from "react";
import keycloak from "./keycloak.js";
import { getChatHistory, uploadFile } from "./api.js";
import AuthedMedia from "./AuthedMedia.jsx";
import {
  connectSocket,
  sendChatMessage,
  markChatRead,
} from "./socket.js";

export default function ChatWindow({ recipientId }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);

  const currentUserId = keycloak.tokenParsed?.sub;

  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);

  const upsertMessage = useCallback((incoming) => {
    setMessages((prev) => {
      // Replace optimistic message with server message
      const pendingIdx = prev.findIndex(
        (m) =>
          m.pending &&
          m.senderId === incoming.senderId &&
          m.content === incoming.content
      );

      if (pendingIdx !== -1) {
        const copy = [...prev];
        copy[pendingIdx] = incoming;
        return copy;
      }

      // Update existing message
      const idx = prev.findIndex((m) => m.id === incoming.id);

      if (idx === -1) {
        return [...prev, incoming];
      }

      const copy = [...prev];
      copy[idx] = incoming;

      return copy;
    });
  }, []);

  /*
   * Load conversation + connect WebSocket
   */
  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setMessages([]);

    getChatHistory(recipientId)
      .then((history) => {
        if (cancelled) return;
        setMessages(history);

        const chatId = history.find((m) => m.chatId)?.chatId;
        if (chatId) markChatRead(chatId);
      })
      .catch((err) => console.error("Failed to load history", err))
      .finally(() => !cancelled && setLoading(false));

    connectSocket({
      onMessage: (msg) => {
        console.log("📩 WebSocket message:", msg);

        /*
         * Only process messages belonging to this conversation.
         */
        if (
          msg.senderId === recipientId ||
          msg.recipientId === recipientId
        ) {
          upsertMessage(msg);

          /*
           * If the message is addressed to me and this
           * conversation is currently open, mark it read.
           *
           * IMPORTANT:
           * use msg.chatId, NOT recipientId.
           */
          if (
            msg.recipientId === currentUserId &&
            msg.chatId
          ) {
            markChatRead(msg.chatId);
          }
        }
      },

      onStatus: (msgs) => {
        const statusMessages = Array.isArray(msgs)
          ? msgs
          : [msgs];

        statusMessages.forEach(upsertMessage);
      },

      onError: (err) => {
        console.error("WebSocket server error:", err);
      },
    });

    return () => {
      cancelled = true;

      /*
       * DO NOT disconnect the global WebSocket here.
       */
    };
  }, [recipientId, currentUserId, upsertMessage]);

  /*
   * Scroll to latest message
   */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  /*
   * Send text message
   */
  const handleSend = () => {
    const content = draft.trim();

    if (!content) {
      return;
    }

    const tempMessage = {
      id: `temp-${Date.now()}`,
      chatId: null,
      senderId: currentUserId,
      recipientId,
      content,
      type: "TEXT",
      state: "SENDING",
      createdDate: new Date().toISOString(),
      pending: true,
    };

    /*
     * Optimistic UI
     */
    setMessages((prev) => [
      ...prev,
      tempMessage,
    ]);

    /*
     * Send through WebSocket
     */
    sendChatMessage(
      recipientId,
      content,
      "TEXT"
    );

    setDraft("");
  };

  /*
   * Upload media
   */
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    try {
      const { url, type } = await uploadFile(file);

      const tempMessage = {
        id: `temp-${Date.now()}`,
        chatId: null,
        senderId: currentUserId,
        recipientId,
        content: url,
        type,
        state: "SENDING",
        createdDate: new Date().toISOString(),
        pending: true,
      };

      setMessages((prev) => [
        ...prev,
        tempMessage,
      ]);

      sendChatMessage(
        recipientId,
        url,
        type
      );
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        Loading conversation...
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 12,
        }}
      >
        {messages.map((msg) => {
          const isMine =
            msg.senderId === currentUserId;

          return (
            <div
              key={msg.id}
              style={{
                textAlign: isMine
                  ? "right"
                  : "left",
                margin: "6px 0",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  background: isMine
                    ? "#DCF8C6"
                    : "#FFF",
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: "6px 10px",
                  maxWidth: "70%",
                  opacity: msg.pending
                    ? 0.6
                    : 1,
                }}
              >
                {msg.type === "TEXT" ? (
                  <div>{msg.content}</div>
                ) : (
                  <AuthedMedia path={msg.content} type={msg.type} />
                )}

                <div
                  style={{
                    fontSize: 10,
                    color: "#888",
                    marginTop: 3,
                  }}
                >
                  {msg.state}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      <div
        style={{
          display: "flex",
          padding: 8,
          borderTop: "1px solid #ddd",
          gap: 8,
        }}
      >
        <input
          value={draft}
          onChange={(e) =>
            setDraft(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
          placeholder="Type a message..."
          style={{
            flex: 1,
          }}
        />

        <button onClick={handleSend}>
          Send
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,audio/*,video/*"
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
}