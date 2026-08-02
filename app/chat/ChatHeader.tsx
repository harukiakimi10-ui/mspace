import { ChevronLeft } from "lucide-react";

type ChatHeaderProps = {
  profileName: string;
  profilePhoto: string;
  admin: any;
  conversation: any;
  formatLastSeen: (date: string) => string;
  onBack: () => void;
};

export default function ChatHeader({
  profileName,
  profilePhoto,
  admin,
  conversation,
  formatLastSeen,
  onBack,
}: ChatHeaderProps) {
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

      padding: "calc(env(safe-area-inset-top) + 12px) 15px 12px",

      minHeight: "74px",
      flexShrink: 0,

      background: "linear-gradient(90deg,#7c3aed,#9333ea)",
      color: "#fff",
      boxShadow: "0 2px 12px rgba(0,0,0,.12)",
    }}
  >
      <button
        onClick={onBack}
        style={{
  background: "transparent",
  border: "none",
  color: "#fff",
  cursor: "pointer",
  marginRight: "10px",
  padding: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}}
      >
        <ChevronLeft size={34} strokeWidth={3.2} />
      </button>

      <img
        src={
          profilePhoto ||
          "https://trmbblhdiolnbdnhlepv.supabase.co/storage/v1/object/public/avatars/WhatsApp%20Image%202025-02-22%20at%201.43.05%20PM.jpeg"
        }
        alt={profileName || "Donald Lee"}
        style={{
          width: "46px",
          height: "46px",
          borderRadius: "50%",
          objectFit: "cover",
          marginRight: "12px",
        }}
      />

      <div>
        <div
          style={{
            fontWeight: "bold",
            fontSize: "18px",
          }}
        >
          {profileName || "Donald Lee"}
        </div>

        <div
          style={{
            fontSize: "13px",
          }}
        >
          {conversation?.admin_typing
            ? "Typing..."
            : admin?.is_online
            ? "Online"
            : admin?.last_seen
            ? `Last seen ${formatLastSeen(admin.last_seen)}`
            : "Offline"}
        </div>
      </div>
    </div>
  );
}