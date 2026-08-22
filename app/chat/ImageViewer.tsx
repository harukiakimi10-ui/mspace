type ImageViewerProps = {
  open: boolean;
  image: string;
  name: string;
  onClose: () => void;
};

export default function ImageViewer({
  open,
  image,
  name,
  onClose,
}: ImageViewerProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        overflow: "hidden",
        touchAction: "none",
      }}
    >
      {/* CLOSE BUTTON */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close photo"
        style={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top) + 12px)",
          left: 14,
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.25)",
          background: "rgba(0,0,0,0.5)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          zIndex: 50,
          cursor: "pointer",
        }}
      >
        <span
          style={{
            fontSize: 32,
            fontWeight: 300,
            lineHeight: 1,
          }}
        >
          ×
        </span>
      </button>

      {/* PHOTO */}
      <img
        src={image}
        alt={name}
        draggable={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
          userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTouchCallout: "none",
        }}
      />
    </div>
  );
}