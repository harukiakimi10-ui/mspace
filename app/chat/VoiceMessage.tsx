"use client";

import { useRef, useState, useEffect } from "react";
import { Play,Pause, Mic } from "lucide-react";

type VoiceMessageProps = {
  msg?: any;
  currentUser: "member" | "admin";

  formatTime?: (date: string) => string;

  preview?: boolean;

  audioBlob?: Blob | null;

  duration?: number;
};

export default function VoiceMessage({
  msg,
  currentUser,
  formatTime,
  preview = false,
  audioBlob,
  duration: previewDuration = 0,
}: VoiceMessageProps) {
    const audioRef = useRef<HTMLAudioElement>(null);

   const [playing, setPlaying] = useState(false);

   const [currentTime, setCurrentTime] = useState(0);

   const [duration, setDuration] = useState(
  msg.file_duration ?? 0
);


const [isAndroid, setIsAndroid] = useState(false);

useEffect(() => {
  const ua = navigator.userAgent;

  const android = /Android/i.test(ua);
  const wechat = /MicroMessenger/i.test(ua);

  setIsAndroid(android && !wechat);
}, []);
  return (
  
  <div
    style={{
  background:
    msg.sender === currentUser
      ? "#6d28d9"
      : "#ffffff",

  borderRadius:
    msg.sender === currentUser
      ? "18px 18px 4px 18px"
      : "18px 18px 18px 4px",

  minWidth: isAndroid ? 220 : 240,
  maxWidth: isAndroid ? 280 : 300,

  display: "flex",
  alignItems: "flex-start",
  gap: 8,

  paddingTop: 4,
  paddingRight: 12,
  paddingBottom: 0,
  paddingLeft: 12,

  boxShadow: "0 2px 8px rgba(0,0,0,.08)",
}}
  >
    <div
  style={{
    position: "relative",
    width: 38,
    height: 38,
    flexShrink: 0,
    marginTop: -7
  }}
>
  <button
  onClick={() => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  }}
  style={{
      width: 38,
      height: 38,
      borderRadius: "50%",
      border: "none",
      background: "#f3f4f6",
      cursor: "pointer",

      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {playing ? (
  <div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    width: "100%",
    height: "100%",
  }}
>
  <div
    style={{
      width: 5,
      height: 15,
      background: "#6d28d9",
      borderRadius: 999,
    }}
  />
  <div
    style={{
      width: 5,
      height: 15,
      background: "#6d28d9",
      borderRadius: 999,
    }}
  />
</div>
) : (
  <Play
    size={18}
    fill="#6d28d9"
    color="#6d28d9"
  />
)}
  </button>

  <div
  style={{
    position: "absolute",
    right: -5,
    bottom: -5,

    width: 20,
    height: 20,

    borderRadius: "50%",

    background:
      msg.sender === currentUser
        ? "#6d28d9"
        : "#ffffff",

    border: "2px solid #ffffff",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>
  <Mic
    size={15}
    strokeWidth={3}
    color={
      msg.sender === currentUser
        ? "#ffffff"
        : "#6d28d9"
    }
  />
</div>
</div>
    <audio
  ref={audioRef}
  src={
  preview
    ? (audioBlob ? URL.createObjectURL(audioBlob) : "")
    : msg.file_url
}
  preload="metadata"
  onLoadedMetadata={() => {
  if (!audioRef.current) return;

  if (!msg.file_duration) {
    setDuration(audioRef.current.duration);
  }
}}
  onPlay={() => setPlaying(true)}
  onPause={() => setPlaying(false)}
  onTimeUpdate={() => {
  if (audioRef.current) {
    console.log(
      "Current:",
      audioRef.current.currentTime,
      "Duration:",
      audioRef.current.duration
    );

    setCurrentTime(audioRef.current.currentTime);
  }
}}
  onEnded={() => setPlaying(false)}
/>

    <div
  style={{
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  }}
>
  {/* Waveform */}
  <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: isAndroid ? 2 : 3,
    minWidth: 0,
    width: "100%",
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
    ((playing ? currentTime : 0) /
      (duration || 1)) *
      30
  )
    ? "#53bdeb"
    : msg.sender === currentUser
      ? "rgba(255,255,255,0.88)"
      : "#6d28d9",
        }}
      />
    ))}
  </div>

  {/* Bottom row */}
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }}
>
  {/* Left side */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      fontSize: 12,
      color:
        msg.sender === currentUser
          ? "rgba(255,255,255,.85)"
          : "#667781",
    }}
  >



    {Math.floor(
  (playing
    ? currentTime
    : (msg.file_duration ?? duration)
  ) / 60
)}:
{String(
  Math.floor(
    (playing
      ? currentTime
      : (msg.file_duration ?? duration)
    ) % 60
  )
).padStart(2, "0")}
  </div>

  {/* Right side */}
  <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 4,
    marginTop: 4,   // Moves the timestamp and ticks downward
    fontSize: 11,
    color:
      msg.sender === currentUser
        ? "rgba(255,255,255,.82)"
        : "#667781",
  }}
>
    <span>{formatTime ? formatTime(msg.created_at) : ""}</span>

    {msg.sender === currentUser && (
      <span
        style={{
          color: msg.is_read
            ? "#53bdeb"
            : "#d1d5db",
        }}
      >
        {msg.is_read ? "✓✓" : "✓"}
      </span>
    )}
  </div>
</div>
</div>
  </div>

);
}