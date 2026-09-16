"use client";

type ProfileAvatarProps = {
  name: string;
  photoUrl?: string | null;
  size?: number;
};

function getAvatarColors(value: string) {
  const colors = [
    { background: "#E8F5E9", icon: "#2E7D32" },
    { background: "#E3F2FD", icon: "#1565C0" },
    { background: "#FFF3E0", icon: "#EF6C00" },
    { background: "#FCE4EC", icon: "#C2185B" },
    { background: "#EDE7F6", icon: "#6A1B9A" },
    { background: "#E0F7FA", icon: "#00838F" },
    { background: "#FFF8E1", icon: "#F9A825" },
    { background: "#F3E5F5", icon: "#8E24AA" },
  ];

  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  return colors[Math.abs(hash) % colors.length];
}

export default function ProfileAvatar({
  name,
  photoUrl,
  size = 45,
}: ProfileAvatarProps) {
  const avatarColors = getAvatarColors(
    name || "Member"
  );

  if (photoUrl) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <img
          src={photoUrl}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: avatarColors.background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 30,
          height: 30,
        }}
      >
        {/* Head */}
        <div
          style={{
            position: "absolute",
            top: 4,
            left: "50%",
            transform: "translateX(-50%)",
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: avatarColors.icon,
          }}
        />

        {/* Shoulders */}
        <div
          style={{
            position: "absolute",
            bottom: 4,
            left: "50%",
            transform: "translateX(-50%)",
            width: 20,
            height: 10,
            borderRadius: "18px 18px 6px 6px",
            background: avatarColors.icon,
          }}
        />
      </div>
    </div>
  );
}