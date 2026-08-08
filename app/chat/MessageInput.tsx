"use client";

import {
  Plus,
  Images,
  Keyboard,
  SendHorizontal,
  Mic,
} from "lucide-react";
import { premiumButton } from "./premiumButton";

type MessageInputProps = {
  message: string;
  messageInputRef: React.RefObject<HTMLTextAreaElement | null>;

  sendMessage: () => void;

  onAttach: () => void;

  uploading: boolean;

  recording: boolean;

  onMicClick: () => void;

  stickerOpen: boolean;

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
  recording,
  onMicClick,

  stickerOpen,
  onToggleQuickEmoji,
  onInput,
  onKeyDown,
}: MessageInputProps) {
  return (
    <div
      style={{
  display: "flex",
  gap: "8px",
  padding: "5px 18px 5px 10px",
  alignItems: "center",
}}
    >
      <button
  onClick={onAttach}
  disabled={uploading}
  style={{
    ...premiumButton,

    width: "40px",
    height: "40px",

    background: "#f3f4f6",
    borderRadius: "50%",

    boxShadow: "none",

    cursor: uploading ? "default" : "pointer",

    padding: 0,
  }}
>
  {uploading ? (
    "..."
  ) : (
    <Plus
  size={26}
  strokeWidth={2.4}
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
        {stickerOpen ? (
  <Keyboard
    size={24}
    strokeWidth={2.2}
    color="#444"
  />
) : (
  <Images
    size={24}
    strokeWidth={2.2}
    color="#444"
  />
)}
      </button>

      <textarea
  ref={messageInputRef}
  value={message}
  onChange={onInput}
  onKeyDown={onKeyDown}
  
  placeholder="Type a message..."
  rows={1}
        style={{
          flex: 1,
          minHeight: "38px",
          maxHeight: "140px",
          padding: "7px 14px",
          borderRadius: "20px",
          border: "1px solid #ccc",
          outline: "none",
          resize: "none",
          overflowY: "auto",
          fontFamily: "inherit",
          fontSize: "14px",
          lineHeight: 1.5,
        }}
      />

      <button
  onMouseDown={(e) => e.preventDefault()}
  onClick={() => {
  if (message.trim()) {
    sendMessage();
  } else {
    onMicClick();
  }
}}
  disabled={uploading}
  style={{
    ...premiumButton,
    width: "38px",
    height: "38px",
    cursor: uploading ? "default" : "pointer",
    opacity: uploading ? 0.6 : 1,
    flexShrink: 0,
  }}
>

  {message.trim() ? (
    <SendHorizontal
      size={17}
      strokeWidth={2.4}
      color="#fff"
    />
  ) : (
    <Mic
      size={18}
      strokeWidth={2.4}
      color="#fff"
    />
  )}
</button>
    </div>
  );
}