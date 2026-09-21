"use client";

import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import {
  MessageCircleMore,
  LogOut,
  Users,
  UserRound,
  Activity,
  Image,
  Video,
  Eye,
} from "lucide-react";
import ProfileAvatar from "@/app/chat/ProfileAvatar";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
const [profileName, setProfileName] = useState("");
const [profileBio, setProfileBio] = useState("");
const [profilePhoto, setProfilePhoto] = useState("");
const [photoFile, setPhotoFile] = useState<File | null>(null);
const [profilePhotoFile, setProfilePhotoFile] =
  useState<File | null>(null);
const [photos, setPhotos] = useState<any[]>([]);

const [videoFile, setVideoFile] = useState<File | null>(null);
const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
const [videos, setVideos] = useState<any[]>([]);
const [members, setMembers] = useState<any[]>([]);
const [visits, setVisits] = useState<any[]>([]);
const [onlineCount, setOnlineCount] = useState(0);
const [totalMembers, setTotalMembers] = useState(0);
const [bannedCount, setBannedCount] = useState(0);


  useEffect(() => {
    const admin =
      localStorage.getItem("mspace_admin") === "true";

    setIsAdmin(admin);
  }, []);

 useEffect(() => {
  if (localStorage.getItem("mspace_admin") !== "true") {
    window.location.replace("/admin/login");
    return;
  }

  loadSettings();
  loadPhotos();
  loadVideos();
  loadMembers();
  loadVisits();
  

  const interval = setInterval(() => {
    loadMembers();
    loadVisits();
  }, 30000);

  return () => clearInterval(interval);
}, []);

async function loadPhotos() {
  const supabase = createClient();

  const { data } = await supabase
    .from("photos")
    .select("*")
    .order("id", { ascending: false });

  if (data) {
    setPhotos(data);
  }
}

async function loadVideos() {
  const supabase = createClient();

  const { data } = await supabase
    .from("videos")
    .select("*")
    .order("id", { ascending: false });

  if (data) {
    setVideos(data);
  }
}


async function loadMembers() {
  const supabase = createClient();

  const { data: membersData } = await supabase
    .from("members")
    .select("*")
    .order("id", { ascending: false });

  const { data: bannedDevices } = await supabase
    .from("banned_devices")
    .select("device_id");

  const { data: visitsData } = await supabase
  .from("page_visits")
  .select("member_id, visited_at")
  .order("visited_at", {
    ascending: false,
  });

console.log("VISITS:", visitsData);
membersData?.forEach((m) => {
  const visit = visitsData?.find(
    (v) => v.member_id === m.member_id
  );

  console.log({
    name: m.name,
    member_id: m.member_id,
    foundVisit: !!visit,
    lastVisit: visit?.visited_at,
  });
});

  if (membersData) {
   const updatedMembers = membersData.map(
  (member) => {
    const lastVisit = visitsData?.find(
      (v) => v.member_id === member.member_id
    );

    return {
      ...member,
      last_seen: lastVisit?.visited_at || null,
      device_banned:
        bannedDevices?.some(
          (d) =>
            d.device_id === member.device_id
        ) || false,
    };
  }
);


const online = updatedMembers.filter((m) => {
  if (!m.last_seen) return false;

  const diffMinutes = Math.floor(
    (Date.now() - new Date(m.last_seen).getTime()) / 60000
  );

  return diffMinutes < 5;
}).length;

setOnlineCount(online);
setTotalMembers(updatedMembers.length);
setBannedCount(
  updatedMembers.filter((m) => m.banned).length
);

    const onlineNow = updatedMembers.filter((m) => {
  if (!m.last_seen) return false;

  const diffMinutes = Math.floor(
    (Date.now() - new Date(m.last_seen).getTime()) / 60000
  );

  return diffMinutes < 5;
}).length;

setOnlineCount(onlineNow);
setTotalMembers(updatedMembers.length);
setBannedCount(
  updatedMembers.filter((m) => m.banned).length
);

setMembers(updatedMembers);

updatedMembers.forEach((m) => {
  console.log(
    m.name,
    "LAST_SEEN:",
    m.last_seen
  );
});
  }
}

async function loadVisits() {
  const supabase = createClient();

  const { data } = await supabase
    .from("page_visits")
    .select("*")
    .order("visited_at", {
      ascending: false,
    })
    .limit(20);

  if (data) {
    setVisits(data);
  }
}



async function uploadPhoto() {
  if (!photoFile) {
    alert("Please select a photo");
    return;
  }

  const supabase = createClient();

  const fileName =
    Date.now() + "-" + photoFile.name;

  const { error: uploadError } =
    await supabase.storage
      .from("photos")
      .upload(fileName, photoFile);

  if (uploadError) {
  console.log(uploadError);
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
  console.log(error);
  alert(error.message);
  return;
}

  alert("Photo uploaded!");

  loadPhotos();
}


async function uploadVideo() {
  if (!videoFile) {
    alert("Please select a video");
    return;
  }

  if (!thumbnailFile) {
    alert("Please select a thumbnail");
    return;
  }

  const supabase = createClient();

  const videoFileName =
    Date.now() + "-video-" + videoFile.name;

  const thumbnailFileName =
    Date.now() + "-thumb-" + thumbnailFile.name;

  const { error: videoError } =
    await supabase.storage
      .from("videos")
      .upload(videoFileName, videoFile);

  if (videoError) {
    alert(videoError.message);
    return;
  }

  const { error: thumbnailError } =
    await supabase.storage
      .from("Thumbnails")
      .upload(thumbnailFileName, thumbnailFile);

  if (thumbnailError) {
    alert(thumbnailError.message);
    return;
  }

  const videoUrl =
    `https://trmbblhdiolnbdnhlepv.supabase.co/storage/v1/object/public/videos/${videoFileName}`;

  const thumbnailUrl =
    `https://trmbblhdiolnbdnhlepv.supabase.co/storage/v1/object/public/Thumbnails/${thumbnailFileName}`;

  const { error } = await supabase
    .from("videos")
    .insert({
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
    });

  if (error) {
    alert(error.message);
    return;
  }

  alert("Video uploaded!");

  setVideoFile(null);
  setThumbnailFile(null);

  loadVideos();
}


async function deletePhoto(id: number) {
  const supabase = createClient();

  const { error } = await supabase
    .from("photos")
    .delete()
    .eq("id", id);

  if (error) {
    console.log(error);
    alert("Delete failed");
    return;
  }

  loadPhotos();
}

async function deleteVideo(id: number) {
  const supabase = createClient();

  const { error } = await supabase
    .from("videos")
    .delete()
    .eq("id", id);

  if (error) {
    console.log(error);
    alert("Delete failed");
    return;
  }

  loadVideos();
}

async function toggleBan(
  id: number,
  banned: boolean
) {
  const supabase = createClient();

  const { data: member } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .single();

  if (!member) return;

  const { error } = await supabase
    .from("members")
    .update({
      banned: !banned,
    })
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

 

  alert("Updated!");

  loadMembers();
}

async function banDevice(member: any) {
  const supabase = createClient();

  if (!member.device_id) {
    alert("No device ID found");
    return;
  }

  const { error: deviceError } =
    await supabase
      .from("banned_devices")
      .insert({
        device_id: member.device_id,
      });

  if (deviceError) {
    alert(deviceError.message);
    return;
  }

  alert(
    "Device banned and all accounts on this device were banned."
  );

  loadMembers();
}


async function unbanDevice(member: any) {
  alert("Member device: " + member.device_id);

  const supabase = createClient();

  const { error } = await supabase
    .from("banned_devices")
    .delete()
    .eq("device_id", member.device_id);

  if (error) {
    alert(error.message);
    return;
  }

  alert("Device unbanned!");

  loadMembers();
}

async function deleteMember(id: number) {
  const supabase = createClient();

  const confirmed = confirm("Delete this member?");
  if (!confirmed) return;

  const { error } = await supabase
    .from("members")
    .delete()
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  loadMembers();

  alert("Member deleted successfully.");
}

async function saveSettings() {
  const supabase = createClient();

  let photoUrl = profilePhoto;

  if (profilePhotoFile) {
    const fileName =
      Date.now() + "-" + profilePhotoFile.name;

    const { error: uploadError } =
      await supabase.storage
        .from("photos")
        .upload(fileName, profilePhotoFile);

    if (uploadError) {
      alert(uploadError.message);
      return;
    }

    photoUrl =
      `https://trmbblhdiolnbdnhlepv.supabase.co/storage/v1/object/public/photos/${fileName}`;
  }

  const { error } = await supabase
    .from("settings")
    .update({
      profile_name: profileName,
      profile_bio: profileBio,
      profile_photo: photoUrl,
    })
    .eq("id", 1);

  if (error) {
    console.log(error);
    alert("Error saving changes");
  } else {
    alert("Profile updated successfully!");
  }
}

async function loadSettings() {
  const supabase = createClient();

  const { data } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (data) {
  setProfileName(data.profile_name || "");
  setProfileBio(data.profile_bio || "");
  setProfilePhoto(data.profile_photo || "");
}
}

  function login() {
    if (password === "MSPACE2026") {
      localStorage.setItem("mspace_admin", "true");
      window.location.reload();
    } else {
      alert("Wrong password");
    }
  }

  if (!isAdmin) {
    return (
      <div
        style={{
          maxWidth: "400px",
          margin: "100px auto",
          textAlign: "center",
        }}
      >
        <h1>Admin Login</h1>

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "20px",
          }}
        />

        <button
          onClick={login}
          style={{
            padding: "12px 20px",
            background: "#2e8b57",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </div>
    );
  }

function getLastSeenText(lastSeen: string | null) {
  if (!lastSeen) return "Never";

  const diffMinutes = Math.floor(
    (Date.now() - new Date(lastSeen).getTime()) / 60000
  );

  if (diffMinutes < 5) {
    return "🟢 Online";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

  return (
  <div style={{ padding: "20px" }}>

    <div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "14px 12px",
    margin: "-20px -20px 24px",
    background: "#ffffff",
    borderBottom: "1px solid #eeeeee",
    boxShadow: "0 4px 18px rgba(0,0,0,0.05)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  }}
>
  {/* MSpace branding */}
<div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    minWidth: 0,
  }}
>
  <div
    style={{
      fontSize: "22px",
      fontWeight: 800,
      color: "#7c3aed",
      letterSpacing: "-0.5px",
      lineHeight: 1.1,
      whiteSpace: "nowrap",
    }}
  >
    MSpace
  </div>

  <div
    style={{
      fontSize: "13px",
      color: "#64748b",
      marginTop: "3px",
      lineHeight: 1.1,
      whiteSpace: "nowrap",
    }}
  >
    Admin Dashboard
  </div>
</div>

  {/* Navigation */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
    }}
  >

    <button
      onClick={() => {
        window.location.href = "/admin/chats";
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        background: "#ffffff",
        color: "#222222",
        border: "1px solid #e5e5e5",
        padding: "8px 9px",
        borderRadius: "12px",
        fontSize: "13px",
        fontWeight: 600,
        cursor: "pointer",
        boxShadow:
          "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <MessageCircleMore size={17} />
      Chats
    </button>

    <button
      onClick={() => {
        localStorage.removeItem("mspace_admin");
        window.location.href = "/admin/login";
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        background:
          "linear-gradient(135deg, #ef4444, #dc2626)",
        color: "#ffffff",
        border: "none",
        padding: "9px 10px",
        borderRadius: "12px",
        fontSize: "13px",
        fontWeight: 700,
        cursor: "pointer",
        boxShadow:
          "0 5px 14px rgba(220,38,38,0.20)",
      }}
    >
      <LogOut size={17} />
      Logout
    </button>
  </div>
</div>

{/* OVERVIEW HEADER */}
<div
  style={{
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "18px",
  }}
>
  <div>
    <div
      style={{
        fontSize: "28px",
        fontWeight: 800,
        color: "#172554",
        lineHeight: 1.15,
      }}
    >
      Overview
    </div>

    <div
      style={{
        fontSize: "16px",
        color: "#64748b",
        marginTop: "5px",
      }}
    >
      A quick snapshot of your MSpace
    </div>
  </div>

  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      color: "#7c3aed",
      fontSize: "15px",
      fontWeight: 600,
      whiteSpace: "nowrap",
      marginTop: "10px",
    }}
  >
    <div
      style={{
        width: "14px",
        height: "14px",
        borderRadius: "50%",
        background: "#a855f7",
      }}
    />
    Live data
  </div>
</div>

    <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px",
    marginBottom: "24px",
  }}
>
  {/* Members */}
  <div
    style={{
  background: "linear-gradient(135deg, #eef6ff, #e3efff)",
  border: "1px solid rgba(59,130,246,0.08)",
  borderRadius: "22px",
  padding: "14px",
  height: "90px",
  boxSizing: "border-box",
  boxShadow: "0 5px 18px rgba(59,130,246,0.08)",
}}
  >
    <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "14px",
    height: "100%",
  }}
>
  <div
    style={{
      width: "44px",
      height: "44px",
      borderRadius: "50%",
      background: "rgba(59,130,246,0.10)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#2563eb",
      flexShrink: 0,
    }}
  >
    <Users size={23} />
  </div>

  <div>
    <div
      style={{
        fontSize: "15px",
        fontWeight: 600,
        color: "#334155",
      }}
    >
      Members
    </div>

    <div
      style={{
        fontSize: "28px",
        lineHeight: 1,
        fontWeight: 800,
        color: "#2563eb",
        marginTop: "6px",
      }}
    >
      {totalMembers}
    </div>
  </div>
</div>
  </div>

  {/* Online */}
  <div
    style={{
      background: "linear-gradient(135deg, #edfff4, #e2faeb)",
      border: "1px solid rgba(34,197,94,0.08)",
      borderRadius: "22px",
      padding: "14px",
      height: "90px",
      boxSizing: "border-box",
      boxShadow: "0 5px 18px rgba(34,197,94,0.08)",
    }}
  >
    <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "14px",
    height: "100%",
  }}
>
  <div
    style={{
      width: "44px",
      height: "44px",
      borderRadius: "50%",
      background: "rgba(34,197,94,0.10)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#16a34a",
      flexShrink: 0,
    }}
  >
    <Activity size={23} />
  </div>

  <div>
    <div
      style={{
        fontSize: "15px",
        fontWeight: 600,
        color: "#334155",
      }}
    >
      Online
    </div>

    <div
      style={{
        fontSize: "28px",
        lineHeight: 1,
        fontWeight: 800,
        color: "#16a34a",
        marginTop: "6px",
      }}
    >
      {onlineCount}
    </div>
  </div>
</div>
  </div>

  {/* Photos */}
  <div
    style={{
      background: "linear-gradient(135deg, #fff8eb, #fff1dc)",
      border: "1px solid rgba(245,158,11,0.08)",
      borderRadius: "22px",
      padding: "14px",
      height: "90px",
      boxSizing: "border-box",
      boxShadow: "0 5px 18px rgba(245,158,11,0.08)",
    }}
  
>
  
  <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "14px",
    height: "100%",
  }}
>
  <div
    style={{
      width: "44px",
      height: "44px",
      borderRadius: "50%",
      background: "rgba(245,158,11,0.10)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#f59e0b",
      flexShrink: 0,
    }}
  >
    <Image size={23} />
  </div>

  <div>
    <div
      style={{
        fontSize: "15px",
        fontWeight: 600,
        color: "#334155",
      }}
    >
      Photos
    </div>

    <div
      style={{
        fontSize: "28px",
        lineHeight: 1,
        fontWeight: 800,
        color: "#ea580c",
        marginTop: "6px",
      }}
    >
      {photos.length}
    </div>
  </div>
</div>
  </div>

  {/* Videos */}
  <div
    style={{
      background: "linear-gradient(135deg, #f7f0ff, #f0e7ff)",
      border: "1px solid rgba(124,58,237,0.08)",
      borderRadius: "22px",
      padding: "14px",
      height: "90px",
      boxSizing: "border-box",
      boxShadow: "0 5px 18px rgba(124,58,237,0.08)",
    }}
  >
    <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "14px",
    height: "100%",
  }}
>
  <div
    style={{
      width: "44px",
      height: "44px",
      borderRadius: "50%",
      background: "rgba(124,58,237,0.10)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#7c3aed",
      flexShrink: 0,
    }}
  >
    <Video size={23} />
  </div>

  <div>
    <div
      style={{
        fontSize: "15px",
        fontWeight: 600,
        color: "#334155",
      }}
    >
      Videos
    </div>

    <div
      style={{
        fontSize: "28px",
        lineHeight: 1,
        fontWeight: 800,
        color: "#7c3aed",
        marginTop: "6px",
      }}
    >
      {videos.length}
    </div>
  </div>
</div>
  </div>
</div>

{/* MEMBER VIEW */}
<div
  onClick={() => {
    window.location.href =
      "/admin/manage/member-view";
  }}
  style={{
    background:
      "linear-gradient(135deg, #7c3aed, #9333ea)",
    borderRadius: "24px",
    padding: "22px",
    marginTop: "4px",
    marginBottom: "24px",
    minHeight: "100px",
    boxSizing: "border-box",
    boxShadow:
      "0 12px 30px rgba(124,58,237,0.22)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "18px",
    cursor: "pointer",
    userSelect: "none",
    color: "#ffffff",
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "16px",
      minWidth: 0,
    }}
  >
    <div
      style={{
        width: "58px",
        height: "58px",
        borderRadius: "18px",
        background:
          "rgba(255,255,255,0.16)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        border:
          "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <Eye size={25} />
    </div>

    <div style={{ minWidth: 0 }}>
      <div
        style={{
          fontSize: "24px",
          fontWeight: 800,
          lineHeight: 1.15,
        }}
      >
        Member View
      </div>

      <div
        style={{
          fontSize: "14px",
          color: "rgba(255,255,255,0.82)",
          marginTop: "7px",
          lineHeight: 1.4,
        }}
      >
        See and manage exactly what your members see
      </div>
    </div>
  </div>

  <div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontSize: "36px",
    lineHeight: 1,
    color: "#ffffff",
  }}
>
  ›
</div>
</div>

<div
  onClick={() => {
    window.location.href = "/admin/manage/members";
  }}
  style={{
    background: "#ffffff",
    borderRadius: "22px",
    padding: "18px",
    marginTop: "20px",
    marginBottom: "20px",
    border: "1px solid #f0f0f0",
    boxShadow: "0 8px 30px rgba(30,41,59,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "14px",
    cursor: "pointer",
    userSelect: "none",
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "14px",
      minWidth: 0,
    }}
  >
    <div
      style={{
        width: "48px",
        height: "48px",
        borderRadius: "16px",
        background: "#EDE7F6",
        color: "#6A1B9A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Users size={25} />
    </div>

    <div style={{ minWidth: 0 }}>
      <div
        style={{
          fontSize: "17px",
          fontWeight: 700,
          color: "#1f2937",
        }}
      >
        Members
      </div>

      <div
        style={{
          fontSize: "13px",
          color: "#6b7280",
          marginTop: "4px",
        }}
      >
        Manage members, bans and devices
      </div>
    </div>
  </div>

  <div
    style={{
      fontSize: "28px",
      color: "#9ca3af",
      lineHeight: 1,
      flexShrink: 0,
    }}
  >
    ›
  </div>
</div>

<div
  onClick={() => {
    window.location.href = "/admin/manage/visitors";
  }}
  style={{
    background: "#ffffff",
    borderRadius: "22px",
    padding: "18px",
    marginBottom: "20px",
    border: "1px solid #f0f0f0",
    boxShadow: "0 8px 30px rgba(30,41,59,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "14px",
    cursor: "pointer",
    userSelect: "none",
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "14px",
      minWidth: 0,
    }}
  >
    <div
      style={{
        width: "48px",
        height: "48px",
        borderRadius: "16px",
        background: "#f1e8ff",
        color: "#6d28d9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Eye size={25} />
    </div>

    <div style={{ minWidth: 0 }}>
      <div
        style={{
          fontSize: "17px",
          fontWeight: 700,
          color: "#1f2937",
        }}
      >
        Recent Visitors
      </div>

      <div
        style={{
          fontSize: "13px",
          color: "#6b7280",
          marginTop: "4px",
        }}
      >
        See your latest unique visitors
      </div>
    </div>
  </div>

  <div
    style={{
      fontSize: "28px",
      color: "#9ca3af",
      lineHeight: 1,
      flexShrink: 0,
    }}
  >
    ›
  </div>
</div>
{/* MSPACE FOOTER */}
<div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "46px",
    paddingBottom: "28px",
    textAlign: "center",
  }}
>
  <img
    src="/mspace-icon.png"
    alt="MSpace"
    style={{
      width: "48px",
      height: "48px",
      objectFit: "contain",
      display: "block",
      marginBottom: "8px",
    }}
  />

  <div
    style={{
      fontSize: "18px",
      fontWeight: 800,
      color: "#172554",
      lineHeight: 1.2,
    }}
  >
    MSpace
  </div>

  <div
    style={{
      fontSize: "13px",
      color: "#94a3b8",
      marginTop: "5px",
    }}
  >
    A more personal space
  </div>
</div>
</div>
  );
}