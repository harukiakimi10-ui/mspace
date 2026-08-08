import { X, SendHorizontal } from "lucide-react";

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
  src={previewUrl ?? ""}
  style={{
    width: "90%",
    maxWidth: "720px",
    maxHeight: "75vh",
    objectFit: "contain",
    borderRadius: 12,
    display: "block",
    margin: "0 auto",
  }}
/>
      ) : (
        <video
          src={previewUrl ?? ""}
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
  width: "100%",
  boxSizing: "border-box",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 40px",
  marginTop: 20,
}}
      >
        <button
  onClick={onCancel}
  aria-label="Cancel"
  style={{
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.10)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
  }}
>
  <X size={20} strokeWidth={2} />
</button>

        <button
  onClick={onSend}
  aria-label="Send"
  style={{
    width: 42,
    height: 42,
    borderRadius: "50%",
    border: "none",
    background: "#7c3aed",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(124, 58, 237, 0.25)",
  }}
>
  <SendHorizontal size={20} strokeWidth={2.2} />
</button>
      </div>
    </div>
  );
}