"use client";

import { useState } from "react";

export default function ChinaReactTest() {
  const [count, setCount] = useState(0);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 24,
          padding: 50,
          textAlign: "center",
          width: "100%",
          maxWidth: 500,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1>React Test</h1>

        <p>React is running.</p>

        <div
          style={{
            fontSize: 80,
            margin: "30px 0",
          }}
        >
          {count}
        </div>

        <button
          onClick={() => setCount((value) => value + 1)}
          style={{
            background: "#16a34a",
            color: "white",
            border: "none",
            borderRadius: 50,
            padding: "18px 45px",
            fontSize: 20,
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          TAP ME
        </button>
      </div>
    </main>
  );
}