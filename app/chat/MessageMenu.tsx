import {
  Reply,
  Copy,
  Download,
  Trash2,
  Trash,
  Forward,
  Pin,
} from "lucide-react";

const language =
  typeof navigator !== "undefined" &&
  navigator.language.startsWith("zh")
    ? "zh"
    : "en";

const t = {
  en: {
  reply: "Reply",
  copy: "Copy",
  save: "Save",
  deleteForMe: "Delete for me",
  deleteForEveryone: "Delete for everyone",
  forward: "Forward",
  pin: "Pin",
  unpin: "Unpin",
},

  zh: {
  reply: "回复",
  copy: "复制",
  save: "保存",
  deleteForMe: "删除此消息",
  deleteForEveryone: "删除所有人",
  forward: "转发",
  pin: "置顶",
  unpin: "取消置顶",
},
}[language];

type MessageMenuProps = {
  open: boolean;
  x: number;
  y: number;
  selectedMessage: any;
  currentUser: "member" | "admin";
  onClose: () => void;
  onReply: () => void;
  onCopy: () => void;
  onForward?: () => void;
  onPin?: () => void;
  isPinned?: boolean;
  onSave: () => void;
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
  onForward,
  onPin,
  isPinned,
  onSave,
  onDeleteForMe,
  onDeleteForEveryone,
}: MessageMenuProps) {
  if (!open || !selectedMessage) return null;

  // Message type
  const messageType = selectedMessage?.message_type;

  const isText = messageType === "text";

  const hasLink =
  isText &&
  /(?:https?:\/\/|www\.|(?:[a-z0-9-]+\.)+[a-z]{2,})(?:[/?#][^\s]*)?/i.test(
    selectedMessage?.content || ""
  );

  const isLocation = messageType === "location";

  const isSaveable =
    messageType === "image" ||
    messageType === "video";

  const isSticker = messageType === "sticker";

  const isMine =
    selectedMessage?.sender === currentUser;

  /*
    FINAL MENU RULES

    Text:
      Reply
      Copy
      Delete for me
      Delete for everyone if mine

    Image / Video:
      Reply
      Save
      Delete for me
      Delete for everyone if mine

    Voice:
      Reply
      Delete for me
      Delete for everyone if mine

    Sticker:
      Reply
      Delete for me
      Delete for everyone if mine
  */

  const itemCount =
  2 +
  (isText ? 1 : 0) +
  (isSaveable ? 1 : 0) +
  (isLocation ? 1 : 0) +
  (currentUser === "admin" && hasLink && onPin ? 1 : 0) +
  (isMine ? 1 : 0);

  const menuWidth = 190;
  const menuHeight = itemCount * 56 + 16;

  const padding = 12;

  const safeX = Math.min(
    Math.max(x, padding),
    window.innerWidth - menuWidth - padding
  );

  const safeY = y;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",

        background: "transparent",
        zIndex: 4000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: safeY,
          left: safeX,

          zIndex: 7000,

          width: 190,

          background:
            "linear-gradient(180deg,#ffffff,#faf5ff)",

          border: "1px solid #ede9fe",

          borderRadius: "18px",

          boxShadow:
            "0 18px 45px rgba(124,58,237,.18)",

          backdropFilter: "blur(16px)",

          padding: "8px",

          overflow: "hidden",
        }}
      >

        {/* REPLY */}
        <div
          onClick={() => {
            onReply();
            onClose();
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f5f3ff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "13px 14px",
            borderRadius: "12px",
            cursor: "pointer",
            transition: "0.2s",
            fontWeight: 400,
            fontSize: "14px",
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "#f5f3ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Reply size={15} color="#7c3aed" />
          </div>

          {t.reply}
        </div>


        {/* COPY — TEXT ONLY */}
        {isText && (
          <div
            onClick={() => {
              onCopy();
              onClose();
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f5f3ff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "13px 14px",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "0.2s",
              fontWeight: 400,
              fontSize: "14px",
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "#f8f8f8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Copy size={15} color="#555" />
            </div>

            {t.copy}
          </div>
        )}

        {/* PIN — ADMIN ONLY, LINK TEXT ONLY */}
{currentUser === "admin" && hasLink && onPin && (
  <div
    onClick={() => {
      onPin();
      onClose();
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "#f5f3ff";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "transparent";
    }}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "13px 14px",
      borderRadius: "12px",
      cursor: "pointer",
      transition: "0.2s",
      fontWeight: 400,
      fontSize: "14px",
    }}
  >
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: "50%",
        background: "#f8f8f8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Pin size={15} color="#555" />
    </div>

    {isPinned ? t.unpin : t.pin}
  </div>
)}


        {/* SAVE — PHOTO / VIDEO ONLY */}
        {isSaveable && (
          <div
            onClick={() => {
              onSave();
              onClose();
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f5f3ff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "13px 14px",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "0.2s",
              fontWeight: 400,
              fontSize: "14px",
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "#f8f8f8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Download size={15} color="#555" />
            </div>

            {t.save}
          </div>
        )}

        {/* FORWARD — LOCATION ONLY */}
{isLocation && currentUser === "admin" && onForward && (
  <div
    onClick={() => {
      onForward();
      onClose();
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "#f5f3ff";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "transparent";
    }}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "13px 14px",
      borderRadius: "12px",
      cursor: "pointer",
      transition: "0.2s",
      fontWeight: 400,
      fontSize: "14px",
    }}
  >
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: "50%",
        background: "#f8f8f8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Forward size={15} color="#555" />
    </div>

    {t.forward}
  </div>
)}


        {/* DELETE FOR ME — EVERY MESSAGE TYPE */}
        <div
          onClick={() => {
            onDeleteForMe();
            onClose();
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f5f3ff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "13px 14px",
            borderRadius: "12px",
            cursor: "pointer",
            transition: "0.2s",
            fontWeight: 400,
            fontSize: "14px",
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "#f8f8f8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Trash2 size={15} color="#666" />
          </div>

          {t.deleteForMe}
        </div>


        {/* DELETE FOR EVERYONE — ONLY YOUR MESSAGE */}
        {isMine && (
          <div
            onClick={() => {
              onDeleteForEveryone();
              onClose();
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#fef2f2";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "13px 14px",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "0.2s",
              color: "#ef4444",
              fontWeight: 500,
              fontSize: "14px",
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "#fef2f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Trash size={15} color="#ef4444" />
            </div>

            {t.deleteForEveryone}
          </div>
        )}

      </div>
    </div>
  );
}