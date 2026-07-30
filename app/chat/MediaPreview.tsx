type MediaPreviewProps = {
  open: boolean;
  previewFile: File | null;
  previewUrl: string;
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
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      {previewFile?.type.startsWith("image/") ? (
        <img
          src={previewUrl}
          style={{
            maxWidth: "95%",
            maxHeight: "80%",
            objectFit: "contain",
          }}
        />
      ) : (
        <video
          src={previewUrl}
          controls
          autoPlay
          style={{
            maxWidth: "95%",
            maxHeight: "80%",
          }}
        />
      )}

      <div
        style={{
          display: "flex",
          gap: 20,
          marginTop: 20,
        }}
      >
        <button
          onClick={onCancel}
          style={{
            padding: "12px 30px",
            borderRadius: 30,
            border: "none",
            background: "#666",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>

        <button
          onClick={onSend}
          style={{
            padding: "12px 30px",
            borderRadius: 30,
            border: "none",
            background: "#7c3aed",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}