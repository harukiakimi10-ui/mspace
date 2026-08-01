"use client";

import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

type EmojiPanelProps = {
  open: boolean;
  onEmojiSelect: (emoji: any) => void;
};

export default function EmojiPanel({
  open,
  onEmojiSelect,
}: EmojiPanelProps) {
  if (!open) return null;

  return (
  <div
    style={{
  width: "100%",
  height: "200px",

  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",

  padding: "0 12px",

  boxSizing: "border-box",

  borderTop: "1px solid #e5d8ff",
  background: "#f8f5ff",

  overflow: "hidden",
}}
  >
    <Picker
  data={data}
  theme="light"
  onEmojiSelect={onEmojiSelect}
  previewPosition="none"
  skinTonePosition="none"
  perLine={9}
/>
  </div>
);
}