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

  useEffect(() => {
  loadProfile();
  loadPhotos();
  loadVideos();

  checkBanStatus();

  const interval = setInterval(() => {
    checkBanStatus();
  }, 5000);

  return () => clearInterval(interval);
}, []);

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

  return (
    <main
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "30px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* HEADER */}

   <div
  style={{
    textAlign: "center",
    marginBottom: "40px",
  }}
>
  <h1
    style={{
      color: "#7c3aed",
      fontSize: "48px",
      fontWeight: "800",
      margin: 0,
    }}
  >
    MSpace
  </h1>
</div>


      {/* PROFILE SECTION */}

 <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "40px",
    justifyContent: "flex-start",
    marginTop: "40px",
    marginBottom: "60px",
    padding: "40px",
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
    width: "220px",
    height: "220px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "6px solid #ede9fe",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
  }}
/>

  <div>
    <h2
      style={{
        fontSize: "48px",
        margin: 0,
        color: "#111",
        whiteSpace: "nowrap",
      }}
    >
      {profileName || "Donald Lee"}
    </h2>

    <p
      style={{
        maxWidth: "600px",
        marginTop: "10px",
        fontSize: "24px",
        color: "#666",
        lineHeight: "1.8",
      }}
    >
      {
  profileBio ||
  "Welcome to MSpace. View my exclusive photos, watch my latest videos and chat with me directly."
}
    </p>

   <div
  style={{
    display: "flex",
    gap: "60px",
    marginTop: "25px",
    marginBottom: "25px",
  }}
>
  <div>
    <h3
      style={{
        margin: 0,
        fontSize: "30px",
        fontWeight: "700",
      }}
    >
      {photos.length}
    </h3>

    <p
      style={{
        margin: 0,
        color: "#7c3aed",
      }}
    >
      Photos
    </p>
  </div>

  <div>
    <h3
      style={{
        margin: 0,
        fontSize: "30px",
        fontWeight: "700",
      }}
    >
      {videos.length}
    </h3>

    <p
      style={{
        margin: 0,
        color: "#7c3aed",
      }}
    >
      Videos
    </p>
  </div>
</div>

<button
  onClick={() => {
    if (typeof window !== "undefined") {
      (window as any).$crisp?.push([
        "do",
        "chat:open",
      ]);
    }
  }}
  style={{
    background:
      "linear-gradient(90deg,#7c3aed,#9333ea)",
    color: "#fff",
    border: "none",
    padding: "14px 30px",
    borderRadius: "12px",
    fontSize: "18px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow:
      "0 8px 20px rgba(124,58,237,0.3)",
  }}
>
  Chat With Me
</button>    
     
  </div>

</div>
        

      
      {/* PHOTOS */}

      <h2
  style={{
    color: "#7c3aed",
    fontSize: "42px",
    textAlign: "center",
    marginBottom: "40px",
    fontWeight: "700",
  }}
>
  Photos
</h2>

      <div
  id="photos"
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "30px",
  }}
>
  {photos.map((photo) => (
  <img
    key={photo.id}
    src={photo.image_url}
    alt="Photo"
    style={{
      width: "100%",
      height: "250px",
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
    fontSize: "42px",
    textAlign: "center",
    marginTop: "70px",
    marginBottom: "40px",
    fontWeight: "700",
  }}
>
  Videos
</h2>

<div
  id="videos"
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "30px",
  }}
>
  {videos.map((video) => (
    <video
      key={video.id}
      controls
      style={{
        width: "100%",
        height: "280px",
        objectFit: "cover",
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
    marginTop: "80px",
    padding: "30px",
    textAlign: "center",
    borderTop: "1px solid #eee",
    color: "#666",
  }}
>
  <h3
    style={{
      color: "#7c3aed",
      margin: 0,
    }}
  >
    MSpace
  </h3>

  <p>
    © 2026 Donald Lee. All Rights Reserved.
  </p>
</footer>
</main>
  );
}



