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
  const [showInstallButton, setShowInstallButton] =
  useState(false);
  const [isOffline, setIsOffline] = useState(false);

const [deferredPrompt, setDeferredPrompt] =
  useState<any>(null);
  const router = useRouter();

const [language, setLanguage] =
  useState<"en" | "zh">("en");
  
  const [languageDiagnostic, setLanguageDiagnostic] = useState<{
  browserLanguages: string[];
  browserLanguage: string;
  detectedLanguage: "zh" | "en";
} | null>(null);

  useEffect(() => {
  setMounted(true);
}, []);

useEffect(() => {
  const browserLanguages =
    typeof navigator !== "undefined"
      ? Array.from(navigator.languages || [])
      : [];

  const browserLanguage =
    typeof navigator !== "undefined"
      ? navigator.language || ""
      : "";

  // Prefer the browser's primary language.
  const primaryLanguage =
    browserLanguages[0] || browserLanguage;

  const detectedLanguage: "zh" | "en" =
    primaryLanguage
      ? primaryLanguage.toLowerCase().startsWith("zh")
        ? "zh"
        : "en"
      : "zh";

  setLanguage(detectedLanguage);

  setLanguageDiagnostic({
    browserLanguages,
    browserLanguage: primaryLanguage || "(not detected)",
    detectedLanguage,
  });
}, []);

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

const t = {
en: {
join: "Join MSpace",
joinDesc: "Join and start connecting",
name: "Name",
enterName: "Enter your name",
profilePhoto: "Profile Photo",
uploadPhoto: "Upload Profile Photo",
choosePhoto: "Choose Photo",
selected: "Selected",
connecting: "Connecting…",
addApp: "Add App",
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
privacy: "Privacy Policy",
enterNameAlert: "Please enter your name",
blockedDevice: "This device has been blocked.",
bannedAccount: "Your MSpace account has been banned.",
error: "Error",
copyright: "All Rights Reserved",
appName: "MSpace",
offline: "No internet connection",
ownerSpace: "Huang Dingxiang's",


},

zh: {
join: "加入星域",
joinDesc: "加入并开始交流",
name: "姓名",
enterName: "请输入您的姓名",
profilePhoto: "头像照片",
uploadPhoto: "上传头像照片",
choosePhoto: "选择照片",
selected: "已选择",
connecting: "连接中…",
addApp: "安装星域",
recentPhotos: "最新照片",
latestVideo: "最新视频",
photos: "照片",
videos: "视频",
welcomeTo: "欢迎来到",
personalSpace: "个人空间",
personalDesc:
"这是我分享生活点滴并与朋友交流的地方。",

optional: "JPG、PNG 或 WebP • 可选",
termsText: "加入即表示您同意我们的",
terms: "服务条款",
privacy: "隐私政策",
enterNameAlert: "请输入您的姓名",
blockedDevice: "此设备已被封锁。",
bannedAccount: "您的星域账户已被封禁。",
error: "错误",
copyright: "版权所有",
appName: "星域",
offline: "网络不可用，请检查网络",
ownerSpace: "黄定襄的",


},
}[language];

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

    console.log("Valid member found. Restoring login...");
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

    // If we already have a stored member ID, keep the user in the member
    // area even when Supabase cannot be reached. The members page already
    // has local caching and handles backend errors without blanking itself.
    if (result === "error" && localStorage.getItem("mspace_member_id")) {
      router.replace("/members");
    }

    // Always release the loading gate. A backend timeout/error must never
    // leave the entire page permanently blank.
    setRestoring(false);

    console.log("Restore result:", result);
  });

  return () => {
    cancelled = true;
  };
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


const installApp = async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();

  const result =
    await deferredPrompt.userChoice;

  if (result.outcome === "accepted") {
    setShowInstallButton(false);
  }
};

async function joinMSpace() {
  setLoading(true);

  if (!name.trim()) {
    alert(t.enterNameAlert);

    setLoading(false);
    return;
  }

    const supabase = createClient();
    let deviceId =
  localStorage.getItem("mspace_device_id");

if (!deviceId) {
  deviceId = createId();

  localStorage.setItem(
    "mspace_device_id",
    deviceId
  );
}
   

  const { data: bannedDevices } = await supabase
  .from("banned_devices")
  .select("*");

console.log(
  "ALL BANNED DEVICES:",
  bannedDevices
);

console.log(
  "CURRENT DEVICE:",
  deviceId
);

const bannedDevice = bannedDevices?.find(
  (d) => d.device_id === deviceId
);

if (bannedDevice) {
  alert(t.blockedDevice);

  setLoading(false);
  return;
}

 const { data: existingMember } = await supabase
  .from("members")
  .select("*")
  .eq("name", name)
  .single();

if (existingMember?.banned) {
  alert(t.bannedAccount);

  setLoading(false);
  return;
}

// Check whether this device already has an MSpace account
const { data: deviceMember } = await supabase
  .from("members")
  .select("member_id, name, banned")
  .eq("device_id", deviceId)
  .maybeSingle();

if (deviceMember) {
  if (deviceMember.banned) {
    alert(t.bannedAccount);
    setLoading(false);
    return;
  }

  console.log(
    "Existing account found for this device:",
    deviceMember
  );

  localStorage.setItem(
    "mspace_member_id",
    deviceMember.member_id
  );

  setLoading(false);

  router.push("/members");
  return;
}

// No account exists for this device — create one

   const memberId = createId();

   let photoUrl = "";

if (photoFile) {
  const { data, error: uploadError } =
    await supabase.storage
      .from("avatars")
      .upload(
        `${Date.now()}.jpg`,
        photoFile,
        {
          upsert: true,
        }
      );

  console.log("PATH:", data?.path);
  console.log("UPLOAD ERROR:", uploadError);

  if (uploadError) {
  alert(JSON.stringify(uploadError, null, 2));
  setLoading(false);
  return;
}
  photoUrl =
  `https://trmbblhdiolnbdnhlepv.supabase.co/storage/v1/object/public/avatars/${data.path}`;

console.log("PHOTO URL:", photoUrl);
}


  const { error } = await supabase
  .from("members")
  .insert([
    {
      member_id: memberId,
      name,
      photo_url: photoUrl,
      device_id: deviceId,
    },
  ]);

if (error) {
    alert(`${t.error}: ${error.message}`);

  setLoading(false);
  return;
}


localStorage.setItem(
  "mspace_member_id",
  memberId
);

setName("");

setLoading(false);

router.push("/members");
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
onClick={() => {
  document
    .getElementById("join-form")
    ?.scrollIntoView({
      behavior: "smooth",
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
  <h2
    style={{
      textAlign: "center",
      fontSize: "24px",
      fontWeight: "700",
      marginBottom: "8px",
      color: "#111827",
    }}
  >
    {t.join}
  </h2>

  <p
    style={{
      textAlign: "center",
      color: "#6b7280",
      marginBottom: "10px",
      fontSize: "18px",
    }}
  >
    {t.joinDesc}
  </p>

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
    style={{
      border: "2px dashed #d1d5db",
      borderRadius: "16px",
      padding: "5px 10px",
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
  <ImagePlus size={56} color="#7c3aed" />
</div>


    <p
  style={{
    textAlign: "center",
    color: "#7c3aed",
    fontWeight: "600",
    marginBottom: "5px",
  }}
>
  {t.uploadPhoto}
</p>

<p
  style={{
    textAlign: "center",
    color: "#6b7280",
    fontSize: "14px",
    marginBottom: "10px",
  }}
>
  {t.optional}
</p>
    <label
  style={{
    display: "inline-block",
    marginTop: "5px",
    padding: "8px 18px",
    background: "#7c3aed",
    color: "#fff",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  }}
>
  {t.choosePhoto}

  <input
    type="file"
    accept="image/*"
    onChange={(e) => {
  const file = e.target.files?.[0] || null;
  setPhotoFile(file);
  setFileName(file?.name || "");
}}
    style={{
      display: "none",
    }}
  />
</label>

{fileName && (
  <p
    style={{
      marginTop: "15px",
      color: "#6b7280",
      fontSize: "14px",
      textAlign: "center",
      wordBreak: "break-all",
    }}
  >
    {t.selected}: {fileName}
  </p>
)}
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
  {" "}
  {language === "zh" ? "和" : "and"}
  {" "}
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
 ©️ 2026 {language === "zh" ? "黄定襄" : "Huang Dingxiang"}. {t.copyright}
</p>
</footer>
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
      boxShadow:
        "0 4px 12px rgba(0,0,0,0.2)",
    }}
  >
    📱 {t.addApp}
  </button>
  
)}
{(
  <div
    style={{
      position: "fixed",
      bottom: "10px",
      right: "10px",
      zIndex: 10000,
      background: "#fffbe6",
      color: "#111827",
      border: "2px solid #d97706",
      borderRadius: "10px",
      padding: "12px",
      maxWidth: "90vw",
      fontSize: "13px",
      overflowWrap: "anywhere",
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    }}
  >
    <strong>MSpace Language Diagnostic</strong>
    <p style={{ margin: "6px 0" }}>
      Browser language: {languageDiagnostic?.browserLanguage ?? "Diagnostic state is empty"}
    </p>
    <p style={{ margin: "6px 0" }}>
      Preferred languages: {languageDiagnostic?.browserLanguages.join(", ") ?? "(none)"}
    </p>
    <p style={{ margin: "6px 0" }}>
      MSpace selected: {languageDiagnostic?.detectedLanguage ?? language}
    </p>
  </div>
)}
</main>

</>

);
}

