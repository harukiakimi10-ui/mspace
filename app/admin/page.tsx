"use client";

import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";

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
const [videos, setVideos] = useState<any[]>([]);
const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    const admin =
      localStorage.getItem("mspace_admin") === "true";

    setIsAdmin(admin);
  }, []);

  useEffect(() => {
  loadSettings();
  loadPhotos();
  loadVideos();
  loadMembers();
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

  const { data } = await supabase
    .from("members")
    .select("*")
    .order("id", { ascending: false });

  if (data) {
    setMembers(data);
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

  const supabase = createClient();

  const fileName =
    Date.now() + "-" + videoFile.name;

  const { error: uploadError } =
    await supabase.storage
      .from("videos")
      .upload(fileName, videoFile);

  if (uploadError) {
    console.log(uploadError);
    alert(uploadError.message);
    return;
  }

  const videoUrl =
    `https://trmbblhdiolnbdnhlepv.supabase.co/storage/v1/object/public/videos/${fileName}`;

  const { error } = await supabase
    .from("videos")
    .insert({
      video_url: videoUrl,
    });

  if (error) {
    console.log(error);
    alert(error.message);
    return;
  }

  alert("Video uploaded!");

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

  await supabase
    .from("members")
    .update({
      banned: true,
    })
    .eq("device_id", member.device_id);

  alert(
    "Device banned and all accounts on this device were banned."
  );

  loadMembers();
}

async function deleteMember(id: number) {
  const supabase = createClient();

  const confirmed = confirm(
    "Delete this member?"
  );

  if (!confirmed) return;

  const { error } = await supabase
    .from("members")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Delete failed");
    return;
  }

  loadMembers();
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

  return (
    <div style={{ padding: "40px" }}>
      <h1>MSpace Admin Panel</h1>

      <p>✅ Logged in</p>

 <button
  onClick={() => {
    localStorage.removeItem("mspace_admin");
    window.location.reload();
  }}
  style={{
    padding: "10px 16px",
    background: "#dc3545",
    color: "white",
    border: "none",
    cursor: "pointer",
    marginBottom: "20px",
  }}
>
  Logout
</button>

      <h2>Profile Settings</h2>

<input
  type="text"
  placeholder="Profile Name"
  value={profileName || ""}
  onChange={(e) => setProfileName(e.target.value)}
  style={{
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
  }}
/>

<textarea
  placeholder="Profile Bio"
  value={profileBio || ""}
  onChange={(e) => setProfileBio(e.target.value)}
  style={{
    width: "100%",
    height: "120px",
    padding: "12px",
    marginBottom: "15px",
  }}
/>

<input
  type="file"
  accept="image/*"
  onChange={(e) =>
    setProfilePhotoFile(
      e.target.files?.[0] || null
    )
  }
/>

<button
  onClick={saveSettings}
  style={{
    padding: "12px 20px",
    background: "#2e8b57",
    color: "white",
    border: "none",
    cursor: "pointer",
  }}
>
  Save Changes
</button>

<h2 style={{ marginTop: "40px" }}>
  Photo Gallery
</h2>

<input
  type="file"
  accept="image/*"
  onChange={(e) =>
    setPhotoFile(
      e.target.files?.[0] || null
    )
  }
/>

<br />
<br />

<button
  onClick={uploadPhoto}
  style={{
    padding: "12px 20px",
    background: "#2e8b57",
    color: "white",
    border: "none",
    cursor: "pointer",
  }}
>
  Upload Photo
</button>

<div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(3, 1fr)",
    gap: "20px",
    marginTop: "30px",
  }}
>
  {photos.map((photo) => (
    <div key={photo.id}>
      <img
        src={photo.image_url}
        style={{
          width: "100%",
          height: "200px",
          objectFit: "cover",
        }}
      />

      <button
        onClick={() =>
          deletePhoto(photo.id)
        }
      >
        Delete
      </button>
    </div>
  ))}
</div>

<h2 style={{ marginTop: "40px" }}>
  Video Gallery
</h2>

<input
  type="file"
  accept="video/*"
  onChange={(e) =>
    setVideoFile(
      e.target.files?.[0] || null
    )
  }
/>

<br />
<br />

<button
  onClick={uploadVideo}
  style={{
    padding: "12px 20px",
    background: "#2e8b57",
    color: "white",
    border: "none",
    cursor: "pointer",
  }}
>
  Upload Video
</button>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    marginTop: "30px",
  }}
>
  {videos.map((video) => (
    <div key={video.id}>
      <video
        controls
        style={{
          width: "100%",
          height: "200px",
          objectFit: "cover",
        }}
      >
        <source
          src={video.video_url}
          type="video/mp4"
        />
      </video>

      <button
        onClick={() =>
          deleteVideo(video.id)
        }
      >
        Delete
      </button>
    </div>
  ))}
</div>


<h2 style={{ marginTop: "40px" }}>
  Members
</h2>

<table
  style={{
    width: "100%",
    borderCollapse: "collapse",
  }}
>
  <thead>
  <tr>
  <th>ID</th>
  <th>Name</th>
  <th>Device ID</th>
  <th>Photo</th>
  <th>Status</th>
  <th>Action</th>
</tr>
</thead>

  <tbody>
    {members.map((member) => (
      <tr key={member.id}>
        <td>{member.member_id}</td>

        <td>{member.name}</td>
       
        <td>
         {member.device_id
          ? member.device_id.slice(0, 8)
          : "None"}
        </td>

        <td>
          {member.photo_url ? (
            <img
              src={member.photo_url}
              width="60"
            />
          ) : (
            "No Photo"
          )}
        </td>

        <td>
  {member.banned ? "🚫 Banned" : "✅ Active"}
</td>

<td>
  <button
    onClick={() =>
      toggleBan(member.id, member.banned)
    }
    style={{
      background: member.banned
        ? "#28a745"
        : "#ffc107",
      color: "black",
      border: "none",
      padding: "6px 12px",
      marginRight: "10px",
      cursor: "pointer",
    }}
  >
    {member.banned ? "Unban" : "Ban"}
  </button>

  <button
    onClick={() =>
      banDevice(member)
    }
    style={{
      background: "#8b0000",
      color: "white",
      border: "none",
      padding: "6px 12px",
      marginRight: "10px",
      cursor: "pointer",
    }}
  >
    Ban Device
  </button>

  <button
    onClick={() =>
      deleteMember(member.id)
    }
    style={{
      background: "#dc3545",
      color: "white",
      border: "none",
      padding: "6px 12px",
      cursor: "pointer",
    }}
  >
    Delete
  </button>
</td>
      </tr>
    ))}
  </tbody>
</table>

</div>
  );
}