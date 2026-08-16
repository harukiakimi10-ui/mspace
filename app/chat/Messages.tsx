"use client";
import { Fragment, useState } from "react";
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

import LocationThumbnail from "./LocationThumbnail";



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
  onCancelUpload,
}: MessagesProps) {

  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(
  new Set()
);

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
  maxWidth:
  msg.message_type === "location"
    ? "390px"
    : "70%",

width: "fit-content",
  

  padding:
  (
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
  (
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
  (
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
  (
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
  {msg.reply_sender === currentUser ? "You" : profileName}
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
    <span>Location</span>
  </>
) : msg.reply_preview === "🎥 Video" ? (
  <>
    <Video
      size={16}
      strokeWidth={2.2}
    />
    <span>Video</span>
  </>
) : isReplySticker ? null : (
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

  <span>Voice message</span>
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
    {isExpanded ? "Show less" : "Load more"}
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
  onContextMenu={(e) => {
    e.preventDefault();
    e.stopPropagation();
  }}
  style={{
    width: "auto",
    height: "160px",
    display: "block",
    background: "transparent",
    border: "none",
    boxShadow: "none",

    WebkitTouchCallout: "none",
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
      alt="Photo"
      onClick={() => {
        setViewerImage(msg.file_url);
        setViewerName(msg.file_name || "Photo");
        setShowImageViewer(true);
      }}
  onContextMenu={(e) => {
    e.preventDefault();
    e.stopPropagation();
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
          aria-label="Cancel upload"
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
                #ffffff ${(msg.progress ?? 0) * 3.6}deg,
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
  <div
    onClick={() => {
      setViewerVideo(msg.file_url);
      setShowVideoViewer(true);
    }}
    style={{
      position: "relative",
      display: "inline-block",
      width: "250px",
      height: "320px",
      cursor: "pointer",
      overflow: "hidden",
      borderRadius: "16px",
      background: "#000",
    }}
  >
    {msg.uploading ? (
      <video
        src={msg.file_url}
        preload="auto"
        playsInline
        muted
        autoPlay
        loop
        onLoadedData={(e) => {
          const video = e.currentTarget;

          video.pause();

          try {
            video.currentTime = 0.1;
          } catch {}
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        style={{
          width: "250px",
          height: "320px",
          display: "block",
          objectFit: "cover",
          background: "#000",
          borderRadius: "16px",
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
          userSelect: "none",
        }}
      />
    ) : (
      <img
        src={msg.reply_thumbnail_url}
        alt="Video"
        draggable={false}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        style={{
          width: "250px",
          height: "320px",
          display: "block",
          objectFit: "cover",
          background: "#000",
          borderRadius: "16px",
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
          userSelect: "none",
        }}
      />
    )}

    {/* Center control */}
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
      {msg.uploading ? (
        <button
          type="button"
          aria-label="Cancel upload"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            onCancelUpload(msg.upload_id ?? msg.id);
          }}
          style={{
            position: "relative",
            zIndex: 10,
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
                #ffffff ${(msg.progress ?? 0) * 3.6}deg,
                rgba(255,255,255,0.25) 0deg
              )`,
              WebkitMask:
                "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 0)",
              mask:
                "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 0)",
            }}
          />

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
      ) : (
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
      )}
    </div>

    {/* Timestamp */}
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
        zIndex: 5,
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
  />
)}


          </div>
        </div>
      </Fragment>
    );
})}
    </>
  );
}