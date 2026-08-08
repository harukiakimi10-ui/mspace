"use client";

import { stickerPacks } from "./StickerData";
import { useState } from "react";

type StickerPanelProps = {
  open: boolean;
  onClose: () => void;
  onStickerSelect: (sticker: string) => void;
};

export default function StickerPanel({
  open,
  onClose,
  onStickerSelect,
}: StickerPanelProps) {
  const [selectedPack, setSelectedPack] = useState("expressions");

  if (!open) return null;

  const currentPack =
    stickerPacks.find(
      (pack) => pack.id === selectedPack
    ) ?? stickerPacks[0];

  return (
    <>
      {/* Background */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.12)",
          zIndex: 1998,
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,

          background: "#fff",

          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,

          padding: 18,

          zIndex: 1999,

          height: "45vh",

          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Drag Handle */}
        <div
          style={{
            width: 48,
            height: 5,
            borderRadius: 999,
            background: "#ddd",
            margin: "0 auto 18px",
          }}
        />

        {/* Header */}
        <div
          style={{
            textAlign: "center",
            fontWeight: 700,
            color: "#6d28d9",
            fontSize: 17,
            marginBottom: 10,
          }}
        >
          Stickers
        </div>

        {/* Pack Tabs */}
        <div
          style={{
            display: "flex",
            gap: 10,
            overflowX: "auto",
            marginBottom: 8,
          }}
        >
          {stickerPacks.map((pack) => (
            <button
              key={pack.id}
              onClick={() =>
                setSelectedPack(pack.id)
              }
              style={{
                border: "none",
                background:
                  selectedPack === pack.id
                    ? "#ede9fe"
                    : "transparent",

                borderRadius: 999,

                padding: "6px 10px",

                cursor: "pointer",

                whiteSpace: "nowrap",

                fontWeight: 600,
              }}
            >
              {pack.title}
            </button>
          ))}
        </div>

        {/* Sticker Grid */}
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
  {currentPack.stickers.map((file) => {
    const src = `${currentPack.folder}/${file}`;

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

{currentPack.stickers.length === 0 && (
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
      </div>
    </>
  );
}