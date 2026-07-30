"use client";

import { Fragment } from "react";

type MessagesProps = {
  messages: any[];

  currentUser: "member" | "admin";

  formatTime: (date: string) => string;
  formatDateLabel: (date: string) => string;
  isNewDay: (current: any, previous: any) => boolean;

  setViewerImage: (url: string) => void;
  setViewerName: (name: string) => void;
  setShowImageViewer: (open: boolean) => void;

  setViewerVideo: (url: string) => void;
  setShowVideoViewer: (open: boolean) => void;

  setSelectedMessage: (msg: any) => void;
  setMenuX: (x: number) => void;
  setMenuY: (y: number) => void;
  setShowMessageMenu: (open: boolean) => void;
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
export default function Messages({
  messages,
  currentUser,
  formatTime,
  formatDateLabel,
  isNewDay,
  setViewerImage,
  setViewerName,
  setShowImageViewer,
  setViewerVideo,
  setShowVideoViewer,
  setSelectedMessage,
  setMenuX,
  setMenuY,
  setShowMessageMenu,
}: MessagesProps) {

const formatDate = (date: string) => {
  const d = new Date(date);
  const today = new Date();

  if (d.toDateString() === today.toDateString()) {
    return "Today";
  }

  return d.toLocaleDateString();
};

  return (
    <>
      {messages.map((msg, index) => {
  const previous = index > 0 ? messages[index - 1] : null;

  const emojiCount = getEmojiCount(msg.content || "");

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
          style={{
            display: "flex",
          justifyContent:
              msg.sender === currentUser
               ? "flex-end"
              : "flex-start",
            padding: "6px 12px",
          }}
        >
          <div
            style={{
              maxWidth: "75%",
              padding: emojiCount === 1 ? "0" : "10px 14px",
              borderRadius:
  emojiCount === 1
    ? 0
    : msg.sender === currentUser
    ? "18px 18px 4px 18px"
    : "18px 18px 18px 4px",
              background:
  emojiCount === 1
    ? "transparent"
    : msg.sender === currentUser
    ? "#6d28d9"
    : "#ffffff",
               
              color:
              msg.sender === currentUser
                  ? "#ffffff"
                  : "#111111",
              boxShadow:
  emojiCount === 1
    ? "none"
    : "0 2px 8px rgba(0,0,0,.08)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}

     onContextMenu={(e) => {
  e.preventDefault();
  setSelectedMessage(msg);
  setMenuX(e.clientX);
  setMenuY(e.clientY);
  setShowMessageMenu(true);
}}

onTouchStart={(e) => {
  const touch = e.touches[0];

  const timer = setTimeout(() => {
    setSelectedMessage(msg);
    setMenuX(touch.clientX);
    setMenuY(touch.clientY);
    setShowMessageMenu(true);
  }, 500);

  (e.currentTarget as any)._pressTimer = timer;
}}

onTouchEnd={(e) => {
  clearTimeout((e.currentTarget as any)._pressTimer);
}}

onTouchMove={(e) => {
  clearTimeout((e.currentTarget as any)._pressTimer);
}}


         >
   {msg.reply_preview && (
     <div
       style={{
         borderLeft: "4px solid #a78bfa",
         background:
           msg.sender === "member"
             ? "rgba(255,255,255,0.12)"
             : "#f3f4f6",
         padding: "8px 10px",
         borderRadius: "8px",
         marginBottom: "8px",
       }}
     >
       {msg.reply_file_url ? (
         <div
           style={{
             display: "flex",
             alignItems: "center",
             gap: "10px",
           }}
         >
           <div
             style={{
               position: "relative",
               width: "48px",
               height: "48px",
               flexShrink: 0,
             }}
           >
             <img
               src={
                 msg.reply_preview === "🎥 Video"
                   ? msg.reply_thumbnail_url
                   : msg.reply_file_url
               }
               alt="Reply"
               style={{
                 width: "48px",
                 height: "48px",
                 borderRadius: "8px",
                 objectFit: "cover",
               }}
             />
           </div>

           <div>
             <div
               style={{
                 fontWeight: 600,
                 fontSize: "13px",
               }}
             >
               {msg.reply_preview === "🎥 Video"
                 ? "🎥 Video"
                 : "🖼️ Photo"}
             </div>
           </div>
         </div>
       ) : (
         <div
           style={{
             fontSize: "12px",
             lineHeight: 1.3,
             whiteSpace: "nowrap",
             overflow: "hidden",
             textOverflow: "ellipsis",
           }}
         >
           {msg.reply_preview}
         </div>
       )}
     </div>
   )}


   {msg.message_type === "text" && (
  <div
    style={
  msg.is_deleted
    ? {
        fontStyle: "italic",
        color:
           msg.sender === currentUser
    ? "rgba(255,255,255,0.75)"
    : "#666",
            
      }
    : {}
}
  >
    {msg.is_deleted
  ? msg.sender === currentUser
    ? "🗑 You deleted this message"
    : "🗑 This message was deleted"
      : (
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
  lineHeight: 1,
  fontFamily:
    '"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji",sans-serif',
  fontWeight: "normal",
  letterSpacing: 0,
  textRendering: "geometricPrecision",
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
}}
>
  {msg.content}
</span>
)}
  </div>
)}

{msg.message_type === "image" && (
  <img
    src={msg.file_url}
    alt="Photo"
    onClick={() => {
      setViewerImage(msg.file_url);
      setViewerName(msg.file_name || "Photo");
      setShowImageViewer(true);
    }}
    style={{
      maxWidth: "220px",
      borderRadius: 12,
      cursor: "pointer",
      display: "block",
    }}
  />
)}

{msg.message_type === "video" && (
  <div
    onClick={() => {
      setViewerVideo(msg.file_url);
      setShowVideoViewer(true);
    }}
    style={{
      position: "relative",
      display: "inline-block",
      cursor: "pointer",
    }}
  >
   <video
  src={msg.file_url}
  preload="metadata"
  playsInline
  muted
  style={{
    width: "100%",
    maxWidth: "250px",
    display: "block",
    borderRadius: "16px",
    objectFit: "cover",
    pointerEvents: "none",
  }}
/>

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
  <div
    style={{
      width: "46px",
      height: "46px",
      borderRadius: "50%",
      background: "#ffffff",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
    }}
  >
    <div
      style={{
        width: 0,
        height: 0,
        borderTop: "8px solid transparent",
        borderBottom: "8px solid transparent",
        borderLeft: "12px solid #000",
        marginLeft: "3px",
      }}
    />
  </div>
</div>
  </div>
)}

<div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    marginTop: emojiCount === 1 ? 10 : 6,
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 3,

      background:
        emojiCount === 1
          ? msg.sender === currentUser
            ? "#6d28d9"
            : "#ffffff"
          : "transparent",

      padding:
        emojiCount === 1
          ? "4px 8px"
          : "0",

      borderRadius:
        emojiCount === 1
          ? "12px"
          : "0",

      boxShadow:
        emojiCount === 1
          ? "0 2px 8px rgba(0,0,0,.08)"
          : "none",

      fontSize: 11,
      lineHeight: 1,
      opacity: 0.8,
    }}
  >
  <span>
    {formatTime(msg.created_at)}
  </span>

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
          </div>
        </div>
      </Fragment>
    );
})}
    </>
  );
}