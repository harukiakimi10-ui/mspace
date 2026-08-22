"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  SendHorizontal,
  Play,
  Pause,
} from "lucide-react";

type MediaPreviewProps = {
  open: boolean;
  previewFile: File | null;
  previewUrl: string | null;
  onCancel: () => void;
  onSend: () => Promise<void>;
};

export default function MediaPreview({
  open,
  previewFile,
  previewUrl,
  onCancel,
  onSend,
}: MediaPreviewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const thumbnailVideoRef =
    useRef<HTMLVideoElement | null>(null);

  const [videoPlaying, setVideoPlaying] =
    useState(false);

  const [videoThumbnail, setVideoThumbnail] =
    useState<string | null>(null);

  const [videoReady, setVideoReady] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  /*
   * Generate a thumbnail from the selected
   * local video.
   */
  useEffect(() => {
    if (!open) {
      setVideoThumbnail(null);
      setVideoReady(false);
      setVideoPlaying(false);
      return;
    }

    if (
      !previewFile ||
      !previewFile.type.startsWith("video/") ||
      !previewUrl
    ) {
      setVideoThumbnail(null);
      setVideoReady(false);
      setVideoPlaying(false);
      return;
    }

    setVideoThumbnail(null);
    setVideoReady(false);
    setVideoPlaying(false);

    const video =
      document.createElement("video");

    thumbnailVideoRef.current = video;

    video.src = previewUrl;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    let cancelled = false;

    const generateThumbnail = async () => {
      try {
        /*
         * Wait until the video has enough metadata
         * to know its dimensions and duration.
         */
        await new Promise<void>((resolve, reject) => {
          const timeout =
            window.setTimeout(() => {
              reject(
                new Error(
                  "Video metadata timeout"
                )
              );
            }, 5000);

          video.onloadedmetadata = () => {
            clearTimeout(timeout);
            resolve();
          };

          video.onerror = () => {
            clearTimeout(timeout);
            reject(
              new Error(
                "Unable to load selected video"
              )
            );
          };

          video.load();
        });

        if (cancelled) return;

        /*
         * Seek slightly into the video rather than
         * using exactly 0 seconds.
         *
         * This avoids black first frames on many
         * videos/cameras.
         */
        const seekTime =
          video.duration > 0
            ? Math.min(
                0.1,
                Math.max(
                  0,
                  video.duration / 2
                )
              )
            : 0;

        await new Promise<void>((resolve) => {
          let finished = false;

          const finish = () => {
            if (finished) return;

            finished = true;

            video.removeEventListener(
              "seeked",
              finish
            );

            resolve();
          };

          video.addEventListener(
            "seeked",
            finish,
            { once: true }
          );

          try {
            video.currentTime = seekTime;
          } catch {
            finish();
          }

          /*
           * Never allow thumbnail generation
           * to block the preview forever.
           */
          window.setTimeout(
            finish,
            2500
          );
        });

        if (cancelled) return;

        if (
          video.videoWidth <= 0 ||
          video.videoHeight <= 0
        ) {
          throw new Error(
            "Video dimensions are unavailable"
          );
        }

        const canvas =
          document.createElement("canvas");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context =
          canvas.getContext("2d");

        if (!context) {
          throw new Error(
            "Canvas is unavailable"
          );
        }

        context.drawImage(
          video,
          0,
          0,
          canvas.width,
          canvas.height
        );

        const thumbnail =
          canvas.toDataURL(
            "image/jpeg",
            0.88
          );

        if (!cancelled) {
          setVideoThumbnail(
            thumbnail
          );

          setVideoReady(true);
        }
      } catch (error) {
        console.error(
          "Local video thumbnail error:",
          error
        );

        /*
         * We still allow the user to send the
         * video even if thumbnail generation fails.
         */
        if (!cancelled) {
          setVideoReady(true);
        }
      }
    };

    generateThumbnail();

    return () => {
      cancelled = true;

      video.pause();
      video.removeAttribute("src");
      video.load();

      thumbnailVideoRef.current = null;
    };
  }, [
    open,
    previewFile,
    previewUrl,
  ]);

  /*
   * Reset sending state whenever a new preview
   * is opened.
   */
  useEffect(() => {
    if (open) {
      setSending(false);
    }
  }, [open]);

  if (!open) return null;

  const isVideo =
    previewFile?.type.startsWith("video/");

  const toggleVideo = async () => {
    const video =
      videoRef.current;

    if (!video) return;

    try {
      if (video.paused) {
        await video.play();
        setVideoPlaying(true);
      } else {
        video.pause();
        setVideoPlaying(false);
      }
    } catch (error) {
      console.error(
        "Video preview playback error:",
        error
      );
    }
  };

  const handleSend = async () => {
    if (sending) return;

    setSending(true);

    try {
      await onSend();
    } catch (error) {
      console.error(
        "Media send error:",
        error
      );

      setSending(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      {/* MEDIA AREA */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding:
            "30px 20px 100px 20px",
          boxSizing: "border-box",
        }}
      >
        {!isVideo ? (
          /*
           * PHOTO
           */
          <img
            src={previewUrl ?? ""}
            alt="Preview"
            draggable={false}
            style={{
              width: "90%",
              maxWidth: "720px",
              maxHeight: "75vh",
              objectFit: "contain",
              borderRadius: 12,
              display: "block",
              margin: "0 auto",

              WebkitUserSelect:
                "none",
              userSelect: "none",
            }}
          />
        ) : (
          /*
           * VIDEO
           */
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* THUMBNAIL */}
            {videoThumbnail ? (
              <img
                src={videoThumbnail}
                alt="Video preview"
                draggable={false}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                  display: "block",
                  borderRadius: 12,
                  background: "#000",

                  WebkitUserSelect:
                    "none",
                  userSelect:
                    "none",
                }}
              />
            ) : (
              /*
               * Temporary loading state while
               * the first frame is generated.
               */
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color:
                    "rgba(255,255,255,0.65)",
                  fontSize: 14,
                }}
              >
                Preparing video…
              </div>
            )}

            {/* ACTUAL VIDEO */}
            <video
              ref={videoRef}
              src={previewUrl ?? ""}
              playsInline
              preload="metadata"
              onPlay={() => {
                setVideoPlaying(true);
              }}
              onPause={() => {
                setVideoPlaying(false);
              }}
              onEnded={() => {
                setVideoPlaying(false);
              }}
              style={{
                position:
                  "absolute",
                width: "1px",
                height: "1px",
                opacity: 0,
                pointerEvents:
                  "none",
              }}
            />

            {/* PLAY / PAUSE */}
            {videoReady && (
              <button
                type="button"
                onClick={toggleVideo}
                aria-label={
                  videoPlaying
                    ? "Pause video"
                    : "Play video"
                }
                style={{
                  position:
                    "absolute",
                  left: "50%",
                  top: "50%",
                  transform:
                    "translate(-50%, -50%)",

                  width: 62,
                  height: 62,
                  borderRadius: "50%",
                  border: "none",

                  background:
                    "rgba(0,0,0,0.55)",

                  color: "#fff",

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",

                  padding: 0,
                  cursor: "pointer",

                  boxShadow:
                    "0 4px 18px rgba(0,0,0,0.35)",

                  WebkitTapHighlightColor:
                    "transparent",
                }}
              >
                {videoPlaying ? (
                  <Pause
                    size={27}
                    strokeWidth={2.2}
                  />
                ) : (
                  <Play
                    size={29}
                    strokeWidth={2.2}
                    fill="currentColor"
                  />
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* BOTTOM CONTROLS */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,

          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",

          padding:
          "18px 24px calc(55px + env(safe-area-inset-bottom))",

          boxSizing: "border-box",

          background:
            "linear-gradient(to top, rgba(0,0,0,0.78), transparent)",

          zIndex: 20,
        }}
      >
        {/* CANCEL */}
        <button
          type="button"
          onClick={onCancel}
          disabled={sending}
          aria-label="Cancel"
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",

            border:
              "1px solid rgba(255,255,255,0.18)",

            background:
              "rgba(255,255,255,0.10)",

            color: "#fff",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            padding: 0,
            cursor: sending
              ? "default"
              : "pointer",

            opacity: sending
              ? 0.5
              : 1,

            boxShadow:
              "0 4px 12px rgba(0,0,0,0.25)",

            WebkitTapHighlightColor:
              "transparent",
          }}
        >
          <X
            size={21}
            strokeWidth={2}
          />
        </button>

        {/* SEND */}
        <button
          type="button"
          onClick={handleSend}
          disabled={sending}
          aria-label="Send"
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",

            border: "none",

            background: "#7c3aed",

            color: "#fff",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            padding: 0,

            cursor: sending
              ? "default"
              : "pointer",

            opacity: sending
              ? 0.6
              : 1,

            boxShadow:
              "0 4px 14px rgba(124,58,237,0.35)",

            WebkitTapHighlightColor:
              "transparent",
          }}
        >
          <SendHorizontal
            size={21}
            strokeWidth={2.2}
          />
        </button>
      </div>
    </div>
  );
}