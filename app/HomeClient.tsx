"use client";

import "./home.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Play,
  WifiOff,
  Image,
  Video,
  ImagePlus,
  Download,
  UserRoundPlus,
} from "lucide-react";
import { createId } from "@/lib/createId";


type HomeData = {
  photoCount: number;
  videoCount: number;
  recentPhotos: string[];
  latestVideo: string;
  latestThumbnail: string;
};

export default function Home({
  initialHomeData,
}: {
  initialHomeData: HomeData;
}) {
  const [latestVideo, setLatestVideo] = useState(
  initialHomeData.latestVideo
);

const [latestThumbnail, setLatestThumbnail] = useState(
  initialHomeData.latestThumbnail
);

const [recentPhotos, setRecentPhotos] = useState<string[]>(
  initialHomeData.recentPhotos
);

  const [name, setName] = useState("");
  const [photoFile, setPhotoFile] =
  useState<File | null>(null);
  const [fileName, setFileName] = useState("");

  const [photoCount, setPhotoCount] = useState(
  initialHomeData.photoCount
);

const [videoCount, setVideoCount] = useState(
  initialHomeData.videoCount
);

  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(true);

  const [mounted, setMounted] = useState(false);
const [isOffline, setIsOffline] = useState(false);
const [showInstallButton, setShowInstallButton] = useState(false);
const [showInstallHelp, setShowInstallHelp] = useState(false);
const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
const [language, setLanguage] = useState<"en" | "zh">("zh");
const router = useRouter();

  useEffect(() => {
  setMounted(true);
}, []);

useEffect(() => {
  const browserLanguages = Array.from(navigator.languages || []);
  const browserLanguage = navigator.language || "";
  const primaryLanguage = browserLanguages[0] || browserLanguage;

  const detectedLanguage: "zh" | "en" = primaryLanguage
    ? primaryLanguage.toLowerCase().startsWith("zh")
      ? "zh"
      : "en"
    : "zh";

  setLanguage(detectedLanguage);
}, []);

const t = {
  en: {
    join: "Join MSpace",
    joinDesc: "Join MSpace and start connecting",
    name: "Name",
    enterName: "Enter your name",
    profilePhoto: "Profile Photo",
    tapToUpload: "Tap to upload profile photo",
    selected: "Selected",
    connecting: "Connecting…",
    addApp: "Install App",
    installApp: "Install App",
    recentPhotos: "Recent Photos",
    latestVideo: "Latest Video",
    photos: "Photos",
    videos: "Videos",
    welcomeTo: "Welcome to",
    personalSpace: "Personal Space",
    personalDesc:
      "A place where I share my life moments and connect with friends.",
    optional: "JPG, PNG or WebP • Optional",
    termsText: "By joining, you agree to our",
    terms: "Terms of Service",
    termsAnd: "and",
    privacy: "Privacy Policy",
    enterNameAlert: "Please enter your name",
    blockedDevice: "This device has been blocked.",
    bannedAccount: "Your MSpace account has been banned.",
    error: "Error",
    copyright: "All Rights Reserved",
    appName: "MSpace",
    offline: "No internet connection",
    ownerSpace: "Happiness's",
  },
  zh: {
    join: "加入星域",
    joinDesc: "加入星域并开始交流",
    name: "姓名",
    enterName: "请输入您的姓名",
    profilePhoto: "头像照片",
    tapToUpload: "点击上传头像",
    selected: "已选择",
    connecting: "连接中…",
    addApp: "安装应用",
    installApp: "安装应用",
    recentPhotos: "最新照片",
    latestVideo: "最新视频",
    photos: "照片",
    videos: "视频",
    welcomeTo: "欢迎来到",
    personalSpace: "个人空间",
    personalDesc: "这是我分享生活点滴并与朋友交流的地方。",
    optional: "JPG、PNG 或 WebP • 可选",
    termsText: "加入即表示您同意我们的",
    terms: "服务条款",
    termsAnd: "和",
    privacy: "隐私政策",
    enterNameAlert: "请输入您的姓名",
    blockedDevice: "此设备已被封锁。",
    bannedAccount: "您的星域账户已被封禁。",
    error: "错误",
    copyright: "版权所有",
    appName: "星域",
    offline: "网络不可用，请检查网络",
    ownerSpace: "幸福的",
  },
}[language];


useEffect(() => {
  const updateOnlineStatus = () => {
    setIsOffline(!navigator.onLine);
  };

  updateOnlineStatus();

  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);

  return () => {
    window.removeEventListener("online", updateOnlineStatus);
    window.removeEventListener("offline", updateOnlineStatus);
  };
}, []);

  useEffect(() => {
  let cancelled = false;

  // Never let a slow/unreachable backend keep the entire home page blank.
  // This is especially important on networks where Supabase may be slow or
  // temporarily unreachable. The user can still see the page and retry.
  const withTimeout = async <T,>(promise: PromiseLike<T>, timeoutMs = 8000): Promise<T | null> => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    try {
      return await Promise.race([
        promise,
        new Promise<null>((resolve) => {
          timeoutId = setTimeout(() => resolve(null), timeoutMs);
        }),
      ]);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  };

  async function restoreMember(): Promise<"signup" | "redirect" | "error"> {
  console.log("=== RESTORE START ===");

  const memberId = localStorage.getItem("mspace_member_id");
  console.log("Member ID:", memberId);

  // Check whether the stored member ID still exists.
if (memberId) {
  const supabase = createClient();

  const storedMemberResult = await withTimeout(
    supabase
      .from("members")
      .select("member_id, banned")
      .eq("member_id", memberId)
      .maybeSingle(),
  );

  if (!storedMemberResult) {
    console.warn("Stored member lookup timed out.");
    return "error";
  }

  const { data: existingMember, error } = storedMemberResult;

  console.log("Stored member ID:", memberId);
  console.log("Stored member lookup:", existingMember);
  console.log("Stored member lookup error:", error);

  // Database/network error — do not destroy the stored identity.
  if (error) {
    console.log(
      "Could not verify stored member because of a database/network error."
    );
    return "error";
  }

  // The browser has a stale member ID.
  if (!existingMember) {
    console.log(
      "Stored member ID no longer exists. Clearing stale ID."
    );

    localStorage.removeItem("mspace_member_id");

    // Continue through the normal device/account check.
  } else {
    // Existing account is banned.
    if (existingMember.banned) {
      console.log("Stored member is banned");
      return "signup";
    }

        const deviceId = localStorage.getItem("mspace_device_id");

    if (!deviceId) {
      console.warn("Cannot create member session: device ID is missing.");
      return "error";
    }

    const sessionCreated = await createMemberServerSession(
      existingMember.member_id,
      deviceId
    );

    if (!sessionCreated) {
      console.warn("Member session was not created; preserving saved identity.");
      return "error";
    }

    console.log("Valid member and server session restored.");
    router.replace("/members");
    return "redirect";
  }
}

  const deviceId = localStorage.getItem("mspace_device_id");
  console.log("Device ID:", deviceId);

  // No device ID means this is a genuinely new visitor.
  if (!deviceId) {
    console.log("No device ID");
    return "signup";
  }

  const supabase = createClient();

  const deviceMemberResult = await withTimeout(
    supabase
      .from("members")
      .select("*")
      .eq("device_id", deviceId)
      .order("created_at", { ascending: false }),
  );

  if (!deviceMemberResult) {
    console.warn("Device member lookup timed out.");
    return "error";
  }

  const { data: members, error } = deviceMemberResult;
  const member = members?.[0];

  console.log("Supabase error:", error);
  console.log("Member found:", member);

  // Network/database failure.
  // DO NOT show signup.
  if (error) {
    console.log(
      "Could not check member because of a network/database error."
    );
    return "error";
  }

  // Supabase successfully answered and confirmed
  // that this device has no member.
  if (!member) {
    console.log("No member matched this device");
    return "signup";
  }

  // Existing account is banned.
  if (member.banned) {
    console.log("Member is banned");
    return "signup";
  }

    console.log("Restoring login...");

  const sessionCreated = await createMemberServerSession(
    member.member_id,
    deviceId
  );

  if (!sessionCreated) {
    console.warn(
      "Member session creation failed during device restoration."
    );
    return "error";
  }

  localStorage.setItem(
    "mspace_member_id",
    member.member_id
  );

  console.log("Redirecting...");

  router.replace("/members");

  return "redirect";
}

  restoreMember().then((result) => {
  if (cancelled) return;

  console.log("Restore result:", result);

  // Keep the homepage hidden while redirecting a returning member.
  if (result === "redirect") {
    return;
  }

  // If Supabase is unavailable but this device has a saved member ID,
  // continue to the members page without revealing the signup page.
  if (result === "error" && localStorage.getItem("mspace_member_id")) {
    router.replace("/members");
    return;
  }

  // Only show the homepage after confirming this is a new visitor
  // or when no redirect is required.
  setRestoring(false);
});

  return () => {
    cancelled = true;
  };
}, []);


useEffect(() => {
  const isStandalone = () =>
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  const isIPhoneOrIPad =
    /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (isStandalone()) {
    setShowInstallButton(false);
    return;
  }

  if (isIPhoneOrIPad) {
    setShowInstallButton(true);
  } else {
    setShowInstallButton(false);
  }

  const handler = (event: Event) => {
    event.preventDefault();

    setDeferredPrompt(
      event as Event & {
        prompt: () => Promise<void>;
        userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
      }
    );

    setShowInstallButton(true);
  };

  window.addEventListener("beforeinstallprompt", handler);

  const handleInstalled = () => {
    setShowInstallButton(false);
    setDeferredPrompt(null);
  };

  window.addEventListener("appinstalled", handleInstalled);

  return () => {
    window.removeEventListener("beforeinstallprompt", handler);
    window.removeEventListener("appinstalled", handleInstalled);
  };
}, []);


const installApp = async () => {
  if (!deferredPrompt) {
    setShowInstallHelp(true);
    return;
  }

  await deferredPrompt.prompt();

  const result = await deferredPrompt.userChoice;

  if (result.outcome === "accepted") {
    setShowInstallButton(false);
    setDeferredPrompt(null);
  }
};

async function createMemberServerSession(
  memberId: string,
  deviceId: string
): Promise<boolean> {
  try {
    const response = await fetch("/api/member/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      cache: "no-store",
      body: JSON.stringify({ memberId, deviceId }),
    });

    if (!response.ok) {
      console.error(
        "Member server session creation failed:",
        response.status
      );
      return false;
    }

    const result = await response.json();
    return result.authenticated === true;
  } catch (error) {
    console.error("Member server session request failed:", error);
    return false;
  }
}

async function joinMSpace() {
  if (loading) return;

  setLoading(true);

  try {
    // 1. Validate the name inside MSpace.
    const trimmedName = name.trim();

    if (!trimmedName) {
      alert(t.enterNameAlert);
      return;
    }

    // 2. Create or restore this device's MSpace ID.
    const supabase = createClient();

    let deviceId = localStorage.getItem("mspace_device_id");

    if (!deviceId) {
      deviceId = createId();
      localStorage.setItem("mspace_device_id", deviceId);
    }

    // 3. Check banned devices and handle database errors.
    const {
      data: bannedDevices,
      error: bannedDevicesError,
    } = await supabase
      .from("banned_devices")
      .select("device_id");

    if (bannedDevicesError) {
      console.error("Banned-device check failed:", bannedDevicesError);
      alert(`${t.error}: ${bannedDevicesError.message}`);
      return;
    }

    const isBanned = bannedDevices?.some(
      (device) => device.device_id === deviceId
    );

    if (isBanned) {
      alert(t.blockedDevice);
      return;
    }

    // 4. Check whether this name belongs to a banned account.
    const {
      data: existingMember,
      error: nameCheckError,
    } = await supabase
      .from("members")
      .select("member_id, name, banned")
      .eq("name", trimmedName)
      .maybeSingle();

    if (nameCheckError) {
      console.error("Name check failed:", nameCheckError);
      alert(`${t.error}: ${nameCheckError.message}`);
      return;
    }

    if (existingMember?.banned) {
      alert(t.bannedAccount);
      return;
    }

    // 5. Restore an existing account on this device.
    const {
      data: deviceMember,
      error: deviceCheckError,
    } = await supabase
      .from("members")
      .select("member_id, name, banned")
      .eq("device_id", deviceId)
      .maybeSingle();

    if (deviceCheckError) {
      console.error("Device account check failed:", deviceCheckError);
      alert(`${t.error}: ${deviceCheckError.message}`);
      return;
    }

    if (deviceMember) {
      if (deviceMember.banned) {
        alert(t.bannedAccount);
        return;
      }

      localStorage.setItem(
        "mspace_member_id",
        deviceMember.member_id
      );

      router.push("/members");
      return;
    }

    // 6. Upload the optional profile photo.
    let photoUrl = "";

    if (photoFile) {
      const extension =
        photoFile.name.split(".").pop()?.toLowerCase() || "jpg";

      const filePath = `${createId()}.${extension}`;

      const { data: uploadedFile, error: uploadError } =
        await supabase.storage
          .from("avatars")
          .upload(filePath, photoFile, {
            upsert: false,
          });

      if (uploadError) {
        console.error("Profile photo upload failed:", uploadError);
        alert(`${t.error}: ${uploadError.message}`);
        return;
      }

      if (!uploadedFile?.path) {
        alert(t.error);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(uploadedFile.path);

      photoUrl = publicUrlData.publicUrl;
    }

    // 7. Create the new MSpace account.
    const memberId = createId();

    const { error: insertError } = await supabase
      .from("members")
      .insert({
        member_id: memberId,
        name: trimmedName,
        photo_url: photoUrl,
        device_id: deviceId,
      });

    if (insertError) {
      console.error("Account creation failed:", insertError);
      alert(`${t.error}: ${insertError.message}`);
      return;
    }

        // 8. Create a server session for the new account.
    const sessionCreated = await createMemberServerSession(
      memberId,
      deviceId
    );

    if (!sessionCreated) {
      console.error(
        "Account created, but server session creation failed."
      );

      // Preserve the account ID so the member's account is not lost.
      localStorage.setItem("mspace_member_id", memberId);

      alert(
        "Your account was created, but your secure session could not be established. Please check your connection and try again."
      );
      return;
    }

    // 9. Save the account locally and open the members page.
    localStorage.setItem("mspace_member_id", memberId);

    setName("");
    setPhotoFile(null);
    setFileName("");

    router.push("/members");
  } catch (error) {
    console.error("MSpace signup failed:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Please check your connection and try again.";

    alert(`${t.error}: ${message}`);
  } finally {
    // Always release the Join button, including on failure.
    setLoading(false);
  }
}

if (!mounted || restoring) {
  return null;
}

return (
  <>

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

  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 20px",
      borderBottom: "1px solid #eee",
      backgroundColor: "#fff",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}
  >
    <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "12px",
  }}
>
 <img
 suppressHydrationWarning
  src="/MSpace-logo.jpg.jpeg"
  alt={t.appName}
  style={{
    height: "55px",
    width: "auto",
    objectFit: "contain",
  }}
/>

</div>

<button
className="mobile-header-join-button"
onClick={() => {
  const joinForm = document.getElementById("join-form");

  if (!joinForm) return;

  joinForm.scrollIntoView({
    behavior: "auto",
    block: "start",
  });
}}
  style={{
    background:
      "linear-gradient(90deg, #7c3aed, #9333ea)",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "10px",
    cursor: "pointer",
  }}
>
  {t.join}
</button>

{showInstallButton && (
  <button
  className="desktop-install-button"
   onClick={installApp}
    style={{
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  background: "linear-gradient(90deg, #7c3aed, #9333ea)",
  color: "white",
  border: "none",
  padding: "12px 24px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "16px",
  whiteSpace: "nowrap",
}}
  >
    <Download size={20} />
    {t.addApp}
  </button>
)}

  </div>

  <main
  style={{
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    background:
      "linear-gradient(135deg, #f5f3ff 0%, #ffffff 50%, #fdf2f8 100%)",
    minHeight: "auto",
    paddingBottom: "0px",
  }}
>
  <div className="hero-section">

    <div className="left-panel">

      {/* OWNER PROFILE */}


 <div className="profile-row">

  <img
  suppressHydrationWarning
  src="https://trmbblhdiolnbdnhlepv.supabase.co/storage/v1/object/public/avatars/WhatsApp%20Image%202025-02-22%20at%2012.15.29%20PM.jpeg"
  alt="Donald Lee"
  style={{
    width: "160px",
    height: "160px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "6px solid white",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  }}
/>

  <div className="profile-info">

    <p
      style={{
        color: "#7c3aed",
        fontWeight: "600",
        marginBottom: "10px",
      }}
    >
      {t.welcomeTo}
    </p>

    <h2
      style={{
        fontSize: "clamp(22px, 2.5vw, 32px)",
        fontWeight: "800",
        lineHeight: "1.0",
        marginTop: "0",
        marginBottom: "6px",
        color: "#111827",
      }}
    >
      {t.ownerSpace}
<br />
{t.personalSpace}
    </h2>

    <p
      style={{
        fontSize: "15px",
        color: "#6b7280",
        lineHeight: "1.7",
      }}
    >
      {t.personalDesc}
    </p>

  </div>

</div>


{/* PHOTO / VIDEO COUNTS */}

<div
  className="stats-row"
  style={{
    display: "flex",
    alignItems: "center",
    gap: "40px",
    marginTop: "18px",
    marginBottom: "10px",
    marginLeft: "186px",
  }}
>
  {/* Photos */}

  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
    }}
  >
    <div
      style={{
        width: "46px",
        height: "46px",
        borderRadius: "14px",
        background: "linear-gradient(135deg,#7c3aed,#9333ea)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 20px rgba(124,58,237,.25)",
      }}
    >
      <Image size={24} color="#ffffff" />
    </div>

    <div>
      <div
        style={{
          fontSize: "20px",
          fontWeight: 700,
          color: "#111827",
          lineHeight: 1,
        }}
      >
        {photoCount}
      </div>

      <div
        style={{
          fontSize: "14px",
          color: "#6b7280",
          marginTop: "4px",
        }}
      >
        {t.photos}
      </div>
    </div>
  </div>

 {/* Divider */}

<div
  style={{
    width: "1px",
    height: "42px",
    background: "#e5e7eb",
  }}
/>

  {/* Videos */}

  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
    }}
  >
    <div
      style={{
        width: "46px",
        height: "46px",
        borderRadius: "14px",
        background: "linear-gradient(135deg,#7c3aed,#9333ea)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 20px rgba(124,58,237,.25)",
      }}
    >
      <Video size={30} color="#ffffff" />
    </div>

    <div>
      <div
        style={{
          fontSize: "20px",
          fontWeight: 700,
          color: "#111827",
          lineHeight: 1,
        }}
      >
        {videoCount}
      </div>

      <div
        style={{
          fontSize: "14px",
          color: "#6b7280",
          marginTop: "4px",
        }}
      >
        {t.videos}
      </div>
    </div>
  </div>
</div>



<div
  className="media-row"
  style={{
    maxWidth: "1000px",
  }}
>

      <div
  style={{
    height: "20px",
  }}
/>

<div
  style={{
    display: "flex",
    gap: "20px",
    marginTop: "-35px",
    marginBottom: "0px",
    justifyContent: "center",
    alignItems: "flex-start",
  }}
>
  {/* Premium Recent Photos Card */}

<div
  style={{
  flex: 1,
  background: "#ffffff",
  border: "1px solid #eef2ff",
  borderRadius: "24px",
  padding: "20px 20px 10px",
  boxShadow: "0 12px 35px rgba(15,23,42,0.08)",
  display: "flex",
  flexDirection: "column",
}}
>
  <h3
    style={{
      margin: 0,
      fontSize: "16px",
      fontWeight: 600,
      color: "#111827",
      marginBottom: "18px",
    }}
  >
    {t.recentPhotos}
  </h3>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "6px",
    }}
  >
    {recentPhotos.slice(0, 2).map((photo, index) => (
      <img
        key={index}
        src={photo}
        alt=""
        style={{
          width: "100%",
          height: "210px",
          borderRadius: "18px",
          objectFit: "cover",
          display: "block",
        }}
      />
    ))}
  </div>
</div>

  {/* Video Card */}

<div
  style={{
  flex: 1,
  background: "#ffffff",
  border: "1px solid #eef2ff",
  borderRadius: "24px",
  padding: "20px 20px 10px",
  boxShadow: "0 12px 35px rgba(15,23,42,0.08)",

  display: "flex",
  flexDirection: "column",
}}
>
  <h2
    style={{
      margin: "0 0 20px",
      textAlign: "center",
      fontSize: "16px",
      fontWeight: 600,
      color: "#111827",
    }}
  >
    {t.latestVideo}
  </h2>

  <div
    style={{
      position: "relative",
      overflow: "hidden",
      borderRadius: "18px",
    }}
  >
    {latestThumbnail && (
      <img
        src={latestThumbnail}
        alt="Latest Video"
        style={{
          width: "100%",
          height: "210px",
          borderRadius: "18px",
          objectFit: "cover",
          display: "block",
        }}
      />
    )}

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
      width: "50px",
      height: "50px",
      borderRadius: "50%",
      background: "rgba(255,255,255,0.55)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.8)",
      boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Play
      size={20}
      fill="#ffffff"
      color="#ffffff"
      strokeWidth={2}
    />
  </div>
</div>


  </div>

</div>
</div>
</div> {/* closes left-panel */}
</div>


<div id="join-form" className="right-panel">
<div
  id="signup"
  style={{
    width: "90%",
    maxWidth: "480px",
    margin: "-40px auto 0 auto",
    background: "#fff",
    borderRadius: "24px",
    padding: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    border: "1px solid #f1f1f1",
  }}
>

  <p
    style={{
      textAlign: "center",
      color: "#111827",
      marginBottom: "10px",
      fontSize: "18px",
    }}
  >
    {t.joinDesc}
  </p>

  <div
  style={{
    display: "flex",
    justifyContent: "center",
    marginBottom: "8px",
  }}
>
  <div
  className="signup-photo-preview"
  style={{
    borderRadius: "50%",
      overflow: "hidden",
      background: "#f3f0ff",
      border: "2px solid #e5e7eb",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {photoFile ? (
      <img
        src={URL.createObjectURL(photoFile)}
        alt="Profile photo preview"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />


    ) : (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ede9fe",
        }}
      >
        <svg
          width="44"
          height="44"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Default profile avatar"
          role="img"
        >
          <circle cx="24" cy="15" r="8" fill="#6d28d9" />
          <path
            d="M7 40C7 31.7 13.7 26 24 26C34.3 26 41 31.7 41 40V42H7V40Z"
            fill="#6d28d9"
          />
        </svg>
      </div>
    )}


  </div>
</div>

  <label
  style={{
    display: "block",
    textAlign: "left",
    fontWeight: "600",
    marginBottom: "4px",
    color: "#111827",
  }}
>
  {t.name}
</label>

  <input
    type="text"
    placeholder={t.enterName}
    value={name}
    onChange={(e) => setName(e.target.value)}
    style={{
      width: "100%",
      padding: "10px",
      borderRadius: "12px",
      border: "1px solid #d1d5db",
      fontSize: "16px",
      marginBottom: "10px",
      boxSizing: "border-box",
      color: "#6b7280",
    }}
  />

  <label
  style={{
    display: "block",
    textAlign: "left",
    fontWeight: "600",
    marginBottom: "10px",
    color: "#111827",
  }}
>
  {t.profilePhoto}
</label>

  <div
   onClick={() => document.getElementById("mspace-profile-photo")?.click()}
    style={{
      border: "2px dashed #c4b5fd",
      borderRadius: "16px",
      background: "#f5f3ff",
      padding: "4px 10px",
      textAlign: "center",
      marginBottom: "5px",
      cursor: "pointer",
    }}
  >
    <div
  style={{
    display: "flex",
    justifyContent: "center",
    marginBottom: "4px",
  }}
>
  <ImagePlus size={36} color="#7c3aed" />
</div>


    <p
  style={{
    textAlign: "center",
    color: "#7c3aed",
    fontWeight: "600",
    marginBottom: "2px",
  }}
>
  {t.tapToUpload}
</p>

<p
  style={{
    textAlign: "center",
    color: "#6b7280",
    fontSize: "14px",
    marginBottom: "4px",
  }}
>
  {t.optional}
</p>

  <input
      id="mspace-profile-photo"
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files?.[0] || null;
        setPhotoFile(file);
        setFileName(file?.name || "");
      }}
      style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: 0,
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        border: 0,
      }}
    />
  </div>

  <button
  onClick={joinMSpace}
  disabled={loading}
  style={{
    width: "100%",
    padding: "14px",
    background:
      "linear-gradient(90deg,#7c3aed,#9333ea)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: "18px",
    fontWeight: "700",
    opacity: loading ? 0.8 : 1,
    cursor: loading ? "not-allowed" : "pointer",
    boxShadow:
      "0 8px 20px rgba(124,58,237,0.3)",
  }}
>
  <>
  {loading ? (
    <>
      <span
        style={{
          display: "inline-block",
          width: "16px",
          height: "16px",
          border: "2px solid rgba(255,255,255,0.4)",
          borderTop: "2px solid white",
          borderRadius: "50%",
          marginRight: "8px",
          animation: "spin 1s linear infinite",
          verticalAlign: "middle",
        }}
      />
      {t.connecting}
    </>
  ) : (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
      }}
    >
      <UserRoundPlus size={22} />
      {t.join}
    </span>
  )}
</>
</button>

  <p
  style={{
    textAlign: "center",
    marginTop: "12px",
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "1.4",
  }}
>
  {t.termsText}
  <span
    style={{
      color: "#7c3aed",
      fontWeight: "600",
    }}
  >
    {" "}{t.terms}
  </span>
  {" "}{t.termsAnd}{" "}
  <span
    style={{
      color: "#7c3aed",
      fontWeight: "600",
    }}
  >
    {t.privacy}
  </span>
  .
</p>
</div> {/* closes signup card */}
</div> {/* closes right-panel */}
</div> {/* closes hero-section */}

<footer
  style={{
    marginTop: "-40px",
    padding: "5px",
    backgroundColor: "#ffffff",
    borderTop: "1px solid #eee",
    color: "#666",
    textAlign: "center",
  }}
>
 <h3
  style={{
    margin: "0",
    fontSize: "16px",
  }}
>
  {t.appName}
</h3>

  <p
  style={{
    margin: "0",
    fontSize: "13px",
  }}
>
 ©️ 2026 {language === "zh" ? "幸福" : "Happiness"}. {t.copyright}
</p>
</footer>

{showInstallButton && (
  <button
   className="mobile-install-button"
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
    📱 {t.installApp}
  </button>
)}
{showInstallHelp && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 10000,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}
    onClick={() => setShowInstallHelp(false)}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-help-title"
      onClick={(event) => event.stopPropagation()}
      style={{
        width: "100%",
        maxWidth: "360px",
        background: "#fff",
        color: "#222",
        borderRadius: "16px",
        padding: "24px",
        boxSizing: "border-box",
        boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
      }}
    >

      <h2
  id="install-help-title"
  style={{
    marginTop: 0,
    textAlign: "center",
    fontWeight: 600,
  }}
>
  {language === "zh" ? "安装星域" : "Install MSpace"}
</h2>


{(/iPhone|iPad|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) ? (

  <>
    <p style={{ margin: "12px 0", textAlign: "left" }}>
      {language === "zh"
         ? "在 iPhone 或 iPad 上使用 Safari 安装星域："
         : "To install MSpace using Safari on your iPhone or iPad:"}
    </p>

    <ol
  style={{
    margin: "12px 0",
    lineHeight: 1.7,
    textAlign: "left",
    listStylePosition: "outside",
  }}
>
      <li>
        {language === "zh"
          ? "在 Safari 中打开 星域。"
          : "Open MSpace in Safari."}
      </li>
      <li>
        {language === "zh" ? (
          <>点击 Safari 的<strong>分享</strong>按钮（带向上箭头的方框）。</>
        ) : (
          <>Tap Safari&apos;s <strong>Share</strong> button (the square with an upward arrow).</>
        )}
      </li>
      <li>
        {language === "zh" ? (
          <>向下滚动并选择<strong>添加到主屏幕</strong>。</>
        ) : (
          <>Scroll down and choose <strong>Add to Home Screen</strong>.</>
        )}
      </li>
      <li>
        {language === "zh" ? (
          <>点击右上角的<strong>添加</strong>。</>
        ) : (
          <>Tap <strong>Add</strong> in the top-right corner.</>
        )}
      </li>
      <li>
        {language === "zh"
          ? "在主屏幕上找到 星域 图标并打开。"
          : "Find the MSpace icon on your Home Screen and open it."}
      </li>
    </ol>

    <p
  style={{
    fontSize: "13px",
    color: "#666",
    margin: "12px 0",
    textAlign: "left",
  }}
>
      {language === "zh"
        ? "如果找不到“添加到主屏幕”，请检查 Safari 分享菜单中的可用选项。菜单可能因 iOS 版本而异。"
        : "If you cannot find Add to Home Screen, check the available options in Safari's Share menu. The menu may vary by iOS version."}
    </p>
  </>
) : (
  <>
    <p>
      {language === "zh"
        ? "在 Android 手机上将 星域 添加到主屏幕："
        : "To add MSpace to your Android home screen:"}
    </p>

    <ol style={{ paddingLeft: "22px", lineHeight: 1.8 }}>
      <li>
        {language === "zh"
          ? "在 Google Chrome 中打开 星域。"
          : "Open MSpace in Google Chrome."}
      </li>
      <li>
        {language === "zh"
          ? "点击 Chrome 的三点菜单。"
          : "Tap Chrome's three-dot menu."}
      </li>
      <li>
        {language === "zh" ? (
          <>如果有<strong>安装应用</strong>或<strong>添加到主屏幕</strong>选项，请选择其中一个。</>
        ) : (
          <>Choose <strong>Install app</strong> or <strong>Add to Home screen</strong>, if available.</>
        )}
      </li>
      <li>
        {language === "zh"
          ? "按照屏幕上的提示操作。"
          : "Follow the on-screen instructions."}
      </li>
    </ol>

    <p style={{ fontSize: "13px", color: "#666" }}>
      {language === "zh"
        ? "如果这两个选项都没有出现，可能是浏览器目前不支持安装。"
        : "If neither option appears, the browser may not currently allow installation."}
    </p>
  </>
)}

   <button
  type="button"
  onClick={() => setShowInstallHelp(false)}
  style={{
    width: "100%",
    padding: "12px",
    marginTop: "8px",
    border: "none",
    borderRadius: "10px",
    background: "#7c3aed",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
  }}
>
  {language === "zh" ? "知道了" : "Got it"}
</button>
    </div>
  </div>
)}
</main>
</>
);
}