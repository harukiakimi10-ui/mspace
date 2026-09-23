"use client";

import Script from "next/script";
import {
  useState,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { MessagesSquare } from "lucide-react";
import NotificationButton from "../NotificationButton";
import ProfileAvatar from "@/app/chat/ProfileAvatar";

import {
  MessageCircleMore,
  ChevronLeft,
  ChevronRight,
  X,
  WifiOff,
  Grid3X3,
  Image,
  Video,
  Volume2,
  VolumeX,
} from "lucide-react";


export default function MembersPage() {
const router = useRouter();
const supabase = createClient();

const PROFILE_CACHE_KEY = "mspace-members-profile";
const PHOTOS_CACHE_KEY = "mspace-members-photos";
const VIDEOS_CACHE_KEY = "mspace-members-videos";
const MEDIA_CACHE_NAME = "mspace-members-media-v1";

async function cacheMedia(url: string) {
  if (!url || typeof window === "undefined") return;

  if (!("caches" in window)) return;

  try {
    const cache = await caches.open(MEDIA_CACHE_NAME);

    const existing = await cache.match(url);

    if (!existing) {
      const response = await fetch(url);

      if (response.ok) {
        await cache.put(url, response);
      }
    }
  } catch (error) {
    console.log("Media cache failed:", error);
  }
}

async function getCachedMediaUrl(url: string) {
  if (!url || typeof window === "undefined") return url;

  if (!("caches" in window)) return url;

  try {
    const cache = await caches.open(MEDIA_CACHE_NAME);
    const response = await cache.match(url);

    if (!response) return url;

    const blob = await response.blob();

    return URL.createObjectURL(blob);
  } catch (error) {
    console.log("Cached media read failed:", error);
    return url;
  }
}

  const [photos, setPhotos] = useState<any[]>([]);

const [videos, setVideos] = useState<any[]>([]);

const [profileName, setProfileName] = useState("");
const [profileBio, setProfileBio] = useState("");

const [activeMediaTab, setActiveMediaTab] =
  useState<"all" | "photos" | "videos">("all");


const [profilePhoto, setProfilePhoto] = useState("");
const [cacheReady, setCacheReady] = useState(false);

  const [memberName, setMemberName] = useState("");
const [memberPhoto, setMemberPhoto] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState("");
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [selectedIndex, setSelectedIndex] =
  useState<number | null>(null);
  const [selectedVideoIndex, setSelectedVideoIndex] =
  useState<number | null>(null);
  useEffect(() => {
  if (
    selectedVideoIndex === null ||
    !videoViewerRef.current
  ) {
    return;
  }

  requestAnimationFrame(() => {
    const viewer = videoViewerRef.current;

    if (!viewer) return;

    viewer.scrollTo({
      top:
        selectedVideoIndex *
        viewer.clientHeight,
      behavior: "instant",
    });
  });
}, [selectedVideoIndex]);

  const [photoViewerCurrentIndex, setPhotoViewerCurrentIndex] =
  useState<number | null>(null);

const [videoViewerControlsVisible, setVideoViewerControlsVisible] =
  useState<number | null>(null);

  const [videoViewerMuted, setVideoViewerMuted] =
  useState(true);

  const [videoViewerReady, setVideoViewerReady] =
  useState<Record<number, boolean>>({});

  const [allMediaMuted, setAllMediaMuted] =
  useState<Record<string, boolean>>({});

  const [allMediaPlaying, setAllMediaPlaying] =
  useState<Record<string, boolean>>({});

const photoViewerRef =
  useRef<HTMLDivElement | null>(null);

const videoViewerRef =
  useRef<HTMLDivElement | null>(null);

const fullscreenPhotoRefs =
  useRef<(HTMLImageElement | null)[]>([]);

const fullscreenVideoRefs =
  useRef<(HTMLVideoElement | null)[]>([]);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [touchStartX, setTouchStartX] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
 useEffect(() => {
  const updateNetworkStatus = () => {
    setIsOffline(!navigator.onLine);
  };

  updateNetworkStatus();

  window.addEventListener("online", updateNetworkStatus);
  window.addEventListener("offline", updateNetworkStatus);

  return () => {
    window.removeEventListener("online", updateNetworkStatus);
    window.removeEventListener("offline", updateNetworkStatus);
  };
}, []);

useEffect(() => {
  async function restoreCachedData() {
    // CACHED ADMIN PROFILE
    try {
      const cachedProfile =
        localStorage.getItem(PROFILE_CACHE_KEY);

      if (cachedProfile) {
        const profile = JSON.parse(cachedProfile);

        setProfileName(profile.profile_name || "");
        setProfileBio(profile.profile_bio || "");
        setProfilePhoto(profile.profile_photo || "");
      }
    } catch (error) {
      console.log(
        "Cached profile restore failed:",
        error
      );
    }

    // CACHED PHOTOS
try {
  const cachedPhotos =
    localStorage.getItem(PHOTOS_CACHE_KEY);

  if (cachedPhotos) {
    const parsedPhotos = JSON.parse(cachedPhotos);

    setPhotos(parsedPhotos);
  }
} catch (error) {
  console.log(
    "Cached photos restore failed:",
    error
  );
}

    // CACHED VIDEOS
try {
  const cachedVideos =
    localStorage.getItem(VIDEOS_CACHE_KEY);

  if (cachedVideos) {
    const parsedVideos = JSON.parse(cachedVideos);

    setVideos(parsedVideos);
  }
} catch (error) {
  console.log(
    "Cached videos restore failed:",
    error
  );
}
setCacheReady(true);
  }

  restoreCachedData();
}, []);
 
   
  const language =
  typeof navigator !== "undefined" &&
  navigator.language.startsWith("zh")
    ? "zh"
    : "en";

const t = {
  en: {
    appName: "MSpace",
    photos: "Photos",
    videos: "Videos",
    chat: "Chat With Me",
    install: "Install MSpace",
    loading: "Loading...",
    welcome:
      "Welcome to my personal space. View my exclusive photos, watch my latest videos and chat with me directly.",
    copyright: "All Rights Reserved",
    offline: "No internet connection",
  },

  zh: {
    appName: "星域",
    photos: "照片",
    videos: "视频",
    chat: "与我聊天",
    install: "安装星域",
    loading: "加载中...",
    welcome:
      "欢迎来到我的个人空间。查看我的独家照片、观看最新视频，并直接与我聊天。",
    copyright: "版权所有",
    offline: "网络不可用，请检查网络",
  },
}[language];

  useEffect(() => {
  loadInitialData();

  checkBanStatus();
  trackVisit();

  const interval = setInterval(() => {
    loadProfile();
    loadPhotos();
    loadVideos();

    checkBanStatus();
  }, 5000);

  return () => clearInterval(interval);
}, []);


 useEffect(() => {
  const handler = (e: any) => {
    e.preventDefault();

    setDeferredPrompt(e);
    setShowInstallButton(true);
  };

  window.addEventListener(
    "beforeinstallprompt",
    handler
  );

  return () =>
    window.removeEventListener(
      "beforeinstallprompt",
      handler
    );
}, []);

useEffect(() => {
  const checkScreen = () => {
    setIsMobile(window.innerWidth < 768);
  };

  checkScreen();

  window.addEventListener("resize", checkScreen);

  return () =>
    window.removeEventListener(
      "resize",
      checkScreen
    );
}, []);

useEffect(() => {
  const channel = supabase
    .channel("members-unread")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
      },
      () => {
        loadUnreadCount();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);

useEffect(() => {
  const isMobileChrome =
    /CriOS/i.test(navigator.userAgent) ||
    (/Android/i.test(navigator.userAgent) &&
      /Chrome/i.test(navigator.userAgent));

  if (isMobileChrome) {
    return;
  }

  const html = document.documentElement;
  const body = document.body;

  const previousHtmlOverflow = html.style.overflow;
  const previousBodyOverflow = body.style.overflow;
  const previousHtmlHeight = html.style.height;
  const previousBodyHeight = body.style.height;
  const previousHtmlOverscroll = html.style.overscrollBehavior;
  const previousBodyOverscroll = body.style.overscrollBehavior;

  html.style.overflow = "hidden";
  body.style.overflow = "hidden";

  html.style.height = "100%";
  body.style.height = "100%";

  html.style.overscrollBehavior = "none";
  body.style.overscrollBehavior = "none";

  return () => {
    html.style.overflow = previousHtmlOverflow;
    body.style.overflow = previousBodyOverflow;

    html.style.height = previousHtmlHeight;
    body.style.height = previousBodyHeight;

    html.style.overscrollBehavior = previousHtmlOverscroll;
    body.style.overscrollBehavior = previousBodyOverscroll;
  };
}, []);


async function loadInitialData() {
  await Promise.all([
    loadProfile(),
    loadPhotos(),
    loadVideos(),
    loadUnreadCount(),
  ]);

  setLoading(false);
}


async function loadProfile() {
  const supabase = createClient();

  // Offline: restore the cached profile
  if (!navigator.onLine) {
    try {
      const cachedProfile =
        localStorage.getItem(PROFILE_CACHE_KEY);

      if (cachedProfile) {
        const profile = JSON.parse(cachedProfile);

        setProfileName(profile.profile_name || "");
        setProfileBio(profile.profile_bio || "");

        if (profile.profile_photo) {
  setProfilePhoto(profile.profile_photo);
} else {
  setProfilePhoto("");
}
      }
    } catch (error) {
      console.log("Cached profile restore failed:", error);
    }

    return;
  }

  // Online: load the latest profile from Supabase
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (data) {
    setProfileName(data.profile_name);
    setProfileBio(data.profile_bio);
    setProfilePhoto(data.profile_photo);

    // Save profile information locally
    try {
      localStorage.setItem(
        PROFILE_CACHE_KEY,
        JSON.stringify({
          profile_name: data.profile_name,
          profile_bio: data.profile_bio,
          profile_photo: data.profile_photo,
        })
      );
    } catch (error) {
      console.log("Profile cache save failed:", error);
    }

    // Save the actual profile image locally
    if (data.profile_photo) {
      await cacheMedia(data.profile_photo);
    }
  }

  if (error) {
    console.log(error);
  }
}

async function loadPhotos() {
  const supabase = createClient();

  // Offline: restore cached photos
  if (!navigator.onLine) {
    try {
      const cachedPhotos =
        localStorage.getItem(PHOTOS_CACHE_KEY);

      if (cachedPhotos) {
        const parsedPhotos = JSON.parse(cachedPhotos);

        const restoredPhotos = await Promise.all(
          parsedPhotos.map(async (photo: any) => {
            if (!photo.image_url) {
              return photo;
            }

            const cachedUrl =
              await getCachedMediaUrl(photo.image_url);

            return {
              ...photo,
              image_url: cachedUrl,
            };
          })
        );

        setPhotos(restoredPhotos);
      }
    } catch (error) {
      console.log("Cached photos restore failed:", error);
    }

    return;
  }

  // Online: load the latest photos from Supabase
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .order("id", { ascending: false });

  if (data) {
    setPhotos(data);

    // Save photo information locally
    try {
      localStorage.setItem(
        PHOTOS_CACHE_KEY,
        JSON.stringify(data)
      );
    } catch (error) {
      console.log("Photos cache save failed:", error);
    }

    // Save the actual photo files locally
    await Promise.all(
  data
    .filter((photo) => photo.image_url)
    .map((photo) => cacheMedia(photo.image_url))
);
  }

  if (error) {
    console.log(error);
  }
}

async function loadVideos() {
  const supabase = createClient();

  // Offline: restore cached videos
  if (!navigator.onLine) {
    try {
      const cachedVideos =
        localStorage.getItem(VIDEOS_CACHE_KEY);

      if (cachedVideos) {
        const parsedVideos = JSON.parse(cachedVideos);

        const restoredVideos = await Promise.all(
          parsedVideos.map(async (video: any) => {
            if (!video.thumbnail_url) {
              return video;
            }

            const cachedThumbnail =
              await getCachedMediaUrl(video.thumbnail_url);

            return {
              ...video,
              thumbnail_url: cachedThumbnail,
            };
          })
        );

        setVideos(restoredVideos);
      }
    } catch (error) {
      console.log("Cached videos restore failed:", error);
    }

    return;
  }

  // Online: load the latest videos from Supabase
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .order("id", { ascending: false });

  if (data) {
    setVideos(data);

    // Save video information locally
    try {
      localStorage.setItem(
        VIDEOS_CACHE_KEY,
        JSON.stringify(data)
      );
    } catch (error) {
      console.log("Videos cache save failed:", error);
    }

    // Save the actual video thumbnails locally
    await Promise.all(
  data
    .filter((video) => video.thumbnail_url)
    .map((video) => cacheMedia(video.thumbnail_url))
);

  }

  if (error) {
    console.log(error);
  }
}

async function checkBanStatus() {
  const cachedName =
    localStorage.getItem("mspace-member-name") || "";

  const cachedPhoto =
    localStorage.getItem("mspace-member-photo") || "";

  if (cachedName) {
    setMemberName(cachedName);
  }

  if (cachedPhoto) {
    setMemberPhoto(cachedPhoto);
  }
  const memberId =
    localStorage.getItem("mspace_member_id");

  if (!memberId) {
    router.push("/");
    return;
  }

  const supabase = createClient();

  const { data: member, error } = await supabase
    .from("members")
    .select("*")
    .eq("member_id", memberId)
    .single();

    if (member) {
  const name = member.name || "";
  const photo = member.photo_url || "";

  setMemberName(name);
  setMemberPhoto(photo);

  localStorage.setItem(
    "mspace-member-name",
    name
  );

  localStorage.setItem(
    "mspace-member-photo",
    photo
  );
}

  if (error) {
  console.log(
    "Could not verify member because of a network error. Staying on members page."
  );
  return;
}

if (!member) {
  localStorage.removeItem("mspace_member_id");
  router.push("/");
  return;
}

  // Account ban
  if (member.banned) {
    alert("Your MSpace account has been banned.");

    localStorage.removeItem(
      "mspace_member_id"
    );

    router.push("/");
    return;
  }

  // Device ban
  if (member.device_id) {
    const { data: bannedDevice } =
      await supabase
        .from("banned_devices")
        .select("*")
        .eq("device_id", member.device_id)
        .maybeSingle();

    if (bannedDevice) {
      alert("This device has been blocked.");

      localStorage.removeItem(
        "mspace_member_id"
      );

      router.push("/");
      return;
    }
  }
}

async function trackVisit() {
  try {
    const memberId =
      localStorage.getItem("mspace_member_id");

    const deviceId =
      localStorage.getItem("mspace_device_id");

    if (!memberId) return;

    const supabase = createClient();

    const { data: member } = await supabase
      .from("members")
      .select("name")
      .eq("member_id", memberId)
      .single();

    await supabase
      .from("page_visits")
      .insert({
        member_id: memberId,
        member_name: member?.name || "",
        device_id: deviceId || "",
      });
  } catch (error) {
    console.log("Visit tracking failed", error);
  }
}


async function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();

    const choiceResult =
      await deferredPrompt.userChoice;

    if (choiceResult.outcome === "accepted") {
      console.log("MSpace installed");
    }

    return;
  }

  const isIOS =
    /iPad|iPhone|iPod/.test(
      navigator.userAgent
    );

  if (isIOS) {
    alert(
      "To install MSpace:\n\n" +
      "1. Tap Share\n" +
      "2. Tap Add to Home Screen\n" +
      "3. Tap Add"
    );
  } else {
    alert(
      "To install MSpace:\n\n" +
      "Open your browser menu and select:\n" +
      "'Install App' or 'Add to Home Screen'"
    );
  }
}
async function openChat() {
  router.push("/chat");
}

async function loadUnreadCount() {
  const memberId = localStorage.getItem("mspace_member_id");

  if (!memberId) return;

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("member_id", memberId)
    .maybeSingle();

  if (!conversation) {
    setUnreadCount(0);
    return;
  }

  const { count } = await supabase
    .from("messages")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("conversation_id", conversation.id)
    .eq("sender", "admin")
    .eq("is_read", false);

 console.log("Unread count:", count);
  setUnreadCount(count ?? 0);
}


const allMedia = useMemo(() => {
  const photoItems = photos.map((photo) => ({
    type: "photo" as const,
    id: photo.id,
    url: photo.image_url,
    created_at: photo.created_at,
  }));

  const videoItems = videos.map((video) => ({
    type: "video" as const,
    id: video.id,
    url: video.video_url,
    thumbnail_url: video.thumbnail_url,
    created_at: video.created_at,
  }));

  return [...photoItems, ...videoItems].sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
  );
}, [photos, videos]);

useEffect(() => {
  if (selectedIndex === null) return;

  setPhotoViewerCurrentIndex(selectedIndex);

  requestAnimationFrame(() => {
    const viewer = photoViewerRef.current;

    if (!viewer) return;

    const target = viewer.children[
      selectedIndex
    ] as HTMLElement | undefined;

    target?.scrollIntoView({
      behavior: "instant",
      block: "start",
    });
  });
}, [selectedIndex]);

useEffect(() => {
  if (activeMediaTab !== "all") return;

  const videos =
    document.querySelectorAll<HTMLVideoElement>(
      "#all-media video"
    );

  if (videos.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video =
          entry.target as HTMLVideoElement;

        if (entry.isIntersecting) {
          videos.forEach((otherVideo) => {
            if (otherVideo !== video) {
              otherVideo.pause();
            }
          });

          const activeMedia = allMedia.find(
  (item) => item.type === "video" && item.url === video.src
);

video.muted = activeMedia
  ? allMediaMuted[activeMedia.id] ?? true
  : true;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    },
    {
      threshold: 0.7,
    }
  );

  videos.forEach((video) => {
    observer.observe(video);
  });

  return () => {
    observer.disconnect();
  };
}, [activeMediaTab, allMedia.length, allMediaMuted]);

useEffect(() => {
  const previousScrollRestoration =
    window.history.scrollRestoration;

  window.history.scrollRestoration = "manual";

  const timer = setTimeout(() => {
    window.scrollTo(0, 0);
  }, 100);

  return () => {
    clearTimeout(timer);
    window.history.scrollRestoration =
      previousScrollRestoration;
  };
}, []);


useEffect(() => {
  if (
    activeMediaTab !== "photos" &&
    activeMediaTab !== "videos"
  ) {
    return;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document
        .getElementById("members-page-header")
        ?.scrollIntoView({
          behavior: "instant",
          block: "start",
        });
    });
  });
}, [activeMediaTab]);


  return (
  
   
   <main
  style={{
    fontFamily: "Arial, sans-serif",
    padding: "0px 5px",
    width: "100%",
    maxWidth: "none",
    margin: 0,
    visibility: cacheReady ? "visible" : "hidden",
  }}
>

  {isOffline && (
  <div
    style={{
      width: "100%",
      minHeight: "44px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      padding: "0 14px",
      boxSizing: "border-box",
      background: "#fff1f2",
      borderBottom: "1px solid #fecdd3",
      color: "#4b5563",
      fontSize: "14px",
      fontWeight: 500,
    }}
  >
    <WifiOff
      size={18}
      strokeWidth={2.4}
      style={{
        color: "#ef4444",
        flexShrink: 0,
      }}
    />

    <span>{t.offline}</span>
  </div>
)}



 {/* HEADER */}

<div
  id="members-page-header"
  style={{
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 10px 0",
    boxSizing: "border-box",
  }}
>
  <h1
    style={{
      fontSize: "25px",
      fontWeight: "900",
      letterSpacing: "-1px",
      margin: 0,
      background:
        "linear-gradient(135deg,#7c3aed,#a855f7,#c084fc)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    }}
  >
    {t.appName}
  </h1>

  {!isOffline && <NotificationButton />}
</div>

   

      {/* MEMBER PROFILE */}

<div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "6px 10px 6px 6px",
    marginTop: "12px",
    marginBottom: "10px",
    width: "fit-content",
marginLeft: "5px",
marginRight: "0",
    boxSizing: "border-box",
  }}
>
  <button
    type="button"
    onClick={() => router.push("/members/profile")}
    style={{
      border: "none",
      background: "transparent",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: 0,
      cursor: "pointer",
    }}
  >
    <ProfileAvatar
      name={memberName || "Member"}
      photoUrl={memberPhoto}
      size={38}
    />

    <span
      style={{
        fontSize: "16px",
        fontWeight: 700,
        color: "#111827",
        whiteSpace: "nowrap",
      }}
    >
      {memberName || "Member"}
    </span>

    <ChevronRight
      size={18}
      strokeWidth={2.2}
      color="#6b7280"
    />
  </button>
</div>

{/* PROFILE SECTION */}

 <div
  style={{
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: isMobile ? "15px" : "30px",
    justifyContent: "flex-start",
    marginTop: "0px",
    marginBottom: "5px",
    padding: isMobile
  ? "15px"
  : "8px 20px",
    width: "95%",
    maxWidth: "1400px",
    marginLeft: "auto",
    marginRight: "auto",
    boxSizing: "border-box",
    borderRadius: "20px",
   background:
"linear-gradient(135deg,#faf5ff 0%,#ffffff 100%)",
   border: "1px solid #e8e8e8",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  }}
>

  <img
  src={
    profilePhoto ||
    "https://trmbblhdiolnbdnhlepv.supabase.co/storage/v1/object/public/avatars/WhatsApp%20Image%202025-02-22%20at%201.43.05%20PM.jpeg"
  }
  loading="eager"
  decoding="sync"
  alt="Donald Lee"
  onError={async (e) => {
    const image = e.currentTarget;

    if (image.dataset.fallbackApplied === "true") {
      return;
    }

    image.dataset.fallbackApplied = "true";

    if (profilePhoto) {
      const cachedUrl = await getCachedMediaUrl(profilePhoto);

      if (cachedUrl !== profilePhoto) {
        image.src = cachedUrl;
      }
    }
  }}
  style={{
  width: isMobile ? "90px" : "160px",
  height: isMobile ? "90px" : "160px",
  borderRadius: "50%",
  objectFit: "cover",
  marginTop: isMobile ? "0px" : "0px",
    border: "6px solid #ede9fe",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
  }}
/>

<div
  style={{
    flex: 1,
    display: "flex",
    flexDirection: "column",
  }}
>
    <h2
      style={{
        fontSize: isMobile ? "24px" : "32px",
        margin: 0,
        color: "#111",
        whiteSpace: "nowrap",
      }}
    >
      {profileName}
    </h2>

    <p
      style={{
        maxWidth: isMobile ? "100%" : "430px",
        marginTop: "10px",
        fontSize: isMobile ? "13px" : "18px",
        color: "#666",
        lineHeight: "1.5",
      }}
    >
      {
  profileBio || t.welcome
}
    </p>

 <div
  style={{
    display: "flex",
    justifyContent: "flex-start",
    marginTop: "15px",
  }}
>
  <div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    marginTop: "5px",
  }}
>
    <div
      style={{
        display: "flex",
        gap: isMobile ? "8px" : "30px",
      }}
    >
      <div style={{ textAlign: "center" }}>
       <div
  style={{
    fontSize: isMobile ? "16px" : "24px",
    fontWeight: "800",
    background:
      "linear-gradient(90deg,#7c3aed,#a855f7)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    lineHeight: "1",
  }}
>
  {photos.length}
</div>
        <div
  style={{
    fontSize: "13px",
    color: "#555",
    fontWeight: "600",
    marginTop: "4px",
  }}
>
  {t.photos}
</div>
      </div>

      <div style={{ textAlign: "center" }}>
        <div
  style={{
    fontSize: isMobile ? "16px" : "24px",
    fontWeight: "800",
    background:
      "linear-gradient(90deg,#7c3aed,#a855f7)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    lineHeight: "1",
  }}
>
  {videos.length}
</div>
        <div
  style={{
    fontSize: "13px",
    color: "#555",
    fontWeight: "600",
    marginTop: "4px",
  }}
>
  {t.videos}
</div>
      </div>
    </div>

    <button
  onClick={openChat}
  style={{
    position: "relative",

    padding: isMobile ? "8px 16px" : "12px 30px",
    borderRadius: isMobile ? "10px" : "14px",
    fontSize: isMobile ? "14px" : "16px",
    background:
      "linear-gradient(90deg,#7c3aed,#9333ea)",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow:
      "0 4px 12px rgba(124,58,237,0.25)",
  }}
>
  <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "8px",
  }}
>
  <MessageCircleMore
    size={22}
    strokeWidth={2.5}
  />

  <span>{t.chat}</span>
</div>

  {unreadCount > 0 && (
    <div
      style={{
        position: "absolute",
        top: -8,
        right: -8,

        minWidth: 22,
        height: 22,

        borderRadius: 11,

        background: "#25D366",
        color: "#fff",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        fontSize: 12,
        fontWeight: 700,

        padding: "0 6px",
      }}
    >
      {unreadCount}
    </div>
  )}
</button>
  </div>
</div>

</div>
</div>
        

      
      {/* MEDIA NAVIGATION */}

<div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "60px",
    marginTop: "14px",
    marginBottom: "14px",
    width: "100%",
    boxSizing: "border-box",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    background: "#ffffff",
    paddingTop: "10px",
    paddingBottom: "10px",
  }}
>
  {/* ALL */}
  <button
    type="button"
    onClick={() => {
      setActiveMediaTab("all");
    }}
    style={{
      width: "44px",
      height: "44px",
      borderRadius: "12px",
      border: "none",
      background:
        activeMediaTab === "all"
          ? "linear-gradient(135deg,#7c3aed,#9333ea)"
          : "#f3f4f6",
      color:
        activeMediaTab === "all"
          ? "#fff"
          : "#555",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
    }}
  >
    <Grid3X3 size={21} />
  </button>

  {/* PHOTOS */}
  <button
    type="button"
    onClick={() => {
  const allVideos =
    document.querySelectorAll<HTMLVideoElement>(
      "#all-media video"
    );

  allVideos.forEach((video) => {
    video.muted = true;
    video.pause();
  });

  setAllMediaMuted((prev) => {
    const next = { ...prev };

    allMedia.forEach((item) => {
      if (item.type === "video") {
        next[item.id] = true;
      }
    });

    return next;
  });

  setActiveMediaTab("photos");
    }}
    style={{
      width: "44px",
      height: "44px",
      borderRadius: "12px",
      border: "none",
      background:
        activeMediaTab === "photos"
          ? "linear-gradient(135deg,#7c3aed,#9333ea)"
          : "#f3f4f6",
      color:
        activeMediaTab === "photos"
          ? "#fff"
          : "#555",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
    }}
  >
    <Image size={21} />
  </button>

  {/* VIDEOS */}
  <button
    type="button"
    onClick={() => {
  const allVideos =
    document.querySelectorAll<HTMLVideoElement>(
      "#all-media video"
    );

  allVideos.forEach((video) => {
    video.muted = true;
    video.pause();
  });

  setAllMediaMuted((prev) => {
    const next = { ...prev };

    allMedia.forEach((item) => {
      if (item.type === "video") {
        next[item.id] = true;
      }
    });

    return next;
  });

  setActiveMediaTab("videos");
    }}
    style={{
      width: "44px",
      height: "44px",
      borderRadius: "12px",
      border: "none",
      background:
        activeMediaTab === "videos"
          ? "linear-gradient(135deg,#7c3aed,#9333ea)"
          : "#f3f4f6",
      color:
        activeMediaTab === "videos"
          ? "#fff"
          : "#555",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
    }}
  >
    <Video size={21} />
  </button>
</div>

{/* ALL MEDIA */}

{activeMediaTab === "all" && (
  <div
    id="all-media"
    style={{
      width: "100%",
      padding: 0,
      margin: 0,
    }}
  >
    {allMedia.map((media) => (
      <div
        key={`${media.type}-${media.id}`}
        style={{
          width: "100%",
          height: "100dvh",
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background: "#000",
          scrollSnapAlign: "start",
        }}
      >
        {media.type === "photo" ? (
          <img
            src={media.url}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
            }}
          />
        ) : (
  <div
    style={{
      position: "relative",
      width: "100%",
      height: "100%",
    }}
  >

    {!allMediaPlaying[media.id] && (
  <img
    src={media.thumbnail_url}
    alt=""
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "contain",
      display: "block",
      background: "#000",
      zIndex: 1,
    }}
  />
)}

    <video
  src={media.url}
  poster={media.thumbnail_url}
  muted={allMediaMuted[media.id] ?? true}
  playsInline
  preload="auto"
  onLoadStart={() => {
    setAllMediaPlaying((prev) => ({
      ...prev,
      [media.id]: false,
    }));
  }}
  onPlaying={(e) => {
  const video = e.currentTarget;

  if ("requestVideoFrameCallback" in video) {
    video.requestVideoFrameCallback(() => {
      setAllMediaPlaying((prev) => ({
        ...prev,
        [media.id]: true,
      }));
    });
  } else {
    requestAnimationFrame(() => {
      setAllMediaPlaying((prev) => ({
        ...prev,
        [media.id]: true,
      }));
    });
  }
}}
  style={{
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
    background: "#000",
    opacity: allMediaPlaying[media.id] ? 1 : 0,
    zIndex: 2,
  }}
/>
          
        <button
          onClick={(e) => {
  e.stopPropagation();

  const video =
    e.currentTarget.parentElement?.querySelector(
      "video"
    );

  if (!video) return;

  const nextMuted = !video.muted;

  const allVideos =
    document.querySelectorAll<HTMLVideoElement>(
      "#all-media video"
    );

  allVideos.forEach((otherVideo) => {
    otherVideo.muted = nextMuted;
  });

  const nextStates: Record<string, boolean> = {};

  allMedia.forEach((item) => {
    if (item.type === "video") {
      nextStates[item.id] = nextMuted;
    }
  });

  setAllMediaMuted(nextStates);
}}
          style={{
            position: "absolute",
            bottom: "24px",
            right: "18px",
            width: "46px",
            height: "46px",
            borderRadius: "50%",
            border: "none",
            background: "#fff",
            color: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 10,
          }}
        >
          {allMediaMuted[media.id] ?? true ? (
            <VolumeX size={23} strokeWidth={2.4} />
          ) : (
            <Volume2 size={23} strokeWidth={2.4} />
          )}
        </button>
        </div>

        )}
      </div>
    ))}
  </div>
)}

{/* PHOTOS */}

{activeMediaTab === "photos" && (
  <div
    id="photos"
    style={{
      display: "grid",
      gridTemplateColumns: isMobile
        ? "repeat(3, 1fr)"
        : "repeat(6, 1fr)",
      gap: "0px",
      marginBottom: "2px",
      paddingLeft: isMobile ? "10px" : "40px",
      paddingRight: isMobile ? "10px" : "40px",
    }}
  >
    {photos.map((photo, index) => (
      <img
        key={photo.id}
        src={photo.image_url}
        alt="Photo"
        onError={async (e) => {
          const image = e.currentTarget;

          if (
            image.dataset.fallbackApplied ===
            "true"
          ) {
            return;
          }

          image.dataset.fallbackApplied = "true";

          const cachedUrl =
            await getCachedMediaUrl(
              photo.image_url
            );

          if (
            cachedUrl !== photo.image_url
          ) {
            image.src = cachedUrl;
          }
        }}
        onClick={() =>
          setSelectedIndex(index)
        }
        onMouseEnter={(e) => {
          e.currentTarget.style.transform =
            "scale(1.03)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform =
            "scale(1)";
        }}
        style={{
          width: "100%",
          height: isMobile ? "160px" : "190px",
          objectFit: "cover",
          borderRadius: "0px",
          border: "1px solid #e8e8e8",
          boxShadow:
            "0 12px 30px rgba(0,0,0,0.15)",
          cursor: "pointer",
          transition:
            "all 0.3s ease",
        }}
      />
    ))}
  </div>
)}

{/* VIDEOS */}

{activeMediaTab === "videos" && (
  <div
    id="videos"
    style={{
      display: "grid",
      gridTemplateColumns: isMobile
        ? "repeat(3, 1fr)"
        : "repeat(6, 1fr)",
      gap: "0px",
      paddingLeft: isMobile ? "10px" : "40px",
      paddingRight: isMobile ? "10px" : "40px",
    }}
  >
    {videos.map((video, index) => (
      <div
        key={video.id}
        onClick={() =>
          setSelectedVideoIndex(index)
        }
        style={{
          cursor: "pointer",
          width: "100%",
          height: isMobile ? "160px" : "190px",
          overflow: "hidden",
          borderRadius: "0px",
          position: "relative",
        }}
      >
        <img
          src={
            video.thumbnail_url ||
            "https://via.placeholder.com/300x200?text=Video"
          }
          alt="Video Thumbnail"
          onError={async (e) => {
            const image =
              e.currentTarget;

            if (
              image.dataset
                .fallbackApplied ===
              "true"
            ) {
              return;
            }

            image.dataset.fallbackApplied =
              "true";

            if (video.thumbnail_url) {
              const cachedUrl =
                await getCachedMediaUrl(
                  video.thumbnail_url
                );

              if (
                cachedUrl !==
                video.thumbnail_url
              ) {
                image.src = cachedUrl;
              }
            }
          }}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            pointerEvents: "none",
            borderRadius: "0px",
            border:
              "1px solid #e8e8e8",
            boxShadow:
              "0 12px 30px rgba(0,0,0,0.15)",
          }}
        />
      </div>
    ))}
  </div>
)}

<footer
  style={{
    textAlign: "center",
    marginTop: "4px",
    padding: "8px 0",
    color: "#666",
    fontSize: "12px",
    borderTop: "1px solid #eee",
  }}
>
  ©️ 2026 {language === "zh" ? "黄定襄" : "Huang Dingxiang"}. {t.copyright}
</footer>
{selectedPhoto && (
  <div
    onClick={() => setSelectedPhoto("")}
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.9)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
      cursor: "pointer",
    }}
  >
    <img
      src={selectedPhoto}
      alt=""
      style={{
        maxWidth: "95%",
        maxHeight: "95%",
        borderRadius: "12px",
      }}
    />
  </div>
)}

{showInstallButton && (
  <button
  onClick={installApp}
  style={{
    position: "fixed",
    bottom: "20px",
    left: "20px",
    zIndex: 9999,
    padding: "10px 16px",
    borderRadius: "999px",
    border: "none",
    background: "#7c3aed",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  }}
>
  📱 {t.install}
</button>
)}


 {/* FULLSCREEN PHOTO VIEWER */}

{selectedIndex !== null && (
  <div
    ref={photoViewerRef}
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 99999,
      background: "#000",
      overflowY: "auto",
      overflowX: "hidden",
      scrollSnapType: "y mandatory",
      WebkitOverflowScrolling: "touch",
    }}
    onScroll={(e) => {
      const viewer = e.currentTarget;
      const index = Math.round(
        viewer.scrollTop / window.innerHeight
      );

      if (
        index >= 0 &&
        index < photos.length &&
        index !== photoViewerCurrentIndex
      ) {
        setPhotoViewerCurrentIndex(index);
      }
    }}
  >
    {photos.map((photo, index) => (
      <div
        key={photo.id}
        style={{
          width: "100%",
          height: "100dvh",
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
          scrollSnapAlign: "start",
          scrollSnapStop: "always",
          position: "relative",
        }}
      >
        <img
          ref={(element) => {
            fullscreenPhotoRefs.current[index] =
              element;
          }}
          src={photo.image_url}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>
    ))}

    {/* CLOSE */}
    <button
      onClick={() => {
        setSelectedIndex(null);
        setPhotoViewerCurrentIndex(null);
      }}
      style={{
        position: "fixed",
        top: "18px",
        right: "18px",
        zIndex: 100000,
        width: "42px",
        height: "42px",
        borderRadius: "50%",
        border: "none",
        background: "#fff",
        color: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      <X size={24} strokeWidth={2.4} />
    </button>
  </div>
)}


{/* FULLSCREEN VIDEO VIEWER */}

{selectedVideoIndex !== null && (
  <div
    ref={videoViewerRef}
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 99999,
      background: "#000",
      overflowY: "auto",
      overflowX: "hidden",
      scrollSnapType: "y mandatory",
      WebkitOverflowScrolling: "touch",
    }}
    onScroll={(e) => {
  const viewer = e.currentTarget;

  const index = Math.round(
    viewer.scrollTop / viewer.clientHeight
  );

  const videoElements =
    viewer.querySelectorAll<HTMLVideoElement>("video");

  videoElements.forEach((video, videoIndex) => {
    if (videoIndex === index) {
      // Keep the same mute state when moving to another video
      video.muted = videoViewerMuted;

      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });

  if (
    index >= 0 &&
    index < videos.length &&
    index !== selectedVideoIndex
  ) {
    setSelectedVideoIndex(index);
  }
}}
  >
    {videos.map((video, index) => (
      <div
        key={video.id}
        style={{
          width: "100%",
          height: "100dvh",
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
          scrollSnapAlign: "start",
          scrollSnapStop: "always",
          position: "relative",
        }}
      >

        {!videoViewerReady[index] && (
  <img
    src={video.thumbnail_url || ""}
    alt=""
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "contain",
      zIndex: 1,
    }}
  />
)}
        <video
          ref={(element) => {
            fullscreenVideoRefs.current[index] =
              element;
          }}
          src={video.video_url}
          poster={video.thumbnail_url || undefined}
          onLoadStart={() => {
    setVideoViewerReady((prev) => ({
      ...prev,
      [index]: false,
    }));
  }}
  onPlaying={(e) => {
    const videoElement = e.currentTarget;

    if ("requestVideoFrameCallback" in videoElement) {
      videoElement.requestVideoFrameCallback(() => {
        setVideoViewerReady((prev) => ({
          ...prev,
          [index]: true,
        }));
      });
    } else {
      requestAnimationFrame(() => {
        setVideoViewerReady((prev) => ({
          ...prev,
          [index]: true,
        }));
      });
    }
  }}
          muted
          playsInline
          autoPlay={index === selectedVideoIndex}
          controls={
            videoViewerControlsVisible === index
          }
          onClick={(e) => {
            e.stopPropagation();

            setVideoViewerControlsVisible(
              videoViewerControlsVisible === index
                ? null
                : index
            );
          }}
          onLoadedMetadata={(e) => {
            if (index === selectedVideoIndex) {
              e.currentTarget.play().catch(() => {});
            }
          }}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
            background: "#000",
            opacity: videoViewerReady[index] ? 1 : 0,
zIndex: 2,
          }}
        />
      </div>
    ))}

    {/* MUTE / UNMUTE */}

<button
  onClick={(e) => {
    e.stopPropagation();

    const video =
      fullscreenVideoRefs.current[
        selectedVideoIndex
      ];

    if (!video) return;

    const nextMuted = !video.muted;

    video.muted = nextMuted;
    setVideoViewerMuted(nextMuted);
  }}
  style={{
    position: "fixed",
    bottom: "28px",
    right: "18px",
    zIndex: 100000,
    width: "46px",
    height: "46px",
    borderRadius: "50%",
    border: "none",
    background: "#fff",
    color: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  }}
>
  {videoViewerMuted ? (
    <VolumeX size={23} strokeWidth={2.4} />
  ) : (
    <Volume2 size={23} strokeWidth={2.4} />
  )}
</button>

    {/* CLOSE */}
    <button
      onClick={(e) => {
  e.stopPropagation();

  fullscreenVideoRefs.current.forEach((video) => {
    if (video) {
      video.muted = true;
      video.pause();
    }
  });

  setVideoViewerMuted(true);
  setSelectedVideoIndex(null);
  setVideoViewerControlsVisible(null);
}}
      style={{
        position: "fixed",
        top: "18px",
        right: "18px",
        zIndex: 100000,
        width: "42px",
        height: "42px",
        borderRadius: "50%",
        border: "none",
        background: "#fff",
        color: "#000",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      <X size={24} strokeWidth={2.4} />
    </button>
  </div>
)}
</main>
);
}
