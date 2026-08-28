export default function MessageStatus({ state }) {
    if (state === "SENDING") return <span style={{ fontSize: 10, color: "#999" }}>Sending...</span>;
    if (state === "SENT") return <span style={{ fontSize: 10, color: "#999" }}>✓ Sent</span>;
    if (state === "DELIVERED") return <span style={{ fontSize: 10, color: "#999" }}>✓✓ Delivered</span>;
    if (state === "SEEN") return <span style={{ fontSize: 10, color: "#4fa8f7" }}>✓✓ Seen</span>;
    return null;
}