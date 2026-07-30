type ReplyPreviewProps = {
  replyMessage: any;
  replyPreview: string;
  onCancel: () => void;
};

export default function ReplyPreview({
  replyMessage,
  replyPreview,
  onCancel,
}: ReplyPreviewProps) {
  if (!replyMessage) return null;

  return (
    <div
      style={{
        padding: "10px 15px",
        borderLeft: "4px solid #7c3aed",
        background: "#f5f3ff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ overflow: "hidden" }}>
        <div
          style={{
            color: "#7c3aed",
            fontWeight: "bold",
            fontSize: "13px",
          }}
        >
          Replying to
        </div>

        <div
          style={{
            fontSize: "13px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "260px",
          }}
        >
          {replyPreview}
        </div>
      </div>

      <button
        onClick={onCancel}
        style={{
          border: "none",
          background: "transparent",
          fontSize: "18px",
          cursor: "pointer",
        }}
      >
        ✕
      </button>
    </div>
  );
}