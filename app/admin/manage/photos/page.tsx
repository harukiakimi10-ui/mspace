"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import {
  MessageCircleMore,
  LogOut,
  ArrowLeft,
  Image,
  Upload,
  Trash2,
} from "lucide-react";

export default function PhotoGalleryPage() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    if (localStorage.getItem("mspace_admin") !== "true") {
      window.location.replace("/admin/login");
      return;
    }

    loadPhotos();
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

    setPhotoFile(null);
    loadPhotos();
  }

  async function deletePhoto(id: number) {
    const supabase = createClient();

    const confirmed = confirm(
      "Delete this photo?"
    );

    if (!confirmed) return;

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

  function logout() {
    localStorage.removeItem("mspace_admin");
    window.location.href = "/admin/login";
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8f7ff",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
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
          boxShadow:
            "0 4px 18px rgba(0,0,0,0.05)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        {/* MSpace branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
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
              color: "#ffffff",
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
                letterSpacing: "-0.5px",
                whiteSpace: "nowrap",
              }}
            >
              MSpace
            </div>

            <div
              style={{
                fontSize: "13px",
                color: "#64748b",
                marginTop: "1px",
              }}
            >
              Photo Gallery
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
              window.location.href =
                "/admin/chats";
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
            onClick={logout}
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

      {/* Back */}
      <button
        onClick={() => {
          window.location.href =
            "/admin/manage";
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "none",
          border: "none",
          color: "#64748b",
          fontSize: "16px",
          fontWeight: 600,
          padding: 0,
          cursor: "pointer",
          marginBottom: "28px",
        }}
      >
        <ArrowLeft size={22} />
        Back to Manage
      </button>

      {/* Page title */}
      <div style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "16px",
              background: "#dcfce7",
              color: "#16a34a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image size={27} />
          </div>

          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "30px",
                fontWeight: 800,
                color: "#172554",
              }}
            >
              Photo Gallery
            </h1>

            <p
              style={{
                margin: "5px 0 0",
                color: "#64748b",
                fontSize: "15px",
              }}
            >
              Upload and manage photos for members
            </p>
          </div>
        </div>
      </div>

      {/* Upload card */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "22px",
          padding: "20px",
          marginBottom: "24px",
          boxShadow:
            "0 8px 30px rgba(30,41,59,0.06)",
          border: "1px solid #f0f0f0",
        }}
      >
        <div
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "#172554",
            marginBottom: "14px",
          }}
        >
          Upload Photo
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setPhotoFile(
              e.target.files?.[0] || null
            )
          }
          style={{
            width: "100%",
            marginBottom: "16px",
          }}
        />

        <button
          onClick={uploadPhoto}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "100%",
            padding: "13px",
            border: "none",
            borderRadius: "12px",
            background:
              "linear-gradient(135deg, #7c3aed, #9333ea)",
            color: "#ffffff",
            fontSize: "15px",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow:
              "0 8px 18px rgba(124,58,237,0.20)",
          }}
        >
          <Upload size={19} />
          Upload Photo
        </button>
      </div>

      {/* Gallery */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "22px",
          padding: "20px",
          boxShadow:
            "0 8px 30px rgba(30,41,59,0.06)",
          border: "1px solid #f0f0f0",
        }}
      >
        <div
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "#172554",
            marginBottom: "18px",
          }}
        >
          Your Photos
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, minmax(0, 1fr))",
            gap: "12px",
          }}
        >
          {photos.map((photo) => (
            <div
              key={photo.id}
              style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: "14px",
                background: "#f1f5f9",
              }}
            >
              <img
                src={photo.image_url}
                alt=""
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  objectFit: "cover",
                  display: "block",
                }}
              />

              <button
                onClick={() =>
                  deletePhoto(photo.id)
                }
                style={{
                  position: "absolute",
                  right: "8px",
                  bottom: "8px",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  border: "none",
                  background: "#dc2626",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow:
                    "0 4px 10px rgba(0,0,0,0.20)",
                }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {photos.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "#94a3b8",
              fontSize: "14px",
            }}
          >
            No photos uploaded yet.
          </div>
        )}
      </div>
    </div>
  );
}