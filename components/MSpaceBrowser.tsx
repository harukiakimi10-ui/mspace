"use client";

import { useEffect, useRef, useState } from "react";
import {
  RotateCw,
  X,
  ExternalLink,
  Globe,
} from "lucide-react";

type MSpaceBrowserProps = {
  url: string;
  onClose: () => void;
};

export default function MSpaceBrowser({
  url,
  onClose,
}: MSpaceBrowserProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const iframeLoadedRef = useRef(false);

  const [currentUrl, setCurrentUrl] = useState(url);
  const [loading, setLoading] = useState(true);
  const [iframeFailed, setIframeFailed] = useState(false);

  useEffect(() => {
  iframeLoadedRef.current = false;
  setCurrentUrl(url);
  setLoading(true);
  setIframeFailed(false);
}, [url]);

  useEffect(() => {
  setIframeFailed(false);

  const timer = window.setTimeout(() => {
    if (!iframeLoadedRef.current) {
      setIframeFailed(true);
    }
  }, 10000);

  return () => {
    window.clearTimeout(timer);
  };
}, [currentUrl]);

  const handleReload = () => {
    setLoading(true);
    setIframeFailed(false);

    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const handleOpenExternal = () => {
    window.open(currentUrl, "_blank", "noopener,noreferrer");
  };

  const handleIframeLoad = () => {
    iframeLoadedRef.current = true;
    setLoading(false);
    setIframeFailed(false);

    try {
      const iframeDocument =
        iframeRef.current?.contentDocument;

      const title = iframeDocument?.title;

      if (title) {
        document.title = title;
      }
    } catch {
      // Cross-origin websites cannot be inspected.
    }
  };

  const displayUrl = (() => {
    try {
      return new URL(currentUrl).hostname;
    } catch {
      return currentUrl;
    }
  })();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Browser header */}
      <div
        style={{
          flexShrink: 0,
          background: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          paddingTop:
            "env(safe-area-inset-top, 0px)",
        }}
      >
        {/* Navigation controls */}
        <div
          style={{
            height: 52,
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "0 10px",
          }}
        >

          <button
            type="button"
            onClick={handleReload}
            aria-label="Reload"
            style={{
              width: 40,
              height: 40,
              border: "none",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 20,
              cursor: "pointer",
            }}
          >
            <RotateCw
              size={21}
              strokeWidth={2.2}
              style={{
                animation: loading
                  ? "mspaceBrowserSpin 1s linear infinite"
                  : "none",
              }}
            />
          </button>

          <div
  style={{
    flex: 1,
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 8px",
    overflow: "hidden",
  }}
>
  <span
    style={{
      fontSize: 14,
      color: "#4b5563",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    }}
  >
    {displayUrl}
  </span>
</div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close browser"
            style={{
              width: 40,
              height: 40,
              border: "none",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 20,
              cursor: "pointer",
            }}
          >
            <X size={23} strokeWidth={2.2} />
          </button>
        </div>

        {/* Loading bar */}
        {loading && (
          <div
            style={{
              height: 2,
              width: "100%",
              overflow: "hidden",
              background: "#f3f4f6",
            }}
          >
            <div
              style={{
                height: "100%",
                width: "35%",
                background: "#6d28d9",
                animation:
                  "mspaceBrowserLoading 1.1s ease-in-out infinite",
              }}
            />
          </div>
        )}
      </div>

      {/* Website */}
      <div
        style={{
          position: "relative",
          flex: 1,
          minHeight: 0,
          background: "#ffffff",
        }}
      >
        <iframe
          ref={iframeRef}
          src={currentUrl}
          title="MSpace Browser"
          onLoad={handleIframeLoad}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            display: "block",
            background: "#ffffff",
          }}
        />

        {/* Website refused / failed to load */}
        {iframeFailed && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 380,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 58,
                  height: 58,
                  margin: "0 auto 16px",
                  borderRadius: 29,
                  background: "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Globe
                  size={28}
                  strokeWidth={2}
                  color="#6b7280"
                />
              </div>

              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#111827",
                  marginBottom: 8,
                }}
              >
                This website can't be displayed here
              </div>

              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: "#6b7280",
                  marginBottom: 20,
                }}
              >
                The website may not allow itself to be
                displayed inside MSpace.
              </div>

              <button
                type="button"
                onClick={handleOpenExternal}
                style={{
                  border: "none",
                  borderRadius: 10,
                  background: "#6d28d9",
                  color: "#ffffff",
                  padding: "11px 16px",
                  fontSize: 14,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                }}
              >
                <ExternalLink
                  size={17}
                  strokeWidth={2.2}
                />
                Open in browser
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes mspaceBrowserSpin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes mspaceBrowserLoading {
          0% {
            transform: translateX(-120%);
          }

          50% {
            transform: translateX(100%);
          }

          100% {
            transform: translateX(300%);
          }
        }
      `}</style>
    </div>
  );
}