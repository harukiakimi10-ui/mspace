import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type MediaItem = {
  id: string;
  message_type: string;
  file_url: string;
  reply_thumbnail_url?: string | null;
  thumbnail_url?: string | null;
  file_name?: string | null;
};

type MediaViewerProps = {
  open: boolean;
  media: MediaItem[];
  initialIndex: number;
  onClose: () => void;
  isDesktop?: boolean;
};

export default function MediaViewer({
  open,
  media,
  initialIndex,
  onClose,
  isDesktop = false,
}: MediaViewerProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [currentIndex, setCurrentIndex] =
    useState(initialIndex);

  useEffect(() => {
    if (!open) return;

    setCurrentIndex(initialIndex);

    const container = scrollRef.current;

    if (!container) return;

    requestAnimationFrame(() => {
      container.scrollTo({
        left:
          initialIndex * container.clientWidth,
        behavior: "auto",
      });
    });
  }, [open, initialIndex]);

  useEffect(() => {
  if (!open) return;

  const container = scrollRef.current;

  if (!container) return;

  let timeout: ReturnType<typeof setTimeout> | null =
    null;

  const pauseInactiveVideos = () => {
    const slides = Array.from(
      container.children
    ) as HTMLElement[];

    if (slides.length === 0) return;

    const width = container.clientWidth;

    if (width <= 0) return;

    const activeIndex = Math.round(
      container.scrollLeft / width
    );

    slides.forEach((slide, index) => {
      if (index === activeIndex) return;

      const video =
        slide.querySelector(
          "video"
        ) as HTMLVideoElement | null;

      if (video) {
        video.pause();
      }
    });
  };

  const handleScroll = () => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(
      pauseInactiveVideos,
      400
    );
  };

  container.addEventListener(
    "scroll",
    handleScroll,
    { passive: true }
  );

  return () => {
    if (timeout) {
      clearTimeout(timeout);
    }

    container.removeEventListener(
      "scroll",
      handleScroll
    );
  };
}, [open, media.length]);

  if (!open || media.length === 0) {
    return null;
  }

  const handleScroll = () => {
    const container = scrollRef.current;

    if (!container) return;

    const width = container.clientWidth;

    if (width <= 0) return;

    const index = Math.round(
      container.scrollLeft / width
    );

    setCurrentIndex(
      Math.max(
        0,
        Math.min(index, media.length - 1)
      )
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        background: "#000",
        zIndex: 99999,
        overflow: "hidden",
      }}
    >
      {/* CLOSE BUTTON */}
      <button
        type="button"
        onPointerDown={(e) => {
  e.preventDefault();
  e.stopPropagation();

  setTimeout(() => {
    onClose();
  }, 150);
}}
        aria-label="Close media viewer"
        style={{
          position: "absolute",
          top:
            "calc(18px + env(safe-area-inset-top))",
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
          cursor: "pointer",
          fontSize: 30,
          lineHeight: 1,
          WebkitTapHighlightColor:
            "transparent",
           touchAction: "none",
           pointerEvents: "auto",
        }}
      >
        ×
      </button>

      {isDesktop && currentIndex > 0 && (
  <button
    type="button"
    onClick={() => {
      const container = scrollRef.current;

      if (!container) return;

      container.scrollTo({
        left: (currentIndex - 1) * container.clientWidth,
        behavior: "smooth",
      });
    }}
    aria-label="Previous media"
    style={{
      position: "absolute",
      left: 24,
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: 20,
      width: 48,
      height: 48,
      borderRadius: "50%",
      border: "none",
      background: "rgba(255,255,255,0.92)",
      color: "#111",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
      cursor: "pointer",
      boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
      WebkitTapHighlightColor: "transparent",
    }}
  >
    <ChevronLeft size={30} strokeWidth={2.4} />
  </button>
)}

{isDesktop && currentIndex < media.length - 1 && (
  <button
    type="button"
    onClick={() => {
      const container = scrollRef.current;

      if (!container) return;

      container.scrollTo({
        left: (currentIndex + 1) * container.clientWidth,
        behavior: "smooth",
      });
    }}
    aria-label="Next media"
    style={{
      position: "absolute",
      right: 24,
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: 20,
      width: 48,
      height: 48,
      borderRadius: "50%",
      border: "none",
      background: "rgba(255,255,255,0.92)",
      color: "#111",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
      cursor: "pointer",
      boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
      WebkitTapHighlightColor: "transparent",
    }}
  >
    <ChevronRight size={30} strokeWidth={2.4} />
  </button>
)}

      {/* MEDIA COUNTER */}
      <div
        style={{
          position: "absolute",
          top:
            "calc(24px + env(safe-area-inset-top))",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
          color: "#fff",
          fontSize: 14,
          fontWeight: 500,
          background: "rgba(0,0,0,0.45)",
          padding: "6px 10px",
          borderRadius: 20,
          pointerEvents: "none",
        }}
      >
        {currentIndex + 1} / {media.length}
      </div>

      {/* MEDIA */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          overflowX: "auto",
          overflowY: "hidden",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-x",
          scrollbarWidth: "none",
        }}
      >
        {media.map((item) => (
          <div
            key={item.id}
            style={{
              flex: "0 0 100%",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              scrollSnapAlign: "center",
              overflow: "hidden",
            }}
          >
            {item.message_type === "video" ? (
  <video
    src={item.file_url}
    controls
    playsInline
    preload="metadata"
    poster={
      item.reply_thumbnail_url ||
      item.thumbnail_url ||
      undefined
    }
    style={{
      maxWidth: "100%",
      maxHeight: "100%",
      width: "100%",
      height: "100%",
      objectFit: "contain",
      display: "block",
      background: "#000",
    }}
  />
) : (
              <img
                src={item.file_url}
                alt={
                  item.file_name || "Photo"
                }
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  WebkitTouchCallout:
                    "none",
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}