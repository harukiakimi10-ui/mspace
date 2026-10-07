"use client";

import { useEffect, useState } from "react";

export default function ChinaReactDiagnostic() {
  const [hydrated, setHydrated] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [error, setError] = useState("No error detected");

  useEffect(() => {
    setHydrated(true);

    const handleError = (event: ErrorEvent) => {
      setError(event.message || "JavaScript error detected");
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setError(String(event.reason || "Unhandled promise rejection"));
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 30,
        fontFamily: "Arial, sans-serif",
        background: "#f5f5f5",
      }}
    >
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
          background: "white",
          padding: 30,
          borderRadius: 20,
        }}
      >
        <h1>React Hydration Diagnostic</h1>

        <p>
          <strong>React mounted:</strong>{" "}
          {hydrated ? "YES" : "NO"}
        </p>

        <p>
          <strong>Button clicks:</strong> {clicks}
        </p>

        <p>
          <strong>Error:</strong> {error}
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
    </main>
  );
}