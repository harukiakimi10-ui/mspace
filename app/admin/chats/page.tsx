"use client";

import Header from "./components/Header";
import Stats from "./components/Stats";
import ConversationList from "./components/ConversationList";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function AdminChatsPage() {

const onlineCount = 0;
const totalMembers = 0;
const unreadCount = 0;

const [conversations, setConversations] = useState<any[]>([]);
const [selectedConversation, setSelectedConversation] = useState<any>(null);
const [messages, setMessages] = useState<any[]>([]);
const [reply, setReply] = useState("");


const supabase = createClient();

useEffect(() => {
  loadConversations();
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
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.log(error);
    return;
  }

console.log("Supabase conversations:", data);
console.log("Supabase error:", error);

  const result = [];

for (const conversation of data || []) {
  const { data: member } = await supabase
    .from("members")
    .select("name, photo_url")
    .eq("member_id", conversation.member_id)
    .single();

  result.push({
    ...conversation,
    member,
  });
}

setConversations(result);
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
}

  return (
  <>
    <Header />

    <div style={{ padding: "30px" }}>
      <Stats
        onlineCount={onlineCount}
        totalMembers={totalMembers}
        unreadCount={unreadCount}
      />

    <div
  style={{
    borderTop: "1px solid #e5e7eb",
    marginTop: "24px",
    marginBottom: "24px",
  }}
/>

      <div
        style={{
          display: "flex",
          marginTop: "20px",
        }}
      >
  <ConversationList
  conversations={conversations}
/>
   
      </div>
    </div>
  </>
);
}