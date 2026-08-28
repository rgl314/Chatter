// src/AuthedMedia.jsx
import { useEffect, useState } from "react";
import { fetchFileBlob } from "./api.js";

const mediaUrlCache = new Map();

export default function AuthedMedia({ path, type }) {
  const [blobUrl, setBlobUrl] = useState(mediaUrlCache.get(path) || null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (mediaUrlCache.has(path)) {
      setBlobUrl(mediaUrlCache.get(path));
      return;
    }

    let cancelled = false;

    fetchFileBlob(path)
      .then((blob) => {
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        mediaUrlCache.set(path, url);
        setBlobUrl(url);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [path]);

  if (error) return <div style={{ fontSize: 12, color: "#c00" }}>⚠️ failed to load media</div>;
  if (!blobUrl) return <div style={{ fontSize: 12, color: "#888" }}>⏳ loading...</div>;

  if (type === "IMAGE") {
    return <img src={blobUrl} alt="attachment" style={{ maxWidth: 220, borderRadius: 6, display: "block" }} />;
  }
  if (type === "AUDIO") {
    return <audio controls src={blobUrl} style={{ maxWidth: 220 }} />;
  }
  if (type === "VIDEO") {
    return <video controls src={blobUrl} style={{ maxWidth: 220, borderRadius: 6 }} />;
  }
  return null;
}