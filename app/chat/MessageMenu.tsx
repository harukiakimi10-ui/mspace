type MessageMenuProps = {
  open: boolean;
  x: number;
  y: number;
  selectedMessage: any;
  currentUser: "member" | "admin";
  onClose: () => void;
  onReply: () => void;
  onCopy: () => void;
  onDeleteForMe: () => void;
  onDeleteForEveryone: () => void;
};

export default function MessageMenu({
  open,
  x,
  y,
  selectedMessage,
  currentUser,
  onClose,
  onReply,
  onCopy,
  onDeleteForMe,
  onDeleteForEveryone,
}: MessageMenuProps) {

  if (!open || !selectedMessage) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.15)",
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: y,
          left: x,
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0,0,0,.2)",
          minWidth: "220px",
          overflow: "hidden",
        }}
      >
        <div
          onClick={onReply}
          style={{
            padding: "14px 18px",
            cursor: "pointer",
          }}
        >
          ↩ Reply
        </div>

        <div
  onClick={onCopy}
  style={{
    padding: "14px 18px",
    cursor: "pointer",
  }}
>
  📋 Copy
</div>

        <div
  onClick={onDeleteForMe}
  style={{
    padding: "14px 18px",
    cursor: "pointer",
  }}
>
  🗑 Delete for me
</div>

       {selectedMessage?.sender === currentUser && (
  <div
    onClick={onDeleteForEveryone}
    style={{
      padding: "14px 18px",
      color: "#d32f2f",
      cursor: "pointer",
    }}
  >
    ❌ Delete for everyone
  </div>
)}
      </div>
    </div>
  );
}