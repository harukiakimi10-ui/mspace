"use client";

import { useState } from "react";

export default function ChinaJsTestPage() {
  const [count, setCount] = useState(0);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          background: "#ffffff",
          borderRadius: "20px",
          padding: "40px 24px",
          textAlign: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <h1>MSpace JavaScript Test</h1>

        <p style={{ fontSize: "20px" }}>
          JavaScript is running.
        </p>

        <p style={{ fontSize: "48px", margin: "20px 0" }}>
          {count}
        </p>

        <button
          onClick={() => setCount((value) => value + 1)}
          style={{
            border: "none",
            borderRadius: "999px",
            padding: "14px 28px",
            background: "#16a34a",
            color: "#ffffff",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          Tap Me
        </button>
      </div>
    </main>
  );
}