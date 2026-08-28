import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import keycloak from "./keycloak.js";

const root = ReactDOM.createRoot(document.getElementById("root"));

keycloak
  .init({
    onLoad: "login-required", // forces login before showing anything
    pkceMethod: "S256",       // PKCE — required for public clients, more secure than plain redirect
  })
  .then((authenticated) => {
    if (authenticated) {
      root.render(<React.StrictMode>
  <App />
</React.StrictMode>);
    } else {
      root.render(<div>Failed to authenticate</div>);
    }
  })
  .catch((err) => {
    console.error("Keycloak init error", err);
    root.render(<div>Keycloak initialization failed</div>);
  });