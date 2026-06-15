"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function MembersPage() {

  const [photos, setPhotos] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [profileName, setProfileName] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");

  useEffect(() => {
  loadProfile();
  loadPhotos();
  loadVideos();
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "20px",
    borderBottom: "1px solid #eee",
    marginBottom: "40px",
  }}
>
  <h1
    style={{
      color: "#2e8b57",
      fontSize: "48px",
      margin: 0,
    }}
  >
    MSpace
  </h1>

  <div
    style={{
      display: "flex",
      gap: "40px",
      fontSize: "18px",
      fontWeight: "600",
      alignItems: "center",
    }}
  >
    <span
  style={{ cursor: "pointer" }}
  onClick={() => {
    document.body.scrollIntoView({
      behavior: "smooth",
    });
  }}
>
  Home
</span>

    <span
      style={{ cursor: "pointer" }}
      onClick={() =>
        document
          .getElementById("photos")
          ?.scrollIntoView({ behavior: "smooth" })
      }
    >
      Photos
    </span>

    <span
      style={{ cursor: "pointer" }}
      onClick={() =>
        document
          .getElementById("videos")
          ?.scrollIntoView({ behavior: "smooth" })
      }
    >
      Videos
    </span>

    <span
      style={{ cursor: "pointer", color: "#2e8b57" }}
      onClick={() => {
        if (typeof window !== "undefined") {
          (window as any).$crisp?.push(["do", "chat:open"]);
        }
      }}
    >
      Chat
    </span>

     <span
  style={{ cursor: "pointer", color: "#2e8b57" }}
  onClick={() => {
    alert(
      "Add MSpace to your Home Screen\n\n📱 iPhone:\n1. Tap Share\n2. Tap Add to Home Screen\n3. Tap Add\n\n🤖 Android:\n1. Tap Menu (⋮)\n2. Tap Add to Home Screen\n3. Tap Add"
    );
  }}
>
  📱 Install
</span>
   
  </div>
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
  "linear-gradient(135deg, #f8fbf8 0%, #ffffff 100%)",
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
    border: "6px solid white",
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
  </div>

</div>
        

      <hr
        style={{
          margin: "40px 0",
        }}
      />

      {/* PHOTOS */}

      <h2
  style={{
    color: "#2e8b57",
    fontSize: "42px",
    textAlign: "center",
    marginBottom: "40px",
    fontWeight: "700",
  }}
>
  Recent Photos
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
    }}
  />
))}
    
</div>
      <hr
        style={{
          margin: "40px 0",
        }}
      />

      {/* VIDEOS */}

 <h2
  style={{
    color: "#2e8b57",
    fontSize: "42px",
    textAlign: "center",
    marginTop: "70px",
    marginBottom: "40px",
    fontWeight: "700",
  }}
>
  Latest Videos
</h2>

<div
  id="videos"
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
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

</main>
  );
}



