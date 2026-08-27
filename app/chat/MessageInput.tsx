"use client";

import {
  Plus,
  Smile,
  Keyboard,
  SendHorizontal,
  Mic,
} from "lucide-react";
import { premiumButton } from "./premiumButton";
import { useLayoutEffect } from "react";


type MessageInputProps = {
  message: string;
  messageInputRef: React.RefObject<HTMLTextAreaElement | null>;

  placeholder: string;

  sendMessage: () => void;

  onAttach: () => void;

  uploading: boolean;

  recording: boolean;

  onMicClick: () => void;

  stickerOpen: boolean;

  onToggleQuickEmoji: () => void;

  onFocusInput: () => void;

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
  placeholder,
  sendMessage,
  onAttach,
  uploading,
  recording,
  onMicClick,

  stickerOpen,
  onToggleQuickEmoji,
  onFocusInput,
  onInput,
  onKeyDown,
}: MessageInputProps) {

  useLayoutEffect(() => {
    if (message !== "") return;

    const input = messageInputRef.current;

    if (!input) return;

    input.scrollLeft = 0;
    input.scrollTop = 0;

    try {
      input.setSelectionRange(0, 0);
    } catch {}
  }, [message, messageInputRef]);

  return (
  <div
    style={{
      display: "flex",
      gap: "8px",
      padding: "0 18px 14px 10px",
      alignItems: "center",
    }}
  >
      <button
  onClick={onAttach}
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
  <Plus
  size={26}
  strokeWidth={2.4}
  color="#444"
/>
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
  <Smile
  size={26}
  strokeWidth={2.2}
  color="#444"
/>
)}
      </button>

      <textarea
  ref={messageInputRef}
  id="mspace-message-input"
  value={message}
  onChange={onInput}
  onKeyDown={(e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();

    if (message.trim()) {
      sendMessage();
    }

    return;
  }

  onKeyDown(e);
}}
  onPointerDown={onFocusInput}
  
  placeholder={placeholder}
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

  // Keep text readable on iPhone Dark Mode
  color: "#222222",
  backgroundColor: "#ffffff",
  WebkitTextFillColor: "#222222",
  caretColor: "#222222",
}}
      />

      <button
  type="button"
  onMouseDown={(e) => {
    e.preventDefault();
  }}
  onClick={async () => {
    if (message.trim()) {
      await sendMessage();
    } else {
      onMicClick();
    }
  }}
  style={{
    ...premiumButton,
    width: "38px",
    height: "38px",
    cursor: "pointer",
    opacity: 1,
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