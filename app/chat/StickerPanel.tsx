"use client";

import { stickerPacks } from "./StickerData";
import { useState } from "react";
import { Smile, Sticker } from "lucide-react";
import EmojiPanel from "./EmojiPanel";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

type StickerPanelProps = {
  open: boolean;

  isDesktop?: boolean;
  composerHeight?: number;
  onClose: () => void;
  onStickerSelect: (sticker: string) => void;
  onEmojiSelect: (emoji: string) => void;
};

export default function StickerPanel({
  open,
  isDesktop = false,
  composerHeight = 70,
  onClose,
  onStickerSelect,
  onEmojiSelect,
}: StickerPanelProps) {
  const [selectedPack, setSelectedPack] = useState("expressions");
  const [panelTab, setPanelTab] = useState<"emoji" | "sticker">("emoji"); 
   
  if (!open) return null;


  return (
    <>
      {/* Background */}
      <div
  onClick={onClose}
  style={{
    position: "fixed",
    inset: 0,
    background: "transparent",
    zIndex: 1998,
    pointerEvents: "none",
  }}
/>
      <div
  data-mspace-sticker-panel="true"
  style={{
  position: "fixed",

  left: isDesktop ? "50%" : 0,

  right: isDesktop ? "auto" : 0,

  bottom: isDesktop ? composerHeight + 20 : 0,

  transform: isDesktop
    ? "translateX(-50%)"
    : "none",

  width: isDesktop ? "600px" : "100%",

  maxWidth: isDesktop
    ? "calc(100vw - 595px)"
    : "100%",

  background: "#fff",

  borderTopLeftRadius: isDesktop ? 18 : 0,
  borderTopRightRadius: isDesktop ? 18 : 0,

   boxShadow: isDesktop
      ? "0 -10px 30px rgba(0,0,0,0.14)"
      : "0 -8px 24px rgba(0,0,0,0.12)",

  padding: "8px 0 0 0",

  zIndex: isDesktop ? 6000 : 1999,

  height: isDesktop ? "58vh" : "38vh",

  display: "flex",
  flexDirection: "column",
}}
      >

        {/* Emoji / Sticker tabs */}
<div
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 40,
    marginBottom: 10,
  }}
>
  <button
    type="button"
    onClick={() => setPanelTab("emoji")}
    style={{
      border: "none",
      background: "transparent",
      padding: "6px 12px",
      cursor: "pointer",
      color: panelTab === "emoji" ? "#6d28d9" : "#777",
      borderBottom:
        panelTab === "emoji"
          ? "3px solid #6d28d9"
          : "3px solid transparent",
    }}
  >
    <Smile
      size={26}
      strokeWidth={2.2}
    />
  </button>

  <button
    type="button"
    onClick={() => setPanelTab("sticker")}
    style={{
      border: "none",
      background: "transparent",
      padding: "6px 12px",
      cursor: "pointer",
      color: panelTab === "sticker" ? "#6d28d9" : "#777",
      borderBottom:
        panelTab === "sticker"
          ? "3px solid #6d28d9"
          : "3px solid transparent",
    }}
  >
    <Sticker
      size={26}
      strokeWidth={2.2}
    />
  </button>
</div>

  {panelTab === "emoji" && (
  <div
  style={{
    flex: 1,
    width: "100%",
    minWidth: 0,
    overflow: "hidden",
    boxSizing: "border-box",
  }}
>
    <Picker
  data={data}
  theme="light"
  onEmojiSelect={onEmojiSelect}
  searchPosition="none"
  previewPosition="none"
  skinTonePosition="none"
  dynamicWidth={false}
  perLine={18}
  style={{
    width: "100%",
    minWidth: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
  }}
/>
  </div>
)}

    {panelTab === "sticker" && (
<div
  style={{
    flex: 1,
    overflowY: "auto",

    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",

    gap: 10,
    paddingTop: 10,
  }}
>
  {stickerPacks
  .find((pack) => pack.id === "chinese")
  ?.stickers.map((file) => {
    const src = `/stickers/chinese/${file}`;

    return (
      <button
        key={file}
        onClick={() => onStickerSelect(src)}
        style={{
          border: "none",
          background: "transparent",
          padding: 0,
          cursor: "pointer",
        }}
      >
        <img
          src={src}
          alt={file}
          style={{
            width: "100%",
            aspectRatio: "1",
            objectFit: "contain",
          }}
          onError={(e) => {
            (
              e.currentTarget
                .parentElement as HTMLElement
            ).style.display = "none";
          }}
        />
      </button>
    );
  })}

{stickerPacks.find((pack) => pack.id === "chinese")?.stickers.length === 0 && (
  <div
    style={{
      gridColumn: "1 / -1",
      textAlign: "center",
      color: "#999",
      marginTop: 40,
    }}
  >
    没有贴纸
  </div>
)}
</div>
)}
  </div>

  
    </>
  );
}