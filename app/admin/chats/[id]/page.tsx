"use client";

import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState, useRef } from "react";



export default function ChatPage() {
  const { id } = useParams();
  const router = useRouter();

  const supabase = createClient();

  const [messages, setMessages] = useState<any[]>([]);
  const [member, setMember] = useState<any>(null);
  const [conversation, setConversation] = useState<any>(null);
  const [reply, setReply] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isChatActive, setIsChatActive] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  const messagesRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadConversation();

(async () => {
  await loadMessages();
})();

const handleVisibility = async () => {
  const active =
    document.visibilityState === "visible" &&
    document.hasFocus();

  setIsChatActive(active);

  await updateAdminOnlineStatus(active);

  if (active) {
    await loadMessages();

    setTimeout(async () => {
      await markMessagesAsRead();
    }, 200);
  }
};





window.addEventListener("focus", handleVisibility);
window.addEventListener("blur", handleVisibility);
const handleUnload = () => {
  updateAdminOnlineStatus(false);
};

window.addEventListener("beforeunload", handleUnload);
document.addEventListener(
  "visibilitychange",
  handleVisibility
);

setTimeout(() => {
  handleVisibility();
}, 200);

    const channel = supabase
  .channel(`admin-chat-${id}`)

  // Listen for messages
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "messages",
      filter: `conversation_id=eq.${id}`,
    },
    async () => {
      await loadMessages();

      if (
  document.visibilityState === "visible" &&
  document.hasFocus()
) {
  await markMessagesAsRead();
}
    }
  )

  // Listen for member online/offline changes
  .on(
  "postgres_changes",
  {
    event: "UPDATE",
    schema: "public",
    table: "members",
  },
  async (payload) => {
    console.log("MEMBER UPDATE:", payload);

    await loadConversation();
  }
)

.on(
  "postgres_changes",
  {
    event: "UPDATE",
    schema: "public",
    table: "conversations",
    
  },
  async (payload) => {
    console.log("CONVERSATION UPDATE:", payload);

    await loadConversation();
  }
)

  .subscribe();

   return () => {
  updateAdminOnlineStatus(false);

  window.removeEventListener(
    "focus",
    handleVisibility
  );

  window.removeEventListener(
    "blur",
    handleVisibility
  );

  document.removeEventListener(
    "visibilitychange",
    handleVisibility
  );

  window.removeEventListener(
    "beforeunload",
    handleUnload
  );

  supabase.removeChannel(channel);
};
  }, []);





  async function loadConversation() {
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", id)
      .single();
 console.log("Conversation:", data);

    if (!data) return;

    const { data: memberData } = await supabase
  .from("members")
  .select("name, photo_url, is_online, last_seen")
  .eq("member_id", data.member_id)
  .single();

setMember(memberData);
setConversation(data);

console.log("Conversation:", data);
  }

async function updateAdminOnlineStatus(online: boolean) {
  const { error } = await supabase
    .from("admins")
    .update({
      is_online: online,
      last_seen: new Date().toISOString(),
    })
    .eq("id", "11111111-1111-1111-1111-111111111111");

  if (error) {
    console.error("Admin status error:", error);
  }
}

  async function loadMessages() {
    console.log("loadMessages() called");

    const { data } = await supabase
     
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    setMessages(data || []);

setTimeout(() => {
  const el = messagesRef.current;

  if (!el) return;

  if (initialLoad) {
    el.scrollTop = el.scrollHeight;
    setInitialLoad(false);
    return;
  }

  const isNearBottom =
    el.scrollHeight - el.scrollTop - el.clientHeight < 80;

  if (isNearBottom) {
    el.scrollTop = el.scrollHeight;
  }
}, 0);
  console.log("Messages:", data);


 
  }

async function markMessagesAsRead() {
  if (
    document.visibilityState !== "visible" ||
    !document.hasFocus()
  ) {
    return;
  }

  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("conversation_id", id)
    .eq("sender", "member")
    .eq("is_read", false);
}

  async function sendReply() {
    if (!reply.trim()) return;

    await supabase
  .from("messages")
  .insert({
    conversation_id: id,
    sender: "admin",
    content: reply,
    is_read: false,
  });

setReply("");

await loadMessages();

setTimeout(() => {
  messagesRef.current?.scrollTo({
    top: messagesRef.current.scrollHeight,
    behavior: "smooth",
  });
}, 50);

  }


function formatTime(date: string) {
  return new Date(date).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}


function formatDateLabel(date: string) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date();

  today.setHours(0, 0, 0, 0);
  yesterday.setDate(today.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const messageDay = new Date(d);
  messageDay.setHours(0, 0, 0, 0);

  if (messageDay.getTime() === today.getTime()) return "Today";
  if (messageDay.getTime() === yesterday.getTime()) return "Yesterday";

  return d.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isNewDay(current: any, previous: any) {
  if (!previous) return true;

  return (
    new Date(current.created_at).toDateString() !==
    new Date(previous.created_at).toDateString()
  );
}


function formatLastSeen(date: string) {
  const lastSeen = new Date(date);

  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  if (lastSeen.toDateString() === now.toDateString()) {
    return `today at ${lastSeen.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  }

  if (
    lastSeen.toDateString() ===
    yesterday.toDateString()
  ) {
    return `yesterday at ${lastSeen.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  }

  return lastSeen.toLocaleString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}


  return (
  <div
    style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "#f5f5f5",
      position: "relative",
    }}
  >
    {/* Header */}

    <div
      style={{
        height: 70,
        background: "#6d28d9",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: 15,
      }}
    >
      <button
        onClick={() => router.push("/admin/chats")}
        style={{
          border: "none",
          background: "transparent",
          color: "#fff",
          fontSize: 22,
          cursor: "pointer",
        }}
      >
        ←
      </button>

      <img
        src={member?.photo_url || "/avatar.png"}
        style={{
          width: 45,
          height: 45,
          borderRadius: "50%",
          objectFit: "cover",
        }}
      />

      <div>
  <div style={{ fontWeight: 600 }}>
    {member?.name || "Member"}
  </div>

  <div style={{ fontSize: 13 }}>
  {conversation?.member_typing
    ? "Typing..."
    : member?.is_online
      ? "Online"
      : member?.last_seen
        ? `Last seen ${formatLastSeen(member.last_seen)}`
        : "Offline"}
</div>
</div>
    </div>

    {/* Messages */}

   <div
  style={{
    flex: 1,
    position: "relative",
    overflow: "hidden",
  }}
>
  <div
    ref={messagesRef}
    onScroll={(e) => {
      const el = e.currentTarget;

      const distanceFromBottom =
        el.scrollHeight -
        el.scrollTop -
        el.clientHeight;

      setShowScrollButton(distanceFromBottom > 80);
    }}
    style={{
      height: "100%",
      overflowY: "auto",
      padding: 20,
      paddingBottom: 90,
    }}
  >
    {messages.map((msg, index) => {
  const previous = index > 0 ? messages[index - 1] : null;

  return (
    <div key={msg.id}>
      {isNewDay(msg, previous) && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "16px 0",
          }}
        >
          <div
            style={{
  background: "#dfe9f5",
  color: "#54656f",
  padding: "7px 16px",
  borderRadius: 10,
  fontSize: 13,
  fontWeight: 600,
  boxShadow: "0 1px 2px rgba(0,0,0,.08)",
}}
          >
            {formatDateLabel(msg.created_at)}
          </div>
        </div>
      )}

      <div
        key={msg.id}
        style={{
          display: "flex",
          justifyContent:
            msg.sender === "admin"
              ? "flex-end"
              : "flex-start",
          marginBottom: 15,
        }}
      >
        <div
          style={{
            background:
              msg.sender === "admin"
                ? "#6d28d9"
                : "#fff",
            color:
              msg.sender === "admin"
                ? "#fff"
                : "#000",
            padding: "12px 16px",
            borderRadius: 16,
            maxWidth: "70%",
            wordBreak: "break-word",
            boxShadow: "0 2px 8px rgba(0,0,0,.08)",
          }}
        >
          <div>{msg.content}</div>

<div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    gap: 3,
    marginTop: 6,
    fontSize: 11,
    lineHeight: 1,
    opacity: 0.8,
  }}
>
  <span>{formatTime(msg.created_at)}</span>

  {msg.sender === "admin" && (
    <span
      style={{
        color: msg.is_read ? "#53bdeb" : "#d1d5db",
        fontWeight: 700,
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
})}
  </div>

  {showScrollButton && (
    <button
      onClick={() =>
        messagesRef.current?.scrollTo({
          top: messagesRef.current.scrollHeight,
          behavior: "smooth",
        })
      }
      style={{
  position: "absolute",
  right: 20,
  bottom: 20,

  width: 36,
  height: 36,

  borderRadius: "50%",
  border: "1px solid #d9d9d9",

  background: "#f5f5f5",
  color: "#000",         

  fontSize: 16,
  fontWeight: 700,

  cursor: "pointer",

  boxShadow: "0 2px 8px rgba(0,0,0,.15)",

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  zIndex: 100,
}}
    >
      ↓
    </button>
  )}
</div>

<div
      style={{
        display: "flex",
        padding: 15,
        gap: 10,
        background: "#fff",
        borderTop: "1px solid #ddd",
      }}
    >
      <input
        value={reply}
        onChange={async (e) => {
  setReply(e.target.value);

  await supabase
    .from("conversations")
    .update({
      admin_typing: true,
    })
    .eq("id", id);

  if (typingTimeout.current) {
    clearTimeout(typingTimeout.current);
  }

  typingTimeout.current = setTimeout(async () => {
    await supabase
      .from("conversations")
      .update({
        admin_typing: false,
      })
      .eq("id", id);
  }, 1000);
}}
        placeholder="Type a reply..."
        style={{
          flex: 1,
          padding: 14,
          borderRadius: 25,
          border: "1px solid #ccc",
          outline: "none",
        }}
      />

      <button
        onClick={sendReply}
        style={{
          width: 50,
          height: 50,
          borderRadius: "50%",
          border: "none",
          background: "#6d28d9",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        ➤
      </button>
    </div>
  </div>
);
}