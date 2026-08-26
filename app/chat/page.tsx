
"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState, useRef } from "react";
import { flushSync } from "react-dom";

import ImageViewer from "./ImageViewer";
import VideoViewer from "./VideoViewer";
import MessageMenu from "./MessageMenu";
import MediaPreview from "./MediaPreview";
import ChatHeader from "./ChatHeader";
import ChatComposer from "./ChatComposer";
import ReplyPreview from "./ReplyPreview";
import Messages from "./Messages";
import { Paperclip, Smile, SendHorizontal } from "lucide-react";
import { ChevronDown } from "lucide-react";
import AttachmentMenu from "./AttachmentMenu";
import StickerPanel from "./StickerPanel";
import { createId } from "@/lib/createId";
import { compressVideo } from "./videoCompressor";
import LocationPreview from "./LocationPreview";

import * as tus from "tus-js-client";


import {
  getMessages,
  sendTextMessage,
  sendStickerMessage,
  sendLocationMessage,
} from "./services/messageService";

import {
  getConversation,
  createConversation,
  updateOnlineStatus as updateMemberOnlineStatus,
  getProfileSettings,
  getAdminStatus,
} from "./services/conversationService";





export default function ChatPage() {
  
console.log("MEMBER PAGE LOADED", Date.now());


const [language, setLanguage] = useState<"en" | "zh">("en");

useEffect(() => {
  if (
    typeof navigator !== "undefined" &&
    navigator.language.startsWith("zh")
  ) {
    setLanguage("zh");
  }
}, []);

const t = {
    en: {
    hello: "Hello",
    today: "Today",
    yesterday: "Yesterday",
    todayAt: "today at",

    welcome: "Welcome to MSpace.",

    photo: "Photo",
    video: "Video",
    voice: "Voice message",
    sticker: "Sticker",
    location: "Location",

    locationNotSupported:
      "Location is not supported on this device.",

    allowLocation:
      "Please allow location access to share your location.",

    unableLocation:
      "Unable to get your location.",

    unableSendLocation:
      "Unable to send your location.",

    uploadFailed:
      "The file could not be uploaded.",
  },

    zh: {
    hello: "你好",
    today: "今天",
    yesterday: "昨天",
    todayAt: "今天",

    welcome: "欢迎来到星域。",

    photo: "照片",
    video: "视频",
    voice: "语音消息",
    sticker: "贴纸",
    location: "位置",

    locationNotSupported:
      "此设备不支持位置功能。",

    allowLocation:
      "请允许访问您的位置以分享位置。",

    unableLocation:
      "无法获取您的位置。",

    unableSendLocation:
      "无法发送您的位置。",

    uploadFailed:
      "文件无法上传。",
  },
}[language];

  const router = useRouter();
  const supabase = createClient();

  const [conversationId, setConversationId] = useState<string | null>(null);
   useEffect(() => {
  if (!conversationId) return;

  const sendOpenConversation = async () => {
    try {
      const registration =
        await navigator.serviceWorker.ready;

      const worker =
        navigator.serviceWorker.controller ||
        registration.active;

      if (!worker) {
        console.error(
          "MSpace: no active service worker available"
        );
        return;
      }

      worker.postMessage({
  type: "MSPACE_SET_OPEN_CONVERSATION",
  conversationId,
});

console.log(
  "MSpace: open conversation saved:",
  conversationId
);

      console.log(
        "MSpace: open conversation sent to service worker:",
        conversationId
      );
    } catch (error) {
      console.error(
        "MSpace: failed to set open conversation:",
        error
      );
    }
  };

  sendOpenConversation();

  return () => {
    navigator.serviceWorker.ready.then((registration) => {
      const worker =
        navigator.serviceWorker.controller ||
        registration.active;

      worker?.postMessage({
        type: "MSPACE_SET_OPEN_CONVERSATION",
        conversationId: null,
      });
    });
  };
}, [conversationId]);


  const [messages, setMessages] = useState<any[]>([]);
   useEffect(() => {
  console.log("messages changed");
}, [messages]);

  const [message, setMessage] = useState("");
  const [recording, setRecording] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [voiceState, setVoiceState] = useState<
  "idle" | "recording" | "preview"
>("idle");
const [recordingTime, setRecordingTime] = useState(0);
const [recordedDuration, setRecordedDuration] = useState(0);
const [previewCurrentTime, setPreviewCurrentTime] = useState(0);


const [mediaRecorder, setMediaRecorder] =
  useState<MediaRecorder | null>(null);

const [audioChunks, setAudioChunks] =
  useState<Blob[]>([]);

  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [pendingUploads, setPendingUploads] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const activeUploadsRef = useRef<Record<string, tus.Upload>>({});
  const [newMessageCount, setNewMessageCount] = useState(0);
  


   const memberId =
  typeof window !== "undefined"
    ? localStorage.getItem("mspace_member_id")
    : null;

const CHAT_CACHE_KEY = `mspace-chat-header-${memberId ?? "default"}`;
const MESSAGE_CACHE_KEY = `mspace-chat-messages-${memberId ?? "default"}`;


  const [cachedHeader, setCachedHeader] = useState<any>(null);

  const [profileName, setProfileName] = useState("");

const [profilePhoto, setProfilePhoto] = useState("");

const [admin, setAdmin] = useState<any>(null);
  


  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showStickerPanel, setShowStickerPanel] =
  useState(false);
  const [isChatActive, setIsChatActive] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  
  const [showLocationPreview, setShowLocationPreview] =
  useState(false);

const [locationPreview, setLocationPreview] = useState<{
  latitude: number;
  longitude: number;
} | null>(null);


  const [conversation, setConversation] = useState<any>(null);
    useEffect(() => {
  console.log("conversation changed");
}, [conversation]);


const [startupComplete, setStartupComplete] = useState(false);
const [uploading, setUploading] = useState(false);

const messagesRef = useRef<HTMLDivElement>(null);
const longPressTimerRef =
  useRef<ReturnType<typeof setTimeout> | null>(null);

const longPressTriggeredRef =
  useRef(false);


const fileInputRef = useRef<HTMLInputElement>(null);
const cameraInputRef = useRef<HTMLInputElement>(null);
const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
const hasAutoScrolled = useRef(false);
const loadingConversationRef = useRef(false);
const showScrollButtonRef = useRef(false);
const messageInputRef = useRef<HTMLTextAreaElement>(null);
const mediaRecorderRef = useRef<MediaRecorder | null>(null);
const playbackIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
const audioChunksRef = useRef<Blob[]>([]);
const previewAudioRef = useRef<HTMLAudioElement | null>(null);
const timerRef = useRef<NodeJS.Timeout | null>(null);
const recordedAudioRef = useRef<Blob | null>(null);
const hasBootstrappedRef = useRef(false);

const presenceMountedRef = useRef(false);
const presenceRequestRef = useRef(0);

const analyserRef = useRef<AnalyserNode | null>(null);
const audioContextRef = useRef<AudioContext | null>(null);
const animationFrameRef = useRef<number | null>(null);
const sendingVoiceRef = useRef(false);



const [voiceLevel, setVoiceLevel] = useState(0);



const [previewUrl, setPreviewUrl] = useState<string | null>(null);

const [previewFile, setPreviewFile] = useState<File | null>(null);
const [showPreview, setShowPreview] = useState(false);
const [showImageViewer, setShowImageViewer] = useState(false);
const [viewerImage, setViewerImage] = useState("");
const [viewerName, setViewerName] = useState("");
const [showVideoViewer, setShowVideoViewer] = useState(false);
const [viewerVideo, setViewerVideo] = useState("");
const [selectedMessage, setSelectedMessage] = useState<any>(null);
const [showMessageMenu, setShowMessageMenu] = useState(false);

useEffect(() => {
  if (showMessageMenu && showStickerPanel) {
    setShowStickerPanel(false);
  }
}, [showMessageMenu, showStickerPanel]);

const [showComposer, setShowComposer] = useState(true);
const [messageFocus, setMessageFocus] = useState(false);
const menuAudioContextRef = useRef<AudioContext | null>(null);

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
      0.06,
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


const [menuX, setMenuX] = useState(0);
const [menuY, setMenuY] = useState(0);
const [replyMessage, setReplyMessage] = useState<any>(null);
const [replyPreview, setReplyPreview] = useState("");
const [showEmojiPicker, setShowEmojiPicker] = useState(false);
const [showFullEmojiPicker, setShowFullEmojiPicker] = useState(false);
 console.count("ChatPage Render");
console.log("ADMIN STATE:", admin);



const startMessageLongPress = (message: any) => {
  longPressTriggeredRef.current = false;

  if (longPressTimerRef.current) {
    clearTimeout(longPressTimerRef.current);
  }

  longPressTimerRef.current = setTimeout(() => {
    longPressTriggeredRef.current = true;

    setSelectedMessage(message);
    setShowComposer(false);
    setShowMessageMenu(true);
  }, 1000);
};

const cancelMessageLongPress = () => {
  if (longPressTimerRef.current) {
    clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
  }
};

const closeMessageMenu = () => {
  cancelMessageLongPress();

  setShowMessageMenu(false);
  setSelectedMessage(null);
  setShowComposer(true);
};






async function bootstrapChat() {
  await Promise.all([
    loadConversation(),
    loadProfile(),
    loadAdminStatus(),
  ]);

  setStartupComplete(true);
}

useEffect(() => {
  if (hasBootstrappedRef.current) return;

  hasBootstrappedRef.current = true;

  void bootstrapChat();
}, []);




useEffect(() => {
  showScrollButtonRef.current = showScrollButton;
}, [showScrollButton]);


  useEffect(() => {
  const disableContextMenu = (e: MouseEvent) => {
    e.preventDefault();
  };

  document.addEventListener(
    "contextmenu",
    disableContextMenu,
    true // capture phase
  );

  return () => {
    document.removeEventListener(
      "contextmenu",
      disableContextMenu,
      true
    );
  };
}, []);


  useEffect(() => {
  if (!conversationId) return;

  let mounted = true;

  presenceMountedRef.current = true;

  const setPresence = async (online: boolean) => {
    if (!mounted) return;

    const memberId =
      localStorage.getItem("mspace_member_id");

    if (!memberId) return;

    const requestId =
      ++presenceRequestRef.current;

    try {
      await updateMemberOnlineStatus(
        memberId,
        online
      );

      if (
        !mounted ||
        requestId !== presenceRequestRef.current
      ) {
        return;
      }

      console.log(
        "MEMBER PRESENCE:",
        online ? "ONLINE" : "OFFLINE"
      );
    } catch (error) {
      console.error(
        "Presence update error:",
        error
      );
    }
  };

  const checkPresence = () => {
    const active =
      document.visibilityState === "visible" &&
      document.hasFocus();

    setIsChatActive(active);

    void setPresence(active);

    if (active && conversationId) {
      void loadMessages(conversationId);

      setTimeout(() => {
        if (mounted) {
          void markMessagesAsRead(
            conversationId
          );
        }
      }, 200);
    }
  };

  // Entering the chat
  void setPresence(true);

  // Keep the member's online status alive.
// This refreshes online_at every 30 seconds
// while the member is actively using MSpace.
const heartbeat = setInterval(() => {
  if (
    document.visibilityState === "visible" &&
    document.hasFocus()
  ) {
    void setPresence(true);
  }
}, 30000);

  document.addEventListener(
    "visibilitychange",
    checkPresence
  );

  window.addEventListener(
    "focus",
    checkPresence
  );

  window.addEventListener(
    "blur",
    checkPresence
  );

  const handlePageHide = () => {
    mounted = false;

    presenceMountedRef.current = false;

    const memberId =
      localStorage.getItem(
        "mspace_member_id"
      );

    if (memberId) {
      void updateMemberOnlineStatus(
        memberId,
        false
      );
    }
  };

  window.addEventListener(
    "pagehide",
    handlePageHide
  );

  return () => {
    mounted = false;

    presenceMountedRef.current = false;

    clearInterval(heartbeat);

    document.removeEventListener(
      "visibilitychange",
      checkPresence
    );

    window.removeEventListener(
      "focus",
      checkPresence
    );

    window.removeEventListener(
      "blur",
      checkPresence
    );

    window.removeEventListener(
      "pagehide",
      handlePageHide
    );

    const memberId =
      localStorage.getItem(
        "mspace_member_id"
      );

    if (memberId) {
      void updateMemberOnlineStatus(
        memberId,
        false
      );
    }

    console.log(
      "CHAT PAGE UNMOUNTED → MEMBER OFFLINE"
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
       
        async (payload) => {
  console.log("NEW MESSAGE:", payload);

  if (pendingUploads.length === 0) {
    await loadMessages(conversationId);
  }

  // If the member is currently at the bottom,
  // the new message is considered seen immediately.
  const el = messagesRef.current;

  const distanceFromBottom =
    el
      ? el.scrollHeight -
        el.scrollTop -
        el.clientHeight
      : 0;

  const isNearBottom = distanceFromBottom <= 80;

  if (
  !isNearBottom &&
  payload.new?.sender === "admin"
) {
  setNewMessageCount((count) => count + 1);
}

  if (
    document.visibilityState === "visible" &&
    document.hasFocus() &&
    isNearBottom
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
  }, [conversationId]);

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

useEffect(() => {
  console.log("conversationId changed:", conversationId);
}, [conversationId]);

useEffect(() => {
  console.log("profileName changed:", profileName);
}, [profileName]);

useEffect(() => {
  console.log("profilePhoto changed:", profilePhoto);
}, [profilePhoto]);

useEffect(() => {
  console.log("admin changed:", admin);
}, [admin]);

useEffect(() => {
  console.log("conversation changed:", conversation);
}, [conversation]);

useEffect(() => {
  console.log("messages changed:", messages.length);
}, [messages]);

useEffect(() => {
  console.log("startupComplete changed:", startupComplete);
}, [startupComplete]);

useEffect(() => {
  console.log("isChatActive changed:", isChatActive);
}, [isChatActive]);


async function loadConversation() {
if (loadingConversationRef.current) return;
loadingConversationRef.current = true;

console.log(">>> loadConversation START");
  const memberId = localStorage.getItem("mspace_member_id");
  console.log("MEMBER ID:", memberId);

  if (!memberId) {
  loadingConversationRef.current = false;
  return;
}

  let conversation = await getConversation(memberId);


  if (!conversation) {

  console.log(">>> INSERTING conversation");

  conversation = await createConversation(memberId);

console.log(">>> CREATED:", conversation.id);
}

  if (!conversation) {
  loadingConversationRef.current = false;
  return;
}

  setConversationId(conversation.id);
  setConversation(conversation);
  console.log("Conversation state:", conversation);
 
  setInitialLoad(true);


  await loadMessages(conversation.id);

setTimeout(async () => {
  await markMessagesAsRead(conversation.id);
}, 200);
loadingConversationRef.current = false;
}

async function loadProfile() {
  
  const data = await getProfileSettings();

if (!data) return;

  setProfileName(data.profile_name);
  setProfilePhoto(data.profile_photo || null);
  const existing = localStorage.getItem(CHAT_CACHE_KEY);

let header: any = {};

if (existing) {
  try {
    header = JSON.parse(existing);
  } catch {
    header = {};
  }
}

header.profileName = data.profile_name;
header.profilePhoto = data.profile_photo;

localStorage.setItem(
  CHAT_CACHE_KEY,
  JSON.stringify(header)
);
}

async function loadAdminStatus() {
  // Load the last known admin status immediately
  const cached = localStorage.getItem(CHAT_CACHE_KEY);

  if (cached) {
    try {
      const header = JSON.parse(cached);

      if (header.admin) {
        setAdmin(header.admin);
      }
    } catch (err) {
      console.error("Cache parse error:", err);
    }
  }

  // Fetch the latest status from Supabase
  let data;

try {
  data = await getAdminStatus();
} 

  catch (error: any) {
  console.error("ADMIN ERROR:", error);
  console.error("MESSAGE:", error?.message);
  console.error("DETAILS:", error?.details);
  console.error("HINT:", error?.hint);
  console.error("CODE:", error?.code);
  return;
}

console.log("ADMIN STATUS:", data);

if (!data) return;

  // Update React state
  setAdmin(data);

  // Save the updated status back to the cache
  const existing = localStorage.getItem(CHAT_CACHE_KEY);

  let header: any = {};

  if (existing) {
    try {
      header = JSON.parse(existing);
    } catch {
      header = {};
    }
  }

  header.admin = data;

  localStorage.setItem(
    CHAT_CACHE_KEY,
    JSON.stringify(header)
  );
}

async function handleMessageInput(
  e: React.ChangeEvent<HTMLTextAreaElement>
) {
  setMessage(e.target.value);

  e.target.style.height = "0px";
  e.target.style.height = `${Math.min(
    e.target.scrollHeight,
    140
  )}px`;

  if (!conversationId) return;

  const { data, error } = await supabase
    .from("conversations")
    .update({
      member_typing: true,
    })
    .eq("id", conversationId)
    .select();

  console.log("MEMBER TYPING UPDATE:", {
    conversationId,
    data,
    error,
  });

  if (typingTimeout.current) {
    clearTimeout(typingTimeout.current);
  }

  typingTimeout.current = setTimeout(async () => {
    const { data, error } = await supabase
      .from("conversations")
      .update({
        member_typing: false,
      })
      .eq("id", conversationId)
      .select();

    console.log("MEMBER TYPING STOP:", {
      conversationId,
      data,
      error,
    });
  }, 1000);
}


async function loadMessages(id: string) {
  const data = await getMessages(id);

  const filteredMessages = (data || []).filter(
  (msg) => msg.deleted_for !== "member"
);

console.log("Before setMessages:", messages.length);
console.log("Incoming messages:", filteredMessages.length);

setMessages(filteredMessages);

localStorage.setItem(
  MESSAGE_CACHE_KEY,
  JSON.stringify(filteredMessages)
);

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

    // Update the MSpace Home Screen badge
const { count: unreadCount, error: unreadCountError } =
  await supabase
    .from("messages")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("conversation_id", id)
    .eq("sender", "admin")
    .eq("is_read", false);

if (unreadCountError) {
  console.error(
    "MSpace member unread badge count error:",
    unreadCountError
  );
} else {
  try {
  const count = unreadCount ?? 0;

  if (
    "setAppBadge" in navigator &&
    typeof navigator.setAppBadge === "function"
  ) {
    if (
  "setAppBadge" in navigator &&
  typeof navigator.setAppBadge === "function"
) {
  await navigator.setAppBadge(count);
}
  }

  console.log(
    "MSpace member badge updated:",
    count
  );
} catch (error) {
  console.error(
    "MSpace member badge update error:",
    error
  );
}
}

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
  console.log("Conversation ID:", conversationId);
  if (!conversationId) return;

  if (!message.trim()) return;

  let data;

try {
  data = await sendTextMessage({
    conversationId,
    content: message,
    replyMessage,
  });
} catch (error) {
  console.error("Send message error:", error);
  return;
}

if (!data) return;
  const isAndroid =
  /Android/i.test(navigator.userAgent);

const stickerPanelIsOpen =
  !!document.querySelector(
    '[data-mspace-sticker-panel="true"]'
  );

resetComposer();
await loadMessages(conversationId);

if (!(isAndroid && stickerPanelIsOpen)) {
  requestAnimationFrame(() => {
    messageInputRef.current?.focus();
  });
}

setTimeout(() => {
  const el = messagesRef.current;

  if (!el) return;

  el.scrollTo({
    top: el.scrollHeight,
    behavior: "smooth",
  });
}, 50);
}

const startRecording = async () => {

  sendingVoiceRef.current = false;

  try {

    const stream = await navigator.mediaDevices.getUserMedia({
  audio: true,
});

// Live microphone analyser for waveform
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();

analyser.fftSize = 256;

const source = audioContext.createMediaStreamSource(stream);
source.connect(analyser);

audioContextRef.current = audioContext;
analyserRef.current = analyser;

const dataArray = new Uint8Array(analyser.fftSize);

const updateVoiceLevel = () => {
  analyser.getByteTimeDomainData(dataArray);

  let sum = 0;

  for (let i = 0; i < dataArray.length; i++) {
    const value = (dataArray[i] - 128) / 128;
    sum += value * value;
  }

  const rms = Math.sqrt(sum / dataArray.length);

  setVoiceLevel(Math.min(1, rms * 4));

  animationFrameRef.current =
    requestAnimationFrame(updateVoiceLevel);
};

updateVoiceLevel();

const recorder = new MediaRecorder(stream);

    console.log("MediaRecorder =", recorder);
    console.log("Recorder MIME type:", recorder.mimeType);

    audioChunksRef.current = [];

    recorder.ondataavailable = (event) => {
  if (event.data.size > 0) {
    audioChunksRef.current.push(event.data);
  }
};

    recorder.onstart = () => {

  setRecording(true);
  setVoiceState("recording");

  setAudioChunks([]);

  setRecordingTime(0);

timerRef.current = setInterval(() => {
  setRecordingTime((t) => t + 1);
}, 1000);

};


    recorder.start();

    mediaRecorderRef.current = recorder;
  } catch (err) {
    console.error(err);
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
      const audioBlob = new Blob(audioChunksRef.current, {
  type: recorder.mimeType,
});

      console.log("Recorded audio:", audioBlob);
      console.log("Final audio type:", audioBlob.type);

      setRecordedAudio(audioBlob);

      recordedAudioRef.current = audioBlob;

      const url = URL.createObjectURL(audioBlob);

      if (previewAudioRef.current) {
        previewAudioRef.current.src = url;
      } else {
        previewAudioRef.current = new Audio(url);
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setRecording(false);
      setRecordedDuration(recordingTime);
      if (!sendDirectly) {
      setVoiceState("preview");
      }

      recorder.stream
        .getTracks()
        .forEach((track) => track.stop());

      resolve();   // <-- This is the important line
    };

    recorder.stop();
  });
};

const playRecording = () => {
  const audio = previewAudioRef.current;

  if (!audio) return;

  // Clear any old playback timer
  if (playbackIntervalRef.current) {
    clearInterval(playbackIntervalRef.current);
    playbackIntervalRef.current = null;
  }

  audio.play();

  setPlaying(true);

  playbackIntervalRef.current = setInterval(() => {
    setPreviewCurrentTime(audio.currentTime);
  }, 100);

  audio.onended = () => {
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
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
    clearInterval(playbackIntervalRef.current);
    playbackIntervalRef.current = null;
  }

  setPreviewCurrentTime(audio.currentTime);
  setPlaying(false);
};

const deleteRecording = () => {
  if (playbackIntervalRef.current) {
  clearInterval(playbackIntervalRef.current);
  playbackIntervalRef.current = null;
}

  if (previewAudioRef.current) {
    previewAudioRef.current.pause();
    previewAudioRef.current.currentTime = 0;
  }

  setPlaying(false);

  setRecordedAudio(null);

  setRecordingTime(0);

  setRecordedDuration(0);

  setVoiceState("idle");
};

async function sendSticker(sticker: string) {
  if (!conversationId) return;

  let data;

try {
  data = await sendStickerMessage(
  conversationId,
  sticker,
  replyMessage
);
} catch (error) {
  console.error("Sticker error:", error);
  return;
}

if (!data) return;

// Clear the reply composer after sending
setReplyMessage(null);
setReplyPreview("");

await loadMessages(conversationId);
  setTimeout(() => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, 50);
}


const cancelUpload = (uploadId: string) => {
  console.log("Cancelling upload:", uploadId);

  // Get the actual TUS upload
  const upload = activeUploadsRef.current[uploadId];

  // Stop the real upload first
  if (upload) {
    upload.abort();
    delete activeUploadsRef.current[uploadId];
  }

  // Remove the temporary message
  setPendingUploads((prev) =>
    prev.filter(
      (msg) =>
        msg.upload_id !== uploadId &&
        msg.id !== uploadId
    )
  );

  // Remove its progress
  setUploadProgress((prev) => {
    const next = { ...prev };
    delete next[uploadId];
    return next;
  });
};

async function createTemporaryVideoThumbnail(
  file: File
): Promise<string | null> {
  if (!file.type.startsWith("video/")) {
    return null;
  }

  const video = document.createElement("video");
  const videoUrl = URL.createObjectURL(file);

  video.src = videoUrl;
  video.muted = true;
  video.playsInline = true;
  video.preload = "metadata";

  try {
    return await new Promise<string | null>((resolve) => {
      let finished = false;

      const finish = (result: string | null) => {
        if (finished) return;

        finished = true;

        URL.revokeObjectURL(videoUrl);

        resolve(result);
      };

      video.onloadedmetadata = () => {
        try {
          if (
            !Number.isFinite(video.duration) ||
            video.duration <= 0
          ) {
            finish(null);
            return;
          }

          video.currentTime = Math.min(
            0.1,
            Math.max(0, video.duration / 2)
          );
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

          const ctx =
            canvas.getContext("2d");

          if (!ctx) {
            finish(null);
            return;
          }

          ctx.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
          );

          const thumbnailUrl =
            canvas.toDataURL(
              "image/jpeg",
              0.85
            );

          finish(thumbnailUrl);
        } catch (error) {
          console.error(
            "Temporary video thumbnail error:",
            error
          );

          finish(null);
        }
      };

      video.onerror = () => {
        console.error(
          "Temporary video could not be decoded"
        );

        finish(null);
      };

      setTimeout(() => {
        if (!finished) {
          console.error(
            "Temporary video thumbnail timed out"
          );

          finish(null);
        }
      }, 5000);

      video.load();
    });
  } catch (error) {
    console.error(
      "Temporary video thumbnail exception:",
      error
    );

    URL.revokeObjectURL(videoUrl);

    return null;
  }
}

async function uploadFile(
  file: File,
  uploadId?: string
) {
  if (!conversationId) return;

  setUploading(true);

  if (uploadId) {
  setUploadProgress((prev) => ({
    ...prev,
    [uploadId]: 0,
  }));
}

  let uploadFile = file;
  let thumbnailUrl: string | null = null;

  try {
    /*
     * VIDEO COMPRESSION
     *
     * Videos 10 MB or smaller are uploaded normally.
     * Videos above 10 MB are compressed before upload.
     */
    if (file.type.startsWith("video/")) {
  console.log(
    "Member original video:",
    (file.size / 1024 / 1024).toFixed(2),
    "MB"
  );

  console.log(
    "Member: converting video to MP4/H.264..."
  );

  uploadFile = await compressVideo(file);

  console.log(
    "Member final video:",
    (uploadFile.size / 1024 / 1024).toFixed(2),
    "MB",
    uploadFile.type
  );
}

    /*
     * Upload the FINAL file.
     *
     * For videos above 10 MB this is the compressed MP4.
     * For videos 10 MB or smaller this is the original file.
     */
    // Create a Storage-safe filename.
// Keep the original filename separately in the database.
const safeFileName = uploadFile.name
  .replace(/[^a-zA-Z0-9._-]/g, "_");

const filePath =
  `${conversationId}/${Date.now()}-${safeFileName}`;

console.log("Original filename:", uploadFile.name);
console.log("Storage filename:", safeFileName);
console.log("Uploading:", filePath);
    /*
 * RESUMABLE UPLOAD WITH REAL PROGRESS
 */
const { data: sessionData } = await supabase.auth.getSession();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const accessToken =
  sessionData.session?.access_token || supabaseKey;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase configuration is missing.");
}

if (!supabaseUrl || !accessToken) {
  throw new Error("Supabase configuration is missing.");
}

await new Promise<void>((resolve, reject) => {
  const upload = new tus.Upload(uploadFile, {
    endpoint: `${supabaseUrl}/storage/v1/upload/resumable`,

    retryDelays: [0, 3000, 5000, 10000, 20000],

    headers: {
  authorization: `Bearer ${accessToken}`,
  apikey: supabaseKey,
  "x-upsert": "false",
},

    metadata: {
      bucketName: "photos",
      objectName: filePath,
      contentType: uploadFile.type || "application/octet-stream",
      cacheControl: "3600",
    },

    onError(error) {
      console.error("TUS upload error:", error);
      reject(error);
    },

    onProgress(bytesUploaded, bytesTotal) {
      const percentage = Math.round(
        (bytesUploaded / bytesTotal) * 100
      );

      console.log("Upload progress:", percentage + "%");

      if (uploadId) {
        setPendingUploads((prev) =>
          prev.map((m) =>
            m.upload_id === uploadId
              ? {
                  ...m,
                  progress: percentage,
                }
              : m
          )
        );
      }
    },

    onSuccess() {
      console.log("TUS upload completed.");
      resolve();
    },
  });

  if (uploadId) {
  activeUploadsRef.current[uploadId] = upload;
}

  upload.start();
});

    const { data } = supabase.storage
      .from("photos")
      .getPublicUrl(filePath);

    /*
 * CREATE VIDEO THUMBNAIL
 *
 * Same thumbnail-generation method used
 * by the working Admin implementation.
 */
if (uploadFile.type.startsWith("video/")) {
  const video = document.createElement("video");
  const videoUrl = URL.createObjectURL(uploadFile);

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
              "Member video thumbnail: invalid video dimensions"
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
              "Member video thumbnail: canvas context unavailable"
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
                  "Member video thumbnail: canvas.toBlob() returned null"
                );

                finish();
                return;
              }

              try {
                const thumbnailPath =
                  `${conversationId}/thumb-${uploadId || Date.now()}.jpg`;

                const {
                  error: thumbnailUploadError,
                } = await supabase.storage
                  .from("photos")
                  .upload(
                    thumbnailPath,
                    blob,
                    {
                      contentType: "image/jpeg",
                      upsert: true,
                    }
                  );

                if (thumbnailUploadError) {
                  console.error(
                    "Member video thumbnail upload error:",
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
                  "Member video thumbnail URL:",
                  thumbnailUrl
                );

                finish();
              } catch (error) {
                console.error(
                  "Member video thumbnail upload exception:",
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
            "Member video thumbnail capture error:",
            error
          );

          finish();
        }
      };

      video.onerror = () => {
        console.error(
          "Member video thumbnail: video could not be decoded"
        );

        finish();
      };

      video.onloadedmetadata = () => {
        try {
          if (video.duration > 0) {
            video.currentTime = Math.min(
              0.1,
              Math.max(
                0,
                video.duration / 2
              )
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

      // Same fallback protection as Admin.
      setTimeout(() => {
        if (!finished) {
          console.error(
            "Member video thumbnail: generation timed out"
          );

          finish();
        }
      }, 5000);

      video.load();
    });
  } catch (thumbnailError) {
    console.error(
      "Member video thumbnail generation error:",
      thumbnailError
    );
  } finally {
    URL.revokeObjectURL(videoUrl);
  }
}

    console.log("Public URL:", data.publicUrl);

    /*
     * SAVE MESSAGE
     */
    const { data: insertedMessage, error } =
  await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender: "member",

      message_type: uploadFile.type.startsWith("image/")
        ? "image"
        : uploadFile.type.startsWith("video/")
        ? "video"
        : "file",

      content: "",

      file_url: data.publicUrl,

      upload_id: uploadId,

      reply_thumbnail_url: thumbnailUrl,

      file_name: uploadFile.name,
      file_size: uploadFile.size,
      mime_type: uploadFile.type,

      is_read: false,
    })
    .select()
    .single();

console.log(
  "Inserted member media message:",
  insertedMessage
);

console.log(
  "REAL MEMBER VIDEO THUMBNAIL:",
  insertedMessage?.reply_thumbnail_url
);

console.log(
  "Insert error:",
  error
);

if (error) {
  throw new Error(error.message);
}


/*
 * SEND PUSH NOTIFICATION TO ADMIN
 *
 * The media message was successfully saved.
 * Notify the MSpace admin only.
 */
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
          uploadFile.type.startsWith("image/")
            ? "📷Photo"
            : uploadFile.type.startsWith("video/")
            ? "🎥Video"
            : "📎File",

        conversationId,

        targetMemberId:
          "11111111-1111-1111-1111-111111111111",
      }),
    }
  );

  const pushResult =
    await pushResponse.json();

  console.log(
    "Member → Admin media push result:",
    pushResult
  );

} catch (pushError) {
  console.error(
    "Member → Admin media push error:",
    pushError
  );
}


return insertedMessage;



  } catch (error) {
    console.error("Upload failed:", error);

    alert(
      error instanceof Error
        ? error.message
        : t.uploadFailed
    );

  } finally {
    setUploading(false);
  }
}


async function sendVoiceMessage(duration: number) {

  if (sendingVoiceRef.current) return;

  sendingVoiceRef.current = true;

  console.log("Sending voice duration:", duration);

console.log("MEMBER ID:", localStorage.getItem("mspace_member_id"));
console.log("DEVICE ID:", localStorage.getItem("mspace_device_id"));
console.log("CONVERSATION ID:", conversationId);


  if (!conversationId) {
  alert("CONVERSATION ID IS EMPTY");
  return;
}

  const audioBlob = recordedAudioRef.current;

if (!audioBlob) {
  alert("AUDIO BLOB IS EMPTY");
  return;
}

  setUploading(true);


try {
  const mimeType = audioBlob.type || "audio/mp4";

const extension = mimeType.includes("mp4")
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
  `${conversationId}/${file.name}`;

  const { error: uploadError } = await supabase.storage
  .from("photos")
  .upload(filePath, file);

if (uploadError) {
  alert(uploadError.message);
  return;
}

const { data } = supabase.storage
  .from("photos")
  .getPublicUrl(filePath);

  const { error } = await supabase
  .from("messages")
  .insert({
    conversation_id: conversationId,
    sender: "member",
    message_type: "voice",
    content: "",
    file_url: data.publicUrl,
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type,
file_duration: duration,
is_read: false,
    
    reply_to_id: replyMessage?.id ?? null,

    reply_file_duration:
  replyMessage?.message_type === "voice"
    ? replyMessage.file_duration
    : null,

reply_preview:
  replyMessage?.message_type === "text"
    ? replyMessage.content
    : replyMessage?.message_type === "image"
    ? `📷 ${t.photo}`
    : replyMessage?.message_type === "video"
    ? `🎥 ${t.video}`
    : replyMessage?.message_type === "voice"
    ? `🎤 ${t.voice}`
    : replyMessage?.message_type === "sticker"
    ? `🏷️ ${t.sticker}`
    : replyMessage?.message_type === "location"
    ? `📍 ${t.location}`
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

reply_message_type: replyMessage?.message_type ?? null,

reply_sender: replyMessage?.sender ?? null,

  });

if (error) {
  alert(error.message);
  return;
}

/*
 * Send push notification to the admin.
 * Do NOT wait for the push request before continuing.
 */
void fetch("/api/push/send", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    body: "🎤 voice message",
    conversationId,

    // Same admin recipient used by text/sticker notifications.
    targetMemberId:
      "11111111-1111-1111-1111-111111111111",
  }),
})
  .then(async (pushResponse) => {
    const pushResult = await pushResponse.text();

    console.log(
      "VOICE PUSH RESPONSE STATUS:",
      pushResponse.status
    );

    console.log(
      "VOICE PUSH RESPONSE BODY:",
      pushResult
    );

    if (!pushResponse.ok) {
      console.error(
        "Voice push request failed:",
        pushResponse.status,
        pushResult
      );
    }
  })
  .catch((pushError) => {
    console.error(
      "Voice push notification error:",
      pushError
    );
  });

await loadMessages(conversationId);

deleteRecording();

recordedAudioRef.current = null;

requestAnimationFrame(() => {
  messageInputRef.current?.focus();
});

setTimeout(() => {
  const el = messagesRef.current;

  if (!el) return;

  el.scrollTo({
    top: el.scrollHeight,
    behavior: "smooth",
  });
}, 50);

} finally {
  setUploading(false);
}



}




function formatTime(date: string) {
  const locale =
    typeof navigator !== "undefined" &&
    navigator.language.startsWith("zh")
      ? "zh-CN"
      : "en-US";

  return new Date(date).toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

        
function formatDateLabel(date: string) {  
  const messageDate = new Date(date);

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const message = messageDate.toDateString();

  if (message === today.toDateString()) {
    return t.today;
  }

  if (message === yesterday.toDateString()) {
    return t.yesterday;
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
    return `${t.todayAt} ${d.toLocaleTimeString([], {
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


console.log("RENDER profileName:", profileName);
console.log("RENDER profilePhoto:", profilePhoto);

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
  onClose={() => {
  clearMessageFocus();
  setShowComposer(true);
}}
  onReply={() => {
  console.log("REPLY SELECTED MESSAGE:", selectedMessage);

  setReplyMessage(selectedMessage);

  flushSync(() => {
    setShowComposer(true);
  });

  messageInputRef.current?.focus();

  if (selectedMessage?.message_type === "text") {
    setReplyPreview(selectedMessage.content);

  } else if (selectedMessage?.message_type === "image") {
    setReplyPreview(`📷 ${t.photo}`);

  } else if (selectedMessage?.message_type === "video") {
    setReplyPreview(`🎥 ${t.video}`);

  } else if (selectedMessage?.message_type === "voice") {
    const duration = selectedMessage.file_duration ?? 0;

    setReplyPreview(
  `🎤 ${t.voice} ${Math.floor(duration / 60)}:${String(
        Math.floor(duration % 60)
      ).padStart(2, "0")}`
    );

  } else if (selectedMessage?.message_type === "location") {
    setReplyPreview(t.location);

  } else if (selectedMessage?.message_type === "sticker") {
    setReplyPreview(`🏷️ ${t.sticker}`);
  }

  setMessageFocus(false);
  setShowMessageMenu(false);
  setShowComposer(true);
}}
  onCopy={() => {
  navigator.clipboard.writeText(
    selectedMessage?.content || ""
  );

  setMessageFocus(false);
  setShowMessageMenu(false);
  setShowComposer(true);
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
    clearMessageFocus();
    setMessageFocus(false);
    setShowMessageMenu(false);
    setShowComposer(true);
  }
}}


onDeleteForMe={async () => {
  if (!selectedMessage) return;

  await supabase
    .from("messages")
    .update({
      deleted_for: "member",
    })
    .eq("id", selectedMessage.id);

  setMessageFocus(false);
  setShowMessageMenu(false);
  setShowComposer(true);
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

  setMessageFocus(false);
  setShowMessageMenu(false);
  setShowComposer(true);
  if (conversationId) {
    await loadMessages(conversationId);
  }
}}
/>

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
  alert(t.locationNotSupported);
  return;
}

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

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
       alert(t.allowLocation);

      } else {
        alert(t.unableLocation);
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
      conversationId!,
      latitude,
      longitude
    );

    setShowLocationPreview(false);
    setLocationPreview(null);
   await loadMessages(conversationId!);

setTimeout(() => {
  messagesRef.current?.scrollTo({
    top: messagesRef.current.scrollHeight,
    behavior: "smooth",
  });
}, 50);

  } catch (error) {
    console.error(
      "Location send error:",
      error
    );

    alert(t.unableSendLocation);
  }
}}
  />
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
    setMessage((prev) => prev + emojiValue);
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

  // Keep references to the file and preview URL
  // before clearing the preview state.
  const fileToUpload = previewFile;
  const localPreviewUrl = previewUrl;

  const tempId = "temp-" + Date.now();
  const uploadId = createId();

  let temporaryThumbnail: string | null = null;

if (fileToUpload.type.startsWith("video/")) {
  temporaryThumbnail =
    await createTemporaryVideoThumbnail(
      fileToUpload
    );
}

  // Show the video immediately in the chat while uploading.
  setPendingUploads((prev) => [
    ...prev,
    {
      id: tempId,
      upload_id: uploadId,
      sender: "member",
      message_type: fileToUpload.type.startsWith("image/")
        ? "image"
        : "video",
      file_url: localPreviewUrl,
      thumbnail_url: temporaryThumbnail,
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

 

  // IMPORTANT:
  // Close and completely clear the full-screen preview
  // immediately when Send is pressed.
  setShowPreview(false);
  setPreviewFile(null);
  setPreviewUrl("");

  try {
    // Upload using the captured file, NOT previewFile state.
    const insertedMessage =
  await uploadFile(fileToUpload, uploadId);

if (!insertedMessage?.file_url) {
  throw new Error("Supabase did not return a file URL");
}

// Wait until the real Supabase image is fully loaded
if (insertedMessage.message_type === "image") {
  await new Promise<void>((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve();

    img.onerror = () => {
      reject(
        new Error("Real Supabase image failed to load")
      );
    };

    img.src = insertedMessage.file_url;
  });
}

// Wait until the real Supabase video thumbnail is fully loaded
if (
  insertedMessage.message_type === "video" &&
  insertedMessage.reply_thumbnail_url
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

    img.src = insertedMessage.reply_thumbnail_url;
  });
}


// Put the real message into the chat
setMessages((prev) => {
  const alreadyExists = prev.some(
    (message) => message.id === insertedMessage.id
  );

  if (alreadyExists) {
    return prev;
  }

  return [
    ...prev,
    insertedMessage,
  ];
});

// Remove the temporary uploading message
setPendingUploads((prev) =>
  prev.filter(
    (message) => message.id !== tempId
  )
);
    
 setUploadProgress((prev) => {
  const next = { ...prev };
  delete next[uploadId];
  return next;
});

  } catch (error) {
    console.error("Media upload failed:", error);

    // Keep the temporary message visible if upload fails.
    // It can show the uploading/failed state.
  }
}}
/>
    <main
  style={{
    position: "fixed",
    inset: 0,

    display: "flex",
    flexDirection: "column",

    background: "#f8f5ff",

    overflow: "hidden",

    height: "100dvh",
    width: "100vw",

    touchAction: "pan-y",
  }}
>
      {/* Header */}
<div
  style={{
    position: "relative",
    zIndex: 1,

    filter: "none",
    opacity: 1,
    pointerEvents: "auto",
  }}
>
  <ChatHeader
    profileName={profileName}
    profilePhoto={profilePhoto}
    admin={admin}
    conversation={conversation}
    formatLastSeen={formatLastSeen}
    onBack={() => router.push("/members")}
  />
</div>

      {/* Messages */}

<div
  style={{
  flex: 1,
  position: "relative",

  minHeight: 0,

  display: "flex",
  flexDirection: "column",

  overflow: "hidden",

  marginTop: "60px",
  marginBottom: "0px",
}}
>
  <div
  ref={messagesRef}
  onClick={() => {
  messageInputRef.current?.blur();

  if (showStickerPanel) {
    setShowStickerPanel(false);
  }

  if (showAttachmentMenu) {
  setShowAttachmentMenu(false);
}

}}

   onContextMenu={(e) => {
    e.preventDefault();
    e.stopPropagation();
  }}

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
  flex: 1,
  minHeight: 0,

  position: "relative",

  overflowY: "auto",
  overflowX: "hidden",

  WebkitOverflowScrolling: "touch",

  padding: showStickerPanel
  ? "20px 10px calc(38vh + 80px)"
  : "20px 10px 80px",

  overscrollBehavior: "contain",
}}
  >
    <div
  style={{
    background: "#ffffff",
    color: "#222222",
    WebkitTextFillColor: "#222222",
    padding: "12px",
    borderRadius: "15px",
    maxWidth: "250px",
    marginBottom: "15px",
    boxShadow: "0 2px 8px rgba(0,0,0,.08)",
  }}
>
  {t.hello} 👋
  <br />
  {t.welcome}
</div>

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
      clearMessageFocus();
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
  currentUser="member"
  profileName={profileName}
  playMenuSound={playMenuSound}
  formatTime={formatTime}
  formatDateLabel={formatDateLabel}
  isNewDay={isNewDay}
  onCancelUpload={cancelUpload}
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
<div
  style={{
    position: "absolute",
    right: 20,
    bottom:
  showStickerPanel
    ? "calc(38vh + 95px)"
    : showAttachmentMenu
    ? "calc(25vh + 5px)"
    : 95,
    zIndex: 3000,
  }}
>
    <button
  type="button"
  onMouseDown={(e) => {
    e.preventDefault();
  }}
  onTouchStart={(e) => {
    e.preventDefault();
  }}
  onClick={() => {
  setNewMessageCount(0);

  messagesRef.current?.scrollTo({
    top: messagesRef.current.scrollHeight,
    behavior: "smooth",
  });
}}
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

      {showComposer && (
  <ChatComposer
  placeholder={language === "zh" ? "输入消息..." : "Type a message..."}
  showComposer={showComposer}

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

  messageInputRef={messageInputRef}

  sendMessage={sendMessage}

  stickerOpen={showStickerPanel}

  onToggleSticker={() => {
    if (showStickerPanel) {
      setShowStickerPanel(false);

      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 150);
    } else {
      messageInputRef.current?.blur();
      setShowStickerPanel(true);
    }
  }}

  onCloseStickerPanel={() => setShowStickerPanel(false)}

  onAttach={() => {
  setShowStickerPanel(false);
  setShowAttachmentMenu(true);
}}

  uploading={uploading}

  recording={recording}
  voiceState={voiceState}
  voiceLevel={voiceLevel}
  recordingTime={recordingTime}
  playing={playing}
  previewCurrentTime={previewCurrentTime}
  startRecording={startRecording}
  stopRecording={stopRecording}
  onPlay={playRecording}
  onPause={pauseRecording}
  onDelete={deleteRecording}
  onSend={async (duration) => {


  console.log("CHAT PAGE onSend duration =", duration);

  try {

    if (recording) {
      await stopRecording(true);
    }

    console.log("Calling sendVoiceMessage with =", duration);

    await sendVoiceMessage(duration);

  } catch (error) {

    console.error("Voice message send error:", error);

  
  }
}}

  fileInputRef={fileInputRef}
  onFileChange={handleFileChange}

  onInput={handleMessageInput}
  onKeyDown={(e) => {
  if (
    e.key === "Enter" &&
    !e.shiftKey &&
    window.innerWidth > 768
  ) {
    e.preventDefault();

    if (message.trim()) {
      sendMessage();
    }
  }
}}
/>
)}
   </main>
</>
);
}