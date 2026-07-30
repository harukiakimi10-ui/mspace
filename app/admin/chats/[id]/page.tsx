"use client";

import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState, useRef } from "react";

import Messages from "@/app/chat/Messages";
import MessageMenu from "@/app/chat/MessageMenu";
import ReplyPreview from "@/app/chat/ReplyPreview";
import MediaPreview from "@/app/chat/MediaPreview";
import ImageViewer from "@/app/chat/ImageViewer";
import VideoViewer from "@/app/chat/VideoViewer";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";



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

  const [selectedMessage, setSelectedMessage] = useState<any>(null);
const [showMessageMenu, setShowMessageMenu] = useState(false);
const [menuX, setMenuX] = useState(0);
const [menuY, setMenuY] = useState(0);

const [replyMessage, setReplyMessage] = useState<any>(null);
const [replyPreview, setReplyPreview] = useState("");

const fileInputRef = useRef<HTMLInputElement>(null);

const [uploading, setUploading] = useState(false);
const [previewFile, setPreviewFile] = useState<File | null>(null);
const [previewUrl, setPreviewUrl] = useState("");
const [showPreview, setShowPreview] = useState(false);

const [showImageViewer, setShowImageViewer] = useState(false);
const [viewerImage, setViewerImage] = useState("");
const [viewerName, setViewerName] = useState("");

const [showVideoViewer, setShowVideoViewer] = useState(false);
const [viewerVideo, setViewerVideo] = useState("");

const [showEmojiPicker, setShowEmojiPicker] = useState(false);
const [newMessageCount, setNewMessageCount] = useState(0);

  const messagesRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasAutoScrolled = useRef(false);

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

  // Messages
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "messages",
      filter: `conversation_id=eq.${id}`,
    },
    async (payload) => {
      await loadMessages();

      if (
        document.visibilityState === "visible" &&
        document.hasFocus()
      ) {
        await markMessagesAsRead();
      }

      // Badge when a new member message arrives
      if (
        payload.eventType === "INSERT" &&
        (payload.new as any).sender === "member"
      ) {
        const container = messagesRef.current;

        if (container) {
          const isAtBottom =
            container.scrollHeight -
              container.scrollTop -
              container.clientHeight <
            50;

          if (!isAtBottom) {
            setNewMessageCount((count) => count + 1);
          } else {
            setNewMessageCount(0);
          }
        }
      }
    }
  )

  // Member online status
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "members",
    },
    async () => {
      await loadConversation();
    }
  )

  // Conversation updates
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "conversations",
    },
    async () => {
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
  console.error("Admin status error");
  console.log(error);
  console.log(JSON.stringify(error, null, 2));
 }

}
  async function loadMessages() {
    console.log("loadMessages() called");

    const { data } = await supabase
     
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    const el = messagesRef.current;

const wasNearBottom =
  !!el &&
  el.scrollHeight - el.scrollTop - el.clientHeight < 80;

    const visibleMessages =
  (data || []).filter(
    (msg) => msg.deleted_for !== "admin"
  );

setMessages(visibleMessages);

requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    if (!messagesRef.current) return;

    if (wasNearBottom) {
      messagesRef.current.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: "auto",
      });
    }
  });
});

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


async function uploadFile(file: File) {
  if (!id) return;

  setUploading(true);
  let thumbnailUrl: string | null = null;

  try {
    const filePath = `${id}/${Date.now()}-${file.name}`;

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
            `${id}/thumb-${Date.now()}.jpg`;

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
        conversation_id: id,

        sender: "admin", // <-- Change this to admin

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

    await loadMessages();
  } finally {
    setUploading(false);
  }
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
    <Messages
  messages={messages}
  currentUser="admin"
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
    <button
      onClick={() => {
  messagesRef.current?.scrollTo({
    top: messagesRef.current.scrollHeight,
    behavior: "smooth",
  });

  setNewMessageCount(0);
}}
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

  {newMessageCount > 0 && (
    <span
      style={{
        position: "absolute",
        top: -6,
        right: -6,
        minWidth: 20,
        height: 20,
        borderRadius: "50%",
        background: "#000",
        color: "#fff",
        fontSize: 11,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 4px",
      }}
    >
      {newMessageCount}
    </span>
  )}
</button>
  )}
</div>
{/* Input */}

<div
  style={{
    background: "#fff",
    borderTop: "1px solid #ddd",
  }}
>
  <ReplyPreview
    replyMessage={replyMessage}
    replyPreview={replyPreview}
    onCancel={() => {
      setReplyMessage(null);
      setReplyPreview("");
    }}
  />

  <div
    style={{
      display: "flex",
      gap: "10px",
      padding: "15px",
      alignItems: "center",
    }}
  >
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*,video/*"
      hidden
      onChange={(e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setPreviewFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setShowPreview(true);

        e.target.value = "";
      }}
    />

    <button
      onClick={() => fileInputRef.current?.click()}
      disabled={uploading}
      style={{
        width: "45px",
        height: "45px",
        borderRadius: "50%",
        border: "none",
        background: "#eee",
        cursor: "pointer",
        fontSize: "20px",
        marginLeft: "45px",
      }}
    >
      {uploading ? "..." : "📎"}
    </button>

    <button
      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
      style={{
        background: "transparent",
        border: "none",
        fontSize: "24px",
        cursor: "pointer",
        marginRight: "8px",
      }}
    >
      😊
    </button>

    {showEmojiPicker && (
      <div
        style={{
          position: "absolute",
          bottom: "60px",
          left: "0",
          zIndex: 1000,
        }}
      >
        <Picker
          data={data}
          onEmojiSelect={(emoji: any) => {
            setReply((prev) => prev + emoji.native);
          }}
        />
      </div>
    )}

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
        padding: "12px",
        borderRadius: "25px",
        border: "1px solid #ccc",
        outline: "none",
      }}
    />

    <button
      onClick={sendReply}
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
</div>

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
  currentUser="admin"
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

  const { data, error } = await supabase
    .from("messages")
    .update({
      deleted_for: "admin",
    })
    .eq("id", selectedMessage.id)
    .select();

  console.log("Delete for me:", { data, error });

  setShowMessageMenu(false);

  await loadMessages();
}}
  onDeleteForEveryone={async () => {
  if (!selectedMessage) return;

  if (selectedMessage.sender !== "admin") {
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

  await loadMessages();
}}
/>
  </div>
);
}