"use client";

import Link from "next/link";
import {
  MessageCircleMore,
  Settings,
  Eye,
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
  <button
    onClick={() => {
      window.location.href = "/admin/manage/member-view";
    }}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "5px",
      background: "#f5edff",
      color: "#6d28d9",
      border: "1px solid #e9d5ff",
      padding: "7px 10px",
       borderRadius: "10px",
      fontSize: "13px",
      fontWeight: 700,
      cursor: "pointer",
      boxShadow: "0 2px 8px rgba(109,40,217,0.06)",
      whiteSpace: "nowrap",
      flexShrink: 0,
    }}
  >
    <Eye size={17} />
    <span>Member View</span>
  </button>

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
    </div>
  </div>
);
}