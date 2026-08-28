import keycloak from "./keycloak.js";

const API_BASE = "http://localhost:8080";

async function authedFetch(path, options = {}) {
  try {
    // refreshes only if token expires within 30s — cheap no-op otherwise
    await keycloak.updateToken(30);
  } catch (err) {
    console.error("Token refresh failed, redirecting to login", err);
    keycloak.login();
    throw err;
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${keycloak.token}`,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `Request failed: ${res.status}`);
  }

  return res;
}

export async function getPresence(userId) {
  const res = await authedFetch(`/api/users/${userId}/presence`);
  return res.json();
}

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await authedFetch(`/api/files/upload`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export async function fetchFileBlob(path) {
  const res = await authedFetch(path);
  return res.blob();
}

export async function getChatHistory(recipientId) {
  const res = await authedFetch(`/api/chats/${recipientId}/messages`);
  return res.json();
}

export async function listUsers() {
  const res = await authedFetch(`/api/users`);
  return res.json();
}
