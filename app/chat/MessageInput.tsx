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
  isDesktop?: boolean;
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
  isDesktop = false,

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
  gap: isDesktop ? "10px" : "8px",
  padding: isDesktop
    ? "0 22px 18px 16px"
    : "0 18px 14px 10px",
  alignItems: "center",
}}
  >
      <button
  onClick={onAttach}
  style={{
    ...premiumButton,

    width: isDesktop ? "48px" : "40px",
    height: isDesktop ? "48px" : "40px",

    background: "#f3f4f6",
    borderRadius: "50%",

    boxShadow: "none",

    cursor: uploading ? "default" : "pointer",

    padding: 0,
  }}
>
  <Plus
  size={isDesktop ? 30 : 26}
  strokeWidth={2.4}
  color="#444"
/>
</button>

      <button
        onClick={onToggleQuickEmoji}
        style={{
          width: isDesktop ? "50px" : "44px",
          height: isDesktop ? "50px" : "44px",
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
    size={isDesktop ? 28 : 24}
    strokeWidth={2.2}
    color="#444"
  />
) : (
  <Smile
    size={isDesktop ? 30 : 26}
    strokeWidth={2.2}
    color="#444"
  />
)}
      </button>

      <textarea
  ref={messageInputRef}
  id="mspace-message-input"
  onBlur={() => {
  console.log("MSPACE TEXTAREA BLUR:", {
    activeElement: document.activeElement?.tagName,
    activeElementId:
      (document.activeElement as HTMLElement | null)?.id,
    visualViewportHeight:
      window.visualViewport?.height,
  });
}}

onFocus={() => {
  console.log("MSPACE TEXTAREA FOCUS EVENT");
}}
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
  minHeight: isDesktop ? "54px" : "38px",
  maxHeight: "140px",

  padding: isDesktop ? "10px 18px" : "7px 14px",

  borderRadius: isDesktop ? "27px" : "20px",
  border: "1px solid #ccc",
  outline: "none",
  resize: "none",
  overflowY: "auto",
  fontFamily: "inherit",

  fontSize: isDesktop ? "17px" : "14px",
  lineHeight: isDesktop ? 1.45 : 1.5,

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
    width: isDesktop ? "48px" : "38px",
    height: isDesktop ? "48px" : "38px",
    cursor: "pointer",
    opacity: 1,
    flexShrink: 0,
  }}
>

  {message.trim() ? (
  <SendHorizontal
    size={isDesktop ? 21 : 17}
    strokeWidth={2.4}
    color="#fff"
  />
) : (
  <Mic
    size={isDesktop ? 22 : 18}
    strokeWidth={2.4}
    color="#fff"
  />
)}
</button>
    </div>
  );
}