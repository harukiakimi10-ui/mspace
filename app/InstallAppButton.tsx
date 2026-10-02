"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

export default function InstallAppButton() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();

      setInstallPrompt(
        event as BeforeInstallPromptEvent
      );
    };

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

      setIsInstalled(
        standalone || iosStandalone
      );
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    window.addEventListener(
      "appinstalled",
      () => {
        setInstallPrompt(null);
        setIsInstalled(true);
      }
    );

    checkInstalled();

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const installApp = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();

    const choice =
      await installPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setInstallPrompt(null);
    }
  };

  if (isInstalled || !installPrompt) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={installApp}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px",

        padding: "7px 10px",

        borderRadius: "10px",

        fontSize: "13px",
        fontWeight: 700,

        color: "#6d28d9",

        background: "#f5edff",

        border: "1px solid #e9d5ff",

        cursor: "pointer",

        whiteSpace: "nowrap",
        flexShrink: 0,

        boxShadow:
          "0 2px 8px rgba(109,40,217,0.06)",
      }}
    >
      <Download size={16} />
      <span>Install App</span>
    </button>
  );
}