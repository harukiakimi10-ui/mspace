"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function MembersPage() {
const router = useRouter();

  const [photos, setPhotos] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [profileName, setProfileName] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState("");
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedIndex, setSelectedIndex] =
  useState<number | null>(null);
  const [selectedVideoIndex, setSelectedVideoIndex] =
  useState<number | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [touchStartX, setTouchStartX] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  loadInitialData();

  checkBanStatus();

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


async function loadInitialData() {
  await Promise.all([
    loadProfile(),
    loadPhotos(),
    loadVideos(),
  ]);

  setLoading(false);
}


async function loadProfile() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (data) {
    setProfileName(data.profile_name);
    setProfileBio(data.profile_bio);
    setProfilePhoto(data.profile_photo);
  }

  if (error) {
    console.log(error);
  }
}

async function loadPhotos() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .order("id", { ascending: false });

  if (data) {
    setPhotos(data);
  }

  if (error) {
    console.log(error);
  }
}

async function loadVideos() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .order("id", { ascending: false });

  if (data) {
    setVideos(data);
  }

  if (error) {
    console.log(error);
  }
}

async function checkBanStatus() {
  const memberId =
    localStorage.getItem("mspace_member_id");

  if (!memberId) {
    router.push("/");
    return;
  }

  const supabase = createClient();

  const { data } = await supabase
    .from("members")
    .select("banned")
    .eq("member_id", memberId)
    .single();

  if (data?.banned) {
    alert("Your MSpace account has been banned.");

    localStorage.removeItem(
      "mspace_member_id"
    );

    router.push("/");
  }
}

async function installApp() {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();

  const choiceResult =
    await deferredPrompt.userChoice;

  if (choiceResult.outcome === "accepted") {
    setShowInstallButton(false);
  }
}

async function openChat() {
  const memberId =
    localStorage.getItem("mspace_member_id");

  console.log("Member ID:", memberId);

  if (!memberId) return;

  const supabase = createClient();

  const { data, error } = await supabase
    .from("members")
    .select("name, photo_url")
    .eq("member_id", memberId)
    .single();

  console.log("Member Data:", data);
  console.log("Member Error:", error);

  if (data) {
  console.log("Sending to Crisp:", data);

  (window as any).$crisp.push([
    "set",
    "user:nickname",
    [data.name]
  ]);

  (window as any).$crisp.push([
    "set",
    "user:avatar",
    [data.photo_url]
  ]);
}

(window as any).$crisp.push([
   "do",
   "chat:open"
  ]);
}

if (loading) {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "20px",
      }}
    >
      Loading...
    </div>
  );
}

  return (
    <main
  style={{
    fontFamily: "Arial, sans-serif",
    padding: "0px 5px",
    width: "100%",
    maxWidth: "none",
    margin: 0,
  }}
>
 {/* HEADER */}

   <div
  style={{
    textAlign: "center",
    marginTop: "-5px",
    marginBottom: "-5px",
    width: "100%",
  }}
>
  <h1
  style={{
    textAlign: "center",
    fontSize: "25px",
    fontWeight: "900",
    letterSpacing: "-1px",
    margin: "10px 0",
    background:
      "linear-gradient(135deg,#7c3aed,#a855f7,#c084fc)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  }}
>
  MSpace
</h1>
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
    "https://trmbblhdiolnbdnhlepv.supabase.co/storage/v1/object/public/avaters/WhatsApp%20Image%202025-02-22%20at%201.43.05%20PM.jpeg"
  }
  alt="Donald Lee"
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
      {profileName || "Donald Lee"}
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
  profileBio ||
  "Welcome to my personal space. View my exclusive photos, watch my latest videos and chat with me directly."
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
  Photos
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
  Videos
</div>
      </div>
    </div>

    <button
      onClick={openChat}
      style={{
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
      💬 Chat With Me
    </button>
  </div>
</div>

</div>
</div>
        

      
      {/* PHOTOS */}

  <h2
  style={{
    color: "#7c3aed",
    fontSize: "18px",
    textAlign: "left",
    marginTop: "4px",
    marginBottom: "2px",
    marginLeft: isMobile ? "10px" : "40px",
    fontWeight: "700",

  }}
>
  Photos
</h2>

      <div
  id="photos"
  style={{
    display: "grid",
    gridTemplateColumns: isMobile
  ? "repeat(3, 1fr)"
  : "repeat(6, 1fr)",
    gap: "4px",
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
      height: isMobile ? "95px" : "110px",
      objectFit: "cover",
      borderRadius: "20px",
      border: "1px solid #e8e8e8",
      boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
      cursor: "pointer",
      transition: "all 0.3s ease",
    }}
  />
))}
    
</div>
      

      {/* VIDEOS */}

 <h2
  style={{
    color: "#7c3aed",
    fontSize: "16px",
    textAlign: "left",
    marginTop: "0px",
    marginBottom: "2px",
    marginLeft: isMobile ? "10px" : "40px",
    fontWeight: "700",

  }}
>
  Videos
</h2>

     <div
  id="videos"
  style={{
    display: "grid",
    gridTemplateColumns: isMobile
  ? "repeat(3, 1fr)"
  : "repeat(6, 1fr)",
    gap: "12px", 
    paddingLeft: isMobile ? "10px" : "40px",
    paddingRight: isMobile ? "10px" : "40px",
  }}
>
  {videos.map((video, index) => (
  <div
  key={video.id}
  onClick={() => setSelectedVideoIndex(index)}
  onTouchStart={() => setSelectedVideoIndex(index)}
  style={{
    cursor: "pointer",
    width: "100%",
    height: isMobile ? "95px" : "100px",
    overflow: "hidden",
    borderRadius: "20px",
    position: "relative",
  }}
>
   <video
  muted
  playsInline
  autoPlay
  loop
  preload="auto"
  controls={false}
  style={{
    width: "100%",
    height: "100%",
    objectFit: "cover",
    pointerEvents: "none",
    borderRadius: "20px",
    border: "1px solid #e8e8e8",
    boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
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

<Script id="crisp-chat" strategy="afterInteractive">
  {`
    window.$crisp=[];
    window.CRISP_WEBSITE_ID="edd48ae1-1428-46c9-a33f-ca9af43d3481";
    (function(){
      var d=document;
      var s=d.createElement("script");
      s.src="https://client.crisp.chat/l.js";
      s.async=1;
      d.getElementsByTagName("head")[0].appendChild(s);
    })();
  `}
</Script>

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
  © 2026 Donald Lee. All Rights Reserved.
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
      boxShadow:
        "0 4px 12px rgba(0,0,0,0.2)",
    }}
  >
    📱 Add App
  </button>
)}


 {selectedIndex !== null && (
  <div
    onClick={() => setSelectedIndex(null)}
    onTouchStart={(e) => {
      setTouchStartX(e.changedTouches[0].clientX);
    }}
    onTouchEnd={(e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;

      if (diff > 50) {
        setSelectedIndex(
          selectedIndex === photos.length - 1
            ? 0
            : selectedIndex + 1
        );
      }

      if (diff < -50) {
        setSelectedIndex(
          selectedIndex === 0
            ? photos.length - 1
            : selectedIndex - 1
        );
      }
    }}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.95)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 99999,
    }}
  >
    <button
  onClick={(e) => {
    e.stopPropagation();
    setSelectedIndex(
      selectedIndex === 0
        ? photos.length - 1
        : selectedIndex - 1
    );
  }}
  style={{
    position: "fixed",
    left: "20px",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 99999,
    background: "transparent",
    border: "none",
    fontSize: "25px",
    cursor: "pointer",
  }}
>
  ←
</button>

<img
  src={photos[selectedIndex].image_url}
  alt=""
  style={{
    maxWidth: "95%",
    maxHeight: "90vh",
    objectFit: "contain",
  }}
/>

<button
  onClick={(e) => {
    e.stopPropagation();
    setSelectedIndex(
      selectedIndex === photos.length - 1
        ? 0
        : selectedIndex + 1
    );
  }}
  style={{
    position: "fixed",
    right: "20px",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 99999,
    background: "transparent",
    border: "none",
    fontSize: "25px",
    cursor: "pointer",
  }}
>
  →
</button>

<button
  onClick={() => setSelectedIndex(null)}
  style={{
    position: "fixed",
    top: "20px",
    right: "20px",
    zIndex: 99999,
    background: "transparent",
    border: "none",
    fontSize: "25px",
    cursor: "pointer",
  }}
>
  ✕
</button>
  </div>
)}


{selectedVideoIndex !== null && (
<div
  onClick={() => setSelectedVideoIndex(null)}
  onTouchStart={(e) => {
    setTouchStartX(e.changedTouches[0].clientX);
  }}
  onTouchEnd={(e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (diff > 50) {
      setSelectedVideoIndex(
        selectedVideoIndex === videos.length - 1
          ? 0
          : selectedVideoIndex + 1
      );
    }

    if (diff < -50) {
      setSelectedVideoIndex(
        selectedVideoIndex === 0
          ? videos.length - 1
          : selectedVideoIndex - 1
      );
    }
  }}
  style={{
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.95)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 99999,
  touchAction: "pan-y",
}}
>
  ←
<button
  onClick={(e) => {
    e.stopPropagation();

    setSelectedVideoIndex(
      selectedVideoIndex === 0
        ? videos.length - 1
        : selectedVideoIndex - 1
    );
  }}
  style={{
  position: "fixed",
  left: "20px",
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 99999,
  background: "transparent",
  border: "none",
  fontSize: "25px",
  color: "#000",
  cursor: "pointer",
}}
>
  ←
</button>

  <video
  key={selectedVideoIndex}
  controls
  autoPlay
  playsInline
  disablePictureInPicture
  controlsList="nofullscreen"
  onClick={(e) => e.stopPropagation()}
  style={{
    maxWidth: "95%",
    maxHeight: "90vh",
  }}
>
      <source
        src={
          videos[selectedVideoIndex]
            .video_url
        }
        type="video/mp4"
      />
    </video>

    <button
      onClick={(e) => {
  e.stopPropagation();
        setSelectedVideoIndex(
          selectedVideoIndex ===
            videos.length - 1
            ? 0
            : selectedVideoIndex + 1
        );
      }}
      
  
  style={{
  position: "fixed",
  right: "20px",
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 99999,
  background: "transparent",
  border: "none",
  fontSize: "25px",
  color: "#000",
  cursor: "pointer",
}}
>
  →
</button>

    <button
      onClick={() =>
        setSelectedVideoIndex(null)
      }
      
  style={{
  position: "fixed",
  top: "20px",
  right: "20px",
  zIndex: 99999,
  background: "transparent",
  border: "none",
  fontSize: "25px",
  color: "#000",
  cursor: "pointer",
}}

>
  ✕
</button>
  </div>
)}
</main>
  );
}



