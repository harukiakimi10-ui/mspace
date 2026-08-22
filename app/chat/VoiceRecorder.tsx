"use client";

import {
  Trash2,
  Square,
  Play,
  Pause,
  SendHorizontal,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";

const language =
  typeof navigator !== "undefined" &&
  navigator.language.startsWith("zh")
    ? "zh"
    : "en";

const t = {
  en: {
    delete: "Delete",
  },

  zh: {
    delete: "删除",
  },
}[language];

type VoiceRecorderProps = {
  voiceState: "recording" | "preview";

  recordingTime: number;

  playing: boolean;

  previewCurrentTime: number;

  voiceLevel: number;

  onStop: () => void;

  onPlay: () => void;

  onPause: () => void;

  onDelete: () => void;

  onSend: (duration: number) => void;
};

export default function VoiceRecorder({
  voiceState,
  voiceLevel,
  recordingTime,
  playing,
  previewCurrentTime,
  onStop,
  onPlay,
  onPause,
  onDelete,
  onSend,
}: VoiceRecorderProps) {

    const previewMode = voiceState === "preview";
     

  if (previewMode) {
  return (
    <div
      style={{
        background: "#fff",
        borderTop: "1px solid rgba(0,0,0,.08)",
        padding: "12px",
      }}
    >
      <div
  style={{
  display: "flex",
  justifyContent: "center",
  marginBottom: 12,
  paddingLeft: 8,
  paddingRight: 8,
}}
>
        <div
          style={{
  background: "#ffffff",
  border: "1px solid rgba(0,0,0,.08)",
  borderRadius: 24,
  minHeight: 56,
  minWidth: 260,
  maxWidth: "100%",
  padding: "0 14px",
  display: "flex",
  alignItems: "center",
  gap: 10,
  boxShadow: "0 2px 8px rgba(0,0,0,.06)",
}}
        >
          <button
  onClick={playing ? onPause : onPlay}
  style={{
  width: 36,
  height: 36,
  borderRadius: "50%",
  border: "none",
  background: "#f5f5f5",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  flexShrink: 0,
}}
>
  {playing ? (
    <Pause
      size={18}
      color="#6d28d9"
      fill="#6d28d9"
    />
  ) : (
    <Play
      size={18}
      color="#6d28d9"
      fill="#6d28d9"
    />
  )}
</button>

<div
  style={{
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 3,
    overflow: "hidden",
  }}
>
  {Array.from({ length: 30 }).map((_, i) => (
    <div
      key={i}
      style={{
        width: 3,
        height: 8 + ((i * 7) % 18),
        borderRadius: 999,
        background:
  i <
  Math.floor(
    (previewCurrentTime / (recordingTime || 1)) * 30
  )
    ? "#53bdeb"
    : "#6d28d9",
        flexShrink: 0,
      }}
    />
  ))}
</div>

<span
  style={{
    fontSize: 13,
    fontWeight: 500,
    color: "#666",
    whiteSpace: "nowrap",
    flexShrink: 0,
  }}
>
  {`${Math.floor(
    (playing ? previewCurrentTime : recordingTime) / 60
  )}:${String(
    Math.floor(
      (playing ? previewCurrentTime : recordingTime) % 60
    )
  ).padStart(2, "0")}`}
</span>


        </div>
      </div>

      <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingLeft: 12,
    paddingRight: 12,
  }}
>
  <button
    onClick={onDelete}
    style={{
      border: "none",
      background: "transparent",
      display: "flex",
      alignItems: "center",
      gap: 6,
      cursor: "pointer",
      color: "#ef4444",
      fontSize: 14,
      fontWeight: 500,
    }}
  >
    <Trash2 size={20} />
    {t.delete}
  </button>

  <button
  onClick={() => {
    console.log("PREVIEW SEND recordingTime =", recordingTime);
    onSend(recordingTime);
  }}
  style={{
    width: 42,
    height: 42,
    borderRadius: "50%",
    border: "none",
    background: "#7c3aed",
    cursor: "pointer",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    boxShadow: "0 2px 8px rgba(0,0,0,.12)",
  }}
>
  <SendHorizontal
    size={17}
    strokeWidth={2.4}
    color="#fff"
  />
</button>
</div>
    </div>
  );
}

return (
    <div
      style={{
        height: 72,
        background: "#fff",
        borderTop: "1px solid rgba(0,0,0,.08)",
        padding: "0 12px",

        display: "grid",
        gridTemplateColumns: "40px 52px 1fr 40px 46px",
        alignItems: "center",
        columnGap: "10px",
      }}
    >
      {/* Delete */}
      <button
  onClick={onDelete}
  style={{
    border: "none",
    background: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>
        <Trash2
          size={20}
          color="#ef4444"
        />
      </button>

      {/* Timer */}
      <span
        style={{
          fontSize: 18,
          fontWeight: 500,
          color: "#444",
          whiteSpace: "nowrap",
        }}
      >
        {`${Math.floor(recordingTime / 60)}:${String(
         recordingTime % 60
        ).padStart(2, "0")}`}
      </span>

      {/* Waveform */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          overflow: "hidden",
          height: 30,
        }}
      >
        {Array.from({ length: 28 }).map((_, i) => {
  const baseHeight = 6 + ((i * 7) % 10);
  const voiceHeight = voiceLevel * (18 + ((i * 5) % 14));

  return (
    <div
      key={i}
      style={{
        width: 3,
        height: baseHeight + voiceHeight,
        borderRadius: 999,
        background: "#7c3aed",
        flexShrink: 0,
        transition: "height 60ms ease-out",
      }}
    />
  );
})}
      </div>

      {/* Main Action */}
      <button
  onClick={() => {
  if (voiceState === "recording") {
    onStop();
  } else if (playing) {
    onPause();
  } else {
    onPlay();
  }
}}
  style={{
    width: 35,
    height: 35,
    borderRadius: "50%",
    background: "#fff",
    border: "1px solid rgba(0,0,0,.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,.12)",
    cursor: "pointer",
    flexShrink: 0,
  }}
>
  {voiceState === "recording" ? (
  <Square size={18} color="#7c3aed" fill="#7c3aed" />
) : playing ? (
  <div
  style={{
    display: "flex",
    gap: 3,
    alignItems: "center",
    justifyContent: "center",
  }}
>
  <div
    style={{
      width: 4,
      height: 15,
      background: "#7c3aed",
      borderRadius: 2,
    }}
  />
  <div
    style={{
      width: 4,
      height: 15,
      background: "#7c3aed",
      borderRadius: 2,
    }}
  />
</div>
) : (
  <Play size={20} color="#7c3aed" fill="#7c3aed" />
)}
</button>

      {/* Send */}
      <button
  type="button"
  onClick={() => {
    console.log("VoiceRecorder recordingTime =", recordingTime);
    onSend(recordingTime);
  }}
  style={{
    width: 42,
    height: 42,
    borderRadius: "50%",
    border: "none",
    background: "#7c3aed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,.12)",
  }}
>
        <SendHorizontal
      size={17}
      strokeWidth={2.4}
      color="#fff"
    />
      </button>
    </div>
  );
}