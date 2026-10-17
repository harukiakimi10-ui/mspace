"use client";

import { useState, useEffect } from "react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((response) => {
        if (response.ok) {
          window.location.replace("/admin/chats");
        }
      })
      .catch(() => {});
  }, []);

  async function login() {
    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Login failed.");
        return;
      }

      window.location.replace("/admin/chats");
    } catch {
      alert("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "100px auto",
        textAlign: "center",
      }}
    >
      <h1>Admin Login</h1>

      <input
        type="password"
        placeholder="Enter Admin password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") void login();
        }}
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "20px",
        }}
      />

      <button
        onClick={() => void login()}
        disabled={loading}
        style={{
          padding: "12px 20px",
          background: "#2e8b57",
          color: "white",
          border: "none",
          cursor: loading ? "wait" : "pointer",
        }}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}
