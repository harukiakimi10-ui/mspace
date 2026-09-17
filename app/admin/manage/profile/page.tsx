"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  MessageCircleMore,
  LogOut,
  Camera,
  Save,
  ArrowLeft,
} from "lucide-react";

export default function AdminProfilePage() {
  const [profileName, setProfileName] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [profilePhotoFile, setProfilePhotoFile] =
    useState<File | null>(null);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("mspace_admin") !== "true") {
      window.location.replace("/admin/login");
      return;
    }

    loadSettings();
  }, []);

  async function loadSettings() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    if (data) {
      setProfileName(data.profile_name || "");
      setProfileBio(data.profile_bio || "");
      setProfilePhoto(data.profile_photo || "");
    }
  }

  async function saveSettings() {
    if (saving) return;

    setSaving(true);

    const supabase = createClient();

    let photoUrl = profilePhoto;

    try {
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
        return;
      }

      setProfilePhoto(photoUrl);
      setProfilePhotoFile(null);

      alert("Profile updated successfully!");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background:
          "linear-gradient(180deg, #ffffff 0%, #faf9ff 100%)",
        color: "#172554",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          background: "#ffffff",
          borderBottom: "1px solid #eeeeee",
          boxShadow:
            "0 4px 18px rgba(0,0,0,0.05)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        {/* MSpace */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, #7c3aed, #9333ea)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              boxShadow:
                "0 6px 16px rgba(124,58,237,0.25)",
              flexShrink: 0,
            }}
          >
            <MessageCircleMore size={22} />
          </div>

          <div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 800,
                color: "#7c3aed",
                lineHeight: 1.1,
              }}
            >
              MSpace
            </div>

            <div
              style={{
                fontSize: "13px",
                color: "#64748b",
                marginTop: "3px",
              }}
            >
              Profile Management
            </div>
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
              gap: "6px",
              background: "#ffffff",
              color: "#222222",
              border: "1px solid #e5e5e5",
              padding: "9px 12px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow:
                "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <MessageCircleMore size={18} />
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
              gap: "6px",
              background:
                "linear-gradient(135deg, #ef4444, #dc2626)",
              color: "#ffffff",
              border: "none",
              padding: "10px 13px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow:
                "0 5px 14px rgba(220,38,38,0.20)",
            }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Page */}
      <main
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "28px 20px 50px",
        }}
      >
        {/* Back */}
        <button
          onClick={() => {
            window.location.href = "/admin/manage";
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            border: "none",
            background: "transparent",
            color: "#64748b",
            fontSize: "14px",
            fontWeight: 600,
            padding: "4px 0",
            cursor: "pointer",
            marginBottom: "18px",
          }}
        >
          <ArrowLeft size={18} />
          Back to Manage
        </button>

        {/* Title */}
        <div
          style={{
            marginBottom: "22px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "30px",
              fontWeight: 800,
              letterSpacing: "-0.7px",
              color: "#172554",
            }}
          >
            Profile
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              fontSize: "15px",
              color: "#64748b",
            }}
          >
            Update your profile photo, name and bio
          </p>
        </div>

        {/* Profile Card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "24px",
            padding: "22px",
            border: "1px solid #eeeeee",
            boxShadow:
              "0 10px 35px rgba(30,41,59,0.07)",
          }}
        >
          {/* Photo */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "24px",
            }}
          >
            <label
              style={{
                width: "130px",
                height: "130px",
                borderRadius: "50%",
                overflow: "visible",
                position: "relative",
                cursor: "pointer",
                background: "#f1f5f9",
                display: "block",
                boxShadow:
                  "0 8px 25px rgba(30,41,59,0.10)",
              }}
            >
              {profilePhoto ? (
                <img
  src={profilePhoto}
  alt="Profile"
  style={{
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    borderRadius: "50%",
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
                    color: "#94a3b8",
                    fontSize: "48px",
                    fontWeight: 700,
                  }}
                >
                  ?
                </div>
              )}

              {/* Camera */}
              <div
                style={{
                  position: "absolute",
                  right: "2px",
                 bottom: "2px",
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  background: "#1e293b",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "3px solid #ffffff",
                }}
              >
                <Camera size={19} />
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setProfilePhotoFile(
                    e.target.files?.[0] || null
                  )
                }
                style={{
                  display: "none",
                }}
              />
            </label>
          </div>

          {/* Name */}
          <div style={{ marginBottom: "18px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 600,
                color: "#475569",
                marginBottom: "7px",
              }}
            >
              Name
            </label>

            <input
              type="text"
              placeholder="Profile Name"
              value={profileName}
              onChange={(e) =>
                setProfileName(e.target.value)
              }
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "13px 14px",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                fontSize: "16px",
                outline: "none",
                background: "#ffffff",
                color: "#1e293b",
              }}
            />
          </div>

          {/* Bio */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 600,
                color: "#475569",
                marginBottom: "7px",
              }}
            >
              Bio
            </label>

            <textarea
              placeholder="Profile Bio"
              value={profileBio}
              onChange={(e) =>
                setProfileBio(e.target.value)
              }
              style={{
                width: "100%",
                minHeight: "130px",
                boxSizing: "border-box",
                padding: "13px 14px",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                fontSize: "16px",
                lineHeight: 1.5,
                outline: "none",
                background: "#ffffff",
                color: "#1e293b",
                resize: "vertical",
              }}
            />
          </div>

          {/* Save */}
          <button
            onClick={saveSettings}
            disabled={saving}
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "14px",
              border: "none",
              borderRadius: "14px",
              background:
                "linear-gradient(135deg, #7c3aed, #9333ea)",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: 700,
              cursor: saving
                ? "default"
                : "pointer",
              opacity: saving ? 0.7 : 1,
              boxShadow:
                "0 8px 20px rgba(124,58,237,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <Save size={19} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </main>
    </div>
  );
}