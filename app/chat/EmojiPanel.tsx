"use client";

import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import "./emoji.css";

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
    height: "100%",
    boxSizing: "border-box",
    overflow: "hidden",
    display: "flex",
    justifyContent: "stretch",
    alignItems: "stretch",
  }}
>
  <Picker
  data={data}
  theme="light"
  onEmojiSelect={(emoji: any) => onEmojiSelect(emoji.native)}
  previewPosition="none"
  skinTonePosition="none"
  dynamicWidth={true}
  perLine={9}
  width="100%"
/>
</div>
);
}