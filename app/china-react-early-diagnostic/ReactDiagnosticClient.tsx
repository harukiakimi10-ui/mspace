
"use client";

import { useEffect, useState } from "react";

export default function ReactDiagnosticClient() {
  const [mounted, setMounted] = useState(false);
  const [clicks, setClicks] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section
      style={{
        marginTop: 24,
        padding: 16,
        border: "1px solid #ddd",
        borderRadius: 12,
      }}
    >
      <h3>React execution test</h3>

      <p>
        <strong>React mounted:</strong> {mounted ? "YES" : "NO"}
      </p>

      <p>
        <strong>Button clicks:</strong> {clicks}
      </p>

      <button
        type="button"
        onClick={() => setClicks((value) => value + 1)}
        style={{
          padding: "15px 25px",
          fontSize: 18,
          borderRadius: 10,
          border: "none",
          cursor: "pointer",
          background: "#1769e0",
          color: "#fff",
        }}
      >
        TAP ME
      </button>
    </section>
  );
}
