"use client";

import { useEffect, useState } from "react";

export default function ReactDiagnosticClient() {
  const [mounted, setMounted] = useState(false);
  const [clicks, setClicks] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div style={{ marginTop: 30 }}>
      <h3>React status</h3>

      <p>
        <strong>React mounted:</strong>{" "}
        {mounted ? "YES" : "NO"}
      </p>

      <p>
        <strong>Button clicks:</strong> {clicks}
      </p>

      <button
        onClick={() => setClicks((value) => value + 1)}
        style={{
          padding: "15px 25px",
          fontSize: 18,
          borderRadius: 10,
          border: "none",
          cursor: "pointer",
        }}
      >
        TAP ME
      </button>
    </div>
  );
}