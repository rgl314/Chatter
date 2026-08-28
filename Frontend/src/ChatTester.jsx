// src/ChatTester.jsx
import { useState, useRef, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const API_BASE = "http://localhost:8080";

// Cache resolved blob URLs so we don't re-fetch the same file repeatedly
const mediaUrlCache = new Map();

function AuthedMedia({ token, path, type }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let localUrl = null;

    async function load() {
      if (mediaUrlCache.has(path)) {
        setBlobUrl(mediaUrlCache.get(path));
        return;
      }

      try {
        const res = await fetch(`${API_BASE}${path}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          setError(true);
          return;
        }

        const blob = await res.blob();
        localUrl = URL.createObjectURL(blob);
        mediaUrlCache.set(path, localUrl);

        if (!cancelled) setBlobUrl(localUrl);
      } catch {
        if (!cancelled) setError(true);
      }
    }

    load();

    return () => {
      cancelled = true;
      // Note: we intentionally don't revoke here since the cache may still
      // reference this URL for other renders of the same file.
    };
  }, [path, token]);

  if (error) return <div>⚠️ failed to load media (auth or file missing)</div>;
  if (!blobUrl) return <div>⏳ loading media...</div>;

  if (type === "IMAGE") {
    return <img src={blobUrl} alt="uploaded" style={{ maxWidth: 200, display: "block" }} />;
  }
  if (type === "AUDIO") {
    return <audio controls src={blobUrl} />;
  }
  if (type === "VIDEO") {
    return <video controls width={240} src={blobUrl} />;
  }
  return null;
}

export default function ChatTester() {
  const [token, setToken] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [content, setContent] = useState("");
  const [log, setLog] = useState([]);
  const [uploading, setUploading] = useState(false);
  const clientRef = useRef(null);
  const fileInputRef = useRef(null);

  const appendLog = (entry) => setLog((prev) => [...prev, entry]);

  const connect = () => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE}/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      debug: (str) => console.log(str),
      onConnect: () => {
        appendLog({ type: "text", text: "✅ Connected" });

        client.subscribe("/user/queue/messages", (message) => {
          appendLog({ type: "message", data: JSON.parse(message.body) });
        });

        client.subscribe("/user/queue/messages.status", (message) => {
          appendLog({ type: "text", text: "👁 status update: " + message.body });
        });

        client.subscribe("/user/queue/errors", (message) => {
          appendLog({ type: "text", text: "❌ error: " + message.body });
        });
      },
      onStompError: (frame) => {
        appendLog({ type: "text", text: "❌ STOMP error: " + frame.headers.message });
      },
      onWebSocketClose: () => appendLog({ type: "text", text: "🔌 Disconnected" }),
    });

    client.activate();
    clientRef.current = client;
  };

  const disconnect = () => clientRef.current?.deactivate();

  const sendMessage = () => {
    if (!content.trim()) return;
    clientRef.current?.publish({
      destination: "/app/chat.send",
      body: JSON.stringify({ recipientId, content, type: "TEXT" }),
    });
    appendLog({ type: "text", text: "📤 sent: " + content });
    setContent("");
  };

  const markRead = () => {
    clientRef.current?.publish({
      destination: "/app/chat.read",
      body: JSON.stringify({ chatId: recipientId }),
    });
    appendLog({ type: "text", text: "👁 marked read request sent" });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !recipientId) {
      appendLog({ type: "text", text: "⚠️ pick a recipient before uploading" });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/api/files/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        appendLog({ type: "text", text: "❌ upload failed: " + JSON.stringify(err) });
        return;
      }

      const { url, type } = await res.json();
      appendLog({ type: "text", text: "📁 uploaded: " + url });

      clientRef.current?.publish({
        destination: "/app/chat.send",
        body: JSON.stringify({ recipientId, content: url, type }),
      });
      appendLog({ type: "text", text: "📤 sent file message" });
    } catch (err) {
      appendLog({ type: "text", text: "❌ upload error: " + err.message });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const renderLogEntry = (entry, i) => {
    if (entry.type === "text") return <div key={i}>{entry.text}</div>;

    const msg = entry.data;
    const isMedia = msg.type === "IMAGE" || msg.type === "AUDIO" || msg.type === "VIDEO";

    return (
      <div key={i} style={{ marginBottom: 8 }}>
        📩 {msg.senderId.slice(0, 8)}… → {msg.recipientId.slice(0, 8)}… [{msg.state}]
        {isMedia ? (
          <div style={{ marginTop: 4 }}>
            <AuthedMedia token={token} path={msg.content} type={msg.type} />
          </div>
        ) : (
          <div>{msg.content}</div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: 20, fontFamily: "monospace" }}>
      <h2>Chatter WebSocket Test</h2>

      <textarea
        placeholder="Paste JWT access_token here"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        rows={4}
        style={{ width: "100%" }}
      />
      <br />
      <button onClick={connect}>Connect</button>
      <button onClick={disconnect}>Disconnect</button>

      <hr />

      <input
        placeholder="recipientId (sub UUID)"
        value={recipientId}
        onChange={(e) => setRecipientId(e.target.value)}
        style={{ width: "100%" }}
      />
      <input
        placeholder="message content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ width: "100%" }}
      />
      <button onClick={sendMessage}>Send</button>
      <button onClick={markRead}>Mark Read</button>

      <hr />

      <label>
        Upload file (image/audio/video):{" "}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,audio/*,video/*"
          onChange={handleFileUpload}
          disabled={uploading}
        />
      </label>
      {uploading && <span> ⏳ uploading...</span>}

      <hr />

      <h3>Log</h3>
      <div style={{ background: "#f0f0f0", padding: 10, maxHeight: 500, overflow: "auto" }}>
        {log.map(renderLogEntry)}
      </div>
    </div>
  );
}