"use client";

import Link from "next/link";
import {
  MessageCircleMore,
  Settings,
  Eye,
  Bell,
} from "lucide-react";

import { useEffect, useState } from "react";
export default function Header() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
  if ("Notification" in window) {
    setNotificationsEnabled(
      Notification.permission === "granted"
    );
  }

  const updateDesktop = () => {
    setIsDesktop(window.innerWidth >= 768);
  };

  updateDesktop();

  window.addEventListener("resize", updateDesktop);

  return () => {
    window.removeEventListener("resize", updateDesktop);
  };
}, []);

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
   
   {isDesktop && !notificationsEnabled && (
  <button
    type="button"
    onClick={async () => {
      if (!("Notification" in window)) {
        return;
      }

      const permission =
        await Notification.requestPermission();

      if (permission === "granted") {
        setNotificationsEnabled(true);
      }
    }}
    style={{
  height: 40,
  padding: "0 20px",
  border: "none",
  borderRadius: 10,
  background: "linear-gradient(135deg,#7c3aed,#a855f7)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 9,
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 8px 18px rgba(124,58,237,.25)",
  whiteSpace: "nowrap",

  animation: "notificationPulse 1.8s ease-in-out infinite",
}}
  >
    <Bell
      size={19}
      strokeWidth={2.2}
    />

    Enable Notifications
  </button>
)}

    </div>

    <style>{`
  @keyframes notificationPulse {
    0%,
    100% {
      transform: scale(1);
    }

    50% {
      transform: scale(0.94);
    }
  }
`}</style>
  </div>
 
);
}