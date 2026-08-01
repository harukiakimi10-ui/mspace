"use client";

import { useState, useEffect } from "react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (localStorage.getItem("mspace_admin") === "true") {
      window.location.replace("/admin/chats");
    }
  }, []);

  function login() {
    if (password === "MSPACE2026") {
      localStorage.setItem("mspace_admin", "true");
      window.location.replace("/admin/chats");
    } else {
      alert("Wrong password");
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
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "20px",
        }}
      />

      <button
        onClick={login}
        style={{
          padding: "12px 20px",
          background: "#2e8b57",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Login
      </button>
    </div>
  );
}