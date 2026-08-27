"use client";

import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState, useRef } from "react";
import { flushSync } from "react-dom";

import Messages from "@/app/chat/Messages";
import MessageMenu from "@/app/chat/MessageMenu";
import ReplyPreview from "@/app/chat/ReplyPreview";
import MediaPreview from "@/app/chat/MediaPreview";

import ImageViewer from "@/app/chat/ImageViewer";
import VideoViewer from "@/app/chat/VideoViewer";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

import { Trash2, ChevronDown, MoreVertical,  ChevronLeft } from "lucide-react";


import DeleteConversationDialog from "@/app/admin/chats/components/DeleteConversationDialog";
import ChatComposer from "@/app/chat/ChatComposer";
import StickerPanel from "@/app/chat/StickerPanel";
import AttachmentMenu from "@/app/chat/AttachmentMenu";

import { compressVideo } from "@/app/chat/videoCompressor";
import { sendLocationMessage } from "@/app/chat/services/messageService";
import LocationPreview from "@/app/chat/LocationPreview";


export default function ChatPage() {
  const { id } = useParams();
  const router = useRouter();

  const supabase = createClient();

  const [messages, setMessages] = useState<any[]>([]);
  const [cacheReady, setCacheReady] = useState(false);
  const [member, setMember] = useState<any>(null);
  function getAvatarColors(value: string) {
  const colors = [
    { background: "#E8F5E9", icon: "#2E7D32" },
    { background: "#E3F2FD", icon: "#1565C0" },
    { background: "#FFF3E0", icon: "#EF6C00" },
    { background: "#FCE4EC", icon: "#C2185B" },
    { background: "#EDE7F6", icon: "#6A1B9A" },
    { background: "#E0F7FA", icon: "#00838F" },
    { background: "#FFF8E1", icon: "#F9A825" },
    { background: "#F3E5F5", icon: "#8E24AA" },
  ];

  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  return colors[Math.abs(hash) % colors.length];
}

  const [conversation, setConversation] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [reply, setReply] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isChatActive, setIsChatActive] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [showStickerPanel, setShowStickerPanel] =
  useState(false);

const [showMessageMenu, setShowMessageMenu] = useState(false);

useEffect(() => {
  if (showMessageMenu && showStickerPanel) {
    setShowStickerPanel(false);
  }
}, [showMessageMenu, showStickerPanel]);


const [showComposer, setShowComposer] = useState(true);
const [messageFocus, setMessageFocus] = useState(false);
const menuAudioContextRef = useRef<AudioContext | null>(null);

const closeMessageMenu = () => {
  setShowMessageMenu(false);
  setSelectedMessage(null);
  setShowComposer(true);
};

const clearMessageFocus = () => {
  setMessageFocus(false);
  setSelectedMessage(null);
  setShowMessageMenu(false);
};

const playMenuSound = (unlockOnly = false) => {
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

    // Safari/iPhone audio unlock
    if (unlockOnly) {
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

      return;
    }

    // Actual menu click sound
    const oscillator =
      audioContext.createOscillator();

    const gain =
      audioContext.createGain();

    oscillator.type = "sine";

    oscillator.frequency.setValueAtTime(
      180,
      audioContext.currentTime
    );

    gain.gain.setValueAtTime(
      0.0001,
      audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.14,
      audioContext.currentTime + 0.01
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      audioContext.currentTime + 0.07
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();

    oscillator.stop(
      audioContext.currentTime + 0.08
    );
  } catch {}
};

const unlockMenuAudio = () => {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as any).webkitAudioContext;

    if (!menuAudioContextRef.current) {
      menuAudioContextRef.current =
        new AudioContextClass();
    }

    const audioContext =
      menuAudioContextRef.current;

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

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


const [showMenu, setShowMenu] = useState(false);
const [menuX, setMenuX] = useState(0);
const [menuY, setMenuY] = useState(0);

const [replyMessage, setReplyMessage] = useState<any>(null);
const [replyPreview, setReplyPreview] = useState("");

const fileInputRef = useRef<HTMLInputElement>(null);

const [uploading, setUploading] = useState(false);
const [pendingUploads, setPendingUploads] = useState<any[]>([]);
const [previewFile, setPreviewFile] = useState<File | null>(null);
const [previewUrl, setPreviewUrl] = useState("");
const [showPreview, setShowPreview] = useState(false);

const generateLocalVideoThumbnail = (
  file: File
): Promise<string | null> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith("video/")) {
      resolve(null);
      return;
    }

    const video = document.createElement("video");
    const videoUrl = URL.createObjectURL(file);

    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";

    let finished = false;

    const finish = (thumbnail: string | null) => {
      if (finished) return;

      finished = true;

      URL.revokeObjectURL(videoUrl);

      video.pause();
      video.removeAttribute("src");
      video.load();

      resolve(thumbnail);
    };

    video.onerror = () => {
      finish(null);
    };

    video.onloadedmetadata = () => {
      try {
        const seekTime =
          video.duration > 0
            ? Math.min(
                0.1,
                Math.max(
                  0,
                  video.duration / 2
                )
              )
            : 0;

        video.currentTime = seekTime;
      } catch {
        finish(null);
      }
    };

    video.onseeked = () => {
      try {
        if (
          video.videoWidth <= 0 ||
          video.videoHeight <= 0
        ) {
          finish(null);
          return;
        }

        const canvas =
          document.createElement("canvas");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context =
          canvas.getContext("2d");

        if (!context) {
          finish(null);
          return;
        }

        context.drawImage(
          video,
          0,
          0,
          canvas.width,
          canvas.height
        );

        const thumbnail =
          canvas.toDataURL(
            "image/jpeg",
            0.88
          );

        finish(thumbnail);
      } catch {
        finish(null);
      }
    };

    // Never block the upload forever
    window.setTimeout(() => {
      finish(null);
    }, 3000);

    video.load();
  });
};




const [showImageViewer, setShowImageViewer] = useState(false);
const [viewerImage, setViewerImage] = useState("");
const [viewerName, setViewerName] = useState("");

const [showVideoViewer, setShowVideoViewer] = useState(false);
const [viewerVideo, setViewerVideo] = useState("");

const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
  try {
    const cachedUnread = localStorage.getItem(
      "mspace-unread-conversation-count"
    );

    if (cachedUnread !== null) {
      setUnreadCount(Number(cachedUnread));
    }
  } catch (error) {
    console.error(
      "MSpace unread count cache read error:",
      error
    );
  }
}, []);

const [showEmojiPicker, setShowEmojiPicker] = useState(false);
const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
const [newMessageCount, setNewMessageCount] = useState(0);
const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [showLocationPreview, setShowLocationPreview] =
  useState(false);

const [locationPreview, setLocationPreview] = useState<{
  latitude: number;
  longitude: number;
} | null>(null);

  const messagesRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasAutoScrolled = useRef(false);
  const memberIdRef = useRef<string | null>(null);

  const [recording, setRecording] = useState(false);
const [playing, setPlaying] = useState(false);

const [voiceState, setVoiceState] = useState<
  "idle" | "recording" | "preview"
>("idle");

const [recordingTime, setRecordingTime] = useState(0);
const [recordedDuration, setRecordedDuration] = useState(0);
const [previewCurrentTime, setPreviewCurrentTime] = useState(0);
const [voiceLevel, setVoiceLevel] = useState(0);

const mediaRecorderRef =
  useRef<MediaRecorder | null>(null);

const audioChunksRef =
  useRef<Blob[]>([]);

const previewAudioRef =
  useRef<HTMLAudioElement | null>(null);

const playbackIntervalRef =
  useRef<ReturnType<typeof setInterval> | null>(null);

const timerRef =
  useRef<ReturnType<typeof setInterval> | null>(null);

const recordedAudioRef =
  useRef<Blob | null>(null);

const analyserRef =
  useRef<AnalyserNode | null>(null);

const audioContextRef =
  useRef<AudioContext | null>(null);

const animationFrameRef =
  useRef<number | null>(null);

const sendingVoiceRef =
  useRef(false);

const messageInputRef =
  useRef<HTMLTextAreaElement | null>(null);


  async function sendAdminPushNotification(
  body: string,
  messageType: string = "text"
) {
  try {
    // Find the member who owns this conversation
    const { data: conversation, error } = await supabase
      .from("conversations")
      .select("member_id")
      .eq("id", id)
      .single();

    if (error || !conversation?.member_id) {
      console.error(
        "Could not find conversation member:",
        error
      );
      return;
    }

    const targetMemberId = conversation.member_id;

    console.log("ADMIN → MEMBER PUSH:", {
      conversationId: id,
      targetMemberId,
      messageType,
    });

    void fetch("/api/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body,
        conversationId: id,
        targetMemberId,
      }),
    })
      .then(async (response) => {
        const result = await response.text();

        console.log(
          "ADMIN PUSH STATUS:",
          response.status
        );

        console.log(
          "ADMIN PUSH RESPONSE:",
          result
        );
      })
      .catch((error) => {
        console.error(
          "Admin push error:",
          error
        );
      });
  } catch (error) {
    console.error(
      "Admin notification error:",
      error
    );
  }
}

  useEffect(() => {

  if (id) {
    const cacheKey = `mspace-messages-${id}`;

    try {
      const cachedMessages = localStorage.getItem(cacheKey);

      if (cachedMessages) {
        const parsedMessages = JSON.parse(cachedMessages);

        const visibleCachedMessages = parsedMessages.filter(
          (msg: any) => msg.deleted_for !== "admin"
        );

        setMessages(visibleCachedMessages);
      }
    } catch (error) {
      console.error(
        "MSpace cache initialization error:",
        error
      );
    }
  }

  if (id) {
    const headerCacheKey =
      `mspace-chat-header-${id}`;

    try {
      const cachedHeader =
        localStorage.getItem(headerCacheKey);

      if (cachedHeader) {
        const parsedHeader =
          JSON.parse(cachedHeader);

        if (parsedHeader.conversation) {
          setConversation(
            parsedHeader.conversation
          );
        }

        if (parsedHeader.member) {
          setMember(
            parsedHeader.member
          );

          memberIdRef.current =
            parsedHeader.conversation?.member_id ??
            null;
        }
      }
    } catch (error) {
      console.error(
        "MSpace header cache error:",
        error
      );
    }
  }

  setCacheReady(true);

  loadConversation();

  loadUnreadConversationCount();

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

  if (payload.eventType === "INSERT") {
    const newMessage = payload.new as any;

    if (newMessage?.deleted_for !== "admin") {
      setMessages((currentMessages) => {
        const alreadyExists = currentMessages.some(
          (message) => message.id === newMessage.id
        );

        if (alreadyExists) {
          return currentMessages;
        }

        return [
          ...currentMessages,
          newMessage,
        ];
      });
    }
  }

  if (payload.eventType === "UPDATE") {
  const updatedMessage = payload.new as any;

  setMessages((currentMessages) =>
    currentMessages.map((message) =>
      message.id === updatedMessage.id
        ? {
            ...message,
            ...updatedMessage,
          }
        : message
    )
  );
}

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

        await loadUnreadConversationCount();

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
  (payload) => {
    const updatedMember = payload.new as any;

    if (
      updatedMember?.member_id !==
      memberIdRef.current
    ) {
      return;
    }

    console.log(
      "REALTIME MEMBER STATUS:",
      {
        name: updatedMember.name,
        is_online: updatedMember.is_online,
        last_seen: updatedMember.last_seen,
      }
    );

    setMember((current: any) => ({
      ...current,
      name: updatedMember.name,
      photo_url: updatedMember.photo_url,
      is_online: updatedMember.is_online,
      last_seen: updatedMember.last_seen,
    }));
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
    (payload) => {
  if (payload.new?.id !== id) return;

  setConversation((prev: any) => ({
    ...(prev || {}),
    ...payload.new,
  }));
}
  )

  .subscribe();

const unreadChannel = supabase
  .channel("admin-unread-conversations")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "messages",
    },
    async () => {
      console.log("🔔 Unread count realtime update");
      await loadUnreadConversationCount();
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
  supabase.removeChannel(unreadChannel);
};
  }, []);



  const startRecording = async () => {
  sendingVoiceRef.current = false;

  try {
    const stream =
      await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

    // Live microphone analyser
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 256;

    const source =
      audioContext.createMediaStreamSource(stream);

    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const dataArray =
      new Uint8Array(analyser.fftSize);

    const updateVoiceLevel = () => {
      analyser.getByteTimeDomainData(dataArray);

      let sum = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const value =
          (dataArray[i] - 128) / 128;

        sum += value * value;
      }

      const rms =
        Math.sqrt(sum / dataArray.length);

      setVoiceLevel(
        Math.min(1, rms * 4)
      );

      animationFrameRef.current =
        requestAnimationFrame(
          updateVoiceLevel
        );
    };

    updateVoiceLevel();

    const recorder =
      new MediaRecorder(stream);

    console.log(
      "Admin MediaRecorder =",
      recorder
    );

    console.log(
      "Admin Recorder MIME type:",
      recorder.mimeType
    );

    audioChunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(
          event.data
        );
      }
    };

    recorder.onstart = () => {
      setRecording(true);
      setVoiceState("recording");

      setRecordingTime(0);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      timerRef.current =
        setInterval(() => {
          setRecordingTime(
            (time) => time + 1
          );
        }, 1000);
    };

    recorder.start();

    mediaRecorderRef.current =
      recorder;

  } catch (error) {
    console.error(
      "Admin microphone error:",
      error
    );

    alert(
      "Microphone access is required to record a voice message."
    );
  }
};


const stopRecording = (sendDirectly = false) => {
  return new Promise<void>((resolve) => {
    const recorder = mediaRecorderRef.current;

    if (!recorder) {
      resolve();
      return;
    }

    recorder.onstop = () => {
      const audioBlob = new Blob(
        audioChunksRef.current,
        {
          type: recorder.mimeType,
        }
      );

      console.log(
        "Admin recorded audio:",
        audioBlob
      );

      console.log(
        "Admin audio type:",
        audioBlob.type
      );

      recordedAudioRef.current =
        audioBlob;

      const url =
        URL.createObjectURL(audioBlob);

      if (previewAudioRef.current) {
        previewAudioRef.current.src =
          url;
      } else {
        previewAudioRef.current =
          new Audio(url);
      }

      if (timerRef.current) {
        clearInterval(
          timerRef.current
        );

        timerRef.current = null;
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(
          animationFrameRef.current
        );

        animationFrameRef.current = null;
      }

      if (audioContextRef.current) {
        audioContextRef.current
          .close()
          .catch(() => {});

        audioContextRef.current = null;
      }

      setVoiceLevel(0);
      setRecording(false);

      setRecordedDuration(
        recordingTime
      );

      if (!sendDirectly) {
  setVoiceState("preview");
}

      recorder.stream
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      mediaRecorderRef.current =
        null;

      resolve();
    };

    recorder.stop();
  });
};


const playRecording = () => {
  const audio = previewAudioRef.current;

  if (!audio) return;

  if (playbackIntervalRef.current) {
    clearInterval(
      playbackIntervalRef.current
    );

    playbackIntervalRef.current = null;
  }

  audio.play();

  setPlaying(true);

  playbackIntervalRef.current =
    setInterval(() => {
      setPreviewCurrentTime(
        audio.currentTime
      );
    }, 100);

  audio.onended = () => {
    if (playbackIntervalRef.current) {
      clearInterval(
        playbackIntervalRef.current
      );

      playbackIntervalRef.current = null;
    }

    setPlaying(false);

    audio.currentTime = 0;
    setPreviewCurrentTime(0);
  };
};

const pauseRecording = () => {
  const audio = previewAudioRef.current;

  if (!audio) return;

  audio.pause();

  if (playbackIntervalRef.current) {
    clearInterval(
      playbackIntervalRef.current
    );

    playbackIntervalRef.current = null;
  }

  setPreviewCurrentTime(
    audio.currentTime
  );

  setPlaying(false);
};

const deleteRecording = () => {
  if (playbackIntervalRef.current) {
    clearInterval(
      playbackIntervalRef.current
    );

    playbackIntervalRef.current = null;
  }

  if (previewAudioRef.current) {
    previewAudioRef.current.pause();
    previewAudioRef.current.currentTime = 0;
    previewAudioRef.current.src = "";
  }

  setPlaying(false);

  recordedAudioRef.current = null;

  setRecordingTime(0);
  setRecordedDuration(0);
  setPreviewCurrentTime(0);
  setVoiceLevel(0);

  setVoiceState("idle");
};


async function sendVoiceMessage(duration: number) {
  if (sendingVoiceRef.current) return;

  sendingVoiceRef.current = true;

  console.log(
    "Admin sending voice duration:",
    duration
  );

  if (!id) {
    alert("Conversation ID is missing.");
    sendingVoiceRef.current = false;
    return;
  }

  const audioBlob =
    recordedAudioRef.current;

  if (!audioBlob) {
    alert("No recorded audio found.");
    sendingVoiceRef.current = false;
    return;
  }

  setUploading(true);

// Show the voice message immediately in the chat
const optimisticId = `optimistic-voice-${Date.now()}`;

const optimisticUrl = URL.createObjectURL(audioBlob);

const optimisticMessage = {
  id: optimisticId,
  conversation_id: id,
  sender: "admin",
  message_type: "voice",
  content: "",
  file_url: optimisticUrl,
  file_name: `voice-${Date.now()}.audio`,
  file_size: audioBlob.size,
  mime_type: audioBlob.type,
  file_duration: duration,
  is_read: false,
  created_at: new Date().toISOString(),

  reply_to_id: replyMessage?.id ?? null,

  reply_file_duration:
    replyMessage?.message_type === "voice"
      ? replyMessage.file_duration
      : null,

  reply_preview:
    replyMessage?.message_type === "text"
      ? replyMessage.content
      : replyMessage?.message_type === "image"
      ? "📷 Photo"
      : replyMessage?.message_type === "video"
      ? "🎥 Video"
      : replyMessage?.message_type === "voice"
      ? "🎤 Voice"
      : replyMessage?.message_type === "sticker"
      ? "🏷️ Sticker"
      : replyMessage?.message_type === "location"
      ? "📍 Location"
      : null,

  reply_file_url:
    replyMessage?.message_type === "image" ||
    replyMessage?.message_type === "video" ||
    replyMessage?.message_type === "voice" ||
    replyMessage?.message_type === "sticker"
      ? replyMessage.file_url
      : replyMessage?.message_type === "location"
      ? replyMessage.content
      : null,

  reply_thumbnail_url:
    replyMessage?.message_type === "video"
      ? (
          replyMessage.reply_thumbnail_url ??
          replyMessage.thumbnail_url ??
          replyMessage.file_url
        )
      : null,

  reply_message_type:
    replyMessage?.message_type ?? null,

  reply_sender:
    replyMessage?.sender ?? null,

  _optimistic: true,
};

setMessages((prev) => [...prev, optimisticMessage]);

requestAnimationFrame(() => {
  messagesRef.current?.scrollTo({
    top: messagesRef.current.scrollHeight,
    behavior: "auto",
  });
});

try {
    const mimeType =
      audioBlob.type || "audio/mp4";

    const extension =
      mimeType.includes("mp4")
        ? "mp4"
        : mimeType.includes("webm")
        ? "webm"
        : "audio";

    const file = new File(
      [audioBlob],
      `voice-${Date.now()}.${extension}`,
      {
        type: mimeType,
      }
    );

    const filePath =
      `${id}/${file.name}`;

    console.log(
      "Uploading Admin voice:",
      filePath
    );

    const {
      error: uploadError,
    } = await supabase.storage
      .from("photos")
      .upload(
        filePath,
        file
      );

    if (uploadError) {
      console.error(
        "Admin voice upload error:",
        uploadError
      );

      alert(uploadError.message);
      return;
    }

    const { data } =
      supabase.storage
        .from("photos")
        .getPublicUrl(filePath);

    console.log(
      "Admin voice public URL:",
      data.publicUrl
    );

    /*
     * Save voice message
     */
    const {
      data: insertedMessage,
      error,
    } = await supabase
      .from("messages")
      .insert({
        conversation_id: id,

        sender: "admin",

        message_type: "voice",

        content: "",

        file_url:
          data.publicUrl,

        file_name:
          file.name,

        file_size:
          file.size,

        mime_type:
          file.type,

        file_duration:
          duration,

        is_read: false,

        reply_to_id:
          replyMessage?.id ?? null,

        reply_file_duration:
          replyMessage?.message_type === "voice"
            ? replyMessage.file_duration
            : null,

        reply_preview:
          replyMessage?.message_type === "text"
            ? replyMessage.content
            : replyMessage?.message_type === "image"
            ? "📷 Photo"
            : replyMessage?.message_type === "video"
            ? "🎥 Video"
            : replyMessage?.message_type === "voice"
            ? "🎤 Voice"
            : replyMessage?.message_type === "sticker"
            ? "🏷️ Sticker"
            : replyMessage?.message_type === "location"
            ? "📍 Location"
            : null,

        reply_file_url:
  replyMessage?.message_type === "image" ||
  replyMessage?.message_type === "video" ||
  replyMessage?.message_type === "voice" ||
  replyMessage?.message_type === "sticker"
    ? replyMessage.file_url
    : replyMessage?.message_type === "location"
    ? replyMessage.content
    : null,
          

        reply_thumbnail_url:
          replyMessage?.message_type === "video"
            ? (
                replyMessage.reply_thumbnail_url ??
                replyMessage.thumbnail_url ??
                replyMessage.file_url
              )
            : null,

        reply_message_type:
          replyMessage?.message_type ?? null,

        reply_sender:
          replyMessage?.sender ?? null,
      })
      .select()
      .single();

    console.log(
      "Admin voice message:",
      insertedMessage
    );

    // Replace the temporary voice message with the real database message
if (insertedMessage) {
  setMessages((prev) =>
    prev.map((message) =>
      message.id === optimisticId
        ? insertedMessage
        : message
    )
  );
}

    if (error) {
      console.error(
        "Admin voice message insert error:",
        error
      );

      alert(error.message);
      return;
    }

    /*
     * Send push notification
     * to this member only.
     */
    if (conversation?.member_id) {
      try {
        const pushResponse =
          await fetch(
            "/api/push/send",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
  body: "🎤 Voice message",

  conversationId: id,

  targetMemberId:
    conversation.member_id,
}),
            }
          );

        const pushResult =
          await pushResponse.json();

        console.log(
          "Admin → Member voice push:",
          pushResult
        );

        if (!pushResponse.ok) {
          console.error(
            "Admin → Member voice push failed:",
            pushResult
          );
        }
      } catch (pushError) {
        console.error(
          "Admin → Member voice push error:",
          pushError
        );
      }
    }

    /*
     * Refresh chat
     */


    deleteRecording();

    setReplyMessage(null);
    setReplyPreview("");

    requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const container = messagesRef.current;

    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "auto",
    });
  });
});

  } catch (error) {
    console.error(
      "Admin voice send error:",
      error
    );

    alert(
      error instanceof Error
        ? error.message
        : "The voice message could not be sent."
    );

  } finally {
    setUploading(false);
    sendingVoiceRef.current = false;
  }
}


async function loadConversation() {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", id)
    .single();

  console.log("Conversation:", data);

  if (error || !data) {
    console.error("Conversation load error:", error);
    setLoadingProfile(false);
    return;
  }

  memberIdRef.current = data.member_id;

  const { data: memberData, error: memberError } =
    await supabase
      .from("members")
      .select("name, photo_url, is_online, last_seen")
      .eq("member_id", data.member_id)
      .single();

  if (memberError) {
    console.error("Member load error:", memberError);
    setLoadingProfile(false);
    return;
  }

  console.log("ADMIN CHAT MEMBER STATUS:", {
    member_id: data.member_id,
    name: memberData?.name,
    is_online: memberData?.is_online,
    last_seen: memberData?.last_seen,
  });

  setMember(memberData);
setConversation(data);

// Save the latest conversation header locally
try {
  localStorage.setItem(
    `mspace-chat-header-${id}`,
    JSON.stringify({
      conversation: data,
      member: memberData,
    })
  );
} catch (error) {
  console.error(
    "MSpace header cache save error:",
    error
  );
}

setLoadingProfile(false);
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

  if (!id) return;

  const cacheKey = `mspace-messages-${id}`;

  const cachedMessages = localStorage.getItem(cacheKey);

  if (cachedMessages) {
    try {
      const parsedMessages = JSON.parse(cachedMessages);

      const visibleCachedMessages = parsedMessages.filter(
        (msg: any) => msg.deleted_for !== "admin"
      );

      setMessages(visibleCachedMessages);

      requestAnimationFrame(() => {
        if (messagesRef.current) {
          messagesRef.current.scrollTo({
            top: messagesRef.current.scrollHeight,
            behavior: "auto",
          });
        }
      });
    } catch (error) {
      console.error(
        "MSpace message cache error:",
        error
      );

      localStorage.removeItem(cacheKey);
    }
  }

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

// Save the latest messages locally
try {
  localStorage.setItem(
    `mspace-messages-${id}`,
    JSON.stringify(visibleMessages)
  );
} catch (error) {
  console.error(
    "MSpace message cache save error:",
    error
  );
}

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

    // Update the MSpace Home Screen badge
const { count: unreadCount, error: unreadCountError } =
  await supabase
    .from("messages")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("sender", "member")
    .eq("is_read", false);

if (unreadCountError) {
  console.error(
    "MSpace unread badge count error:",
    unreadCountError
  );
} else {
  try {
    const registration =
      await navigator.serviceWorker.ready;

    registration.active?.postMessage({
      type: "MSPACE_UPDATE_BADGE",
      count: unreadCount ?? 0,
    });
  } catch (error) {
    console.error(
      "MSpace service worker badge update error:",
      error
    );
  }
}
}




function getReplyData(message: any) {
  if (!message) {
    return {
      reply_preview: null,
      reply_file_url: null,
      reply_thumbnail_url: null,
      reply_message_type: null,
      reply_sender: null,
      reply_file_duration: null,
    };
  }

  if (message.message_type === "text") {
    return {
      reply_preview: message.content || "",
      reply_file_url: null,
      reply_thumbnail_url: null,
      reply_message_type: "text",
      reply_sender: message.sender ?? null,
      reply_file_duration: null,
    };
  }

  if (message.message_type === "image") {
    return {
      reply_preview: "📷 Photo",
      reply_file_url: message.file_url ?? null,
      reply_thumbnail_url: null,
      reply_message_type: "image",
      reply_sender: message.sender ?? null,
      reply_file_duration: null,
    };
  }

  if (message.message_type === "video") {
    return {
      reply_preview: "🎥 Video",
      reply_file_url: message.file_url ?? null,
      reply_thumbnail_url:
        message.reply_thumbnail_url ??
        message.thumbnail_url ??
        message.file_url ??
        null,
      reply_message_type: "video",
      reply_sender: message.sender ?? null,
      reply_file_duration: null,
    };
  }

  if (message.message_type === "voice") {
    return {
      reply_preview: "🎤 Voice",
      reply_file_url: message.file_url ?? null,
      reply_thumbnail_url: null,
      reply_message_type: "voice",
      reply_sender: message.sender ?? null,
      reply_file_duration:
        message.file_duration ?? null,
    };
  }

  if (message.message_type === "sticker") {
    return {
      reply_preview: "🏷️ Sticker",
      reply_file_url:
        message.file_url ??
        message.content ??
        null,
      reply_thumbnail_url: null,
      reply_message_type: "sticker",
      reply_sender: message.sender ?? null,
      reply_file_duration: null,
    };
  }

  if (message.message_type === "location") {
    return {
      reply_preview: "📍 Location",
      reply_file_url:
        message.file_url ??
        message.content ??
        null,
      reply_thumbnail_url: null,
      reply_message_type: "location",
      reply_sender: message.sender ?? null,
      reply_file_duration: null,
    };
  }

  return {
    reply_preview: null,
    reply_file_url: null,
    reply_thumbnail_url: null,
    reply_message_type: message.message_type ?? null,
    reply_sender: message.sender ?? null,
    reply_file_duration: null,
  };
}

  async function sendReply() {
  if (!reply.trim()) return;

  const messageText = reply.trim();

const replyData = getReplyData(replyMessage);

// Clear the composer immediately
setReply("");
setReplyMessage(null);
setReplyPreview("");

  if (!conversation?.member_id) {
  console.error(
    "Cannot send media push: conversation member_id is missing"
  );

}

  const { data, error } = await supabase
  .from("messages")
  .insert({
    conversation_id: id,
    sender: "admin",
    content: messageText,
    is_read: false,

    reply_to_id: replyMessage?.id ?? null,

reply_preview: replyData.reply_preview,

reply_file_url: replyData.reply_file_url,

reply_thumbnail_url:
  replyData.reply_thumbnail_url,

reply_message_type:
  replyData.reply_message_type,

reply_sender:
  replyData.reply_sender,

reply_file_duration:
  replyData.reply_file_duration,
  })
  .select()
  .single();

  if (error) {
  console.error(
    "Admin message insert error:",
    error
  );

  // Restore the message if sending failed
  setReply(messageText);

  return;
}

  console.log(
    "Admin message inserted:",
    data
  );

  requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const container = messagesRef.current;

    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "auto",
    });
  });
});

  // Send push notification to THIS member only
  try {
    const pushResponse = await fetch(
      "/api/push/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  body: messageText,
  conversationId: id,
  targetMemberId: conversation.member_id,
}),
      }
    );

    const pushResult =
      await pushResponse.json();

    console.log(
      "Admin → Member push result:",
      pushResult
    );

    if (!pushResponse.ok) {
      console.error(
        "Admin → Member push failed:",
        pushResult
      );
    }
  } catch (pushError) {
    console.error(
      "Admin → Member push error:",
      pushError
    );
  }

}

async function sendSticker(sticker: string) {
  if (!id) return;

  try {
    const { error } = await supabase
      .from("messages")
      .insert({
        conversation_id: id,
        sender: "admin",
        message_type: "sticker",
        content: sticker,
        file_url: sticker,
        is_read: false,

        reply_to_id: replyMessage?.id ?? null,

        reply_preview:
          replyMessage?.message_type === "text"
            ? replyMessage.content
            : replyMessage?.message_type === "image"
            ? "📷 Photo"
            : replyMessage?.message_type === "video"
            ? "🎥 Video"
            : replyMessage?.message_type === "voice"
            ? "🎤 Voice"
            : replyMessage?.message_type === "sticker"
            ? "🏷️ Sticker"
            : replyMessage?.message_type === "location"
            ? "📍 Location"
            : null,
        reply_file_url:
  replyMessage?.message_type === "image" ||
  replyMessage?.message_type === "video" ||
  replyMessage?.message_type === "voice" ||
  replyMessage?.message_type === "sticker"
    ? replyMessage.file_url
    : replyMessage?.message_type === "location"
    ? replyMessage.content
    : null,

        reply_file_duration:
          replyMessage?.message_type === "voice"
            ? replyMessage.file_duration
            : null,

        reply_thumbnail_url:
          replyMessage?.message_type === "video"
            ? (
                replyMessage.reply_thumbnail_url ??
                replyMessage.thumbnail_url ??
                replyMessage.file_url
              )
            : null,

        reply_message_type:
          replyMessage?.message_type ?? null,

        reply_sender:
          replyMessage?.sender ?? null,
      });

    if (error) {
      console.error("Admin sticker error:", error);
      return;
    }

    setReplyMessage(null);
    setReplyPreview("");


    setTimeout(() => {
      messagesRef.current?.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 50);

    /*
     * Notify this member.
     */
    if (conversation?.member_id) {
      try {
        const pushResponse = await fetch(
          "/api/push/send",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
            body: "💟 Sticker",
            conversationId: id,
            targetMemberId: conversation.member_id,
      }),
          }
        );

        const pushResult = await pushResponse.json();

        console.log(
          "Admin → Member sticker push:",
          pushResult
        );
      } catch (pushError) {
        console.error(
          "Admin sticker push error:",
          pushError
        );
      }
    }
  } catch (error) {
    console.error("Admin sticker error:", error);
  }
}


async function deleteConversation() {
  if (!conversation) return;


  const { data, error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", conversation.id)
    .select();

  if (error) {
    alert(error.message);
    return;
  }

  setShowDeleteDialog(false);

router.push("/admin/chats");
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


async function uploadFile(
  file: File,
  tempId?: string,
  uploadId?: string
) {
  if (!id) return;

  setUploading(true);
  let thumbnailUrl: string | null = null;
  let finalFile = file;

  if (file.type.startsWith("video/")) {
  console.log(
    "Admin original video:",
    (file.size / 1024 / 1024).toFixed(2),
    "MB"
  );

  console.log("Admin: converting video to MP4/H.264...");

  finalFile = await compressVideo(file);

  console.log(
    "Admin final video:",
    (finalFile.size / 1024 / 1024).toFixed(2),
    "MB",
    finalFile.type
  );
}

  try {
    const filePath = `${id}/${Date.now()}-${finalFile.name}`;

    console.log("Uploading:", filePath);

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(filePath, finalFile);

    console.log("Storage error:", uploadError);

    if (uploadError) {
      alert(uploadError.message);
      return;
    }

    const { data } = supabase.storage
      .from("photos")
      .getPublicUrl(filePath);

    if (finalFile.type.startsWith("video/")) {
  const video = document.createElement("video");
  const videoUrl = URL.createObjectURL(finalFile);

  video.src = videoUrl;
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";

  try {
  await new Promise<void>((resolve) => {
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      resolve();
    };

    const captureFrame = () => {
      try {
        if (
          video.videoWidth <= 0 ||
          video.videoHeight <= 0
        ) {
          console.error(
            "Video thumbnail: invalid video dimensions"
          );
          finish();
          return;
        }

        const canvas =
          document.createElement("canvas");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx =
          canvas.getContext("2d");

        if (!ctx) {
          console.error(
            "Video thumbnail: canvas context unavailable"
          );
          finish();
          return;
        }

        ctx.drawImage(
          video,
          0,
          0,
          canvas.width,
          canvas.height
        );

        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              console.error(
                "Video thumbnail: canvas.toBlob() returned null"
              );
              finish();
              return;
            }

            try {
              const thumbnailPath =
                `${id}/thumb-${uploadId || Date.now()}.jpg`;

              const {
                error: thumbnailUploadError,
              } = await supabase.storage
                .from("photos")
                .upload(
                  thumbnailPath,
                  blob,
                  {
                    contentType:
                      "image/jpeg",
                    upsert: true,
                  }
                );

              if (thumbnailUploadError) {
                console.error(
                  "Video thumbnail upload error:",
                  thumbnailUploadError
                );

                finish();
                return;
              }

              const {
                data: thumb,
              } = supabase.storage
                .from("photos")
                .getPublicUrl(
                  thumbnailPath
                );

              thumbnailUrl =
                thumb?.publicUrl || null;

              console.log(
                "Video thumbnail URL:",
                thumbnailUrl
              );

              finish();
            } catch (error) {
              console.error(
                "Video thumbnail upload exception:",
                error
              );

              finish();
            }
          },
          "image/jpeg",
          0.85
        );
      } catch (error) {
        console.error(
          "Video thumbnail capture error:",
          error
        );

        finish();
      }
    };

    video.onerror = () => {
      console.error(
        "Video thumbnail: video could not be decoded"
      );

      finish();
    };

    video.onloadedmetadata = () => {
      try {
        if (video.duration > 0) {
          video.currentTime = Math.min(
            0.1,
            Math.max(0, video.duration / 2)
          );
        } else {
          captureFrame();
        }
      } catch {
        captureFrame();
      }
    };

    video.onseeked = () => {
      captureFrame();
    };

    // Fallback: never let thumbnail generation
    // block the message forever.
    setTimeout(() => {
      if (!finished) {
        console.error(
          "Video thumbnail: generation timed out"
        );

        finish();
      }
    }, 5000);

    video.load();
  });
} catch (thumbnailError) {
  console.error(
    "Video thumbnail generation error:",
    thumbnailError
  );
} finally {
  URL.revokeObjectURL(videoUrl);
}

}

    console.log("Public URL:", data.publicUrl);

    const messageType = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("video/")
      ? "video"
      : "file";

    // Save the Admin's media message
    const { data: insertedMessage, error } =
      await supabase
        .from("messages")
        .insert({
          conversation_id: id,
          sender: "admin",
          message_type: messageType,
          content: "",
          file_url: data.publicUrl,
          upload_id: uploadId,
          reply_thumbnail_url: thumbnailUrl,
          file_name: finalFile.name,
          file_size: finalFile.size,
          mime_type: finalFile.type,
          is_read: false,
        })
        .select()
        .single();

    console.log(
      "Inserted media message:",
      insertedMessage
    );

    console.log(
  "REAL VIDEO THUMBNAIL:",
  insertedMessage?.reply_thumbnail_url
);

    console.log(
      "Insert error:",
      error
    );

    if (error) {
  console.error(
    "Admin media message insert error:",
    error
  );
  return;
}
    

    // Make sure this conversation belongs to a member
    if (!conversation?.member_id) {
      console.error(
        "Cannot send media push: conversation member_id is missing"
      );

      await loadMessages();
      return;
    }

    // Send push notification ONLY to this member
    try {
      const pushResponse = await fetch(
        "/api/push/send",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
  body:
    messageType === "image"
      ? "📷 Photo"
      : messageType === "video"
      ? "🎥 Video"
      : "📎 File",
  conversationId: id,
  targetMemberId:
    conversation.member_id,
}),
        }
      );

      const pushResult =
        await pushResponse.json();

      console.log(
        "Admin → Member media push result:",
        pushResult
      );

      if (!pushResponse.ok) {
        console.error(
          "Admin → Member media push failed:",
          pushResult
        );
      }
    } catch (pushError) {
      console.error(
        "Admin → Member media push error:",
        pushError
      );
    }
return insertedMessage;


  } finally {
    setUploading(false);
  }
}

async function loadUnreadConversationCount() {
  console.log("🔔 Checking unread conversations...");
  const { data: conversations, error: conversationsError } =
    await supabase
      .from("conversations")
      .select("id");

  if (conversationsError) {
    console.error(
      "Unread conversations error:",
      conversationsError
    );
    return;
  }

  const { data: unreadMessages, error: messagesError } =
    await supabase
      .from("messages")
      .select("conversation_id")
      .eq("sender", "member")
      .eq("is_read", false);

  if (messagesError) {
    console.error(
      "Unread messages error:",
      messagesError
    );
    return;
  }

  const unreadConversationIds = new Set(
    (unreadMessages || []).map(
      (message) => message.conversation_id
    )
  );

  const count = (conversations || []).filter(
  (conversation) =>
    unreadConversationIds.has(conversation.id)
).length;

// Save the latest unread count locally
try {
  localStorage.setItem(
    "mspace-unread-conversation-count",
    String(count)
  );
} catch (error) {
  console.error(
    "MSpace unread count cache save error:",
    error
  );
}

setUnreadCount(count);
}

  return (
    <>

    {showLocationPreview && locationPreview && (
  <LocationPreview
    latitude={locationPreview.latitude}
    longitude={locationPreview.longitude}
    onCancel={() => {
      setShowLocationPreview(false);
      setLocationPreview(null);
    }}
    onSend={async (latitude, longitude) => {
      try {
        await sendLocationMessage(
          conversation.id,
          latitude,
          longitude,
          "admin"
        );

        setShowLocationPreview(false);
        setLocationPreview(null);

        await loadMessages();

setTimeout(() => {
  messagesRef.current?.scrollTo({
    top: messagesRef.current.scrollHeight,
    behavior: "smooth",
  });
}, 50);
      } catch (error) {
        console.error(
          "Admin location send error:",
          error
        );

        alert("Unable to send your location.");
      }
    }}
  />
)}

    <AttachmentMenu
  open={showAttachmentMenu}
  onClose={() => setShowAttachmentMenu(false)}

  onCamera={() => {
    setShowAttachmentMenu(false);

    document
      .getElementById("mspace-camera-input")
      ?.click();
  }}

  onPhoto={() => {
    setShowAttachmentMenu(false);

    fileInputRef.current?.click();
  }}

  onVideo={() => {
    setShowAttachmentMenu(false);

    fileInputRef.current?.click();
  }}

 onLocation={() => {
  setShowAttachmentMenu(false);

  if (!navigator.geolocation) {
    alert("Location is not supported on this device.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      console.log(
        "Admin location preview:",
        latitude,
        longitude
      );

      setLocationPreview({
        latitude,
        longitude,
      });

      setShowLocationPreview(true);
    },
    (error) => {
      console.error(
        "Location permission error:",
        error
      );

      if (error.code === 1) {
        alert(
          "Please allow location access to share your location."
        );
      } else {
        alert("Unable to get your location.");
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
}}
/>

    
  <div
  style={{
    height: "100dvh",
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    background: "#f8f5ff",
    position: "fixed",
    inset: 0,
    overflow: "hidden",
  }}
>
    {/* Header */}

<div
  style={{
    height: 70,
    minHeight: 70,
    flexShrink: 0,
    background: "#6d28d9",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    padding: "0 20px",
    gap: 15,

    filter: "none",

  }}
>
      <div
  style={{
    position: "relative",
    width: 40,
    height: 40,
    flexShrink: 0,
  }}
>
  <button
    type="button"
    onClick={() => router.push("/admin/chats")}
    aria-label="Back to chats"
    style={{
      width: 40,
      height: 40,
      borderRadius: "50%",
      border: "1px solid rgba(255,255,255,0.22)",
      background: "rgba(255,255,255,0.12)",
      color: "#fff",

      display: "flex",
      alignItems: "center",
      justifyContent: "center",

      padding: 0,
      cursor: "pointer",

      boxShadow: "0 2px 8px rgba(0,0,0,0.18)",

      WebkitTapHighlightColor: "transparent",
    }}
  >
    <ChevronLeft
      size={24}
      strokeWidth={2.3}
    />

  {unreadCount > 0 && (
  <span
    style={{
      position: "absolute",
      top: -6,
      right: -5,

      minWidth: 20,
      height: 20,
      padding: "0 5px",

      borderRadius: 999,

      background: "#25D366",
      color: "#fff",

      display: "flex",
      alignItems: "center",
      justifyContent: "center",

      fontSize: 11,
      fontWeight: 700,

      boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    }}
  >
    {unreadCount}
  </span>
)}
</button>
</div>

      {member?.photo_url ? (
  <img
    src={member.photo_url}
    onError={(e) => {
      e.currentTarget.style.display = "none";
    }}
    style={{
      width: 45,
      height: 45,
      borderRadius: "50%",
      objectFit: "cover",
      flexShrink: 0,
    }}
  />
) : (
  <div
    style={{
      width: 45,
      height: 45,
      borderRadius: "50%",
      background: getAvatarColors(
        member?.member_id ||
        member?.name ||
        id
      ).background,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "relative",
        width: 30,
        height: 30,
      }}
    >
      {/* Head */}
      <div
        style={{
          position: "absolute",
          top: 4,
          left: "50%",
          transform: "translateX(-50%)",
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: getAvatarColors(
            member?.member_id ||
            member?.name ||
            id
          ).icon,
        }}
      />

      {/* Shoulders */}
      <div
        style={{
          position: "absolute",
          bottom: 4,
          left: "50%",
          transform: "translateX(-50%)",
          width: 20,
          height: 10,
          borderRadius: "18px 18px 6px 6px",
          background: getAvatarColors(
            member?.member_id ||
            member?.name ||
            id
          ).icon,
        }}
      />
    </div>
  </div>
)}
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

<div
  style={{
    marginLeft: "auto",
    marginRight: -10,
    position: "relative",
  }}
>
  <button
    type="button"
    onClick={() => setShowMenu((prev) => !prev)}
    aria-label="Conversation menu"
    style={{
      width: 35,
      height: 35,
      borderRadius: "50%",
      border: "none",
      background: "transparent",
      color: "#fff",

      display: "flex",
      alignItems: "center",
      justifyContent: "center",

      padding: 0,
      cursor: "pointer",

      WebkitTapHighlightColor: "transparent",
    }}
  >
    <MoreVertical
      size={25}
      strokeWidth={2.5}
    />
  </button>

  {showMenu && (
    <div
      style={{
        position: "absolute",
        top: 46,
        right: 0,

        minWidth: 170,

        background: "#fff",
        borderRadius: 14,

        boxShadow:
          "0 10px 30px rgba(0,0,0,0.18)",

        border: "1px solid rgba(0,0,0,0.08)",

        padding: 6,

        zIndex: 1000,
      }}
    >
      <button
        type="button"
        onClick={() => {
          setShowMenu(false);
          deleteConversation();
        }}
        style={{
          width: "100%",

          display: "flex",
          alignItems: "center",
          gap: 10,

          padding: "11px 12px",

          border: "none",
          borderRadius: 10,

          background: "transparent",
          color: "#dc2626",

          fontSize: 15,
          fontWeight: 600,

          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <Trash2
          size={18}
          strokeWidth={2.2}
        />

        Delete conversation
      </button>
    </div>
  )}
</div>
    </div>

    {/* Messages */}

   <div
  style={{
    flex: 1,
    minHeight: 0,
    position: "relative",
    overflow: "hidden",
  }}
>
  <div
  ref={messagesRef}
  onClick={() => {
  if (showMenu) {
    setShowMenu(false);
  }

  if (showStickerPanel) {
    setShowStickerPanel(false);
  }

  if (showAttachmentMenu) {
  setShowAttachmentMenu(false);
}

}}
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
    minHeight: 0,
    overflowY: "auto",
    overflowX: "hidden",
    WebkitOverflowScrolling: "touch",
    
    padding: 20,
    paddingBottom: showStickerPanel
  ? "calc(38vh + 90px)"
  : 90,
    boxSizing: "border-box",
  }}
>

  {messageFocus && (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: "rgba(0, 0, 0, 0.18)",
      zIndex: 0,
      pointerEvents: "none",
      transition: "opacity 0.2s ease",
    }}
  />
)}

<div
  onClick={() => {
    if (messageFocus) {
      setMessageFocus(false);
      setSelectedMessage(null);
      setShowMessageMenu(false);
      setShowComposer(true);
    }
  }}
  style={{
    position: "relative",
    zIndex: 1,
  }}
>
    <Messages
  messages={[
  ...messages.filter(
    (real) =>
      !pendingUploads.some(
        (pending) =>
          pending.upload_id &&
          real.upload_id === pending.upload_id
      )
  ),
  ...pendingUploads,
]}
  currentUser="admin"
  profileName={member?.name || "Member"}
  playMenuSound={playMenuSound}
  onCancelUpload={() => {}}
  formatTime={formatTime}
  formatDateLabel={formatDateLabel}
  isNewDay={isNewDay}
  setViewerImage={setViewerImage}
  setViewerName={setViewerName}
  setShowImageViewer={setShowImageViewer}
  setViewerVideo={setViewerVideo}
  setShowVideoViewer={setShowVideoViewer}
  setSelectedMessage={setSelectedMessage}
  selectedMessage={selectedMessage}
  setMenuX={setMenuX}
  setMenuY={setMenuY}
  setShowMessageMenu={setShowMessageMenu}
  setShowComposer={setShowComposer}
  messageFocus={messageFocus}
setMessageFocus={setMessageFocus}
/>
  </div>
  </div>

  {showScrollButton && (
  <button
  type="button"
  onMouseDown={(e) => {
    e.preventDefault();
  }}
  onTouchStart={(e) => {
    e.preventDefault();
  }}
  onClick={() => {
      messagesRef.current?.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: "smooth",
      });

      setNewMessageCount(0);
    }}
    aria-label="Scroll to latest messages"
    style={{
      position: "absolute",
      right: 20,
      bottom:
  showStickerPanel
    ? "calc(38vh + 95px)"
    : showAttachmentMenu
    ? "calc(25vh + 5px)"
    : 95,

      width: 36,
      height: 36,

      borderRadius: "50%",
      border: "none",

      background: "#ffffff",
      color: "#333333",

      display: "flex",
      alignItems: "center",
      justifyContent: "center",

      padding: 0,
      cursor: "pointer",

      boxShadow: "0 4px 16px rgba(0,0,0,0.18)",

      zIndex: 100,

      WebkitTapHighlightColor: "transparent",
    }}
  >
    <ChevronDown
      size={20}
      strokeWidth={2.8}
    />

    {newMessageCount > 0 && (
      <span
        style={{
          position: "absolute",
          top: -6,
          right: -6,

          minWidth: 20,
          height: 20,

          padding: "0 5px",

          borderRadius: "50%",

          background: "#6d28d9",
          color: "#ffffff",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          fontSize: 11,
          fontWeight: 700,

          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        }}
      >
        {newMessageCount}
      </span>
    )}
  </button>
)}
</div>


{showComposer && (
  <div
    style={{
      flexShrink: 0,
      position: "relative",
      zIndex: 200,
      background: "#ffffff",
    }}
  >


    <ChatComposer
    placeholder="Type a message..."
  showComposer={showComposer}

  message={reply}
  setMessage={setReply}

  currentUser="admin"
  profileName="Admin"

  replyMessage={replyMessage}
  replyPreview={replyPreview}

  onCancelReply={() => {
    setReplyMessage(null);
    setReplyPreview("");
  }}

  messageInputRef={messageInputRef}

  sendMessage={sendReply}

  onAttach={() => {
  setShowStickerPanel(false);
  setShowAttachmentMenu(true);
}}

  uploading={uploading}

  recordingTime={recordingTime}
  playing={playing}
  previewCurrentTime={previewCurrentTime}

  recording={recording}
  voiceState={voiceState}
  voiceLevel={voiceLevel}

  startRecording={startRecording}
  stopRecording={stopRecording}

  onPlay={playRecording}
  onPause={pauseRecording}
  onDelete={deleteRecording}

  onSend={async (duration) => {
  try {
    if (recording) {
      await stopRecording(true);
    }

    // Clear the voice recorder UI immediately
    // for both recording mode and preview mode.
    setVoiceState("idle");

    await sendVoiceMessage(duration);
  } catch (error) {
    console.error(
      "Admin voice message send error:",
      error
    );
  }
}}

  stickerOpen={showStickerPanel}

onToggleSticker={() => {
  setShowStickerPanel((prev) => !prev);
}}

onCloseStickerPanel={() => {
  setShowStickerPanel(false);
}}

  fileInputRef={fileInputRef}

  onFileChange={(e) => {
  const file = e.target.files?.[0];

  if (!file) return;

  setPreviewFile(file);
  setPreviewUrl(URL.createObjectURL(file));
  setShowPreview(true);

  e.target.value = "";
}}

  onInput={(e) => {
  const value = e.target.value;

  // Update the textarea immediately
  setReply(value);

  // Tell the member that admin is typing
  supabase
    .from("conversations")
    .update({
      admin_typing: true,
    })
    .eq("id", id);

  // Reset the typing timer
  if (typingTimeout.current) {
    clearTimeout(typingTimeout.current);
  }

  typingTimeout.current = setTimeout(() => {
    supabase
      .from("conversations")
      .update({
        admin_typing: false,
      })
      .eq("id", id);
  }, 1000);
}}

  onKeyDown={() => {}}
/>
</div>
)}

<StickerPanel
  open={showStickerPanel}
  onClose={() => setShowStickerPanel(false)}
  onStickerSelect={(sticker) => {
    sendSticker(sticker);
  }}
  onEmojiSelect={(emoji: any) => {
    const emojiValue =
      typeof emoji === "string"
        ? emoji
        : emoji?.native;

    if (emojiValue) {
      setReply((prev) => prev + emojiValue);
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

  const fileToUpload = previewFile;
  const localPreviewUrl = previewUrl;

  const tempId = "temp-" + Date.now();
const uploadId = crypto.randomUUID();

const messageType = fileToUpload.type.startsWith("image/")
  ? "image"
  : "video";

let localVideoThumbnail: string | null = null;

if (messageType === "video") {
  localVideoThumbnail =
    await generateLocalVideoThumbnail(
      fileToUpload
    );
}

  // Show the media immediately in the chat
  setPendingUploads((prev) => [
  ...prev,
  {
    id: tempId,
    upload_id: uploadId,
    sender: "admin",
    message_type: messageType,
    content: "",
    file_url: localPreviewUrl,

    // Temporary thumbnail for video
    thumbnail_url:
      localVideoThumbnail,

    file_name: fileToUpload.name,
    created_at: new Date().toISOString(),
    uploading: true,
    progress: 0,
    is_read: false,
  },
]);

setTimeout(() => {
  messagesRef.current?.scrollTo({
    top: messagesRef.current.scrollHeight,
    behavior: "smooth",
  });
}, 50);

  // Close the preview immediately
  setShowPreview(false);
  setPreviewFile(null);
  setPreviewUrl("");

  try {
    // Upload to Supabase
    const progressTimer = setInterval(() => {
  setPendingUploads((prev) =>
    prev.map((message) => {
      if (message.id !== tempId) return message;

      const current = message.progress ?? 0;

      return {
        ...message,
        progress: Math.min(current + 2, 90),
      };
    })
  );
}, 100);

let realMessage: any;

try {
  realMessage = await uploadFile(
    fileToUpload,
    tempId,
    uploadId
  );
} finally {
  clearInterval(progressTimer);
}


if (!realMessage?.file_url) {
  throw new Error("Supabase did not return a file URL");
}

// Wait until the real Supabase media is ready
if (realMessage.message_type === "image") {
  await new Promise<void>((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve();

    img.onerror = () => {
      reject(
        new Error("Real Supabase image failed to load")
      );
    };

    img.src = realMessage.file_url;
  });
}

if (
  realMessage.message_type === "video" &&
  realMessage.reply_thumbnail_url
) {
  await new Promise<void>((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve();

    img.onerror = () => {
      reject(
        new Error(
          "Real Supabase video thumbnail failed to load"
        )
      );
    };

    img.src = realMessage.reply_thumbnail_url;
  });
}

// Put the real message into the chat
setMessages((prev) => {
  const alreadyExists = prev.some(
    (message) => message.id === realMessage.id
  );

  if (alreadyExists) {
    return prev;
  }

  return [
    ...prev,
    realMessage,
  ];
});

// Remove the temporary uploading message
setPendingUploads((prev) =>
  prev.filter(
    (message) => message.id !== tempId
  )
);


  } catch (error) {
    console.error("Admin media upload error:", error);
  }
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
  onClose={() => {
  clearMessageFocus();
  setShowComposer(true);
}}
  onReply={() => {
  setReplyMessage(selectedMessage);

  flushSync(() => {
    setShowComposer(true);
  });

  messageInputRef.current?.focus();

  if (selectedMessage?.message_type === "text") {
    setReplyPreview(selectedMessage.content);
  } else if (selectedMessage?.message_type === "image") {
    setReplyPreview("📷 Photo");
  } else if (selectedMessage?.message_type === "video") {
    setReplyPreview("🎥 Video");
  } else if (selectedMessage?.message_type === "voice") {
    setReplyPreview("🎤 Voice");
  } else if (selectedMessage?.message_type === "sticker") {
    setReplyPreview("🏷️ Sticker");
  } else if (selectedMessage?.message_type === "location") {
    setReplyPreview("📍 Location");
  }

  setShowMessageMenu(false);
}}
  onCopy={() => {
  navigator.clipboard.writeText(
    selectedMessage?.content || ""
  );
  setShowMessageMenu(false);
}}

onSave={async () => {
  if (!selectedMessage?.file_url) return;

  try {
    const response = await fetch(selectedMessage.file_url);
    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download =
      selectedMessage.file_name ||
      (selectedMessage.message_type === "video"
        ? "MSpace-Video.mp4"
        : "MSpace-Photo.jpg");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  } finally {
    setShowMessageMenu(false);
  }
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

<DeleteConversationDialog
  open={showDeleteDialog}
  onCancel={() => setShowDeleteDialog(false)}
  onConfirm={deleteConversation}
/>
  </div>
  </>
);
}