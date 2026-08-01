import { Camera, Video, X } from "lucide-react";

type ReplyPreviewProps = {
  replyMessage: any;
  replyPreview: string;
  currentUser: "member" | "admin";
  profileName: string;
  onCancel: () => void;
};

export default function ReplyPreview({
  replyMessage,
  replyPreview,
  currentUser,
  profileName,
  onCancel,
}: ReplyPreviewProps) {
  if (!replyMessage) return null;
  console.log(replyMessage);

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
  Replying to{" "}
{replyMessage.sender === currentUser
  ? "You"
  : profileName}
</div>

        <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "#555",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "260px",
  }}
>
  {replyPreview === "🎥 Video" ? (
    <>
      <Video
        size={16}
        strokeWidth={2.2}
      />
      <span>Video</span>
    </>
  ) : replyPreview === "🖼️ Photo" ? (
    <>
      <Camera
        size={16}
        strokeWidth={2.2}
      />
      <span>Photo</span>
    </>
  ) : (
    <span>{replyPreview}</span>
  )}
</div>
      </div>

      <button
  onClick={onCancel}
  style={{
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    border: "1px solid #e9d5ff",

    background:
      "linear-gradient(135deg,#ffffff,#f5f3ff)",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    cursor: "pointer",

    boxShadow:
      "0 4px 12px rgba(124,58,237,.15)",

    transition: "all .2s ease",
    flexShrink: 0,
  }}
>
  <X
    size={18}
    strokeWidth={2.5}
    color="#7c3aed"
  />
</button>
    </div>
  );
}