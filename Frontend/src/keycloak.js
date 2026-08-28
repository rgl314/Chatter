import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://127.0.0.1:9090",
  realm: "chatter",
  clientId: "chatter-client",
});

export default keycloak;