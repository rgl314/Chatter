// socket.js
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import keycloak from "./keycloak.js";

const WS_URL = "http://localhost:8080/ws";

let client = null;
let generation = 0;
let handlers = {
  onMessage: null,
  onStatus: null,
  onError: null,
};

export async function connectSocket({ onMessage, onStatus, onError }) {
  handlers = { onMessage, onStatus, onError };

  if (client?.active) {
    return client;
  }

  const myGeneration = ++generation;

  try {
    await keycloak.updateToken(30);
  } catch (err) {
    console.error("Token refresh failed before connecting", err);
    keycloak.login();
    return;
  }

  if (myGeneration !== generation) return;

  const newClient = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    connectHeaders: { Authorization: `Bearer ${keycloak.token}` },
    reconnectDelay: 5000,
    beforeConnect: async () => {
      try {
        await keycloak.updateToken(30);
        newClient.connectHeaders = { Authorization: `Bearer ${keycloak.token}` };
      } catch (err) {
        console.error("Token refresh failed during reconnect", err);
      }
    },
    onConnect: () => {
      if (myGeneration !== generation) {
        newClient.deactivate();
        return;
      }

      newClient.subscribe("/user/queue/messages", (msg) => {
        handlers.onMessage?.(JSON.parse(msg.body));
      });

      newClient.subscribe("/user/queue/messages.status", (msg) => {
        handlers.onStatus?.(JSON.parse(msg.body));
      });

      newClient.subscribe("/user/queue/errors", (msg) => {
        handlers.onError?.(JSON.parse(msg.body));
      });
    },
  });

  client = newClient;
  client.activate();
  return client;
}

export function disconnectSocket() {
  generation++;
  if (client) {
    client.deactivate();
    client = null;
  }
}

export function sendChatMessage(recipientId, content, type = "TEXT") {
  client?.publish({
    destination: "/app/chat.send",
    body: JSON.stringify({ recipientId, content, type }),
  });
}

export function markChatRead(chatId) {
  client?.publish({
    destination: "/app/chat.read",
    body: JSON.stringify({ chatId }),
  });
}