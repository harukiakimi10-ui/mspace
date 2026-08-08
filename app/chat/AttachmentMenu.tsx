"use client";

import {
  Camera,
  Image,
  Video,
  MapPin,
  X,
} from "lucide-react";


type AttachmentMenuProps = {
  open: boolean;

  onClose: () => void;

  onCamera: () => void;

  onPhoto: () => void;

  onVideo: () => void;

  onLocation: () => void;
};

export default function AttachmentMenu({
  open,
  onClose,
  onCamera,
  onPhoto,
  onVideo,
  onLocation,
}: AttachmentMenuProps) {
  if (!open) return null;

  return (
    <>

    
      {/* Background */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,

          background: "rgba(0,0,0,.12)",
          transition: "opacity .25s ease",

          zIndex: 1998,
        }}
      />

      {/* Bottom Sheet */}
      <div
        style={{
  position: "fixed",

  left: 0,
  right: 0,
  bottom: 0,

  transform: open
    ? "translateY(0)"
    : "translateY(100%)",

  transition: "transform 260ms cubic-bezier(.22,.61,.36,1)",

  willChange: "transform",

  background: "#fff",
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,

          padding: "18px",

          boxShadow:
            "0 -8px 30px rgba(0,0,0,.12)",

          zIndex: 1999,
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
    position: "relative",
    height: 36,
    marginBottom: 20,
  }}
>
  <div
    style={{
      position: "absolute",
      left: "50%",
      transform: "translateX(-50%)",
      fontWeight: 700,
      fontSize: 18,
      color: "#6d28d9",
    }}
  >
    Attach
  </div>

  <button
    onClick={onClose}
    style={{
      position: "absolute",
      right: 0,
      top: 0,
      border: "none",
      background: "transparent",
      cursor: "pointer",
    }}
  >
    <X size={22} color="#666" />
  </button>
</div>

        {/* Icons Row */}
        <div
          style={{
            display: "flex",

            justifyContent: "space-around",

            alignItems: "flex-start",
          }}
    >
  <MenuItem
    icon={<Camera size={28} color="#6d28d9" />}
    label="Camera"
    onClick={onCamera}
  />

  <MenuItem
  icon={<Image size={28} color="#6d28d9" />}
  label="Photos"
  onClick={onPhoto}
/>

  <MenuItem
    icon={<Video size={28} color="#6d28d9" />}
    label="Video"
    onClick={onVideo}
  />

  <MenuItem
    icon={<MapPin size={28} color="#6d28d9" />}
    label="Location"
    onClick={onLocation}
  />
</div>

      </div>
    </>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        border: "none",
        background: "transparent",
        cursor: "pointer",

        display: "flex",
        flexDirection: "column",
        alignItems: "center",

        gap: 10,

        width: 72,
      }}
    >
      <div
        style={{
          width: 62,
          height: 62,

          borderRadius: 20,

          background: "#f5f3ff",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>

      <span
        style={{
          fontSize: 13,
          color: "#444",
          fontWeight: 600,
        }}
      >
        {label}
      </span>
    </button>
  );
}

        