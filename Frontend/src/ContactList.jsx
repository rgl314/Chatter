// src/ContactList.jsx
import { useEffect, useState, useRef } from "react";
import { listUsers, getPresence } from "./api.js";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import keycloak from "./keycloak.js";

export default function ContactList({ onSelect, selectedId }) {
  const [users, setUsers] = useState([]);
  const [presence, setPresence] = useState({}); // { userId: boolean }
  const [loading, setLoading] = useState(true);
  const presenceClientRef = useRef(null);

  useEffect(() => {
    listUsers()
      .then(async (userList) => {
        setUsers(userList);
        // fetch initial presence snapshot for each contact
        const entries = await Promise.all(
          userList.map(async (u) => {
            try {
              const p = await getPresence(u.id);
              return [u.id, p.online];
            } catch {
              return [u.id, false];
            }
          })
        );
        setPresence(Object.fromEntries(entries));
      })
      .catch((err) => console.error("Failed to load users", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (users.length === 0) return;

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      connectHeaders: { Authorization: `Bearer ${keycloak.token}` },
      onConnect: () => {
        users.forEach((u) => {
          client.subscribe(`/topic/presence.${u.id}`, (msg) => {
            const data = JSON.parse(msg.body);
            setPresence((prev) => ({ ...prev, [data.userId]: data.online }));
          });
        });
      },
    });

    client.activate();
    presenceClientRef.current = client;

    return () => client.deactivate();
  }, [users]);

  if (loading) return <div style={{ padding: 12 }}>Loading contacts...</div>;

  return (
    <div style={{ width: 240, borderRight: "1px solid #ddd", overflowY: "auto" }}>
      {users.map((user) => (
        <div
          key={user.id}
          onClick={() => onSelect(user.id)}
          style={{
            padding: 10,
            cursor: "pointer",
            background: selectedId === user.id ? "#e6f0ff" : "transparent",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: presence[user.id] ? "#4caf50" : "#ccc",
              flexShrink: 0,
            }}
          />
          <div>
            <div style={{ fontWeight: 600 }}>{user.firstName} {user.lastName}</div>
            <div style={{ fontSize: 12, color: "#888" }}>{user.email}</div>
          </div>
        </div>
      ))}
    </div>
  );
}