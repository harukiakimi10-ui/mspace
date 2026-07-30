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
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.95)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          background: "transparent",
          border: "none",
          color: "#fff",
          fontSize: "32px",
          cursor: "pointer",
        }}
      >
        ✕
      </button>

      <img
        src={image}
        alt={name}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "95%",
          maxHeight: "95%",
          objectFit: "contain",
        }}
      />
    </div>
  );
}