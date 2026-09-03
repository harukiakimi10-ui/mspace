import { useEffect } from "react";

import { ChevronLeft } from "lucide-react";

type ChatHeaderProps = {
  profileName: string;
  profilePhoto: string;
  admin: any;
  conversation: any;
  formatLastSeen: (date: string) => string;
  onBack: () => void;
};

const language =
  typeof navigator !== "undefined" &&
  navigator.language.startsWith("zh")
    ? "zh"
    : "en";

const t = {
  en: {
    typing: "Typing...",
    online: "Online",
    lastSeen: "Last seen",
  },

  zh: {
    typing: "正在输入...",
    online: "在线",
    lastSeen: "最后上线",
  },
}[language];

export default function ChatHeader({
  profileName,
  profilePhoto,
  admin,
  conversation,
  formatLastSeen,
  onBack,
}: ChatHeaderProps) {

  console.log("HEADER profileName:", profileName);
console.log("HEADER profilePhoto:", profilePhoto);
console.log("HEADER admin:", admin);



useEffect(() => {
  console.log("ChatHeader Mounted");

  return () => {
    console.log("ChatHeader Unmounted");
  };
}, []);

  return (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,

      display: "flex",
      alignItems: "center",

      padding: "calc(env(safe-area-inset-top) + 2px) 12px 4px",

      minHeight: "60px",
      flexShrink: 0,

      background: "#fff",
      color: "#fff",
      boxShadow: "none",
    }}
  >
      <button
  onClick={onBack}
  style={{
    width: 40,
    height: 40,
    borderRadius: "50%",

    border: "1px solid rgba(255,255,255,0.22)",
    background: "rgba(255,255,255,0.12)",
    color: "#111",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    padding: 0,
    marginRight: "10px",

    cursor: "pointer",

    boxShadow: "0 2px 8px rgba(0,0,0,0.18)",

    WebkitTapHighlightColor: "transparent",
  }}
>
  <ChevronLeft
    size={24}
    strokeWidth={2.3}
  />
</button>


      {profilePhoto && (
  <img
  src={
    profilePhoto ||
    "https://trmbblhdiolnbdnhlepv.supabase.co/storage/v1/object/public/avatars/WhatsApp%20Image%202025-02-22%20at%201.43.05%20PM.jpeg"
  }

  draggable={false}
  onContextMenu={(e) => {
    e.preventDefault();
    e.stopPropagation();
  }}
  onError={(e) => {
    e.currentTarget.src =
      "https://trmbblhdiolnbdnhlepv.supabase.co/storage/v1/object/public/avatars/WhatsApp%20Image%202025-02-22%20at%201.43.05%20PM.jpeg";
  }}
  alt={profileName || "Profile"}
  style={{
    width: 40,
    height: 40,
    borderRadius: "50%",
    objectFit: "cover",
    marginRight: 12,
    WebkitTouchCallout: "none",
    WebkitUserSelect: "none",
    userSelect: "none",
  }}
/>
)}

      <div>
        <div
  style={{
    fontWeight: "bold",
    fontSize: "17px",
    color: "#111",

    WebkitUserSelect: "none",
    userSelect: "none",
  }}
>
  {profileName}
</div>

        <div
  style={{
    fontSize: "13px",
    color: "#666",
  }}
>
  {conversation?.admin_typing
    ? t.typing
    : admin
    ? admin.is_online
      ? t.online
      : admin.last_seen
      ? `${t.lastSeen} ${formatLastSeen(admin.last_seen)}`
      : ""
    : ""}
</div>
      </div>
    </div>
  );
}