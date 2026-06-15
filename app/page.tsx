"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function Home() {
  const [name, setName] = useState("");
  const router = useRouter();
  useEffect(() => {
  const memberId = localStorage.getItem("mspace_member_id");

  if (memberId) {
    router.push("/members");
  }
}, []);

  async function joinMSpace() {
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }

    const supabase = createClient();
    const memberId = crypto.randomUUID();

    const { error } = await supabase
      .from("members")
      .insert([
        {
          member_id: memberId,
          name: name,
          photo_url: "",
        },
      ]);

    if (error) {
  alert("Error: " + error.message);
} else {
  localStorage.setItem("mspace_member_id", memberId);

  setName("");

  router.push("/members");
}
  }

  return (
    <>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px 50px",
      borderBottom: "1px solid #eee",
      backgroundColor: "#fff",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}
  >
    <h1
      style={{
        color: "#2e8b57",
        margin: 0,
        fontSize: "40px",
      }}
    >
      MSpace
    </h1>

    <button
  onClick={() => {
    document
      .getElementById("signup")
      ?.scrollIntoView({ behavior: "smooth" });
  }}
  style={{
    backgroundColor: "#2e8b57",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "10px",
    cursor: "pointer",
  }}
>
  Join MSpace
</button>
  </div>

  <main
  style={{
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    background:
      "linear-gradient(to bottom, #f8fbf8 0%, #ffffff 30%)",
    minHeight: "100vh",
    paddingBottom: "80px",
  }}
>
     

      {/* OWNER PROFILE */}

     <img
  src="https://trmbblhdiolnbdnhlepv.supabase.co/storage/v1/object/public/avaters/WhatsApp%20Image%202025-02-22%20at%201.43.05%20PM.jpeg"
  alt="Donald Lee"
  style={{
    width: "220px",
    height: "220px",
    borderRadius: "50%",
    objectFit: "cover",
    display: "block",
    margin: "40px auto 20px auto",
    border: "6px solid white",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  }}
/>
      <h2
  style={{
    fontSize: "56px",
    fontWeight: "700",
    marginTop: "20px",
    marginBottom: "10px",
  }}
>
  Donald Lee
</h2>

      <p
  style={{
    maxWidth: "800px",
    margin: "20px auto",
    fontSize: "22px",
    color: "#555",
    lineHeight: "1.8",
  }}
>
  Welcome to my personal space. View photos, watch videos,
  stay connected, and become part of the MSpace community.
</p>
<button
  onClick={() => {
    document
      .getElementById("signup")
      ?.scrollIntoView({ behavior: "smooth" });
  }}
  style={{
    backgroundColor: "#2e8b57",
    color: "white",
    border: "none",
    padding: "18px 40px",
    borderRadius: "12px",
    fontSize: "22px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "20px",
    boxShadow: "0 8px 20px rgba(46,139,87,0.3)",
  }}
>
  Join MSpace
</button>

      <hr
        style={{
          width: "60%",
          margin: "40px auto",
        }}
      />
<h2
  style={{
    color: "#2e8b57",
    marginTop: "40px",
    marginBottom: "25px",
  }}
>
  Recent Photos
</h2>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "50px",
    maxWidth: "1000px",
    margin: "0 auto 60px auto",
  }}
>
  <img
    src="https://trmbblhdiolnbdnhlepv.supabase.co/storage/v1/object/public/photos/photosup1.png"
    alt="Photo 1"
    style={{
  width: "100%",
  height: "220px",
  objectFit: "cover",
  borderRadius: "12px",
  boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
}}
  />

  <img
    src="https://trmbblhdiolnbdnhlepv.supabase.co/storage/v1/object/public/photos/photosup2.png"
    alt="Photo 2"
    style={{
      width: "100%",
      height: "220px",
      objectFit: "cover",
      borderRadius: "12px",
      boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
    }}
  />

</div>

     <h2
  style={{
    color: "#2e8b57",
    marginTop: "20px",
    marginBottom: "25px",
  }}
>
  Latest Videos
</h2>

<div
  style={{
    display: "flex",
    justifyContent: "center",
    margin: "0 auto 60px auto",
  }}
>
  <video
    controls
    style={{
  width: "500px",
  height: "230px",
  objectFit: "cover",
  borderRadius: "12px",
  boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
}}
  >
    <source
      src="https://trmbblhdiolnbdnhlepv.supabase.co/storage/v1/object/public/videos/videosupv.mp4"
      type="video/mp4"
    />
  </video>
  
</div>
   
     <div
  style={{
    maxWidth: "900px",
    margin: "40px auto",
    backgroundColor: "#f8fbf8",
    borderRadius: "24px",
    padding: "50px",
    textAlign: "center",
  }}
>
  <h2
    style={{
      fontSize: "42px",
      marginBottom: "15px",
      color: "#222",
    }}
  >
    Stay Connected
  </h2>

  <p
    style={{
      fontSize: "20px",
      color: "#666",
      maxWidth: "600px",
      margin: "0 auto",
      lineHeight: "1.8",
    }}
  >
    Join MSpace and stay connected with me, see my latest updates, photos and videos.
  </p>
</div>

  <div
  id="signup"
  style={{
    width: "450px",
    margin: "60px auto",
    textAlign: "left",
    backgroundColor: "#ffffff",
    padding: "40px",
    borderRadius: "24px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.12)",
    border: "1px solid #f0f0f0",
  }}
>
        <label>Your Name</label>

        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
        width: "100%",
        padding: "14px",
        marginTop: "8px",
        marginBottom: "20px",
        borderRadius: "10px",
        border: "1px solid #ddd",
        fontSize: "16px",
       }}
        />

        <label>Profile Photo (Optional)</label>

        <input
          type="file"
          style={{
            width: "100%",
            marginTop: "8px",
            marginBottom: "20px",
          }}
        />

        <button
          onClick={joinMSpace}
          style={{
            width: "100%",
            padding: "15px",
            backgroundColor: "#2e8b57",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          Join MSpace
        </button>

<button
  onClick={() => {
    alert(
      "Add MSpace to your Home Screen\n\n📱 iPhone:\n1. Tap Share\n2. Tap Add to Home Screen\n3. Tap Add\n\n🤖 Android:\n1. Tap Menu (⋮)\n2. Tap Add to Home Screen\n3. Tap Add"
    );
  }}
  style={{
    width: "100%",
    padding: "15px",
    marginTop: "15px",
    backgroundColor: "#ffffff",
    color: "#2e8b57",
    border: "2px solid #2e8b57",
    borderRadius: "8px",
    fontSize: "18px",
    cursor: "pointer",
  }}
>
  📱 Add to Home Screen
</button>

</div>

<footer
  style={{
    marginTop: "100px",
    padding: "40px",
    backgroundColor: "#2e8b57",
    color: "white",
    textAlign: "center",
  }}
>
  <h3
    style={{
      marginBottom: "10px",
    }}
  >
    MSpace
  </h3>

  <p>
    © 2026 Donald Lee. All Rights Reserved.
  </p>
</footer>
   </main>
  </>
 );
}