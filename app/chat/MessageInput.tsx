"use client";

import { Paperclip, Smile, SendHorizontal } from "lucide-react";
import { premiumButton } from "./premiumButton";

type MessageInputProps = {
  message: string;
  messageInputRef: React.RefObject<HTMLTextAreaElement | null>;

  sendMessage: () => void;

  onAttach: () => void;

  uploading: boolean;

  onToggleQuickEmoji: () => void;

  onInput: (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;

  onKeyDown: (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => void;
};

export default function MessageInput({
  message,
  messageInputRef,
  sendMessage,
  onAttach,
  uploading,
  onToggleQuickEmoji,
  onInput,
  onKeyDown,
}: MessageInputProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        padding: "8px 12px",
        alignItems: "center",
      }}
    >
      <button
  onClick={onAttach}
  disabled={uploading}
  style={{
    ...premiumButton,

    width: "38px",
    height: "38px",

    background: "transparent",

    boxShadow: "none",

    cursor: uploading ? "default" : "pointer",

    padding: 0,
  }}
>
  {uploading ? (
    "..."
  ) : (
    <Paperclip
      size={22}
      strokeWidth={2}
      color="#444"
    />
  )}
</button>

      <button
        onClick={onToggleQuickEmoji}
        style={{
          width: "44px",
          height: "44px",
          background: "transparent",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <Smile
          size={22}
          strokeWidth={2}
          color="#444"
        />
      </button>

      <textarea
  ref={messageInputRef}
  value={message}
  onChange={onInput}
  onKeyDown={onKeyDown}
  onBlur={(e) => {
    // If the user tapped Send, keep the focus so the
    // keyboard stays open.
    requestAnimationFrame(() => {
      if (document.activeElement !== e.target) {
        messageInputRef.current?.focus();
      }
    });
  }}
  placeholder="Type a message..."
  rows={1}
        style={{
          flex: 1,
          minHeight: "42px",
          maxHeight: "140px",
          padding: "9px 16px",
          borderRadius: "24px",
          border: "1px solid #ccc",
          outline: "none",
          resize: "none",
          overflowY: "auto",
          fontFamily: "inherit",
          fontSize: "15px",
          lineHeight: 1.5,
        }}
      />

      <button
  onMouseDown={(e) => e.preventDefault()}
  onClick={sendMessage}
        disabled={uploading}
        style={{
  ...premiumButton,

  width: "44px",
  height: "44px",

  cursor: uploading ? "default" : "pointer",

  opacity: uploading ? 0.6 : 1,

  flexShrink: 0,
}}
      >
        <SendHorizontal
          size={18}
          strokeWidth={2.4}
          color="#fff"
        />
      </button>
    </div>
  );
}