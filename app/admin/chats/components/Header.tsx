"use client";

import Link from "next/link";
import {
  MessageCircleMore,
  Settings,
  Eye,
  Download,
} from "lucide-react";

import { useEffect, useState } from "react";
import NotificationButton from "@/app/NotificationButton";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

export default function Header() {
  const [notificationsEnabled, setNotificationsEnabled] =
    useState(false);

  const [isDesktop, setIsDesktop] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [isInstalled, setIsInstalled] =
    useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setNotificationsEnabled(
        Notification.permission === "granted"
      );
    }

    const updateDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    const android = /Android/i.test(navigator.userAgent);

    setIsAndroid(android);

    updateDesktop();

    window.addEventListener("resize", updateDesktop);

    // Check whether MSpace is already running as an installed app.
    const standalone =
      window.matchMedia(
        "(display-mode: standalone)"
      ).matches ||
      (window.navigator as Navigator & {
        standalone?: boolean;
      }).standalone === true;

    setIsInstalled(standalone);

    const handleBeforeInstallPrompt = (
      event: Event
    ) => {
      event.preventDefault();

      setInstallPrompt(
        event as BeforeInstallPromptEvent
      );
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    window.addEventListener(
      "appinstalled",
      handleAppInstalled
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateDesktop
      );

      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );

      window.removeEventListener(
        "appinstalled",
        handleAppInstalled
      );
    };
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) {
      return;
    }

    await installPrompt.prompt();

    const choice = await installPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setIsInstalled(true);
    }

    setInstallPrompt(null);
  };

  const showInstallButton =
    (isDesktop || isAndroid) &&
    !isInstalled &&
    !!installPrompt;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 12px",
        borderBottom: "1px solid #e5e7eb",
        background: "#fff",
        position: "relative",
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
            background:
              "linear-gradient(135deg,#7c3aed,#9333ea)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            boxShadow:
              "0 8px 20px rgba(124,58,237,.30)",
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
    gap: isAndroid ? "4px" : "12px",
  }}
>
  {isDesktop && (
    <div
      style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
      }}
    >
      <NotificationButton isAdmin />
    </div>
  )}

  {showInstallButton && (
    <button
      type="button"
      onClick={handleInstallApp}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px",
        padding: isAndroid ? "6px 8px" : "7px 10px",
        borderRadius: isAndroid ? "9px" : "10px",
        fontSize: isAndroid ? "12px" : "13px",
        fontWeight: 700,
        color: "#fff",
        background:
          "linear-gradient(135deg,#7c3aed,#9333ea)",
        border: "none",
        cursor: "pointer",
        whiteSpace: "nowrap",
        flexShrink: 0,
        boxShadow:
          "0 2px 8px rgba(124,58,237,0.20)",
      }}
    >
      <Download
        size={isAndroid ? 15 : 16}
      />
      <span>Install App</span>
    </button>
  )}

  <button
    onClick={() => {
      window.location.href =
        "/admin/manage/member-view";
    }}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "5px",
      background: "#f5edff",
      color: "#6d28d9",
      border: "1px solid #e9d5ff",
      padding: isAndroid ? "6px 8px" : "7px 10px",
      borderRadius: isAndroid ? "9px" : "10px",
      fontSize: isAndroid ? "12px" : "13px",
      fontWeight: 700,
      cursor: "pointer",
      boxShadow:
        "0 2px 8px rgba(109,40,217,0.06)",
      whiteSpace: "nowrap",
      flexShrink: 0,
    }}
  >
    <Eye size={isAndroid ? 15 : 17} />
    <span>Member View</span>
  </button>

  <Link
    href="/admin/manage"
    style={{
      display: "flex",
      alignItems: "center",
      gap: "5px",
      padding: isAndroid ? "6px 8px" : "7px 10px",
      borderRadius: isAndroid ? "9px" : "10px",
      fontSize: isAndroid ? "12px" : "13px",
      fontWeight: 600,
      color: "#333",
      textDecoration: "none",
      background: "#fafafa",
      border: "1px solid #ececec",
    }}
  >
    <Settings
      size={isAndroid ? 15 : 16}
    />
    Manage
  </Link>
</div>

      <style jsx>{`
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