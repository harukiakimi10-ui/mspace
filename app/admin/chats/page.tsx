"use client";

import Header from "./components/Header";
import Stats from "./components/Stats";
import ConversationList from "./components/ConversationList";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function AdminChatsPage() {


const [conversations, setConversations] = useState<any[]>([]);
const [selectedConversation, setSelectedConversation] = useState<any>(null);
const [messages, setMessages] = useState<any[]>([]);
const [reply, setReply] = useState("");
const [onlineCount, setOnlineCount] = useState(0);

const totalMembers = conversations.length;
const unreadCount = conversations.filter(
  (c) => c.has_unread
).length;

const supabase = createClient();

useEffect(() => {
  if (localStorage.getItem("mspace_admin") !== "true") {
    window.location.replace("/admin/login");
    return;
  }

  loadConversations();

  const channel = supabase
    .channel("admin-conversations")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "messages",
      },
      () => {
        loadConversations();

        if (selectedConversation) {
          loadMessages(selectedConversation.id);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);

useEffect(() => {
  if (!selectedConversation) return;

  const channel = supabase
    .channel(`admin-chat-${selectedConversation.id}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${selectedConversation.id}`,
      },
      () => {
        console.log("Admin received realtime message");
        loadMessages(selectedConversation.id);
      }
    )
    .subscribe((status) => {
      console.log("Admin realtime:", status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}, [selectedConversation]);

async function loadConversations() {
  console.time("loadConversations");
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .order("updated_at", { ascending: false });
  console.log("Conversation count:", data?.length);
console.log(data);

  if (error) {
    console.log(error);
    return;
  }

console.log("Supabase conversations:", data);
console.log("Supabase error:", error);

  const result: any[] = [];

await Promise.all(
  (data || []).map(async (conversation) => {
    const { data: member } = await supabase
      .from("members")
      .select("name, photo_url, is_online")
      .eq("member_id", conversation.member_id)
      .single();

    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("conversation_id", conversation.id)
      .eq("sender", "member")
      .eq("is_read", false);

    const { data: lastMessage } = await supabase
      .from("messages")
      .select("content, message_type, sender, created_at")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    result.push({
      ...conversation,
      member,
      has_unread: (count || 0) > 0,
      unreadCount: count || 0,
      lastMessage,
    });
  })
);

console.log("Result length:", result.length);
result.sort((a, b) => {
  const aTime = a.lastMessage
    ? new Date(a.lastMessage.created_at).getTime()
    : 0;

  const bTime = b.lastMessage
    ? new Date(b.lastMessage.created_at).getTime()
    : 0;

  return bTime - aTime;
});
setConversations(result);
setOnlineCount(
  result.filter((c) => c.member?.is_online).length
);

console.timeEnd("loadConversations");
}


async function loadMessages(conversationId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.log(error);
    return;
  }

  setMessages(data || []);
}

async function sendReply() {
  if (!selectedConversation || !reply.trim()) return;

  const { data, error } = await supabase
    .from("messages")
    .insert({
  conversation_id: selectedConversation.id,
  sender: "admin",
  content: reply,
})
.select()
.single();
console.log("Inserted admin message:", data);

  if (error) {
    console.log(error);
    return;
  }

  setReply("");
  loadMessages(selectedConversation.id);
  loadConversations();
}

  return (
  <div
    style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      background: "#fff",
    }}
  >
    {/* Fixed Header + Counters */}
    <div
      style={{
        flexShrink: 0,
        background: "#fff",
        zIndex: 100,
      }}
    >
      <Header />

      <div style={{ padding: "8px 20px 0" }}>
        <Stats
          onlineCount={onlineCount}
          totalMembers={totalMembers}
          unreadCount={unreadCount}
        />
      </div>

      <div
        style={{
          borderTop: "1px solid #e5e7eb",
          marginTop: "8px",
        }}
      />
    </div>

    {/* Scrollable Conversation List */}
    <div
      style={{
        flex: 1,
        overflowY: "auto",
      }}
    >
      <ConversationList
        conversations={conversations}
      />
    </div>
  </div>
);
}