"use client";

import { Fragment } from "react";
import { Camera, Video } from "lucide-react";

type MessagesProps = {
  messages: any[];

  currentUser: "member" | "admin";

  profileName: string;

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
  profileName,
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

  console.log(msg.content, emojiCount);

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
            padding: "6px 0px",
          }}
        >
          <div
    style={{
  maxWidth: "70%",
  width: "fit-content",

  padding:
    msg.message_type === "image" || msg.message_type === "video"
      ? "2px"
      : emojiCount === 1
      ? "0"
      : "12px 10px 4px 10px",

  borderRadius:
    emojiCount === 1
      ? 0
      : msg.sender === currentUser
      ? "18px 18px 4px 18px"
      : "18px 18px 18px 4px",

  background:
    msg.message_type === "image" || msg.message_type === "video"
      ? msg.sender === currentUser
        ? "#6d28d9"
        : "#ffffff"
      : emojiCount === 1
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
  e.stopPropagation();

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
         padding: "12px 14px",
         borderRadius: "8px",
         marginBottom: "8px",
       }}
     >
       {msg.reply_file_url ? (

        <>

       <div
  style={{
    color: "#a78bfa",
    fontWeight: 700,
    fontSize: "12px",
    marginBottom: 6,
  }}
>
  {msg.reply_sender === currentUser ? "You" : profileName}
</div>


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
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontWeight: 600,
    fontSize: "13px",
    color:
      msg.sender === "member"
        ? "#ffffff"
        : "#444",
  }}
>
  {msg.reply_preview === "🎥 Video" ? (
    <>
      <Video
        size={16}
        strokeWidth={2.2}
      />
      <span>Video</span>
    </>
  ) : (
    <>
      <Camera
        size={16}
        strokeWidth={2.2}
      />
      <span>Photo</span>
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
    {msg.reply_sender === currentUser ? "You" : profileName}
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
    {msg.reply_preview}
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
    ? "🗑 You deleted this message"
    : "🗑 This message was deleted"
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
    {msg.content}
  </span>

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

{msg.message_type === "image" && (
  <div
    style={{
      position: "relative",
      display: "inline-block",
    }}
  >
    <img
      src={msg.file_url}
      alt="Photo"
      onClick={() => {
        setViewerImage(msg.file_url);
        setViewerName(msg.file_name || "Photo");
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
}}
    />

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
  poster={msg.reply_thumbnail_url || ""}
  preload="metadata"
  playsInline
  muted
      style={{
  width: "250px",
  height: "320px",
  display: "block",
  borderRadius: "16px",
  objectFit: "cover",
  cursor: "pointer",
  background: "#000",
}}
    />

    {/* Existing play button */}
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

    {/* Timestamp inside video */}
    <div
      style={{
        position: "absolute",
        right: "8px",
        bottom: "8px",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        padding: "2px 6px",
        borderRadius: "12px",
        background: "rgba(0,0,0,0.45)",
        color: "#ffffff",
        fontSize: "11px",
        fontWeight: 500,
        pointerEvents: "none",
      }}
    >
      <span>{formatTime(msg.created_at)}</span>

      {msg.sender === currentUser && (
        <span
          style={{
            color: msg.is_read ? "#53bdeb" : "#ffffff",
            fontWeight: 700,
          }}
        >
          {msg.is_read ? "✓✓" : "✓"}
        </span>
      )}
    </div>
  </div>
)}
          </div>
        </div>
      </Fragment>
    );
})}
    </>
  );
}