"use client";

import Link from "next/link";

export default function Header() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px",
        borderBottom: "1px solid #ddd",
        background: "#ffffff",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: "28px",
          color: "#7c3aed",
        }}
      >
        💬 MSpace Chats
      </h1>

      <div
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "center",
        }}
      >
        <Link
          href="/admin/chats"
          style={{
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          💬 Chats
        </Link>

        <Link
          href="/admin/manage"
          style={{
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          ⚙️ Manage
        </Link>

        <button
          onClick={() => {
            localStorage.removeItem("mspace_admin");
            window.location.href = "/admin";
          }}
          style={{
            background: "#dc3545",
            color: "#fff",
            border: "none",
            padding: "10px 18px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}