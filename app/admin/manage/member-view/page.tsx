"use client";

import Script from "next/script";
import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { compressVideo } from "@/app/chat/videoCompressor";

import {
  LogOut,
  MessageCircleMore,
  ChevronLeft,
  ChevronRight,
  X,
WifiOff,
Pencil,
ImagePlus,
Camera,
Trash2,
Play,
Grid3X3,
Image,
Video,
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

const [editingProfile, setEditingProfile] = useState(false);
const [savingProfile, setSavingProfile] = useState(false);

  const [photos, setPhotos] = useState<any[]>([]);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
const [uploadingPhoto, setUploadingPhoto] = useState(false);
const [photoPreviewFiles, setPhotoPreviewFiles] = useState<File[]>([]);
const [photoPreviewIndex, setPhotoPreviewIndex] = useState(0);
const [photoPreviewFullscreen, setPhotoPreviewFullscreen] =
  useState(false);

const [videos, setVideos] = useState<any[]>([]);

const [videoPreviewFiles, setVideoPreviewFiles] = useState<File[]>([]);
const [videoThumbnailFiles, setVideoThumbnailFiles] =
  useState<(File | null)[]>([]);
const [videoPreviewIndex, setVideoPreviewIndex] = useState(0);
const [videoPreviewFullscreen, setVideoPreviewFullscreen] =
  useState(false);
  const [videoControlsVisible, setVideoControlsVisible] =
  useState<number | null>(null);
  const [videoPreviewPlaying, setVideoPreviewPlaying] =
  useState(false);
const [uploadingVideo, setUploadingVideo] = useState(false);


const videoPreviewUrls = useMemo(() => {
  return videoPreviewFiles.map((file) =>
    URL.createObjectURL(file)
  );
}, [videoPreviewFiles]);

const videoThumbnailUrls = useMemo(() => {
  return videoThumbnailFiles.map((file) =>
    file ? URL.createObjectURL(file) : ""
  );
}, [videoThumbnailFiles]);

async function uploadSelectedVideos() {
  if (videoPreviewFiles.length === 0) {
    alert("Please select a video first.");
    return;
  }

  if (uploadingVideo) return;

  setUploadingVideo(true);

  const supabase = createClient();

  try {
    for (const file of videoPreviewFiles) {
      console.log(
        "Original video:",
        file.name,
        (file.size / 1024 / 1024).toFixed(2),
        "MB"
      );

      // Step 1: Compress video
      const compressedFile = await compressVideo(file);

      console.log(
        "Compressed video:",
        (compressedFile.size / 1024 / 1024).toFixed(2),
        "MB"
      );

      // Step 2: Generate thumbnail on the server
      const formData = new FormData();

      formData.append("video", compressedFile);

      const thumbnailResponse = await fetch(
        "/api/video-thumbnail",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!thumbnailResponse.ok) {
        const errorData =
          await thumbnailResponse.json();

        throw new Error(
          errorData.error ||
            "Thumbnail generation failed."
        );
      }

      const thumbnailBlob =
        await thumbnailResponse.blob();

      // Step 3: Create unique filenames
      const id = crypto.randomUUID();

      const videoFileName =
        `${id}.mp4`;

      const thumbnailFileName =
        `${id}.jpg`;

      // Step 4: Upload compressed video
      const { error: videoUploadError } =
        await supabase.storage
          .from("videos")
          .upload(
            videoFileName,
            compressedFile,
            {
              contentType: "video/mp4",
              upsert: false,
            }
          );

      if (videoUploadError) {
        throw videoUploadError;
      }

      // Step 5: Upload server-generated thumbnail
      const { error: thumbnailUploadError } =
        await supabase.storage
          .from("Thumbnails")
          .upload(
            thumbnailFileName,
            thumbnailBlob,
            {
              contentType: "image/jpeg",
              upsert: false,
            }
          );

      if (thumbnailUploadError) {
        throw thumbnailUploadError;
      }

      // Step 6: Get public URLs
      const { data: videoPublicData } =
        supabase.storage
          .from("videos")
          .getPublicUrl(videoFileName);

      const { data: thumbnailPublicData } =
        supabase.storage
          .from("Thumbnails")
          .getPublicUrl(thumbnailFileName);

      // Step 7: Save video record
      const { error: databaseError } =
        await supabase
          .from("videos")
          .insert({
            video_url:
              videoPublicData.publicUrl,
            thumbnail_url:
              thumbnailPublicData.publicUrl,
          });

      if (databaseError) {
        throw databaseError;
      }
    }

    setVideoPreviewFiles([]);
    setVideoPreviewIndex(0);

    await loadVideos();

    alert("Videos uploaded successfully!");
  } catch (error) {
    console.error(
      "Video upload failed:",
      error
    );

    alert(
      error instanceof Error
        ? error.message
        : "Video upload failed."
    );
  } finally {
    setUploadingVideo(false);
  }
}

const videoInputRef = useRef<HTMLInputElement | null>(null);

const videoViewerRef = useRef<HTMLDivElement | null>(null);


const fullscreenVideoRefs =
  useRef<(HTMLVideoElement | null)[]>([]);
 useEffect(() => {
  if (
    !videoPreviewFullscreen ||
    videoPreviewFiles.length === 0
  ) {
    return;
  }

  const timer = setTimeout(() => {
    const video =
      fullscreenVideoRefs.current[
        videoPreviewIndex
      ];

    if (!video) return;

    video.muted = true;

    video.play().catch((error) => {
      console.log(
        "Initial video autoplay blocked:",
        error
      );
    });
  }, 100);

  return () => {
    clearTimeout(timer);
  };
}, [
  videoPreviewFullscreen,
  videoPreviewIndex,
  videoPreviewFiles.length,
]);

const videoPreviewUrl = useMemo(() => {
  const file =
    videoPreviewFiles[videoPreviewIndex];

  if (!file) return "";

  return URL.createObjectURL(file);
}, [
  videoPreviewFiles,
  videoPreviewIndex,
]);

const videoThumbnailUrl = useMemo(() => {
  const file =
    videoThumbnailFiles[videoPreviewIndex];

  if (!file) return "";

  return URL.createObjectURL(file);
}, [
  videoThumbnailFiles,
  videoPreviewIndex,
]);

const [profileName, setProfileName] = useState("");
const [profileBio, setProfileBio] = useState("");

const [profilePhoto, setProfilePhoto] = useState("");


const [editName, setEditName] = useState("");
const [editBio, setEditBio] = useState("");
const [editPhoto, setEditPhoto] = useState("");

const [editPhotoFile, setEditPhotoFile] =
  useState<File | null>(null);


const [cacheReady, setCacheReady] = useState(false);

  const [selectedPhoto, setSelectedPhoto] = useState("");
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [selectedIndex, setSelectedIndex] =
  useState<number | null>(null);

  useEffect(() => {
  if (selectedIndex === null) {
    return;
  }

  const timer = setTimeout(() => {
    const viewer = document.getElementById(
  "photo-viewer"
) as HTMLElement | null;

    if (!viewer) return;

    viewer.scrollTo({
      top: selectedIndex * viewer.clientHeight,
      behavior: "instant",
    });
  }, 100);

  return () => clearTimeout(timer);
}, [selectedIndex]);

 const [activeMediaTab, setActiveMediaTab] = useState<
  "all" | "photos" | "videos"
>("all");
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

          video.muted = true;
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
}, [activeMediaTab, allMedia.length]);

  const [selectedVideoIndex, setSelectedVideoIndex] =
  useState<number | null>(null);

  const [videoViewerControlsVisible, setVideoViewerControlsVisible] =
  useState<number | null>(null);

  useEffect(() => {
  if (
    selectedVideoIndex === null ||
    !videoViewerRef.current
  ) {
    return;
  }

  const timer = setTimeout(() => {
    const viewer = videoViewerRef.current;

    if (!viewer) return;

    viewer.scrollTo({
      top: selectedVideoIndex * viewer.clientHeight,
      behavior: "instant",
    });

    const videosInViewer =
      viewer.querySelectorAll("video");

    videosInViewer.forEach((video, index) => {
      if (index === selectedVideoIndex) {
        video.muted = false;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, 100);

  return () => clearTimeout(timer);
}, [selectedVideoIndex]);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [touchStartX, setTouchStartX] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
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

  const interval = setInterval(() => {
    loadProfile();
    loadPhotos();
    loadVideos();

  }, 5000);

  return () => clearInterval(interval);
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

useEffect(() => {
  if (!editingProfile) return;

  const scrollY = window.scrollY;

  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";

  return () => {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";

    window.scrollTo(0, scrollY);
  };
}, [editingProfile]);

useEffect(() => {
  const previousScrollRestoration =
    history.scrollRestoration;

  history.scrollRestoration = "manual";

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  };

  scrollToTop();

  const frame = requestAnimationFrame(() => {
    scrollToTop();

    requestAnimationFrame(() => {
      scrollToTop();
    });
  });

  const timer = window.setTimeout(() => {
    scrollToTop();
  }, 150);

  return () => {
    cancelAnimationFrame(frame);
    window.clearTimeout(timer);
    history.scrollRestoration = previousScrollRestoration;
  };
}, []);

async function loadInitialData() {
  await Promise.all([
    loadProfile(),
    loadPhotos(),
    loadVideos(),
  ]);

  setLoading(false);
}

async function loadSettings() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    console.log("Error loading settings:", error);
    return;
  }

  if (data) {
    // Member View
    setProfileName(data.profile_name || "");
    setProfileBio(data.profile_bio || "");
    setProfilePhoto(data.profile_photo || "");

    // Edit Profile
    setEditName(data.profile_name || "");
    setEditBio(data.profile_bio || "");
    setEditPhoto(data.profile_photo || "");
  }
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

async function saveProfileChanges() {
  if (savingProfile) return;

  setSavingProfile(true);

  const supabase = createClient();

  try {
    // Start with the current profile photo
    let photoUrl = profilePhoto;

    // Upload new profile photo if one was selected
    if (editPhotoFile) {
      const fileName =
        Date.now() + "-" + editPhotoFile.name;

      const { error: uploadError } =
        await supabase.storage
          .from("photos")
          .upload(fileName, editPhotoFile);

      if (uploadError) {
        console.log(
          "Error uploading profile photo:",
          uploadError
        );

        alert(
          "Photo upload failed: " +
            uploadError.message
        );

        return;
      }

      const { data: publicUrlData } =
        supabase.storage
          .from("photos")
          .getPublicUrl(fileName);

      photoUrl = publicUrlData.publicUrl;
    }

    // Save profile information
    const { error } = await supabase
      .from("settings")
      .update({
        profile_name: editName,
        profile_bio: editBio,
        profile_photo: photoUrl,
      })
      .eq("id", 1);

    if (error) {
      console.log("Error saving profile:", error);

      alert(
        "Save failed: " +
          error.message
      );

      return;
    }

    // Update Member View immediately
    setProfileName(editName);
    setProfileBio(editBio);
    setProfilePhoto(photoUrl);

    // Clear selected photo
    setEditPhotoFile(null);

    // Refresh settings from Supabase
    await loadSettings();

    // Close editor
    setEditingProfile(false);

    alert("Profile updated successfully!");
  } finally {
    setSavingProfile(false);
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

async function uploadPhoto(fileToUpload?: File) {
  const file = fileToUpload || photoFile;

if (!file) {
  alert("Please select a photo");
  return;
}

  if (uploadingPhoto) return;

  setUploadingPhoto(true);

  const supabase = createClient();

  try {
    const fileName =
      Date.now() + "-" + file.name;

    const { error: uploadError } =
      await supabase.storage
        .from("photos")
        .upload(fileName, file);

    if (uploadError) {
      console.log("Photo upload failed:", uploadError);
      alert(uploadError.message);
      return;
    }

    const photoUrl =
      `https://trmbblhdiolnbdnhlepv.supabase.co/storage/v1/object/public/photos/${fileName}`;

    const { error } = await supabase
      .from("photos")
      .insert({
        image_url: photoUrl,
      });

    if (error) {
      console.log("Photo record save failed:", error);
      alert(error.message);
      return;
    }

    setPhotoFile(null);

    await loadPhotos();

    alert("Photo uploaded!");
  } finally {
    setUploadingPhoto(false);
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

function openChat() {
  return;
}



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



 {/* ADMIN MEMBER VIEW HEADER */}

<div
id="member-view-top"
  style={{
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    padding: isMobile
      ? "10px 4px"
      : "12px 20px",
    boxSizing: "border-box",
    marginBottom: "8px",
    borderBottom: "1px solid #eeeeee",
    background: "#ffffff",
  }}
>
  {/* TITLE */}

  <div
    style={{
      display: "flex",
      flexDirection: "column",
      minWidth: 0,
      flex: 1,
    }}
  >
    <span
      style={{
        fontSize: isMobile ? "17px" : "20px",
        fontWeight: 800,
        color: "#111827",
        whiteSpace: "nowrap",
      }}
    >
      Member View
    </span>

    {!isMobile && (
      <span
        style={{
          fontSize: "11px",
          color: "#888",
          marginTop: "2px",
          whiteSpace: "nowrap",
        }}
      >
        How your page looks to members
      </span>
    )}
  </div>

  {/* HEADER BUTTONS */}

  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: isMobile ? "5px" : "7px",
      flexShrink: 0,
    }}
  >
    {/* CHAT */}

    <button
      type="button"
      onClick={() => {
        window.location.href = "/admin/chats";
      }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px",
        background: "#f8f8f8",
        color: "#3f3f3f",
        border: "1px solid #e5e5e5",
        padding: isMobile
          ? "8px 10px"
          : "9px 13px",
        borderRadius: "12px",
        fontSize: isMobile ? "12px" : "13px",
        fontWeight: 700,
        cursor: "pointer",
        boxShadow:
          "0 2px 6px rgba(0,0,0,0.05)",
        whiteSpace: "nowrap",
      }}
    >
      < MessageCircleMore
        size={isMobile ? 16 : 18}
        strokeWidth={2.4}
      />

      <span>Chat</span>
    </button>
    {/* LOGOUT */}

    <button
      type="button"
      onClick={() => {
        localStorage.removeItem("mspace_admin");
        window.location.href = "/admin";
      }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px",
        background: "#ef3030",
        color: "#ffffff",
        border: "1px solid #ef3030",
        padding: isMobile
          ? "8px 10px"
          : "9px 13px",
        borderRadius: "12px",
        fontSize: isMobile ? "12px" : "13px",
        fontWeight: 700,
        cursor: "pointer",
        boxShadow:
          "0 4px 10px rgba(239,48,48,0.18)",
        whiteSpace: "nowrap",
      }}
    >
      <LogOut
        size={isMobile ? 16 : 18}
        strokeWidth={2.4}
      />

      <span>Logout</span>
    </button>
  </div>
</div>

<div
  style={{
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "10px 5px 14px",
    width: "100%",
    boxSizing: "border-box",
  }}
>
  <button
  onClick={async () => {
  await loadSettings();
  setEditingProfile(true);
}}
    style={{
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      height: "44px",
      background: "#f5edff",
      color: "#6d28d9",
      border: "1px solid #e9d5ff",
      borderRadius: "11px",
      fontSize: "13px",
      fontWeight: 700,
      cursor: "pointer",
      whiteSpace: "nowrap",
    }}
  >
    <Pencil size={17} strokeWidth={2.3} />
    <span>Edit Profile</span>
  </button>

  <label
  style={{
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    height: "44px",
    background: "#f5edff",
    color: "#6d28d9",
    border: "1px solid #e9d5ff",
    borderRadius: "11px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
  }}
>
  <ImagePlus size={17} strokeWidth={2.3} />

  <span>
    {uploadingPhoto ? "Uploading..." : "Upload Photos"}
  </span>

  <input
  type="file"
  accept="image/*"
  multiple
  disabled={uploadingPhoto}
  onChange={(e) => {
    const files = Array.from(
      e.target.files || []
    );

    if (files.length === 0) return;

    setPhotoPreviewFiles(files);
    setPhotoPreviewIndex(0);

    e.target.value = "";
  }}
  style={{
    display: "none",
  }}
/>
</label>

  <button
  type="button"
  onClick={() => videoInputRef.current?.click()}
  disabled={uploadingVideo}
  style={{
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    height: "44px",
    background: "#f5edff",
    color: "#6d28d9",
    border: "1px solid #e9d5ff",
    borderRadius: "11px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: uploadingVideo ? "not-allowed" : "pointer",
    whiteSpace: "nowrap",
  }}
>
  <Video size={17} strokeWidth={2.3} />
  <span>
  {uploadingVideo
    ? "Uploading..."
    : "Upload Videos"}
</span>
</button>
<input
  ref={videoInputRef}
  type="file"
  accept="video/*"
  multiple
  disabled={uploadingVideo}
  onChange={async (e) => {
  const files = Array.from(
    e.target.files || []
  );

  if (files.length === 0) return;

  setVideoPreviewFiles(files);
  setVideoPreviewIndex(0);

  setVideoThumbnailFiles(
    files.map(() => null)
  );

  e.target.value = "";

  const thumbnailPromises = files.map(
  async (file) => {
    try {
      console.log(
        "Starting preview thumbnail generation:",
        file.name,
        file.size
      );

      const formData = new FormData();

      formData.append("video", file);

      const response = await fetch(
        "/api/video-thumbnail",
        {
          method: "POST",
          body: formData,
        }
      );

      console.log(
        "Preview thumbnail response:",
        file.name,
        response.status,
        response.ok
      );

      if (!response.ok) {
        return null;
      }

      const blob = await response.blob();

      return new File(
        [blob],
        `thumbnail-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.jpg`,
        {
          type: "image/jpeg",
        }
      );
    } catch (error) {
      console.error(
        "Preview thumbnail generation failed:",
        file.name,
        error
      );

      return null;
    }
  }
);

const thumbnails = await Promise.all(
  thumbnailPromises
);

console.log(
  "Generated preview thumbnails:",
  thumbnails
);

setVideoThumbnailFiles(thumbnails);
  
}}
  style={{
    display: "none",
  }}
/>

{photoPreviewFiles.length > 0 && (
  <div
  style={{
    position: "fixed",
    top: isMobile ? "130px" : "285px",
    left: "6px",
    right: "6px",
    bottom: "0",
    width: "auto",
    maxWidth: "none",
    height: "auto",
    overflow: "hidden",
    transform: "none",
    padding: "14px",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    boxSizing: "border-box",
    boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
    zIndex: 500,
    display: "flex",
    flexDirection: "column",
  }}
>
    <div
      style={{
        fontSize: "16px",
        fontWeight: 800,
        color: "#222",
        marginBottom: "12px",
      }}
    >
      Photo Preview
    </div>

    <div
  style={{
    width: "100%",
    flex: 1,
    minHeight: 0,
    position: "relative",
    overflow: "hidden",
    borderRadius: "14px",
    background: "#f3f4f6",
    touchAction: "pan-y",
  }}
  onTouchStart={(e) => {
  (e.currentTarget as any)._touchStartX =
    e.changedTouches[0].clientX;

  (e.currentTarget as any)._touchStartY =
    e.changedTouches[0].clientY;
}}
  onTouchEnd={(e) => {
  const startX =
    (e.currentTarget as any)._touchStartX;

  const startY =
    (e.currentTarget as any)._touchStartY;

  const endX = e.changedTouches[0].clientX;
  const endY = e.changedTouches[0].clientY;

  const diffX = startX - endX;
  const diffY = startY - endY;

  // Vertical movement = allow normal scrolling
  if (Math.abs(diffY) > Math.abs(diffX)) {
    return;
  }

  // Horizontal movement = change photo
  if (Math.abs(diffX) < 5) return;

  if (diffX > 0) {
    setPhotoPreviewIndex((prev) =>
      prev === photoPreviewFiles.length - 1
        ? 0
        : prev + 1
    );
  } else {
    setPhotoPreviewIndex((prev) =>
      prev === 0
        ? photoPreviewFiles.length - 1
        : prev - 1
    );
  }
}}
>
  {photoPreviewFiles.length === 1 ? (
  <div
    onClick={() => {
      setPhotoPreviewIndex(0);
      setPhotoPreviewFullscreen(true);
    }}
    style={{
      width: "100%",
      height: "100%",
      cursor: "pointer",
    }}
  >
    <img
      src={URL.createObjectURL(photoPreviewFiles[0])}
      alt="Photo Preview"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
      }}
    />
    </div>
  ) : photoPreviewFiles.length === 2 ? (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        gap: "4px",
      }}
    >
      {photoPreviewFiles.map((file, index) => (
        <div
          key={index}
          style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            borderRadius: "10px",
          }}
        >
          <img
            src={URL.createObjectURL(file)}
            alt={`Photo ${index + 1}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();

              setPhotoPreviewFiles((prev) =>
                prev.filter((_, i) => i !== index)
              );

              setPhotoPreviewIndex(0);
            }}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: "none",
              background: "rgba(0,0,0,0.65)",
              color: "#fff",
              fontSize: "20px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 5,
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  ) : (
  <div
    style={{
      display: "grid",
      width: "100%",
      height: "100%",
      gridTemplateColumns: "repeat(2, 1fr)",
      gridTemplateRows: "repeat(2, 1fr)",
      gap: "6px",
    }}
  >
    {photoPreviewFiles
      .slice(0, 4)
      .map((file, index) => {
        const isThreePhotoLayout =
          photoPreviewFiles.length === 3;

        const isPlusPhoto =
          photoPreviewFiles.length >= 5 &&
          index === 3;

        return (
          <div
            key={`${file.name}-${index}`}
            onClick={() => {
              setPhotoPreviewIndex(index);
              setPhotoPreviewFullscreen(true);
            }}
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              minWidth: 0,
              minHeight: 0,
              overflow: "hidden",
              borderRadius: "10px",
              background: "#111",
              cursor: "pointer",

              gridColumn:
                isThreePhotoLayout && index === 0
                  ? "1"
                  : undefined,

              gridRow:
                isThreePhotoLayout && index === 0
                  ? "1 / span 2"
                  : undefined,
            }}
          >
            <img
              src={URL.createObjectURL(file)}
              alt={`Photo ${index + 1}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />

            {isPlusPhoto && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.45)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "26px",
                  fontWeight: 700,
                }}
              >
                +{photoPreviewFiles.length - 4}
              </div>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();

                setPhotoPreviewFiles((prev) =>
                  prev.filter((_, i) => i !== index)
                );

                setPhotoPreviewIndex((prev) => {
                  if (prev === index) return 0;
                  if (prev > index) return prev - 1;
                  return prev;
                });
              }}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "none",
                background: "rgba(0,0,0,0.65)",
                color: "#fff",
                fontSize: "20px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 5,
              }}
            >
              ×
            </button>
          </div>
        );
      })}
  </div>
)}
</div>

    <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    marginTop: "14px",
  }}
>
  <button
    type="button"
    onClick={() => setPhotoPreviewFiles([])}
    style={{
          flex: 1,
          height: "44px",
          borderRadius: "11px",
          border: "1px solid #e5e7eb",
          background: "#f8f8f8",
          color: "#333",
          fontSize: "13px",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
    Cancel
  </button>

  <button
    type="button"
    onClick={async () => {
  if (photoPreviewFiles.length === 0) return;
  if (uploadingPhoto) return;

  for (const file of photoPreviewFiles) {
    await uploadPhoto(file);
  }

  setPhotoPreviewFiles([]);
  setPhotoPreviewIndex(0);
}}
    style={{
          flex: 1,
          height: "44px",
          borderRadius: "11px",
          border: "none",
          background:
            "linear-gradient(135deg,#7c3aed,#9333ea)",
          color: "#fff",
          fontSize: "13px",
          fontWeight: 700,
          cursor: "pointer",
          boxShadow:
            "0 5px 14px rgba(124,58,237,0.20)",
        }}
      >
    Upload Photos
  </button>
</div>
  </div>
)}

{videoPreviewFiles.length > 0 && (
  <div
    style={{
      position: "fixed",
      top: isMobile ? "130px" : "285px",
      left: "6px",
      right: "6px",
      bottom: "0",
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: "14px",
      boxSizing: "border-box",
      padding: "14px",
      zIndex: 500,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
    }}
  >
    <div
  style={{
    flex: 1,
    minHeight: 0,
    width: "100%",
    borderRadius: "14px",
    overflow: "hidden",
    background: "#fff",
    display: "grid",

    gridTemplateColumns:
      videoPreviewFiles.length === 1
        ? "1fr"
        : "repeat(2, 1fr)",

    gridTemplateRows:
      videoPreviewFiles.length === 3
        ? "repeat(2, 1fr)"
        : videoPreviewFiles.length >= 4
        ? "repeat(2, 1fr)"
        : "1fr",

    gap: "4px",
  }}
>
  {videoPreviewFiles
    .slice(0, 4)
    .map((file, index) => {

      const isThreeVideoLayout =
        videoPreviewFiles.length === 3;

      const isPlusVideo =
        videoPreviewFiles.length >= 5 &&
        index === 3;

      return (
        <div
          key={`${file.name}-${index}`}
          onClick={() => {
            setVideoPreviewIndex(index);
            setVideoPreviewFullscreen(true);
          }}
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            minWidth: 0,
            minHeight: 0,
            overflow: "hidden",
            borderRadius: "12px",
            background: "#111",

            gridColumn:
              isThreeVideoLayout && index === 0
                ? "1"
                : undefined,

            gridRow:
              isThreeVideoLayout && index === 0
                ? "1 / span 2"
                : undefined,

            cursor: "pointer",
          }}
        >
          {videoThumbnailUrls[index] ? (
            <img
              src={videoThumbnailUrls[index]}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <video
              src={videoPreviewUrls[index]}
              muted
              playsInline
              preload="metadata"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          )}

          {isPlusVideo && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "26px",
                fontWeight: 700,
              }}
            >
              +{videoPreviewFiles.length - 4}
            </div>
          )}

          
        </div>
      );
    })}
</div>

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "10px",
        marginTop: "14px",
      }}
    >
      <button
        type="button"
        onClick={() => {
          setVideoPreviewFiles([]);
          setVideoPreviewIndex(0);
        }}
        style={{
          flex: 1,
          height: "44px",
          borderRadius: "11px",
          border: "1px solid #e5e7eb",
          background: "#f8f8f8",
          color: "#333",
          fontSize: "13px",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Cancel
      </button>

      <button
        type="button"
        onClick={uploadSelectedVideos}
        style={{
          flex: 1,
          height: "44px",
          borderRadius: "11px",
          border: "none",
          background:
            "linear-gradient(135deg,#7c3aed,#9333ea)",
          color: "#fff",
          fontSize: "13px",
          fontWeight: 700,
          cursor: "pointer",
          boxShadow:
            "0 5px 14px rgba(124,58,237,0.20)",
        }}
      >
        Upload Videos
      </button>
    </div>
  </div>
)}

{photoPreviewFullscreen &&
  photoPreviewFiles.length > 0 && (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.96)",
        zIndex: 99999,
        overflowY: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
        scrollSnapType: "y mandatory",
      }}
    >
      {/* CLOSE */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setPhotoPreviewFullscreen(false);
        }}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          width: "46px",
          height: "46px",
          borderRadius: "50%",
          border:
            "1px solid rgba(255,255,255,0.18)",
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter:
            "blur(12px)",
          color: "#222",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow:
            "0 8px 24px rgba(0,0,0,0.35)",
          zIndex: 100000,
        }}
      >
        <X size={22} />
      </button>

      {/* ALL SELECTED PHOTOS */}
      {photoPreviewFiles.map((file, index) => (
        <div
          key={`${file.name}-${index}`}
          style={{
            width: "100%",
            height: "100dvh",
            minHeight: "100dvh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            scrollSnapAlign: "start",
            boxSizing: "border-box",
            padding: "20px",
            position: "relative",
          }}
        >
          {/* DELETE */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();

              setPhotoPreviewFiles((prev) =>
                prev.filter((_, i) => i !== index)
              );

              if (photoPreviewFiles.length <= 1) {
                setPhotoPreviewFullscreen(false);
                setPhotoPreviewIndex(0);
              } else {
                setPhotoPreviewIndex((prev) => {
                  if (prev > index) {
                    return prev - 1;
                  }

                  if (
                    prev === index &&
                    prev >=
                      photoPreviewFiles.length - 1
                  ) {
                    return Math.max(0, prev - 1);
                  }

                  return prev;
                });
              }
            }}
            style={{
              position: "absolute",
              top: "20px",
              left: "20px",
              width: "46px",
              height: "46px",
              borderRadius: "50%",
              border:
                "1px solid rgba(255,255,255,0.18)",
              background: "rgba(20,20,20,0.72)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter:
                "blur(12px)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow:
                "0 8px 24px rgba(0,0,0,0.35)",
              zIndex: 100001,
            }}
          >
            <Trash2
              size={20}
              strokeWidth={2.2}
            />
          </button>

          <img
            src={URL.createObjectURL(file)}
            alt={`Photo ${index + 1}`}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              width: "auto",
              height: "auto",
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>
      ))}
    </div>
  )}
</div>

{editingProfile && (
  <div
    style={{
      width: "100%",
      maxWidth: "700px",
      margin: "0 auto 18px",
      padding: "18px",
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: "14px",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      height: "calc(100dvh - 135px)",
      boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
    }}
  >
    <div
      style={{
        fontSize: "18px",
        fontWeight: 800,
        color: "#222",
        marginBottom: "16px",
      }}
    >
      Edit Profile
    </div>

    {/* Profile photo */}
<div
  style={{
    display: "flex",
    justifyContent: "center",
    marginBottom: "18px",
  }}
>
  <div
    style={{
      width: "100px",
      height: "100px",
      position: "relative",
    }}
  >
    {/* Photo */}
    <div
      style={{
        width: "100px",
        height: "100px",
        borderRadius: "50%",
        overflow: "hidden",
        background: "#f3f4f6",
        border: "2px solid #e9d5ff",
        boxSizing: "border-box",
      }}
    >
      {editPhoto && (
        <img
          src={editPhoto}
          alt="Profile"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      )}
    </div>

    {/* Edit photo button */}
    <label
      style={{
        position: "absolute",
        right: "2px",
        bottom: "2px",
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        background: "#1e293b",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "3px solid #ffffff",
        boxSizing: "border-box",
        cursor: "pointer",
        zIndex: 20,
      }}
    >
      <Camera size={18} />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];

          if (!file) return;

          setEditPhotoFile(file);
          setEditPhoto(URL.createObjectURL(file));
        }}
        style={{
          display: "none",
        }}
      />
    </label>
  </div>
</div>

    {/* Name */}
    <label
      style={{
        display: "block",
        fontSize: "13px",
        fontWeight: 700,
        color: "#333",
        marginBottom: "6px",
      }}
    >
      Name
    </label>

    <input
      type="text"
      value={editName}
      onChange={(e) => setEditName(e.target.value)}
      style={{
        width: "100%",
        height: "44px",
        padding: "0 12px",
        border: "1px solid #d1d5db",
        borderRadius: "10px",
        fontSize: "14px",
        outline: "none",
        boxSizing: "border-box",
        marginBottom: "14px",
      }}
    />

    {/* Bio */}
    <label
      style={{
        display: "block",
        fontSize: "13px",
        fontWeight: 700,
        color: "#333",
        marginBottom: "6px",
      }}
    >
      Bio
    </label>

    <textarea
      value={editBio}
      onChange={(e) => setEditBio(e.target.value)}
      rows={5}
      style={{
        width: "100%",
        padding: "10px 12px",
        border: "1px solid #d1d5db",
        borderRadius: "10px",
        fontSize: "14px",
        outline: "none",
        resize: "vertical",
        boxSizing: "border-box",
        marginBottom: "16px",
        fontFamily: "Arial, sans-serif",
      }}
    />

    {/* Buttons */}
    <div
      style={{
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
  marginTop: "auto",
}}
    >
      <button
        type="button"
        onClick={() => setEditingProfile(false)}
        style={{
          flex: 1,
          height: "44px",
          borderRadius: "11px",
          border: "1px solid #e5e7eb",
          background: "#f8f8f8",
          color: "#333",
          fontSize: "13px",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Cancel
      </button>

      <button
        type="button"
        onClick={saveProfileChanges}
disabled={savingProfile}
        style={{
          flex: 1,
          height: "44px",
          borderRadius: "11px",
          border: "none",
          background:
            "linear-gradient(135deg,#7c3aed,#9333ea)",
          color: "#fff",
          fontSize: "13px",
          fontWeight: 700,
          cursor: "pointer",
          boxShadow:
            "0 5px 14px rgba(124,58,237,0.20)",
        }}
      >
        {savingProfile ? "Saving..." : "Save Changes"}
      </button>
    </div>
  </div>
)}


{/* MEMBER VIEW MESSAGE */}

<div
  style={{
    width: "100%",
    display: editingProfile ? "none" : "block",
    textAlign: "center",
    padding: isMobile ? "10px 5px 8px" : "12px 5px 10px",
    boxSizing: "border-box",
    
  }}
>
  <span
    style={{
      fontSize: isMobile ? "13px" : "14px",
      fontWeight: 600,
      color: "#777",
    }}
  >
    This is how members sees you in MSpace
  </span>
</div>

      {/* PROFILE SECTION */}

 <div
  style={{
    display: editingProfile ? "none" : "flex",
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
</button>
  </div>
</div>

</div>
</div>
        

      
      {/* PHOTOS */}

  <div
  style={{
    display: editingProfile ? "none" : "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "60px",
    marginTop: "14px",
    marginBottom: "14px",
    marginLeft: "0px",
    width: "100%",
boxSizing: "border-box",

    position:
      activeMediaTab === "all"
        ? "sticky"
        : "static",

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
  setActiveMediaTab("photos");

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document
        .getElementById("member-view-top")
        ?.scrollIntoView({
          behavior: "instant",
          block: "start",
        });
    });
  });
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
  setActiveMediaTab("videos");

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document
        .getElementById("member-view-top")
        ?.scrollIntoView({
          behavior: "instant",
          block: "start",
        });
    });
  });
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
          <video
            src={media.url}
            muted
            playsInline
            preload="metadata"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
              background: "#000",
            }}
          />
        )}
      </div>
    ))}
  </div>
)}


{activeMediaTab === "photos" && (
      <div
  id="photos"
  style={{
    display: editingProfile ? "none" : "grid",
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

    if (image.dataset.fallbackApplied === "true") {
      return;
    }

    image.dataset.fallbackApplied = "true";

    const cachedUrl = await getCachedMediaUrl(
      photo.image_url
    );

    if (cachedUrl !== photo.image_url) {
      image.src = cachedUrl;
    }
  }}
    onClick={() =>
  setSelectedIndex(index)
}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "scale(1.03)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "scale(1)";
    }}
    style={{
      width: "100%",
      height: isMobile ? "160px" : "190px",
      objectFit: "cover",
      borderRadius: "0px",
      border: "1px solid #e8e8e8",
      boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
      cursor: "pointer",
      transition: "all 0.3s ease",
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
    display: editingProfile ? "none" : "grid",
    gridTemplateColumns: isMobile
  ? "repeat(3, 1fr)"
  : "repeat(6, 1fr)",
    gap: "2px",
    paddingLeft: isMobile ? "10px" : "40px",
    paddingRight: isMobile ? "10px" : "40px",
  }}
>
  {videos.map((video, index) => (
  <div
  key={video.id}
  onClick={() => {
  setSelectedVideoIndex(index);
  setVideoViewerControlsVisible(null);
}}
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
      const image = e.currentTarget;

      if (image.dataset.fallbackApplied === "true") {
        return;
      }

      image.dataset.fallbackApplied = "true";

      if (video.thumbnail_url) {
        const cachedUrl = await getCachedMediaUrl(
          video.thumbnail_url
        );

        if (cachedUrl !== video.thumbnail_url) {
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
      border: "none",
      boxShadow: "none",
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
    display: editingProfile ? "none" : "block",
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


 {selectedIndex !== null && (
  <div
  id="photo-viewer"
  style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.96)",
      zIndex: 99999,
      overflowY: "auto",
      overflowX: "hidden",
      WebkitOverflowScrolling: "touch",
      scrollSnapType: "y mandatory",
    }}
  >
    {/* CLOSE */}
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setSelectedIndex(null);
      }}
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        width: "46px",
        height: "46px",
        borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.18)",
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        color: "#222",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        zIndex: 100000,
      }}
    >
      <X size={22} />
    </button>

    {/* ALL PHOTOS */}
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
          scrollSnapAlign: "start",
          boxSizing: "border-box",
          padding: "20px",
        }}
      >
        <img
          src={photo.image_url}
          alt=""
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            width: "auto",
            height: "auto",
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>
    ))}
  </div>
)}

{videoPreviewFullscreen &&
  videoPreviewFiles.length > 0 && (
    <div
      id="video-preview-fullscreen"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.96)",
        zIndex: 99999,
        overflowY: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
        scrollSnapType: "y mandatory",
      }}
      onScroll={(e) => {
        const container =
          e.currentTarget;

        const sections =
          Array.from(
            container.querySelectorAll(
              '[id^="video-preview-"]'
            )
          );

        const containerRect =
          container.getBoundingClientRect();

        const containerCenter =
          containerRect.top +
          containerRect.height / 2;

        let closestVideo: HTMLVideoElement | null =
          null;

        let closestDistance = Infinity;

        sections.forEach((section) => {
          const rect =
            section.getBoundingClientRect();

          const sectionCenter =
            rect.top + rect.height / 2;

          const distance = Math.abs(
            sectionCenter - containerCenter
          );

          const video =
            section.querySelector(
              "video"
            );

          if (
            video &&
            distance < closestDistance
          ) {
            closestDistance = distance;
            closestVideo = video;
          }
        });

        const videoToPlay =
  closestVideo as HTMLVideoElement | null;

if (videoToPlay) {
  fullscreenVideoRefs.current.forEach(
    (video) => {
      if (video && video !== videoToPlay) {
        video.pause();
      }
    }
  );

  videoToPlay.muted = true;

  videoToPlay
    .play()
    .catch(() => {});
}
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setVideoPreviewFullscreen(false);
        }
      }}
    >
      {/* CLOSE */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setVideoPreviewFullscreen(false);
        }}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          width: "46px",
          height: "46px",
          borderRadius: "50%",
          border:
            "1px solid rgba(255,255,255,0.18)",
          background:
            "rgba(255,255,255,0.88)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter:
            "blur(12px)",
          color: "#222",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow:
            "0 8px 24px rgba(0,0,0,0.35)",
          zIndex: 100000,
        }}
      >
        <X size={22} />
      </button>

      {/* ALL SELECTED VIDEOS */}
      {videoPreviewFiles.map(
        (file, index) => (
          <div
            key={`${file.name}-${index}`}
            id={`video-preview-${index}`}
            style={{
              position: "relative",
              width: "100%",
              height: "100dvh",
              minHeight: "100dvh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              scrollSnapAlign: "start",
              boxSizing: "border-box",
              padding: "20px",
            }}
          >

            <button
  type="button"
  onClick={(e) => {
    e.stopPropagation();

    setVideoPreviewFullscreen(false);

    setVideoPreviewFiles((prev) =>
      prev.filter((_, i) => i !== index)
    );

    setVideoThumbnailFiles((prev) =>
      prev.filter((_, i) => i !== index)
    );

    setVideoControlsVisible(null);
    setVideoPreviewIndex((prev) => {
      if (prev === index) return 0;
      if (prev > index) return prev - 1;
      return prev;
    });
  }}
  style={{
    position: "absolute",
    top: "20px",
    left: "20px",
    width: "46px",
    height: "46px",
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.88)",
    color: "#222",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100001,
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
  }}
>
  <Trash2 size={20} />
</button>

            <video
              ref={(video) => {
                fullscreenVideoRefs.current[index] =
                  video;
              }}
              src={videoPreviewUrls[index]}
              poster={
                videoThumbnailUrls[index] ||
                undefined
              }
              autoPlay={
                index === videoPreviewIndex
              }
              muted
              controls={videoControlsVisible === index}
              playsInline
              preload="auto"
              onClick={(e) => {
  e.stopPropagation();
  setVideoControlsVisible(index);
}}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                display: "block",
                background: "#000",
              }}
            />
          </div>
        )
      )}
    </div>
  )}


{selectedVideoIndex !== null && (
  <div
    ref={videoViewerRef}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.96)",
      zIndex: 99999,
      overflowY: "auto",
      overflowX: "hidden",
      WebkitOverflowScrolling: "touch",
      scrollSnapType: "y mandatory",
    }}
    onScroll={(e) => {
  const container = e.currentTarget;

  const index = Math.round(
    container.scrollTop / container.clientHeight
  );

  const videoElements =
    container.querySelectorAll("video");

  videoElements.forEach((video, videoIndex) => {
    if (videoIndex === index) {
  video.muted = false;

  video
    .play()
    .catch(() => {});
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
    {/* CLOSE */}
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setSelectedVideoIndex(null);
setVideoViewerControlsVisible(null);
      }}
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        width: "46px",
        height: "46px",
        borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.18)",
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        color: "#222",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        zIndex: 100000,
      }}
    >
      <X size={22} />
    </button>

    {/* ALL VIDEOS */}
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
          scrollSnapAlign: "start",
          boxSizing: "border-box",
          padding: "20px",
        }}
      >
        <video
  playsInline
  muted
  controls={videoViewerControlsVisible === index}
  onClick={(e) => {
    e.stopPropagation();
    setVideoViewerControlsVisible(index);
  }}
          style={{
            width: "100%",
            height: "100%",
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            background: "#000",
          }}
        >
          <source
            src={video.video_url}
            type="video/mp4"
          />
        </video>
      </div>
    ))}
  </div>
)}
</main>
);
}
