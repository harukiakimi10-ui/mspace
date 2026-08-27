"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Camera,
  Video,
  MapPin,
  Mic,
  Sticker,
  Trash2,
} from "lucide-react";

type Conversation = {
  id: string;
  updated_at: string;
  has_unread?: boolean;
  unreadCount?: number;

  member?: {
  member_id?: string;
  name: string;
  photo_url: string;
  is_online?: boolean;
};

  lastMessage?: {
  content: string;
  message_type: string;
  sender: string;
  created_at: string;
  file_duration?: number | null;
  is_deleted?: boolean;
};
};

type Props = {
  conversations: Conversation[];
};

export default function ConversationList({
  conversations,
}: Props) {

  const router = useRouter();
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
    hash =
      (hash * 31 + value.charCodeAt(i)) | 0;
  }

  return colors[Math.abs(hash) % colors.length];
}

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

function formatVoiceDuration(duration?: number | null) {
  if (!duration || duration < 1) {
    return "0:00";
  }

  const totalSeconds = Math.floor(duration);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

  return (
    <div
      style={{
  width: "100%",
  overflowY: "auto",
}}
    >
      {mounted &&
        conversations.map((chat) => (
        <div
        key={chat.id}
        onClick={() => router.push(`/admin/chats/${chat.id}`)}
          style={{
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "14px",
  borderBottom: "1px solid #eee",
  cursor: "pointer",
}}
        >
          {chat.member?.photo_url ? (
  <img
    src={chat.member.photo_url}
    alt=""
    onError={(e) => {
      e.currentTarget.style.display = "none";
    }}
    style={{
      width: "54px",
      height: "54px",
      borderRadius: "50%",
      objectFit: "cover",
      flexShrink: 0,
    }}
  />
) : (
  <div
    style={{
      width: "54px",
      height: "54px",
      borderRadius: "50%",
      background: getAvatarColors(
        chat.member?.member_id ||
        chat.member?.name ||
        chat.id
      ).background,
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
        width: 34,
        height: 34,
      }}
    >
      {/* Head */}
      <div
        style={{
          position: "absolute",
          top: 6,
          left: "50%",
          transform: "translateX(-50%)",
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: getAvatarColors(
            chat.member?.member_id ||
            chat.member?.name ||
            chat.id
          ).icon,
        }}
      />

      {/* Shoulders */}
      <div
        style={{
          position: "absolute",
          bottom: 6,
          left: "50%",
          transform: "translateX(-50%)",
          width: 20,
          height: 10,
          borderRadius: "18px 18px 7px 7px",
          background: getAvatarColors(
            chat.member?.member_id ||
            chat.member?.name ||
            chat.id
          ).icon,
        }}
      />
    </div>
  </div>
)}

          <div style={{ flex: 1, minWidth: 0 }}>

  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <strong
  style={{
    color: "#333333",
    WebkitTextFillColor: "#333333",
    opacity: 1,
  }}
>
  {chat.member?.name || "Unknown Member"}
</strong>

    <span
      style={{
        fontSize: 12,
        color: "#777",
      }}
    >
      {chat.lastMessage
        ? new Date(
            chat.lastMessage.created_at
          ).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })
        : ""}
    </span>
  </div>

  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 4,
    }}
  >
    <span
      style={{
        color: "#777",
        fontSize: 13,
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        maxWidth: "85%",
      }}
    >
      {chat.lastMessage ? (
  chat.lastMessage.is_deleted ? (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      <Trash2
        size={15}
        strokeWidth={2.4}
        color="#6d28d9"
      />

      <span>
        {chat.lastMessage.sender === "admin"
          ? "You deleted this message"
          : "This message was deleted"}
      </span>
    </span>
  ) : chat.lastMessage.message_type === "image" ? (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      <Camera
        size={15}
        strokeWidth={2.4}
        color="#6d28d9"
      />
      <span>Photo</span>
    </span>

  ) : chat.lastMessage.message_type === "video" ? (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      <Video
        size={15}
        strokeWidth={2.4}
        color="#6d28d9"
      />
      <span>Video</span>
    </span>

  ) : chat.lastMessage.message_type === "location" ? (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      <MapPin
        size={15}
        strokeWidth={2.4}
        color="#6d28d9"
      />
      <span>Location</span>
    </span>

  ) : chat.lastMessage.message_type === "sticker" ? (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      <Sticker
        size={15}
        strokeWidth={2.4}
        color="#6d28d9"
      />
      <span>Sticker</span>
    </span>

  ) : chat.lastMessage.message_type === "voice" ? (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      <Mic
        size={15}
        strokeWidth={2.4}
        color="#6d28d9"
      />

      <span>Voice message</span>

      <span>
        {formatVoiceDuration(
          chat.lastMessage.file_duration
        )}
      </span>
    </span>

  ) : (
    chat.lastMessage.content
  )
) : (
  ""
)}
    </span>

    {(chat.unreadCount ?? 0) > 0 && (
  <div
    style={{
      minWidth: 20,
      height: 20,
      padding: "0 6px",
      borderRadius: 999,
      background: "#25D366",
      color: "#fff",
      fontSize: 11,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontWeight: 700,
    }}
  >
    {chat.unreadCount ?? 0}
  </div>
)}
  </div>

</div>
        </div>
      ))}
    </div>
  );
}