"use client";

type QuickEmojiBarProps = {
  quickEmojis: string[];
  onEmojiClick: (emoji: string) => void;
};

export default function QuickEmojiBar({
  quickEmojis,
  onEmojiClick,
}: QuickEmojiBarProps) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "nowrap",
        alignItems: "center",
        gap: "12px",
        overflowX: "auto",
        overflowY: "hidden",
        padding: "12px 15px",
        background: "#f8f5ff",
        borderTop: "1px solid #e5d8ff",
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
      }}
      className="emoji-bar"
    >
      {quickEmojis.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onEmojiClick(emoji)}
          style={{
            border: "none",
            background: "transparent",
            fontSize: "30px",
            cursor: "pointer",
            flexShrink: 0,
            width: "44px",
            height: "44px",
          }}
        >
          {emoji === "➕" ? (
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg,#7c3aed,#6d28d9)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: 700,
                boxShadow:
                  "0 4px 12px rgba(109,40,217,.35)",
              }}
            >
              +
            </div>
          ) : (
            emoji
          )}
        </button>
      ))}
    </div>
  );
}