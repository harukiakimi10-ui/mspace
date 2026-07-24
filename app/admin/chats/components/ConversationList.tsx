import { useRouter } from "next/navigation";

type Conversation = {
  id: string;
  updated_at: string;
  member?: {
    name: string;
    photo_url: string;
  };
};

type Props = {
  conversations: Conversation[];
};

export default function ConversationList({
  conversations,
}: Props) {

const router = useRouter();
  return (
    <div
      style={{
  width: "100%",
  overflowY: "auto",
}}
    >
      {conversations.map((chat) => (
        <div
        key={chat.id}
        onClick={() => router.push(`/admin/chats/${chat.id}`)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "16px",
            borderBottom: "1px solid #eee",
            cursor: "pointer",
          }}
        >
          <img
            src={chat.member?.photo_url || "/avatar.png"}
            alt=""
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />

          <div style={{ flex: 1 }}>
            <strong>
              {chat.member?.name || "Unknown Member"}
            </strong>

            <div
              style={{
                color: "#777",
                fontSize: "13px",
                marginTop: "4px",
              }}
            >
              {new Date(chat.updated_at).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}