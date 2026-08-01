
"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useRef, useState } from "react";
import ImageViewer from "./ImageViewer";
import VideoViewer from "./VideoViewer";
import MessageMenu from "./MessageMenu";
import MediaPreview from "./MediaPreview";
import ChatHeader from "./ChatHeader";
import ChatComposer from "./ChatComposer";
import ReplyPreview from "./ReplyPreview";
import Messages from "./Messages";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { Paperclip, Smile, SendHorizontal } from "lucide-react";
import { ChevronDown } from "lucide-react";

export default function ChatPage() {
console.log("MEMBER PAGE LOADED");
  const router = useRouter();
  const supabase = createClient();

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [newMessageCount, setNewMessageCount] = useState(0);

  const [profileName, setProfileName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");

  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isChatActive, setIsChatActive] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [admin, setAdmin] = useState<any>(null);  
  const [conversation, setConversation] = useState<any>(null);

 const quickEmojis = [
  "😀","😁","😂","🤣","😊","😍","🥰","😘",
  "❤️","💜","👍","👌","🙏","👏","🔥","🎉",
  "😭","😎","🤔","😅","🥳","✨","💯","😇",
  "🤩","😉","😋","😜","😢","😡","😴","🤗",
  "➕"
];



const [uploading, setUploading] = useState(false);

const messagesRef = useRef<HTMLDivElement>(null);
const fileInputRef = useRef<HTMLInputElement>(null);
const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
const hasAutoScrolled = useRef(false);
const loadingConversationRef = useRef(false);
const messageInputRef = useRef<HTMLTextAreaElement>(null);

const [previewFile, setPreviewFile] = useState<File | null>(null);
const [previewUrl, setPreviewUrl] = useState("");
const [showPreview, setShowPreview] = useState(false);
const [showImageViewer, setShowImageViewer] = useState(false);
const [viewerImage, setViewerImage] = useState("");
const [viewerName, setViewerName] = useState("");
const [showVideoViewer, setShowVideoViewer] = useState(false);
const [viewerVideo, setViewerVideo] = useState("");
const [selectedMessage, setSelectedMessage] = useState<any>(null);
const [showMessageMenu, setShowMessageMenu] = useState(false);
const [menuX, setMenuX] = useState(0);
const [menuY, setMenuY] = useState(0);
const [replyMessage, setReplyMessage] = useState<any>(null);
const [replyPreview, setReplyPreview] = useState("");
const [showEmojiPicker, setShowEmojiPicker] = useState(false);
const [showFullEmojiPicker, setShowFullEmojiPicker] = useState(false);
  console.log("ADMIN STATE:", admin);

  useEffect(() => {
    console.log("Main useEffect ran");

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

    setConversation(payload.new);
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
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
       
        async () => {
          console.log("Messages table changed");
          
          await loadMessages(conversationId);

          if (showScrollButton) {
          setNewMessageCount((count) => count + 1);
        }

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
.on(
  "postgres_changes",
  {
    event: "UPDATE",
    schema: "public",
    table: "messages",
    filter: `conversation_id=eq.${conversationId}`,
  },
  async () => {
    await loadMessages(conversationId);
  }
)
.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, showScrollButton]);

useEffect(() => {
  if (hasAutoScrolled.current) return;
  if (!messages.length) return;

  const el = messagesRef.current;
  if (!el) return;

  requestAnimationFrame(() => {
    el.scrollTop = el.scrollHeight;
    hasAutoScrolled.current = true;
    setInitialLoad(false);
  });
}, [messages]);

async function loadConversation() {
if (loadingConversationRef.current) return;
loadingConversationRef.current = true;

console.log(">>> loadConversation START");
  const memberId = localStorage.getItem("mspace_member_id");

  if (!memberId) {
  loadingConversationRef.current = false;
  return;
}

  const { data, error } = await supabase
  .from("conversations")
  .select("*")
  .eq("member_id", memberId)
  .order("created_at", { ascending: true })
  .limit(1);

console.log("Query returned:", data);

let conversation = data?.[0];

console.log("Conversation query data:", data);
console.log("Conversation query error:", error);

  if (!conversation) {

  console.log(">>> INSERTING conversation");

  const { data: newConversation } = await supabase
    .from("conversations")
    .insert({
      member_id: memberId,
    })
    .select()
    .single();

  conversation = newConversation;

  console.log(">>> CREATED:", newConversation.id);
}

  if (!conversation) {
  loadingConversationRef.current = false;
  return;
}

  setConversationId(conversation.id);
  setConversation(conversation);
  console.log("Conversation state:", conversation);
 
  setInitialLoad(true);

  await updateOnlineStatus(true);

  await loadMessages(conversation.id);

setTimeout(async () => {
  await markMessagesAsRead(conversation.id);
}, 200);
loadingConversationRef.current = false;
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

function handleMessageInput(
  e: React.ChangeEvent<HTMLTextAreaElement>
) {
  setMessage(e.target.value);

  e.target.style.height = "0px";
  e.target.style.height = `${Math.min(
    e.target.scrollHeight,
    140
  )}px`;

  if (!conversationId) return;

  supabase
    .from("conversations")
    .update({
      member_typing: true,
    })
    .eq(
      "member_id",
      localStorage.getItem("mspace_member_id")
    );

  if (typingTimeout.current) {
    clearTimeout(typingTimeout.current);
  }

  typingTimeout.current = setTimeout(async () => {
    await supabase
      .from("conversations")
      .update({
        member_typing: false,
      })
      .eq(
        "member_id",
        localStorage.getItem("mspace_member_id")
      );
  }, 1000);
}


async function loadMessages(id: string) {
  const { data } = await supabase
    .from("messages")
    .select("*")
.eq("conversation_id", id)
.order("created_at", { ascending: true });

  const filteredMessages = (data || []).filter(
  (msg) => msg.deleted_for !== "member"
);

setMessages(filteredMessages);

  const el = messagesRef.current;

const wasNearBottom =
  el &&
  el.scrollHeight -
    el.scrollTop -
    el.clientHeight <
    80;

setTimeout(() => {
  if (!el) return;

  if (wasNearBottom) {
    el.scrollTop = el.scrollHeight;
  }
}, 0);
}

async function markMessagesAsRead(id: string) {
console.log("markMessagesAsRead called");
  if (
    document.visibilityState !== "visible" ||
    !document.hasFocus()
  ) {
    return;
  }
console.log("Updating messages to read...");
  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("conversation_id", id)
    .eq("sender", "admin")
    .eq("is_read", false);

  await loadMessages(id);
console.log("Finished updating read status");
}


function resetComposer() {
  setMessage("");

  if (messageInputRef.current) {
    messageInputRef.current.style.height = "46px";
  }

  setShowEmojiPicker(false);
  setShowFullEmojiPicker(false);

  setReplyMessage(null);
  setReplyPreview("");
}

function handleFileChange(
  e: React.ChangeEvent<HTMLInputElement>
) {
  const file = e.target.files?.[0];

  if (!file) return;

  setPreviewFile(file);
  setPreviewUrl(URL.createObjectURL(file));
  setShowPreview(true);

  e.target.value = "";
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

      reply_to_id: replyMessage?.id ?? null,

reply_preview:
  replyMessage?.message_type === "text"
    ? replyMessage.content
    : replyMessage?.message_type === "image"
      ? "📷 Photo"
      : replyMessage?.message_type === "video"
        ? "🎥 Video"
        : null,

reply_file_url:
  replyMessage?.message_type === "image" ||
  replyMessage?.message_type === "video"
    ? replyMessage.file_url
    : null,
reply_thumbnail_url:
  replyMessage?.message_type === "video"
    ? replyMessage.reply_thumbnail_url
    : null,
reply_sender: replyMessage?.sender ?? null,

    })
    .select()
    .single();

  if (!data) return;

  resetComposer();
  await loadMessages(conversationId);

  setTimeout(() => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, 50);
}


async function uploadFile(file: File) {
  if (!conversationId) return;

  setUploading(true);
  let thumbnailUrl: string | null = null;
  try {
    const filePath = `${conversationId}/${Date.now()}-${file.name}`;

    console.log("Uploading:", filePath);

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(filePath, file);

    console.log("Storage error:", uploadError);

    if (uploadError) {
      alert(uploadError.message);
      return;
    }

    const { data } = supabase.storage
      .from("photos")
      .getPublicUrl(filePath);

if (file.type.startsWith("video/")) {
  const video = document.createElement("video");

  video.src = URL.createObjectURL(file);
  video.muted = true;

  await new Promise<void>((resolve) => {
    video.onloadeddata = () => {
      video.currentTime = 0.1;
    };

    video.onseeked = () => resolve();
  });

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.drawImage(video, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.8)
    );

    if (blob) {
      const thumbnailPath =
        `${conversationId}/thumb-${Date.now()}.jpg`;

      await supabase.storage
        .from("photos")
        .upload(thumbnailPath, blob);

      const { data: thumb } = supabase.storage
        .from("photos")
        .getPublicUrl(thumbnailPath);

      thumbnailUrl = thumb.publicUrl;
    }
  }

  URL.revokeObjectURL(video.src);
}

    console.log("Public URL:", data.publicUrl);

    const { error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender: "member",
        message_type: file.type.startsWith("image/")
  ? "image"
  : file.type.startsWith("video/")
  ? "video"
  : "file",

content: "",

        file_url: data.publicUrl,
        reply_thumbnail_url: thumbnailUrl,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        is_read: false,
      });

    console.log("Insert error:", error);

    await loadMessages(conversationId);
  } finally {
    setUploading(false);
  }
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

function getEmojiCount(text: string) {
  const trimmed = text.trim();

  if (!trimmed) return 0;

  const emojis = Array.from(
    trimmed.matchAll(
      /\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?/gu
    )
  );

  const emojiText = emojis.map((m) => m[0]).join("");

  if (emojiText !== trimmed.replace(/\s/g, "")) {
    return 0;
  }

  return emojis.length;
}


return (
  <>

<ImageViewer
  open={showImageViewer}
  image={viewerImage}
  name={viewerName}
  onClose={() => setShowImageViewer(false)}
/>

<VideoViewer
  open={showVideoViewer}
  video={viewerVideo}
  onClose={() => setShowVideoViewer(false)}
/>

<MessageMenu
  open={showMessageMenu}
  x={menuX}
  y={menuY}
  selectedMessage={selectedMessage}
  currentUser="member"
  onClose={() => setShowMessageMenu(false)}
  onReply={() => {
    setReplyMessage(selectedMessage);

    if (selectedMessage?.message_type === "text") {
      setReplyPreview(selectedMessage.content);
    } else if (selectedMessage?.message_type === "image") {
      setReplyPreview("📷 Photo");
    } else if (selectedMessage?.message_type === "video") {
      setReplyPreview("🎥 Video");
    }

    setShowMessageMenu(false);
  }}
  onCopy={() => {
    navigator.clipboard.writeText(
      selectedMessage?.content || ""
    );
    setShowMessageMenu(false);
  }}

onDeleteForMe={async () => {
  if (!selectedMessage) return;

  await supabase
    .from("messages")
    .update({
      deleted_for: "member",
    })
    .eq("id", selectedMessage.id);

  setShowMessageMenu(false);

  if (conversationId) {
    await loadMessages(conversationId);
  }
}}
onDeleteForEveryone={async () => {
  if (!selectedMessage) return;

  if (selectedMessage.sender !== "member") {
    setShowMessageMenu(false);
    return;
  }

  await supabase
    .from("messages")
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    })
    .eq("id", selectedMessage.id);

  setShowMessageMenu(false);

  if (conversationId) {
    await loadMessages(conversationId);
  }
}}
/>

<MediaPreview
  open={showPreview}
  previewFile={previewFile}
  previewUrl={previewUrl}
  onCancel={() => {
    setShowPreview(false);
    setPreviewFile(null);
    setPreviewUrl("");
  }}
  onSend={async () => {
    if (!previewFile) return;

    await uploadFile(previewFile);

    setShowPreview(false);
    setPreviewFile(null);
    setPreviewUrl("");
  }}
/>
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
      <ChatHeader
  profileName={profileName}
  profilePhoto={profilePhoto}
  admin={admin}
  conversation={conversation}
  formatLastSeen={formatLastSeen}
  onBack={() => router.push("/members")}
/>

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
      if (distanceFromBottom <= 80) {
  setNewMessageCount(0);
}
    }}
    style={{
  height: "100%",
  overflowY: "auto",
  padding: "20px 10px 90px",
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
<Messages
  messages={messages}
  currentUser="member"
  profileName={profileName}
  formatTime={formatTime}
  formatDateLabel={formatDateLabel}
  isNewDay={isNewDay}
  setViewerImage={setViewerImage}
  setViewerName={setViewerName}
  setShowImageViewer={setShowImageViewer}
  setViewerVideo={setViewerVideo}
  setShowVideoViewer={setShowVideoViewer}
  setSelectedMessage={setSelectedMessage}
  setMenuX={setMenuX}
  setMenuY={setMenuY}
  setShowMessageMenu={setShowMessageMenu}
/>
  </div>

  {showScrollButton && (
<div
  style={{
    position: "absolute",
    right: 20,
    bottom: 20,
    zIndex: 100,
  }}
>
    <button
  onClick={() =>
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    })
  }
  style={{
    position: "relative",

    width: 36,
    height: 36,

    borderRadius: "50%",

    border: "1px solid rgba(255,255,255,.35)",

    background:
      "linear-gradient(135deg,#ffffff,#f3f4f6)",

    backdropFilter: "blur(14px)",

    cursor: "pointer",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    boxShadow:
       "0 6px 18px rgba(0,0,0,.16)",

    transition: "all .2s ease",

    zIndex: 100,
  }}
>
  <ChevronDown
  size={20}
  strokeWidth={2.8}
  color="#444"
/>

  {newMessageCount > 0 && (
    <span
      style={{
        position: "absolute",
        top: -4,
        right: -4,

        minWidth: 22,
        height: 22,

        borderRadius: "50%",

        background:
          "linear-gradient(135deg,#7c3aed,#9333ea)",

        color: "#fff",

        fontSize: 11,
        fontWeight: 700,

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        border: "2px solid white",

        boxShadow:
          "0 4px 12px rgba(124,58,237,.35)",

        padding: "0 5px",
      }}
    >
      {newMessageCount}
    </span>
  )}
</button>
</div>
)}
</div>



      {/* Input */}

      <ChatComposer
  message={message}
  setMessage={setMessage}

  currentUser="member"
profileName={profileName}

  replyMessage={replyMessage}
  replyPreview={replyPreview}
  onCancelReply={() => {
    setReplyMessage(null);
    setReplyPreview("");
  }}

  quickEmojis={quickEmojis}

  showQuickEmoji={showEmojiPicker}
  setShowQuickEmoji={setShowEmojiPicker}

  showEmojiPicker={showEmojiPicker}
  setShowEmojiPicker={setShowEmojiPicker}

  showFullEmojiPicker={showFullEmojiPicker}
  setShowFullEmojiPicker={setShowFullEmojiPicker}

  messageInputRef={messageInputRef}

  sendMessage={sendMessage}

  onAttach={() => fileInputRef.current?.click()}
  uploading={uploading}

  fileInputRef={fileInputRef}
  onFileChange={handleFileChange}

  onInput={handleMessageInput}
  onKeyDown={() => {}}
/>
   </main>
</>
);
}