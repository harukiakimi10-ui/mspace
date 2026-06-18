"use client";

import "./home.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function Home() {
  const [latestVideo, setLatestVideo] = useState("");
  const [recentPhotos, setRecentPhotos] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [photoFile, setPhotoFile] =
  useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [photoCount, setPhotoCount] = useState(0);
  const [videoCount, setVideoCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  useEffect(() => {
  const memberId = localStorage.getItem("mspace_member_id");

  if (memberId) {
    router.push("/members");
  }
}, []);

useEffect(() => {
  async function loadCounts() {
    const supabase = createClient();

    const { data: photos } =
      await supabase.storage
        .from("photos")
        .list();

    const { data: videos } =
      await supabase.storage
        .from("videos")
        .list();

    setPhotoCount(photos?.length || 0);
    setVideoCount(videos?.length || 0);
  }

  loadCounts();
}, []);

useEffect(() => {
  async function loadRecentPhotos() {
    const supabase = createClient();

    const { data } = await supabase.storage
      .from("photos")
      .list("", {
        limit: 100,
        sortBy: {
          column: "created_at",
          order: "desc",
        },
      });

    if (!data) return;

    const urls = data
      .slice(0, 2)
      .map(
        (file) =>
          `https://trmbblhdiolnbdnhlepv.supabase.co/storage/v1/object/public/photos/${file.name}`
      );

    setRecentPhotos(urls);
  }

  loadRecentPhotos();
}, []);


useEffect(() => {
  async function loadLatestVideo() {
    const supabase = createClient();

    const { data } = await supabase.storage
      .from("videos")
      .list("", {
        limit: 100,
        sortBy: {
          column: "created_at",
          order: "desc",
        },
      });

    if (!data?.length) return;

    setLatestVideo(
      `https://trmbblhdiolnbdnhlepv.supabase.co/storage/v1/object/public/videos/${data[0].name}`
    );
  }

  loadLatestVideo();
}, []);

async function joinMSpace() {
  setLoading(true);

  if (!name.trim()) {
    alert("Please enter your name");
    setLoading(false);
    return;
  }

    const supabase = createClient();
    let deviceId =
  localStorage.getItem("mspace_device_id");

if (!deviceId) {
  deviceId = crypto.randomUUID();

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
  alert("This device has been blocked.");
  setLoading(false);
  return;
}

 const { data: existingMember } = await supabase
  .from("members")
  .select("*")
  .eq("name", name)
  .single();

if (existingMember?.banned) {
  alert(
    "Your MSpace account has been banned."
  );
  setLoading(false);
  return;
}
    const memberId = crypto.randomUUID();


   let photoUrl = "";

if (photoFile) {
  const { data, error: uploadError } =
    await supabase.storage
      .from("avaters")
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
  `https://trmbblhdiolnbdnhlepv.supabase.co/storage/v1/object/public/avaters/${data.path}`;

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
  alert("Error: " + error.message);
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
  src="/MSpace-logo.jpg.jpeg"
  alt="MSpace"
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
  Join MSpace
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
    src="https://trmbblhdiolnbdnhlepv.supabase.co/storage/v1/object/public/avaters/WhatsApp%20Image%202025-02-22%20at%201.43.05%20PM.jpeg"
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
      Welcome to
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
      Donald Lee's
      <br />
      Personal Space
    </h2>

    <p
      style={{
        fontSize: "15px",
        color: "#6b7280",
        lineHeight: "1.7",
      }}
    >
      A place where I share my life moments,
      <br />
      and connect with friends.
    </p>

  </div>

</div>


{/* ADD PHOTO/VIDEO COUNTS HERE */}

<div
  className="stats-row"
  style={{
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: "24px",
    marginTop: "15px",
    marginBottom: "5px",
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
        width: "32px",
        height: "32px",
        background: "#7c3aed",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
    </div>

    <div>
      <h3
        style={{
          margin: 0,
          fontSize: "18px",
         fontWeight: "700",
         lineHeight: "1",
        }}
      >
        {photoCount}
      </h3>

      <p
        style={{
          margin: 0,
          fontSize: "13px",
          color: "#7c3aed",
        }}
      >
        Photos
      </p>
    </div>
  </div>


  {/* Divider */}


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
        width: "32px",
        height: "32px",
        background: "#7c3aed",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
      </svg>
    </div>


    <div>
      <h3
        style={{
          margin: 0,
          fontSize: "18px",
          fontWeight: "700",
          lineHeight: "1",
        }}
      >
        {videoCount}
      </h3>

      <p
        style={{
          margin: 0,
          fontSize: "13px",
          color: "#7c3aed",
        }}
      >
        Videos
      </p>
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
  {/* Photos Card */}

  <div
    style={{
      flex: 1,
      background: "#fff",
      borderRadius: "16px",
      padding: "15px",
      boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
    }}
  >
    <h3
      style={{
        marginBottom: "12px",
      }}
    >
      Recent Photos
    </h3>

    <div
      style={{
        display: "flex",
        gap: "10px",
      }}
    >
      {recentPhotos.slice(0, 2).map((photo, index) => (
        <img
          key={index}
          src={photo}
          alt=""
          style={{
            width: "50%",
            height: "150px",
            objectFit: "cover",
            borderRadius: "10px",
          }}
        />
      ))}
    </div>
  </div>

  {/* Video Card */}

  <div
    style={{
      flex: 1,
      background: "#fff",
      borderRadius: "16px",
      padding: "15px",
      boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
    }}
  >
    <h3
      style={{
        marginBottom: "12px",
      }}
    >
      Latest Video
    </h3>

    {latestVideo && (
      <video
        controls
        style={{
          width: "100%",
          height: "150px",
          objectFit: "cover",
          borderRadius: "10px",
        }}
      >
        <source src={latestVideo} type="video/mp4" />
      </video>
    )}
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
    Join MSpace
  </h2>

  <p
    style={{
      textAlign: "center",
      color: "#6b7280",
      marginBottom: "10px",
      fontSize: "18px",
    }}
  >
    Join and start connecting
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
  Name
</label>

  <input
    type="text"
    placeholder="Enter your name"
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
  Profile Photo
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
    color: "#7c3aed",
  }}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 5h6" />
    <path d="M19 2v6" />
    <path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    <circle cx="9" cy="9" r="2" />
  </svg>
</div>


    <p
  style={{
    textAlign: "center",
    color: "#7c3aed",
    fontWeight: "600",
    marginBottom: "5px",
  }}
>
  Upload Profile Photo
</p>

<p
  style={{
    textAlign: "center",
    color: "#6b7280",
    fontSize: "14px",
    marginBottom: "10px",
  }}
>
  JPG, PNG or WebP • Optional
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
  Choose Photo

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
    Selected: {fileName}
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
        Connecting...
      </>
    ) : (
      "Join MSpace"
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
    By joining, you agree to our
    <span
      style={{
        color: "#7c3aed",
        fontWeight: "600",
      }}
    >
      {" "}Terms of Service
    </span>
    {" "}and{" "}
    <span
      style={{
        color: "#7c3aed",
        fontWeight: "600",
      }}
    >
      Privacy Policy
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
  MSpace
</h3>

  <p
  style={{
    margin: "0",
    fontSize: "13px",
  }}
>
  © 2026 Donald Lee. All Rights Reserved.
</p>
</footer>
</main>

</>

);
}

