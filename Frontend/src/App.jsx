// src/App.jsx
import { useState } from "react";
import keycloak from "./keycloak.js";
import ChatWindow from "./ChatWindow.jsx";
import ContactList from "./ContactList.jsx";

export default function App() {
  const { given_name, email } = keycloak.tokenParsed || {};
  const [recipientId, setRecipientId] = useState(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "sans-serif" }}>
      <div style={{ padding: 10, borderBottom: "1px solid #ddd", display: "flex", justifyContent: "space-between" }}>
        <strong>Chatter</strong> — logged in as {given_name} ({email})
        <button onClick={() => keycloak.logout({ redirectUri: "http://localhost:5173" })}>
          Logout
        </button>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <ContactList onSelect={setRecipientId} selectedId={recipientId} />

        <div style={{ flex: 1 }}>
          {recipientId ? (
            <ChatWindow key={recipientId} recipientId={recipientId} />
          ) : (
            <div style={{ padding: 20 }}>Select a contact to start chatting</div>
          )}
        </div>
      </div>
    </div>
  );
}