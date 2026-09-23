"use client";

import {
  Camera,
  Image,
  Video,
  MapPin,
  X,
} from "lucide-react";

const language =
  typeof navigator !== "undefined" &&
  navigator.language.startsWith("zh")
    ? "zh"
    : "en";

const t = {
  en: {
    attach: "Attach",
    camera: "Camera",
    photos: "Photos",
    video: "Video",
    location: "Location",
  },

  zh: {
    attach: "附件",
    camera: "相机",
    photos: "照片",
    video: "视频",
    location: "位置",
  },
}[language];


type AttachmentMenuProps = {
  open: boolean;

  isDesktop?: boolean;

  onClose: () => void;

  onCamera: () => void;

  onPhoto: () => void;

  onVideo: () => void;

  onLocation: () => void;
};

export default function AttachmentMenu({
  open,
  isDesktop = false,
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
  style={{
    position: "fixed",
    inset: 0,

    background: "transparent",
    transition: "opacity .25s ease",

    zIndex: 1998,

    pointerEvents: "none",
  }}
/>

      {/* Bottom Sheet */}
      <div
        style={{
  position: "fixed",

  left: isDesktop ? "50%" : 0,
  right: isDesktop ? "auto" : 0,
  bottom: 0,
  width: isDesktop ? 430 : "auto",

  transform: isDesktop
  ? "translateX(-50%)"
  : open
    ? "translateY(0)"
    : "translateY(100%)",

  transition: "transform 260ms cubic-bezier(.22,.61,.36,1)",

  willChange: "transform",

  background: "#fff",
          borderTopLeftRadius: isDesktop ? 18 : 0,
          borderTopRightRadius: isDesktop ? 18 : 0,

          padding: isDesktop ? "10px 18px 12px" : "18px",

          boxShadow:
            "0 -8px 30px rgba(0,0,0,.12)",

          zIndex: 1999,
        }}
      >

        {/* Header */}
        <div
  style={{
    position: "relative",
    height: isDesktop ? 28 : 36,
    marginBottom: isDesktop ? 8 : 20,
  }}
>
  <div
    style={{
      position: "absolute",
      left: "50%",
      transform: "translateX(-50%)",
      fontWeight: 700,
      fontSize: isDesktop ? 16 : 18,
      color: "#6d28d9",
    }}
  >
    {t.attach}
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
    <X size={isDesktop ? 22 : 28} color="#666" />
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
    icon={<Camera size={isDesktop ? 22 : 28} color="#6d28d9" />}
    label={t.camera}
    onClick={onCamera}
  />

  <MenuItem
  icon={<Image size={isDesktop ? 22 : 28} color="#6d28d9" />}
  label={t.photos}
  onClick={onPhoto}
/>

  <MenuItem
    icon={<Video size={isDesktop ? 22 : 28} color="#6d28d9" />}
    label={t.video}
    onClick={onVideo}
  />

  <MenuItem
    icon={<MapPin size={isDesktop ? 22 : 28} color="#6d28d9" />}
    label={t.location}
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

        