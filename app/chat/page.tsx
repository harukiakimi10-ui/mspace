"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useRef, useState } from "react";

export default function ChatPage() {
console.log("MEMBER PAGE LOADED");
  const router = useRouter();
  const supabase = createClient();

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const [profileName, setProfileName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");

  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isChatActive, setIsChatActive] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [admin, setAdmin] = useState<any>(null);  
  const [conversation, setConversation] = useState<any>(null);


  const messagesRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  console.log("ADMIN STATE:", admin);

  useEffect(() => {
    loadConversation();
    loadProfile();
    loadAdminStatus();

    const handleVisibility = async () => {
  const active =
    document.visibilityState === "visible" &&
    document.hasFocus();

  console.log("Visibility:", document.visibilityState);
  console.log("Has focus:", document.hasFocus());
  console.log("Active:", active);

  setIsChatActive(active);
  await updateOnlineStatus(active);

  if (active && conversationId) {
    await loadMessages(conversationId);

    setTimeout(async () => {
      await markMessagesAsRead(conversationId);
    }, 200);
  }
};
      

    window.addEventListener("focus", handleVisibility);
    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    setTimeout(handleVisibility, 200);

    const handleUnload = () => {
  updateOnlineStatus(false);
};

window.addEventListener("beforeunload", handleUnload);

window.addEventListener("focus", handleVisibility);
window.addEventListener("blur", handleVisibility);

return () => {
  updateOnlineStatus(false);

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
};
}, [conversationId]);


useEffect(() => {
  if (!conversationId) return;

  const adminChannel = supabase
    .channel("admin-status")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "admins",
      },
      async () => {
  console.log("ADMIN UPDATE");

  await loadAdminStatus();
 }
)

.on(
  "postgres_changes",
  {
    event: "UPDATE",
    schema: "public",
    table: "conversations",
    filter: `id=eq.${conversationId}`,
  },
  async (payload) => {
    console.log("CONVERSATION UPDATE:", payload);

    await loadConversation();
  }
)
    .subscribe();

  return () => {
    supabase.removeChannel(adminChannel);
  };
}, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`member-chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async () => {
          await loadMessages(conversationId);

          if (
            document.visibilityState === "visible" &&
            document.hasFocus()
          ) {
            setTimeout(async () => {
              await markMessagesAsRead(conversationId);
            }, 200);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

useEffect(() => {
  if (!initialLoad) return;
  if (!messages.length) return;

  const el = messagesRef.current;

  if (!el) return;

  requestAnimationFrame(() => {
    el.scrollTop = el.scrollHeight;
    setInitialLoad(false);
  });
}, [messages, initialLoad]);

async function loadConversation() {
  const memberId = localStorage.getItem("mspace_member_id");

  if (!memberId) return;

  let { data } = await supabase
    .from("conversations")
    .select("*")
    .eq("member_id", memberId)
    .maybeSingle();

  if (!data) {
    const { data: newConversation } = await supabase
      .from("conversations")
      .insert({
        member_id: memberId,
      })
      .select()
      .single();

    data = newConversation;
  }

  if (!data) return;

  setConversationId(data.id);
  setConversation(data);
  console.log("Conversation state:", data);
 
  setInitialLoad(true);

  await updateOnlineStatus(true);

  await loadMessages(data.id);

  setTimeout(async () => {
    await markMessagesAsRead(data.id);
  }, 200);
}

async function loadProfile() {
  const { data } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (!data) return;

  setProfileName(data.profile_name);
  setProfilePhoto(data.profile_photo);
}

async function loadAdminStatus() {
  const { data, error } = await supabase
    .from("admins")
    .select("is_online, last_seen")
    .single();

  console.log("ADMIN STATUS:", data);
  console.log("ADMIN ERROR:", error);

  if (!data) return;

  setAdmin(data);
}

async function updateOnlineStatus(online: boolean) {
  const memberId = localStorage.getItem("mspace_member_id");

  if (!memberId) return;

  const { error } = await supabase
    .from("members")
    .update({
      is_online: online,
      last_seen: new Date().toISOString(),
    })
    .eq("member_id", memberId);

  if (error) {
    console.error("Online status error:", error);
  }
}

async function loadMessages(id: string) {
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  setMessages(data || []);

  setTimeout(() => {
    const el = messagesRef.current;

    if (!el) return;

    const nearBottom =
      el.scrollHeight -
        el.scrollTop -
        el.clientHeight <
      80;

    if (nearBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, 0);
}

async function markMessagesAsRead(id: string) {
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
    .eq("sender", "admin")
    .eq("is_read", false);

  await loadMessages(id);
}

async function sendMessage() {
  if (!conversationId) return;

  if (!message.trim()) return;

  const { data } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender: "member",
      message_type: "text",
      content: message,
      is_read: false,
    })
    .select()
    .single();

  if (!data) return;

  setMessage("");

  await loadMessages(conversationId);

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
  const messageDate = new Date(date);

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const message = messageDate.toDateString();

  if (message === today.toDateString()) {
    return "Today";
  }

  if (message === yesterday.toDateString()) {
    return "Yesterday";
  }

  return messageDate.toLocaleDateString([], {
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
  const d = new Date(date);
  const today = new Date();

  if (d.toDateString() === today.toDateString()) {
    return `today at ${d.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  }

  return d.toLocaleString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

return (
    <main
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f8f5ff",
        position: "relative",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "15px",
          background: "linear-gradient(90deg,#7c3aed,#9333ea)",
          color: "#fff",
          boxShadow: "0 2px 10px rgba(0,0,0,.15)",
        }}
      >
        <button
  onClick={() => router.push("/members")}
  style={{
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: "18px",
    cursor: "pointer",
    marginRight: "15px",
  }}
>
  ←
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
    <div
      style={{
        background: "#ffffff",
        padding: "12px",
        borderRadius: "15px",
        maxWidth: "250px",
        marginBottom: "15px",
        boxShadow: "0 2px 8px rgba(0,0,0,.08)",
      }}
    >
      Hello 👋
      <br />
      Welcome to MSpace.
    </div>

    {messages.map((msg, index) => {
  const previous = index > 0 ? messages[index - 1] : null;

  return (
    <div key={msg.id}>
      {isNewDay(msg, previous) && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "20px 0",
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
            msg.sender === "member"
              ? "flex-end"
              : "flex-start",
          marginBottom: 15,
        }}
      >
        <div
          style={{
            background:
              msg.sender === "member"
                ? "#7c3aed"
                : "#ffffff",
            color:
              msg.sender === "member"
                ? "#fff"
                : "#000",
            padding: "12px 16px",
            borderRadius: 16,
            maxWidth: "70%",
            width: "fit-content",
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

  {msg.sender === "member" && (
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

      {/* Input */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          padding: "15px",
          background: "#fff",
          borderTop: "1px solid #ddd",
        }}
      >
        <input
        value={message}
        onChange={async (e) => {
  setMessage(e.target.value);

  if (!conversationId) {
  console.log("conversationId is NULL");
  return;
}

console.log("conversationId =", conversationId);

 const { data, error, count } = await supabase
  .from("conversations")
  .update(
    {
      member_typing: true,
    },
    {
      count: "exact",
    }
  )
  .eq("member_id", localStorage.getItem("mspace_member_id"))
  .select();

console.log("====== TYPING TEST ======");
console.log("Local member ID:", localStorage.getItem("mspace_member_id"));
console.log("Rows updated:", count);
console.log("Updated row:", data?.[0]);
console.log("Error:", error);
  if (typingTimeout.current) {
    clearTimeout(typingTimeout.current);
  }

  typingTimeout.current = setTimeout(async () => {
  await supabase
    .from("conversations")
    .update({
      member_typing: false,
    })
    .eq("member_id", localStorage.getItem("mspace_member_id"));
}, 1000);

}}
        placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "25px",
            border: "1px solid #ccc",
            outline: "none",
          }}
        />

        <button
          onClick={sendMessage}
          style={{
            background: "#7c3aed",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: "45px",
            height: "45px",
            cursor: "pointer",
          }}
        >
          ➤
        </button>
      </div>
    </main>
  );
}