"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProfileAvatar from "@/app/chat/ProfileAvatar";

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
  member_typing?: boolean;
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
  is_read?: boolean;
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

function MessageReadReceipt({
  message,
}: {
  message?: Conversation["lastMessage"];
}) {
  if (!message || message.sender !== "admin") {
    return null;
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        flexShrink: 0,
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "-2px",
        color: message.is_read
          ? "#2196F3"
          : "#777",
      }}
    >
      {message.is_read ? "✓✓" : "✓"}
    </span>
  );
}

  return (
    <div
  data-mspace-conversation-list="true"
  style={{
    width: "100%",
    overflowY: "auto",
  }}
>
      {mounted &&
        conversations.map((chat) => (
        <div
        key={chat.id}
        data-conversation-id={chat.id}
        onClick={() => {
  const list = document.querySelector(
    '[data-mspace-conversation-list="true"]'
  ) as HTMLElement | null;

  if (list) {
    sessionStorage.setItem(
      "mspace-conversation-list-scroll",
      String(list.scrollTop)
    );
  }

  sessionStorage.setItem(
    "mspace-selected-conversation-id",
    chat.id
  );

  router.push(`/admin/chats/${chat.id}`);
}}
          style={{
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "14px",
  borderBottom: "1px solid #eee",
  cursor: "pointer",
}}
        >
          <ProfileAvatar
  name={
    chat.member?.member_id ||
    chat.member?.name ||
    chat.id ||
    "Member"
  }
  photoUrl={chat.member?.photo_url}
  size={54}
/>

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
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  color: "#777",
  fontSize: 13,
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  maxWidth: "85%",
}}
    >

{!chat.member_typing && (
  <MessageReadReceipt
    message={chat.lastMessage}
  />
)}

      {chat.member_typing ? (
  <span
    style={{
      fontStyle: "italic",
    }}
  >
    Typing...
  </span>
) : chat.lastMessage ? (
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
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
    }}
  >
    <span>
      {chat.lastMessage.content}
    </span>
  </span>
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