"use client";

import Link from "next/link";
import {
  MessageCircleMore,
  Settings,
  LogOut,
} from "lucide-react";

export default function Header() {
  return (
  <div
    style={{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 12px",
  borderBottom: "1px solid #e5e7eb",
  background: "#fff",
  position: "sticky",
  top: 0,
  zIndex: 1000,
  flexShrink: 0,
}}
  >
    <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "5px",
  }}
>
  <div
    style={{
      width: 32,
      height: 32,
      borderRadius: "50%",
      background: "linear-gradient(135deg,#7c3aed,#9333ea)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      boxShadow: "0 8px 20px rgba(124,58,237,.30)",
    }}
  >
    <MessageCircleMore size={16} />
  </div>

  <h1
    style={{
      margin: 0,
      fontSize: "20px",
      fontWeight: 800,
      background:
        "linear-gradient(135deg,#7c3aed,#a855f7)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    }}
  >
    MSpace
  </h1>
</div>

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <Link
        href="/admin/chats"
        style={{
  display: "flex",
  alignItems: "center",
  gap: "5px",

  padding: "7px 10px",

  borderRadius: "10px",

  fontSize: "13px",
  fontWeight: 600,

  color: "#333",
  textDecoration: "none",

  background: "#fafafa",

  border: "1px solid #ececec",
}}
      >
        <>
  <MessageCircleMore size={16} />
  Chats
</>
      </Link>

      <Link
        href="/admin/manage"
        style={{
  display: "flex",
  alignItems: "center",
  gap: "5px",

  padding: "7px 10px",

  borderRadius: "10px",

  fontSize: "13px",
  fontWeight: 600,

  color: "#333",
  textDecoration: "none",

  background: "#fafafa",

  border: "1px solid #ececec",
}}
      >
        <>
  <Settings size={16} />
  Manage
</>
      </Link>

      <button
        onClick={() => {
          localStorage.removeItem("mspace_admin");
          window.location.replace("/admin/login");
        }}
        style={{
  display: "flex",
  alignItems: "center",
  gap: "8px",

  background: "linear-gradient(135deg,#ef4444,#dc2626)",
  color: "#fff",

  border: "none",

  padding: "8px 12px",

  borderRadius: "12px",

  fontSize: "13px",
  fontWeight: 700,

  cursor: "pointer",

  boxShadow:
    "0 8px 20px rgba(239,68,68,.25)",
}}
      >
        <>
  <LogOut size={16} />
  Logout
</>
      </button>
    </div>
  </div>
);
}