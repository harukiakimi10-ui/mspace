"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

const language =
  typeof navigator !== "undefined" &&
  navigator.language.startsWith("zh")
    ? "zh"
    : "en";

const t = {
  en: {
    enableNotifications: "Enable Notifications",
    notificationsEnabled:
      "Notifications are enabled successfully.",
  },

  zh: {
    enableNotifications: "启用通知",
    notificationsEnabled:
      "通知已成功启用。",
  },
}[language];

function urlBase64ToUint8Array(base64String: string) {
  const padding =
    "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from(
    [...rawData].map((char) => char.charCodeAt(0))
  );
}

type NotificationButtonProps = {
  isAdmin?: boolean;
};

export default function NotificationButton({
  isAdmin = false,
}: NotificationButtonProps) {

  const isWeChat =
    typeof navigator !== "undefined" &&
    /MicroMessenger/i.test(navigator.userAgent);
  // IMPORTANT:
  // Always start with "default" so server and client
  // render the same HTML.
 const [permission, setPermission] =
  useState<NotificationPermission>("default");

const [mounted, setMounted] = useState(false);

const [saved, setSaved] = useState(false);
const [checking, setChecking] = useState(true);

  useEffect(() => {
  const checkSavedSubscription = async () => {
    setMounted(true);

    if (isWeChat) {
      setChecking(false);
      return;
    }

    setChecking(true);

    try {

      
      if (
        !("Notification" in window) ||
        !("serviceWorker" in navigator)
      ) {
        return;
      }

      setPermission(Notification.permission);

      const memberId =
        localStorage.getItem("mspace_member_id");

      const ADMIN_ID =
        "11111111-1111-1111-1111-111111111111";

      const finalMemberId = isAdmin
        ? ADMIN_ID
        : memberId;

      if (!finalMemberId) {
        return;
      }

      const registration =
        await navigator.serviceWorker.ready;

      const subscription =
        await registration.pushManager.getSubscription();

      // No subscription exists on this device.
      if (!subscription) {
        setSaved(false);
        return;
      }

      const response = await fetch(
        `/api/push/subscribe?memberId=${encodeURIComponent(
          finalMemberId
        )}&endpoint=${encodeURIComponent(
          subscription.endpoint
        )}`
      );

      if (!response.ok) {
        setSaved(false);
        return;
      }

      const data = await response.json();

      setSaved(data.saved === true);

    } catch (error) {
      console.error(
        "MSpace notification subscription check error:",
        error
      );

      setSaved(false);
    } finally {
      setChecking(false);
    }
  };

  checkSavedSubscription();
}, [isWeChat]);

  const enableNotifications = async () => {
    try {
      if (!("Notification" in window)) {
        alert(
          "Notifications are not supported on this device."
        );
        return;
      }

      if (!("serviceWorker" in navigator)) {
        alert(
          "Service Worker is not supported by this browser."
        );
        return;
      }

      const result =
        await Notification.requestPermission();

      setPermission(result);

      if (result !== "granted") {
        alert(
          `Notification permission: ${result}`
        );
        return;
      }

      if (
  window.location.protocol !== "https:" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
) {
  return;
}

      let registration =
  await navigator.serviceWorker.getRegistration("/");

if (!registration) {
  registration =
    await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
}

await registration.update();

if (!registration.active) {
  const worker =
    registration.installing ||
    registration.waiting;

  if (worker) {
    await new Promise<void>((resolve) => {
      if (worker.state === "activated") {
        resolve();
        return;
      }

      worker.addEventListener(
        "statechange",
        () => {
          if (worker.state === "activated") {
            resolve();
          }
        }
      );
    });
  }
}

if (!registration.active) {
  throw new Error(
    "MSpace service worker is not active yet. Please try again."
  );
}

const publicKey =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!publicKey) {
        throw new Error(
          "NEXT_PUBLIC_VAPID_PUBLIC_KEY is missing"
        );
      }

      let subscription =
        await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription =
          await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey:
              urlBase64ToUint8Array(publicKey),
          });
      }

      const memberId =
  localStorage.getItem("mspace_member_id");


const ADMIN_ID =
  "11111111-1111-1111-1111-111111111111";

const finalMemberId = isAdmin
  ? ADMIN_ID
  : memberId;

      if (!finalMemberId) {
        throw new Error(
          "No MSpace member ID found."
        );
      }

      const response = await fetch(
        "/api/push/subscribe",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            memberId: finalMemberId,
            subscription,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "MSpace push subscription response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to save push subscription"
        );
      }

      setSaved(true);

      alert(
  t.notificationsEnabled
);
    } catch (error: any) {
      console.error(
        "MSpace notification setup error:",
        error
      );

      alert(
        `Could not enable notifications.\n\n${
          error?.message || String(error)
        }`
      );
    }
  };

  // Prevent server/client mismatch.
  if (!mounted || isWeChat) {
  return null;
}

 return (
  <>
    {!checking && !saved && (
      <button
        type="button"
        onClick={enableNotifications}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",

          border: "none",

          background:
            "linear-gradient(135deg, #7c3aed, #9333ea)",

          color: "#fff",

          padding: "13px 20px",

          borderRadius: "14px",

          fontSize: "15px",
          fontWeight: 700,

          cursor: "pointer",

          boxShadow:
            "0 8px 24px rgba(124,58,237,.35)",

          animation:
            "notificationPulse 1.8s ease-in-out infinite",

          WebkitTapHighlightColor: "transparent",
        }}
      >
        <Bell
          size={19}
          strokeWidth={2.3}
        />

        <span>{t.enableNotifications}</span>
      </button>
    )}

    <style jsx>{`
      @keyframes notificationPulse {
        0%,
        100% {
          transform: scale(1);
          box-shadow: 0 8px 24px rgba(124, 58, 237, 0.35);
        }

        50% {
          transform: scale(1.04);
          box-shadow: 0 10px 30px rgba(124, 58, 237, 0.55);
        }
      }
    `}</style>
  </>
);
}