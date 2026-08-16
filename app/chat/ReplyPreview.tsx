import { Camera, Video, MapPin, Play, Mic, X } from "lucide-react";


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
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      <div
  style={{
    overflow: "hidden",
    flex: 1,
  }}
>
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
    justifyContent: "space-between",
    gap: 10,
    width: "360px",
  }}
>
  <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 6,
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    flex: 1,
    color: "#555",
    fontSize: 13,
  }}
>
    {replyMessage.message_type === "video" ? (
  <>
    <Video size={17} strokeWidth={2} />
    <span>Video</span>
  </>
) : replyMessage.message_type === "sticker" ? (
  <img
    src={replyMessage.file_url}
    alt=""
    style={{
      width: 48,
      height: 48,
      objectFit: "contain",
      display: "block",
    }}
  />
) : replyMessage.message_type === "image" ? (
  <>
    <Camera
      size={17}
      strokeWidth={2.3}
      color="currentColor"
    />
    <span>Photo</span>
  </>
) : replyMessage.message_type === "voice" ? (
  <>
    <Mic size={17} strokeWidth={2.3} />
    <span>Voice message</span>
    {replyMessage.file_duration != null && (
      <span style={{ marginLeft: "6px" }}>
        {Math.floor(replyMessage.file_duration / 60)}:
        {String(
          Math.floor(replyMessage.file_duration % 60)
        ).padStart(2, "0")}
      </span>
    )}
  </>
) : replyMessage.message_type === "location" ? (
  <>
    <MapPin
  size={17}
  strokeWidth={2.5}
  color="currentColor"
/>
    <span>Location</span>
  </>
) : (
  <span>{replyPreview}</span>
)}
  </div>

  {(replyMessage.message_type === "image" ||
  replyMessage.message_type === "video") && (
    <div
      style={{
        position: "relative",
        width: 42,
        height: 42,
        borderRadius: 8,
        overflow: "hidden",
        flexShrink: 0,
        marginLeft: 8,
      }}
    >
      <img
        src={
          replyMessage.message_type === "video"
            ? (
                replyMessage.reply_thumbnail_url ??
                replyMessage.thumbnail_url ??
                replyMessage.file_url
              )
            : replyMessage.file_url
        }
        alt=""
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      {replyMessage.message_type === "video" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Play
            size={13}
            fill="#fff"
            color="#fff"
          />
        </div>
      )}
    </div>
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