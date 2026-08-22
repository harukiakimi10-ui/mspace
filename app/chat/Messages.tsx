"use client";
import { Fragment, useState, useEffect, useRef } from "react";
import LocationMessage from "./LocationMessage";
import {
  Video,
  Camera,
  Play,
  Pause,
  Mic,
  MapPin
} from "lucide-react";
import VoiceMessage from "./VoiceMessage";
import VideoMessage from "./VideoMessage";

import LocationThumbnail from "./LocationThumbnail";



type MessagesProps = {
  messages: any[];

  currentUser: "member" | "admin";

  profileName: string;
  playMenuSound: (unlockOnly?: boolean) => void;

  formatTime: (date: string) => string;
  formatDateLabel: (date: string) => string;
  isNewDay: (current: any, previous: any) => boolean;

  setViewerImage: (url: string) => void;
  setViewerName: (name: string) => void;
  setShowImageViewer: (open: boolean) => void;

  setViewerVideo: (url: string) => void;
  setShowVideoViewer: (open: boolean) => void;

  setSelectedMessage: (msg: any) => void;
  selectedMessage: any;

  setMenuX: (x: number) => void;
  setMenuY: (y: number) => void;
  setShowMessageMenu: (open: boolean) => void;

setShowComposer: (open: boolean) => void;

messageFocus: boolean;
setMessageFocus: (open: boolean) => void;

onCancelUpload: (uploadId: string) => void;
};

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

const language =
  typeof navigator !== "undefined" &&
  navigator.language.startsWith("zh")
    ? "zh"
    : "en";

    const t = {
  en: {
    today: "Today",
    youDeleted: "You deleted this message",
    messageDeleted: "This message was deleted",
    location: "Location",
    video: "Video",
    photo: "Photo",
    voiceMessage: "Voice message",
    showLess: "Show less",
    loadMore: "Load more",
    reply: "Reply",
    sticker: "Sticker",
    profile: "Profile",
    you: "You",
    cancelUpload: "Cancel upload",
    cancelVideoUpload: "Cancel video upload",
  },

  zh: {
    today: "今天",
    youDeleted: "你删除了这条消息",
    messageDeleted: "此消息已删除",
    location: "位置",
    video: "视频",
    photo: "照片",
    voiceMessage: "语音消息",
    showLess: "收起",
    loadMore: "加载更多",
    reply: "回复",
    sticker: "贴纸",
    profile: "个人资料",
    you: "你",
    cancelUpload: "取消上传",
    cancelVideoUpload: "取消视频上传",
  },
}[language];

export default function Messages({
  messages,
  currentUser,
  profileName,
  playMenuSound,
  formatTime,
  formatDateLabel,
  isNewDay,
  setViewerImage,
  setViewerName,
  setShowImageViewer,
  setViewerVideo,
  setShowVideoViewer,
  setSelectedMessage,
  selectedMessage,
  setMenuX,
  setMenuY,
  setShowMessageMenu,
  setShowComposer,

messageFocus,
setMessageFocus,

onCancelUpload,
}: MessagesProps) {

  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(
  new Set()
);

const [messageFocusOffset, setMessageFocusOffset] = useState(0);
const menuAudioContextRef = useRef<AudioContext | null>(null);
const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

const unlockMenuAudio = () => {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as any).webkitAudioContext;

    if (!AudioContextClass) return;

    if (!menuAudioContextRef.current) {
      menuAudioContextRef.current =
        new AudioContextClass();
    }

    const audioContext =
      menuAudioContextRef.current;

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    // Tiny silent sound to unlock audio on Safari/iPhone
    const oscillator =
      audioContext.createOscillator();

    const gain =
      audioContext.createGain();

    gain.gain.setValueAtTime(
      0.0001,
      audioContext.currentTime
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();

    oscillator.stop(
      audioContext.currentTime + 0.01
    );
  } catch {}
};

const calculateMessageFocus = (
  msg: any,
  messageElement: HTMLElement
) => {
  const rect = messageElement.getBoundingClientRect();

  const menuWidth = 190;

  const messageType = msg.message_type;

  const isText = messageType === "text";

  const isSaveable =
    messageType === "image" ||
    messageType === "video" ||
    messageType === "voice";

  const isMine = msg.sender === currentUser;

  const itemCount =
    2 +
    (isText ? 1 : 0) +
    (isSaveable ? 1 : 0) +
    (isMine ? 1 : 0);

  const menuHeight =
    itemCount * 56 + 16;

  const menuGap = 8;

  // Total height of selected message + menu
  const groupHeight =
    rect.height +
    menuGap +
    menuHeight;

  // Center the entire message + menu group
  // in the visible screen.
  const targetGroupTop =
    (window.innerHeight - groupHeight) / 2;

  // Positive = move message UP
  // Negative = move message DOWN
  const offset =
    rect.top - targetGroupTop;

  setMessageFocusOffset(offset);

  // Keep the menu attached to the actual message.
// Do not use the old message-focus offset.
const screenPadding = 12;

// Estimate the menu height


const viewportHeight = window.innerHeight;
const viewportWidth = window.innerWidth;

// Try below the selected message first
let menuTop = rect.bottom + menuGap;

// If the menu would go below the screen,
// place it above the selected message.
if (
  menuTop + menuHeight >
  viewportHeight - screenPadding
) {
  menuTop =
    rect.top - menuHeight - menuGap;
}

// Make sure it never goes above the screen.
menuTop = Math.max(
  screenPadding,
  menuTop
);

// Horizontal position
let menuLeft = isMine
  ? rect.right - menuWidth
  : rect.left;

// Keep the menu inside the screen horizontally.
menuLeft = Math.max(
  screenPadding,
  Math.min(
    menuLeft,
    viewportWidth - menuWidth - screenPadding
  )
);

setMenuX(menuLeft);
setMenuY(menuTop);
};

const formatDate = (date: string) => {
  const d = new Date(date);
  const today = new Date();

  if (d.toDateString() === today.toDateString()) {
  return t.today;
}

  return d.toLocaleDateString();
};

const handleMessageLongPress = (
  msg: any,
  messageElement: HTMLElement
) => {
  setSelectedMessage(msg);
  setMessageFocus(true);
  setShowComposer(false);

  requestAnimationFrame(() => {
    calculateMessageFocus(
      msg,
      messageElement
    );

    setMessageFocus(true);
    setShowMessageMenu(true);
  });
};

const scrollToRepliedMessage = (msg: any) => {
  if (!msg?.reply_to_id) return;

  const target = messageRefs.current[msg.reply_to_id];

  if (!target) {
    console.log(
      "Original replied message not found:",
      msg.reply_to_id
    );
    return;
  }

  target.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  // Temporarily highlight the original message
  target.style.transition =
    "background 0.2s ease, box-shadow 0.2s ease";

  target.style.background =
    "rgba(109, 40, 217, 0.12)";

  target.style.boxShadow =
    "0 0 0 3px rgba(109, 40, 217, 0.35)";

  setTimeout(() => {
    target.style.background = "";
    target.style.boxShadow = "";
  }, 1200);
};

  return (
    <>
      {messages.map((msg, index) => {

        const displayProgress = Math.min(
  msg.progress ?? 0,
  95
);

        const isReplyVideo =
  msg.reply_preview?.toLowerCase().includes("video");

const isReplySticker =
  msg.reply_preview?.toLowerCase().includes("sticker");

const isReplyVoice =
  msg.reply_preview?.toLowerCase().includes("voice");

const isReplyLocation =
  msg.reply_message_type === "location";

  const previous = index > 0 ? messages[index - 1] : null;

  const emojiCount = getEmojiCount(msg.content || "");

 const isLongMessage =
  msg.message_type === "text" &&
  (msg.content || "").length > 500;

const isExpanded = expandedMessages.has(msg.id);

const isFocused =
  messageFocus && selectedMessage?.id === msg.id;

const isDeleted = msg.is_deleted === true;

const isStickerReply =
  msg.message_type === "sticker" && !!msg.reply_preview;

  const getLocationCoordinates = () => {
  try {
    const url = new URL(msg.reply_file_url);
    const q = url.searchParams.get("q");

    if (!q) return null;

    const [lat, lng] = q.split(",").map(Number);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }

    return {
      latitude: lat,
      longitude: lng,
    };
  } catch {
    return null;
  }
};

const locationCoordinates = isReplyLocation
  ? getLocationCoordinates()
  : null;

  return (
  <Fragment key={msg.id}>
    {(index === 0 ||
      new Date(previous?.created_at).toDateString() !==
        new Date(msg.created_at).toDateString()) && (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          margin: "12px 0",
        }}
      >
        <span
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
        </span>
      </div>
    )}

   <div
  key={msg.id}
  ref={(el) => {
    messageRefs.current[msg.id] = el;
  }}

  onContextMenu={(e) => {
    e.preventDefault();
    e.stopPropagation();

    setSelectedMessage(msg);
    setMessageFocus(true);

    const messageElement = e.currentTarget as HTMLElement;

    requestAnimationFrame(() => {
  calculateMessageFocus(
    msg,
    messageElement
  );

  setMessageFocus(true);
  setShowMessageMenu(true);
});
  }}

  style={{
    display: "flex",
    justifyContent:
      msg.sender === currentUser
        ? "flex-end"
        : "flex-start",
    padding: "6px 0px",

    position: "relative",

    WebkitTouchCallout: "none",
    WebkitUserSelect: "none",
    userSelect: "none",

    zIndex: isFocused ? 6000 : 1,

    filter: "none",

    opacity: 1,

    transition:
      "filter 0.2s ease, opacity 0.2s ease, transform 0.2s ease",
    

  willChange: "auto", 

    
  transform: "translate3d(0, 0, 0)",
  }}
>
          <div
    style={{
  maxWidth:
  msg.message_type === "location"
    ? "390px"
    : "70%",

width: "fit-content",
  

  padding:
  isDeleted
    ? "12px 10px 8px 10px"
    : (
        msg.message_type === "image" ||
        msg.message_type === "video" ||
        msg.message_type === "sticker" ||
        msg.message_type === "location"
      ) && !msg.reply_preview
    ? "0"
    : emojiCount === 1 && !msg.reply_preview
    ? "0"
    : "12px 10px 4px 10px",

  borderRadius:
  isDeleted
    ? msg.sender === currentUser
      ? "18px 18px 4px 18px"
      : "18px 18px 18px 4px"
    : (
        msg.message_type === "image" ||
        msg.message_type === "video" ||
        msg.message_type === "sticker" ||
        msg.message_type === "location"
      ) && !msg.reply_preview
    ? 0
    : emojiCount === 1 && !msg.reply_preview
    ? 0
    : msg.sender === currentUser
    ? "18px 18px 4px 18px"
    : "18px 18px 18px 4px",

  background:
  isDeleted
    ? msg.sender === currentUser
      ? "#6d28d9"
      : "#ffffff"
    : (
        msg.message_type === "image" ||
        msg.message_type === "video" ||
        msg.message_type === "sticker" ||
        msg.message_type === "location"
      ) && !msg.reply_preview
    ? "transparent"
    : emojiCount === 1 && !msg.reply_preview
    ? "transparent"
    : msg.sender === currentUser
    ? "#6d28d9"
    : "#ffffff",

  color:
    msg.sender === currentUser
      ? "#ffffff"
      : "#111111",

  boxShadow:
  isFocused
    ? "0 0 0 3px rgba(124,58,237,0.45), 0 8px 25px rgba(124,58,237,0.25)"
    : isDeleted
    ? "0 2px 8px rgba(0,0,0,.08)"
    : (
        msg.message_type === "image" ||
        msg.message_type === "video" ||
        msg.message_type === "sticker" ||
        msg.message_type === "location"
      ) && !msg.reply_preview
    ? "none"
    : emojiCount === 1 && !msg.reply_preview
    ? "none"
    : "0 2px 8px rgba(0,0,0,.08)",

  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
}}
     

onTouchStart={(e) => {
  const messageElement =
    e.currentTarget as HTMLElement;

  playMenuSound(true);

  const timer = setTimeout(() => {
  playMenuSound();

  if ("vibrate" in navigator) {
    navigator.vibrate(15);
  }

  setSelectedMessage(msg);
  setMessageFocus(true);
  setShowComposer(false);

  requestAnimationFrame(() => {
      calculateMessageFocus(
        msg,
        messageElement
      );

      setMessageFocus(true);
      setShowMessageMenu(true);
    });

  }, 500);

  (e.currentTarget as any)._pressTimer =
    timer;
}}

onTouchEnd={(e) => {
  clearTimeout(
    (e.currentTarget as any)._pressTimer
  );
}}

onTouchMove={(e) => {
  // Allow small natural finger movement
}}


>
{isDeleted ? (
  <div
    style={{
      fontStyle: "italic",
      color:
        msg.sender === currentUser
          ? "rgba(255,255,255,0.75)"
          : "#666",
      fontSize: "14px",
      paddingBottom: "2px",
    }}
  >
    {msg.sender === currentUser
  ? `🗑 ${t.youDeleted}`
  : `🗑 ${t.messageDeleted}`}
  </div>
) : (
  <>
   {msg.reply_preview && (
     <div
  onClick={(e) => {
    e.stopPropagation();
    scrollToRepliedMessage(msg);
  }}
  style={{
    borderLeft: "4px solid #a78bfa",
         background:
  msg.sender === currentUser
    ? "rgba(255,255,255,0.12)"
    : "#f3f4f6",
         padding: "12px 14px",
         borderRadius: "8px",
         marginBottom: "8px",
       }}
     >
       {msg.reply_file_url && !isReplyVoice? (

        <>

       <div
  style={{
    color: "#a78bfa",
    fontWeight: 700,
    fontSize: "12px",
    marginBottom: 6,
  }}
>
  {msg.reply_sender === currentUser ? t.you : profileName}
</div>


         <div
           style={{
             display: "flex",
             alignItems: "center",
             gap: "10px",
           }}
         >
         {isReplyLocation ? (
  <div
    style={{
      position: "relative",
      width: "48px",
      height: "48px",
      flexShrink: 0,
      borderRadius: "8px",
      overflow: "hidden",
      background: "#e9e3f7",
    }}
  >
    {locationCoordinates ? (
  <LocationThumbnail
    latitude={locationCoordinates.latitude}
    longitude={locationCoordinates.longitude}
  />
) : (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f0eaff",
        }}
      >
        <MapPin
          size={24}
          strokeWidth={2.4}
          color="#6d28d9"
        />
      </div>
    )}
  </div>

) : isReplyVideo ? (
  <div
    style={{
      position: "relative",
      width: "48px",
      height: "48px",
      flexShrink: 0,
    }}
  >
    <img
      src={msg.reply_thumbnail_url}
      alt="Reply"
      style={{
        width: "48px",
        height: "48px",
        borderRadius: "8px",
        objectFit: "cover",
      }}
    />
  </div>
) : isReplySticker ? (
  <div
    style={{
      width: "48px",
      height: "48px",
      flexShrink: 0,
    }}
  >
    <img
      src={msg.reply_file_url}
      alt="Sticker"
      style={{
        width: "48px",
        height: "48px",
        objectFit: "contain",
        display: "block",
      }}
    />
  </div>
) : (
  <div
    style={{
      position: "relative",
      width: "48px",
      height: "48px",
      flexShrink: 0,
    }}
  >
    <img
      src={msg.reply_file_url}
      alt="Reply"
      style={{
        width: "48px",
        height: "48px",
        borderRadius: "8px",
        objectFit: "cover",
      }}
    />
  </div>
)}
           <div>
             <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontWeight: 600,
    fontSize: "13px",
    color:
  msg.sender === currentUser
    ? "#ffffff"
    : "#444",
  }}
>
  {isReplyLocation ? (
  <>
    <MapPin
      size={16}
      strokeWidth={2.2}
      
    />
    <span>{t.location}</span>
  </>
) : msg.reply_preview === "🎥 Video" ? (
  <>
    <Video
      size={16}
      strokeWidth={2.2}
    />
    <span>{t.video}</span>
  </>
) : isReplySticker ? null : (
  <>
    <Camera
      size={16}
      strokeWidth={2.2}
    />
    <span>{t.photo}</span>
  </>
)}
</div>
           </div>
         </div>
         </>
       ) : (
         <div>
  <div
    style={{
      color: "#a78bfa",
      fontWeight: 700,
      fontSize: "12px",
      marginBottom: 2,
    }}
  >
    {msg.reply_sender === currentUser ? t.you : profileName}
  </div>

  <div
    style={{
      fontSize: "12px",
      lineHeight: 1.3,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    }}
  >
    {msg.reply_preview === "🎤 Voice" ||
msg.reply_preview === "🎤 Voice message" ? (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
    }}
  >
    <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 6,
  }}
>
  <Mic
    size={15}
    strokeWidth={2.2}
  />

  <span>{t.voiceMessage}</span>
</div>

    <span
      style={{
        fontSize: "11px",
        opacity: 0.75,
        fontWeight: 500,
      }}
    >
      {msg.reply_file_duration != null
  ? `${Math.floor(msg.reply_file_duration / 60)}:${String(
      Math.floor(msg.reply_file_duration % 60)
    ).padStart(2, "0")}`
  : ""}
    </span>
  </div>
) : (
  msg.reply_preview
)}
  </div>
</div>
       )}
     </div>
   )}


   {msg.message_type === "text" && (
  <div
    style={{
      ...(msg.is_deleted
        ? {
            fontStyle: "italic",
            color:
              msg.sender === currentUser
                ? "rgba(255,255,255,0.75)"
                : "#666",
          }
        : {}),
      textAlign: "left",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      overflowWrap: "break-word",
      letterSpacing: "normal",
      wordSpacing: "normal",
    }}
  >
    {msg.is_deleted
  ? msg.sender === currentUser
    ? `🗑 ${t.youDeleted}`
    : `🗑 ${t.messageDeleted}`
      : (
  <div
  style={{
    display: "inline",
  }}
>
  <div
  style={{
    display: "inline-flex",
    flexDirection: "column",
    alignItems:  
      msg.sender === currentUser
        ? "flex-end"
        : "flex-start",
        
  }}
>
  {msg.message_type !== "location" && (
  <span
    style={{
      fontSize:
        emojiCount === 1
          ? "60px"
          : emojiCount === 2
          ? "42px"
          : emojiCount === 3
          ? "36px"
          : emojiCount === 4
          ? "30px"
          : "inherit",

      lineHeight: 1.2,
      display: "inline",
    }}
  >
    {isLongMessage && !isExpanded
      ? `${msg.content.slice(0, 500)}…`
      : msg.content}
  </span>
)}

  {isLongMessage && (
  <button
    type="button"
    onClick={() => {
      setExpandedMessages((prev) => {
        const next = new Set(prev);

        if (next.has(msg.id)) {
          next.delete(msg.id);
        } else {
          next.add(msg.id);
        }

        return next;
      });
    }}
    style={{
      marginTop: 6,
      padding: "3px 0",
      border: "none",
      background: "transparent",
      color:
        msg.sender === currentUser
          ? "#ddd6fe"
          : "#6d28d9",
      fontSize: 12,
      fontWeight: 700,
      cursor: "pointer",
      alignSelf:
        msg.sender === currentUser
          ? "flex-end"
          : "flex-start",
    }}
  >
    {isExpanded ? t.showLess : t.loadMore}
  </button>
)}

  {emojiCount > 0 && (
    <div
      style={{
        marginTop: 2,
        padding: "3px 8px",
        borderRadius: 12,

        background:
          msg.sender === currentUser
            ? "#6d28d9"
            : "#ffffff",

        boxShadow: "0 1px 4px rgba(0,0,0,.12)",

        display: "flex",
        alignItems: "center",
        gap: 3,

        fontSize: 11,

        color:
          msg.sender === currentUser
            ? "rgba(255,255,255,.82)"
            : "#667781",
      }}
    >
      <span>{formatTime(msg.created_at)}</span>

      {msg.sender === currentUser && (
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
  )}
</div>

  {emojiCount === 0 && (
  <div
    style={{
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "flex-end",
      gap: 3,

      marginTop: 2,
      marginBottom: -2,

      fontSize: 11,
      lineHeight: 1,

      color:
        msg.sender === currentUser
          ? "rgba(255,255,255,.75)"
          : "#667781",
    }}
  >
    <span>{formatTime(msg.created_at)}</span>

    {msg.sender === currentUser && (
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
)}
</div>
)}
  </div>
)}

{msg.message_type === "sticker" && (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: isStickerReply
  ? "center"
  : msg.sender === currentUser
  ? "flex-end"
  : "flex-start",
      background: "transparent",
      width: isStickerReply ? "100%" : "auto",
    }}
  >
    {/* STICKER */}
    <img
  src={msg.file_url}
  alt="Sticker"
  draggable={false}
  style={{
    width: "auto",
    height: "160px",
    display: "block",
    background: "transparent",
    border: "none",
    boxShadow: "none",

    WebkitTouchCallout: "none",
    pointerEvents: "none",
    WebkitUserSelect: "none",
    userSelect: "none",
  }}
/>

    {/* TIMESTAMP */}
    <div
      style={{
        marginTop: 2,
        padding: "3px 8px",
        borderRadius: 12,

        background:
          msg.sender === currentUser
            ? "#6d28d9"
            : "#ffffff",

        boxShadow: "0 1px 4px rgba(0,0,0,.12)",

        display: "flex",
        alignItems: "center",

        justifyContent:
          isStickerReply
            ? "flex-end"
            : msg.sender === currentUser
            ? "flex-end"
            : "flex-start",

        gap: 3,

        fontSize: 11,

        color:
          msg.sender === currentUser
            ? "rgba(255,255,255,.82)"
            : "#667781",

        width: isStickerReply ? "100%" : "auto",
        boxSizing: "border-box",
      }}
    >
      <span>{formatTime(msg.created_at)}</span>

      {msg.sender === currentUser && (
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
)}

{msg.message_type === "image" && (
  <div
    style={{
      position: "relative",
      display: "inline-block",
    }}
  >
    <img
      src={msg.file_url}
      alt={t.photo}
      onClick={() => {
        setViewerImage(msg.file_url);
        setViewerName(msg.file_name || t.photo);
        setShowImageViewer(true);
      }}
      style={{
  width: "250px",
  height: "320px",
  display: "block",
  borderRadius: "16px",
  objectFit: "cover",
  cursor: "pointer",
  background: "#000",

  WebkitTouchCallout: "none",
  pointerEvents: "auto",
  WebkitUserSelect: "none",
  userSelect: "none",
}}
    />

{msg.uploading && (
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        <button
          type="button"
          aria-label={t.cancelUpload}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            if (msg.upload_id) {
              onCancelUpload(msg.upload_id);
            }
          }}
          style={{
            position: "relative",
            width: "58px",
            height: "58px",
            borderRadius: "50%",
            border: "none",
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            cursor: "pointer",
            pointerEvents: "auto",
          }}
        >
          {/* Progress ring */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: `conic-gradient(
                #ffffff ${displayProgress * 3.6}deg,
                rgba(255,255,255,0.25) 0deg
              )`,
              WebkitMask:
                "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 0)",
              mask:
                "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 0)",
            }}
          />

          {/* X */}
          <span
            style={{
              position: "relative",
              color: "#ffffff",
              fontSize: "25px",
              fontWeight: 300,
              lineHeight: 1,
            }}
          >
            ×
          </span>
        </button>
      </div>
    )}

    <div
      style={{
        position: "absolute",
        right: 8,
        bottom: 8,
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 6px",
        borderRadius: "12px",
        background: "rgba(0,0,0,.45)",
        color: "#fff",
        fontSize: "11px",
        fontWeight: 500,
      }}
    >
      <span>{formatTime(msg.created_at)}</span>

      {msg.sender === currentUser && (
        <span
          style={{
            color: msg.is_read ? "#53bdeb" : "#ffffff",
          }}
        >
          {msg.is_read ? "✓✓" : "✓"}
        </span>
      )}
    </div>
  </div>
)}

{msg.message_type === "video" && (
  msg.uploading ? (
    <div
      style={{
        position: "relative",
        width: "250px",
        height: "320px",
        overflow: "hidden",
        borderRadius: "16px",
        background: "#000",
      }}
    >
      {/* TEMPORARY VIDEO THUMBNAIL */}

      <video
  src={msg.file_url}
  muted
  playsInline
  preload="metadata"
  ref={(video) => {
    if (video) {
      video.pause();

      if (video.readyState >= 2) {
        video.currentTime = 0;
      }
    }
  }}
  onLoadedMetadata={(e) => {
    const video = e.currentTarget;

    video.pause();
    video.currentTime = 0;
  }}
  onLoadedData={(e) => {
    const video = e.currentTarget;

    video.pause();
    video.currentTime = 0;
  }}
  style={{
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    background: "#000",
    pointerEvents: "none",
  }}
/>

      {/* UPLOAD RING */}

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <button
          type="button"
          aria-label={t.cancelVideoUpload}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            if (msg.upload_id) {
              onCancelUpload(msg.upload_id);
            }
          }}
          style={{
            position: "relative",
            width: "58px",
            height: "58px",
            borderRadius: "50%",
            border: "none",
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            cursor: "pointer",
            pointerEvents: "auto",
          }}
        >
          {/* PROGRESS RING */}

          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: `conic-gradient(
  #ffffff ${displayProgress * 3.6}deg,
  rgba(255,255,255,0.25) 0deg
)`,
              WebkitMask:
                "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 0)",
              mask:
                "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 0)",
            }}
          />

          {/* CANCEL */}

          <span
            style={{
              position: "relative",
              color: "#ffffff",
              fontSize: "25px",
              fontWeight: 300,
              lineHeight: 1,
            }}
          >
            ×
          </span>
        </button>
      </div>

      {/* TIMESTAMP */}

      <div
        style={{
          position: "absolute",
          right: 8,
          bottom: 8,
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "2px 6px",
          borderRadius: "12px",
          background: "rgba(0,0,0,.45)",
          color: "#fff",
          fontSize: "11px",
          fontWeight: 500,
          pointerEvents: "none",
        }}
      >
        <span>{formatTime(msg.created_at)}</span>
      </div>
    </div>
  ) : (
    <VideoMessage
      msg={msg}
      currentUser={currentUser}
      formatTime={formatTime}
      onOpen={() => {
        setViewerVideo(msg.file_url);
        setShowVideoViewer(true);
      }}
      onClose={() => {
        setShowVideoViewer(false);
      }}
    />
  )
)}


{msg.message_type === "voice" && (
  <VoiceMessage
    msg={msg}
    currentUser={currentUser}
    formatTime={formatTime}
  />
)}

{msg.message_type === "location" && (
  <LocationMessage
    msg={msg}
    currentUser={currentUser}
    formatTime={formatTime}
    onLongPress={handleMessageLongPress}
  />
)}
  </>
)}
          


          </div>
        </div>
      </Fragment>
    );
})}
    </>
  );
}