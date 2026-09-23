"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  SendHorizontal,
  Play,
  Pause,
  Trash2,
} from "lucide-react";

type MediaPreviewProps = {
  open: boolean;
  previewFile: File | null;
  previewUrl: string | null;

  previewFiles?: File[];
  previewUrls?: string[];

  onCancel: () => void;
  onSend: () => Promise<void>;
  onDelete?: (index: number) => void;
};

export default function MediaPreview({
  open,
  previewFile,
  previewUrl,
  previewFiles,
  previewUrls,
  onCancel,
  onSend,
  onDelete,
}: MediaPreviewProps) {

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const thumbnailVideoRef =
    useRef<HTMLVideoElement | null>(null);

  const [videoPlaying, setVideoPlaying] =
    useState(false);

  const [videoThumbnail, setVideoThumbnail] =
    useState<string | null>(null);

    const [videoThumbnails, setVideoThumbnails] =
  useState<Record<number, string>>({});

  const [videoReady, setVideoReady] =
    useState(false);

  const [sending, setSending] =
    useState(false);

    const [viewerOpen, setViewerOpen] =
  useState(false);

const [viewerIndex, setViewerIndex] =
  useState(0);

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

  useEffect(() => {
  if (!open) {
    setVideoThumbnails({});
    return;
  }

  const files =
    previewFiles && previewFiles.length > 0
      ? previewFiles
      : previewFile
        ? [previewFile]
        : [];

  const urls =
    previewUrls && previewUrls.length > 0
      ? previewUrls
      : previewUrl
        ? [previewUrl]
        : [];

  let cancelled = false;

  const generateThumbnail = (
    url: string,
    index: number
  ) => {
    return new Promise<void>((resolve) => {
      const video =
        document.createElement("video");

      video.src = url;
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";

      const cleanup = () => {
        video.pause();
        video.removeAttribute("src");
        video.load();
      };

      video.onloadedmetadata = () => {
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

        video.currentTime = seekTime;
      };

      video.onseeked = () => {
        if (cancelled) {
          cleanup();
          resolve();
          return;
        }

        if (
          video.videoWidth <= 0 ||
          video.videoHeight <= 0
        ) {
          cleanup();
          resolve();
          return;
        }

        const canvas =
          document.createElement("canvas");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context =
          canvas.getContext("2d");

        if (!context) {
          cleanup();
          resolve();
          return;
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

        setVideoThumbnails((prev) => ({
          ...prev,
          [index]: thumbnail,
        }));

        cleanup();
        resolve();
      };

      video.onerror = () => {
        cleanup();
        resolve();
      };

      video.load();
    });
  };

  const generateAll = async () => {
    setVideoThumbnails({});

    for (
      let index = 0;
      index < files.length;
      index++
    ) {
      if (cancelled) return;

      if (
        files[index].type.startsWith("video/") &&
        urls[index]
      ) {
        await generateThumbnail(
          urls[index],
          index
        );
      }
    }
  };

  generateAll();

  return () => {
    cancelled = true;
  };
}, [
  open,
  previewFiles,
  previewUrls,
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

  const openViewer = (index: number) => {
  setViewerIndex(index);
  setViewerOpen(true);
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
    padding: "30px 20px 100px 20px",
    boxSizing: "border-box",
  }}
>
  {(() => {
    const files =
      previewFiles && previewFiles.length > 0
        ? previewFiles
        : previewFile
          ? [previewFile]
          : [];

    const urls =
      previewUrls && previewUrls.length > 0
        ? previewUrls
        : previewUrl
          ? [previewUrl]
          : [];

    if (files.length === 0) {
      return null;
    }

    const visibleCount =
      files.length >= 5 ? 4 : files.length;

    const extraCount =
      files.length > 4
        ? files.length - 4
        : 0;

    const renderMedia = (
      file: File,
      url: string,
      index: number
    ) => {
      const isVideo =
        file.type.startsWith("video/");

      return (
        <div
  key={`${file.name}-${index}`}
  onClick={() => openViewer(index)}
  style={{
            position: "relative",
            overflow: "hidden",
            width: "100%",
            height: "100%",
            background: "#111",
            borderRadius: 10,
            cursor: "pointer",
          }}
        >
          {isVideo ? (
  videoThumbnails[index] ? (
    <img
      src={videoThumbnails[index]}
      alt={`Video preview ${index + 1}`}
      draggable={false}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
      }}
    />
  ) : (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#111",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    />
  )
) : (
  <img
    src={url}
    alt={`Preview ${index + 1}`}
    draggable={false}
    style={{
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
    }}
  />
)}

          {extraCount > 0 &&
            index === visibleCount - 1 && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "rgba(0,0,0,0.45)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 32,
                  fontWeight: 600,
                }}
              >
                +{extraCount}
              </div>
            )}
        </div>
      );
    };

    const visibleFiles =
      files.slice(0, visibleCount);

    const visibleUrls =
      urls.slice(0, visibleCount);

    /*
     * 1 MEDIA
     */
    if (visibleCount === 1) {
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {renderMedia(
            visibleFiles[0],
            visibleUrls[0],
            0
          )}
        </div>
      );
    }

    /*
     * 2 MEDIA
     */
    if (visibleCount === 2) {
      return (
        <div
          style={{
            width: "100%",
            maxWidth: 720,
            height: "75vh",
            display: "grid",
            gridTemplateColumns:
              "1fr 1fr",
            gap: 4,
          }}
        >
          {visibleFiles.map(
            (file, index) =>
              renderMedia(
                file,
                visibleUrls[index],
                index
              )
          )}
        </div>
      );
    }

    /*
     * 3 MEDIA
     *
     * Large media on the left.
     * Two smaller media stacked
     * vertically on the right.
     */
    if (visibleCount === 3) {
      return (
        <div
          style={{
            width: "100%",
            maxWidth: 720,
            height: "75vh",
            display: "grid",
            gridTemplateColumns:
  "1fr 1fr",
            gridTemplateRows:
              "1fr 1fr",
            gap: 4,
          }}
        >
          <div
            style={{
              gridRow: "1 / span 2",
              minWidth: 0,
              minHeight: 0,
            }}
          >
            {renderMedia(
              visibleFiles[0],
              visibleUrls[0],
              0
            )}
          </div>

          <div
            style={{
              minWidth: 0,
              minHeight: 0,
            }}
          >
            {renderMedia(
              visibleFiles[1],
              visibleUrls[1],
              1
            )}
          </div>

          <div
            style={{
              minWidth: 0,
              minHeight: 0,
            }}
          >
            {renderMedia(
              visibleFiles[2],
              visibleUrls[2],
              2
            )}
          </div>
        </div>
      );
    }

    /*
     * 4+ MEDIA
     *
     * Four visible tiles in a 2x2
     * arrangement.
     */
    return (
      <div
        style={{
          width: "100%",
          maxWidth: 720,
          height: "75vh",
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr",
          gridTemplateRows:
            "1fr 1fr",
          gap: 4,
        }}
      >
        {visibleFiles.map(
          (file, index) =>
            renderMedia(
              file,
              visibleUrls[index],
              index
            )
        )}
      </div>
    );
  })()}
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
  "18px 24px calc(40px + env(safe-area-inset-bottom))",

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
      {/* FULL-SCREEN MEDIA VIEWER */}
{viewerOpen && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "#000",
      zIndex: 10000,
      display: "flex",
      flexDirection: "column",
    }}
  >
    {/* CLOSE VIEWER */}
    <button
      type="button"
      onClick={() => setViewerOpen(false)}
      aria-label="Close viewer"
      style={{
        position: "absolute",
        top: "calc(18px + env(safe-area-inset-top))",
        right: 18,
        zIndex: 20,
        width: 44,
        height: 44,
        borderRadius: "50%",
        border: "none",
        background: "#fff",
        color: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
      }}
    >
      <X size={22} />
    </button>

    {/* DELETE MEDIA */}
<button
  type="button"
  onClick={() => {
    if (!onDelete) return;

    onDelete(viewerIndex);

    const total =
      previewFiles?.length ??
      (previewFile ? 1 : 0);

    if (total <= 1) {
      setViewerOpen(false);
    } else if (viewerIndex >= total - 1) {
      setViewerIndex(total - 2);
    }
  }}
  aria-label="Delete media"
  style={{
    position: "absolute",
    top:
      "calc(18px + env(safe-area-inset-top))",
    left: 18,
    zIndex: 20,

    width: 44,
    height: 44,
    borderRadius: "50%",

    border: "none",
    background: "#fff",
    color: "#000",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    padding: 0,
    cursor: "pointer",

    WebkitTapHighlightColor:
      "transparent",
  }}
>
  <Trash2
    size={21}
    strokeWidth={2.2}
  />
</button>

    {/* HORIZONTAL MEDIA */}
    <div
      style={{
        width: "100%",
        height: "100%",
        overflowX: "auto",
        overflowY: "hidden",
        display: "flex",
        scrollSnapType: "x mandatory",
        WebkitOverflowScrolling:
          "touch",
      }}
      onScroll={(e) => {
        const element = e.currentTarget;

        const index = Math.round(
          element.scrollLeft /
            element.clientWidth
        );

        if (
          index >= 0 &&
          index <
            (previewFiles?.length || 0)
        ) {
          setViewerIndex(index);
        }
      }}
    >
      {(previewFiles?.length
        ? previewFiles
        : previewFile
          ? [previewFile]
          : []
      ).map((file, index) => {
        const url =
          previewUrls?.[index] ??
          (index === 0
            ? previewUrl
            : null);

        if (!url) return null;

        const isVideo =
          file.type.startsWith("video/");

        return (
          <div
            key={`${file.name}-viewer-${index}`}
            style={{
              flex: "0 0 100%",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              scrollSnapAlign: "center",
              padding: "30px 16px",
              boxSizing: "border-box",
            }}
          >
            {isVideo ? (
              <video
                src={url}
                controls
                playsInline
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            ) : (
              <img
                src={url}
                alt={`Media ${index + 1}`}
                draggable={false}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  userSelect: "none",
                  WebkitUserSelect:
                    "none",
                }}
              />
            )}
          </div>
        );
      })}
    </div>

    {/* MEDIA COUNTER */}
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom:
          "calc(24px + env(safe-area-inset-bottom))",
        transform:
          "translateX(-50%)",
        color: "#fff",
        background:
          "rgba(0,0,0,0.55)",
        padding: "6px 12px",
        borderRadius: 20,
        fontSize: 14,
      }}
    >
      {viewerIndex + 1} /{" "}
      {previewFiles?.length ||
        (previewFile ? 1 : 0)}
    </div>
  </div>
)}
    </div>
  );
}