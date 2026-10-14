"use client";

import { useEffect, useState } from "react";

export default function ChinaChunkCheck() {
  const [result, setResult] = useState("Checking chunk...");

  useEffect(() => {
    async function checkChunk() {
      const chunk =
        "/_next/static/chunks/app/page-02b8a642350099c8.js";

      try {
        const response = await fetch(chunk, {
          cache: "no-store",
          credentials: "same-origin",
        });

        const text = await response.text();

        let hash = "SHA-256 unavailable";

        if (window.crypto?.subtle) {
          const digest = await window.crypto.subtle.digest(
            "SHA-256",
            new TextEncoder().encode(text)
          );

          hash = Array.from(new Uint8Array(digest))
            .map((byte) => byte.toString(16).padStart(2, "0"))
            .join("");
        }

        setResult(
          `STATUS: ${response.status}\n` +
            `CONTENT-TYPE: ${
              response.headers.get("content-type") || "none"
            }\n` +
            `BYTES: ${new TextEncoder().encode(text).length}\n` +
            `SHA-256: ${hash}`
        );
      } catch (error) {
        setResult(`FETCH ERROR: ${String(error)}`);
      }
    }

    void checkChunk();
  }, []);

  return (
    <main
      style={{
        padding: 24,
        fontFamily: "Arial, sans-serif",
        whiteSpace: "pre-wrap",
      }}
    >
      <h1>China Chunk Check</h1>
      <pre>{result}</pre>
    </main>
  );
}