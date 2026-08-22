"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Play,
  Pause,
  X,
} from "lucide-react";

const language =
  typeof navigator !== "undefined" &&
  navigator.language.startsWith("zh")
    ? "zh"
    : "en";

const t = {
  en: {
    minus10Seconds: "−10 seconds",
    plus10Seconds: "+10 seconds",
  },

  zh: {
    minus10Seconds: "−10秒",
    plus10Seconds: "+10秒",
  },
}[language];

type VideoMessageProps = {
  msg: any;
  currentUser: "member" | "admin";
  formatTime: (date: string) => string;
  onOpen?: () => void;
  onClose?: () => void;
};

export default function VideoMessage({
  msg,
  currentUser,
  formatTime,
  onOpen,
  onClose,
}: VideoMessageProps) {
  const metadataVideoRef =
    useRef<HTMLVideoElement | null>(null);

  const playerVideoRef =
    useRef<HTMLVideoElement | null>(null);

  const [showPlayer, setShowPlayer] =
    useState(false);

  const [playing, setPlaying] =
    useState(false);

  const [duration, setDuration] =
    useState(0);

  const [currentTime, setCurrentTime] =
    useState(0);

  const [mounted, setMounted] =
    useState(false);

  const [skipIndicator, setSkipIndicator] =
    useState<"back" | "forward" | null>(
      null
    );

  const skipTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const thumbnail =
    msg.reply_thumbnail_url ||
    msg.thumbnail_url ||
    "";
    console.log("VIDEO MESSAGE THUMBNAIL DEBUG:", {
  messageId: msg.id,
  fileUrl: msg.file_url,
  reply_thumbnail_url: msg.reply_thumbnail_url,
  thumbnail_url: msg.thumbnail_url,
  finalThumbnail: thumbnail,
});

  /*
   * Make sure portal is only used
   * after the browser has mounted.
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  /*
   * Load video metadata while the
   * message is sitting in the chat.
   *
   * This gives us the real duration
   * without showing the video.
   */
  const handleMetadataLoaded = () => {
    const video =
      metadataVideoRef.current;

    if (!video) return;

    if (
      Number.isFinite(video.duration) &&
      video.duration > 0
    ) {
      setDuration(video.duration);
    }
  };

  /*
   * Format duration
   */
  const formatDuration = (
    seconds: number
  ) => {
    if (
      !Number.isFinite(seconds) ||
      seconds < 0
    ) {
      return "0:00";
    }

    const minutes = Math.floor(
      seconds / 60
    );

    const remainingSeconds =
      Math.floor(seconds % 60);

    return `${minutes}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  /*
   * Open custom player
   */
  const openPlayer = () => {
    setShowPlayer(true);
    setPlaying(false);
    setCurrentTime(0);
  };

  /*
   * Close custom player
   */
  const closePlayer = () => {
    const video =
      playerVideoRef.current;

    if (video) {
      video.pause();
      video.currentTime = 0;
    }

    setPlaying(false);
    setCurrentTime(0);
    setShowPlayer(false);
  };

  /*
   * Play / pause
   */
  const togglePlay = async () => {
    const video =
      playerVideoRef.current;

    if (!video) return;

    try {
      if (video.paused) {
        await video.play();
      } else {
        video.pause();
      }
    } catch (error) {
      console.error(
        "Video playback error:",
        error
      );
    }
  };

  /*
   * Player metadata
   */
  const handlePlayerMetadata = () => {
    const video =
      playerVideoRef.current;

    if (!video) return;

    if (
      Number.isFinite(video.duration) &&
      video.duration > 0
    ) {
      setDuration(video.duration);
    }
  };

  /*
   * Playback progress
   */
  const handleTimeUpdate = () => {
    const video =
      playerVideoRef.current;

    if (!video) return;

    setCurrentTime(
      video.currentTime
    );
  };

  /*
   * Playback ended
   */
  const handleEnded = () => {
    setPlaying(false);
    setCurrentTime(0);

    const video =
      playerVideoRef.current;

    if (video) {
      video.currentTime = 0;
    }
  };

  /*
   * Skip video
   */
  const skipVideo = (
    direction: "back" | "forward"
  ) => {
    const video =
      playerVideoRef.current;

    if (!video) return;

    const amount =
      direction === "forward"
        ? 10
        : -10;

    const nextTime = Math.min(
      Math.max(
        0,
        video.currentTime + amount
      ),
      duration || video.duration || 0
    );

    video.currentTime = nextTime;

    setCurrentTime(nextTime);

    setSkipIndicator(direction);

    if (skipTimeoutRef.current) {
      clearTimeout(
        skipTimeoutRef.current
      );
    }

    skipTimeoutRef.current =
      setTimeout(() => {
        setSkipIndicator(null);
      }, 700);
  };

  /*
   * Prevent the chat page from
   * scrolling behind the player.
   */
  useEffect(() => {
    if (!showPlayer) return;

    const oldOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        oldOverflow;
    };
  }, [showPlayer]);

  /*
   * Keyboard support
   */
  useEffect(() => {
    if (!showPlayer) return;

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        closePlayer();
      }

      if (
        event.key === "ArrowLeft"
      ) {
        skipVideo("back");
      }

      if (
        event.key === "ArrowRight"
      ) {
        skipVideo("forward");
      }

      if (event.key === " ") {
        event.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [showPlayer, duration]);

  /*
   * Cleanup
   */
  useEffect(() => {
    return () => {
      if (skipTimeoutRef.current) {
        clearTimeout(
          skipTimeoutRef.current
        );
      }
    };
  }, []);

  const progress =
    duration > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (currentTime / duration) *
              100
          )
        )
      : 0;

  /*
   * Custom player
   *
   * IMPORTANT:
   * createPortal puts this directly
   * under document.body.
   */
  const player =
    showPlayer && mounted
      ? createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              width: "100vw",
              height: "100dvh",
              background: "#000",
              zIndex: 2147483647,
              overflow: "hidden",
              touchAction: "none",
            }}
          >
            {/* VIDEO */}

            <video
              ref={playerVideoRef}
              src={msg.file_url}
              poster={
                thumbnail || undefined
              }
              playsInline
              preload="auto"
              onLoadedMetadata={
                handlePlayerMetadata
              }
              onTimeUpdate={
                handleTimeUpdate
              }
              onPlay={() =>
                setPlaying(true)
              }
              onPause={() =>
                setPlaying(false)
              }
              onEnded={handleEnded}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
                background: "#000",
              }}
            />

            {/* TOP VIDEO CONTROLS */}

<div
  style={{
    position: "absolute",
    top: "12px",
    left: 0,
    right: 0,
    paddingTop: "env(safe-area-inset-top)",
    paddingLeft: 14,
    paddingRight: 14,
    paddingBottom: 10,
    zIndex: 20,
    background:
      "linear-gradient(rgba(0,0,0,0.65), transparent)",
    display: "flex",
    alignItems: "center",
    gap: 10,
  }}
>
  {/* X BUTTON */}

  <button
    type="button"
    onClick={closePlayer}
    aria-label="Close video"
    style={{
      width: 44,
      height: 44,
      flexShrink: 0,
      borderRadius: "50%",
      border: "1px solid rgba(255,255,255,0.35)",
      background: "rgba(0,0,0,0.35)",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
      cursor: "pointer",
    }}
  >
    <X size={25} strokeWidth={2} />
  </button>

  {/* CURRENT TIME */}

  <span
    style={{
      color: "#fff",
      fontSize: 13,
      fontWeight: 500,
      whiteSpace: "nowrap",
      flexShrink: 0,
    }}
  >
    {formatDuration(currentTime)}
  </span>

  {/* PROGRESS */}

  <div
    style={{
      flex: 1,
      height: 4,
      borderRadius: 4,
      background: "rgba(255,255,255,0.35)",
      overflow: "hidden",
      minWidth: 0,
    }}
  >
    <div
      style={{
        width: `${progress}%`,
        height: "100%",
        borderRadius: 4,
        background: "#fff",
        transition: "width 0.05s linear",
      }}
    />
  </div>

  {/* TOTAL TIME */}

  <span
    style={{
      color: "#fff",
      fontSize: 13,
      fontWeight: 500,
      whiteSpace: "nowrap",
      flexShrink: 0,
    }}
  >
    {formatDuration(duration)}
  </span>
</div>

            {/* LEFT TAP ZONE */}

            <button
              type="button"
              onClick={() =>
                skipVideo("back")
              }
              aria-label="Back 10 seconds"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: "35%",
                border: "none",
                background:
                  "transparent",
                padding: 0,
                zIndex: 10,
              }}
            />

            {/* RIGHT TAP ZONE */}

            <button
              type="button"
              onClick={() =>
                skipVideo("forward")
              }
              aria-label="Forward 10 seconds"
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 0,
                width: "35%",
                border: "none",
                background:
                  "transparent",
                padding: 0,
                zIndex: 10,
              }}
            />

            {/* CENTER PLAY / PAUSE */}

            <button
              type="button"
              onClick={togglePlay}
              aria-label={
                playing
                  ? "Pause"
                  : "Play"
              }
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform:
                  "translate(-50%, -50%)",
                width: 64,
                height: 64,
                borderRadius: "50%",
                border: "none",
                background:
                  "rgba(0,0,0,0.45)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "center",
                padding: 0,
                zIndex: 40,
              }}
            >
              {playing ? (
                <Pause
                  size={28}
                  strokeWidth={2.2}
                />
              ) : (
                <Play
                  size={28}
                  strokeWidth={2.2}
                  fill="#fff"
                  style={{
                    marginLeft: 3,
                  }}
                />
              )}
            </button>

            {/* SKIP INDICATOR */}

            {skipIndicator && (
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform:
                    "translate(-50%, -50%)",
                  padding:
                    "8px 14px",
                  borderRadius: 20,
                  background:
                    "rgba(0,0,0,0.55)",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  zIndex: 60,
                  pointerEvents:
                    "none",
                }}
              >
                {skipIndicator === "back"
                ? t.minus10Seconds
                : t.plus10Seconds}
              </div>
            )}
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {/* Hidden metadata loader */}
      <video
        ref={metadataVideoRef}
        src={msg.file_url}
        preload="metadata"
        muted
        playsInline
        onLoadedMetadata={
          handleMetadataLoaded
        }
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: "none",
        }}
      />

      {/* =========================
          CHAT VIDEO
         ========================= */}

      <div
        onClick={openPlayer}
        style={{
          position: "relative",
          width: "250px",
          height: "320px",
          overflow: "hidden",
          borderRadius: "16px",
          background: "#000",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        {/* Thumbnail */}

        {thumbnail && (
  <img
    src={thumbnail}
    alt="Video"
    draggable={false}
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
      background: "#000",
      pointerEvents: "none",
      WebkitTouchCallout: "none",
      WebkitUserSelect: "none",
      userSelect: "none",
    }}
  />
)}

        {/* Play */}

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              width: 54,
              height: 54,
              borderRadius: "50%",
              background:
                "rgba(255,255,255,0.96)",
              display: "flex",
              alignItems: "center",
              justifyContent:
                "center",
              boxShadow:
                "0 3px 14px rgba(0,0,0,0.35)",
            }}
          >
            <Play
              size={24}
              strokeWidth={2.4}
              fill="#000"
              color="#000"
              style={{
                marginLeft: 3,
              }}
            />
          </span>
        </div>

        {/* REAL VIDEO DURATION */}

        <div
          style={{
            position: "absolute",
            left: 8,
            bottom: 8,
            padding: "3px 7px",
            borderRadius: 12,
            background:
              "rgba(0,0,0,0.55)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 500,
            pointerEvents: "none",
            zIndex: 5,
          }}
        >
          {formatDuration(
            duration
          )}
        </div>

        {/* TIMESTAMP + TICKS */}

        <div
          style={{
            position: "absolute",
            right: 8,
            bottom: 8,
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "3px 7px",
            borderRadius: 12,
            background:
              "rgba(0,0,0,0.55)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 500,
            pointerEvents: "none",
            zIndex: 5,
          }}
        >
          <span>
            {formatTime(
              msg.created_at
            )}
          </span>

          {msg.sender ===
            currentUser && (
            <span
              style={{
                color: msg.is_read
                  ? "#53bdeb"
                  : "#fff",
                fontWeight: 700,
              }}
            >
              {msg.is_read
                ? "✓✓"
                : "✓"}
            </span>
          )}
        </div>
      </div>

      {player}
    </>
  );
}