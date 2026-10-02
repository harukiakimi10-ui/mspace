"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
  }>;
};

export default function InstallAppButton() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const checkInstalled = () => {
      const standalone =
        window.matchMedia(
          "(display-mode: standalone)"
        ).matches;

      const iosStandalone =
        "standalone" in navigator &&
        (navigator as Navigator & {
          standalone?: boolean;
        }).standalone === true;

      setIsInstalled(standalone || iosStandalone);
    };

    checkInstalled();

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
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );

      window.removeEventListener(
        "appinstalled",
        handleAppInstalled
      );
    };
  }, []);

  if (isInstalled || !installPrompt) {
    return null;
  }

  const handleInstall = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();

    const result = await installPrompt.userChoice;

    if (result.outcome === "accepted") {
      setIsInstalled(true);
    }

    setInstallPrompt(null);
  };

  return (
    <button
      onClick={handleInstall}
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
        boxShadow:
          "0 2px 8px rgba(109,40,217,0.06)",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      <Download size={16} />
      <span>Install App</span>
    </button>
  );
}