"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  LogOut,
  MessageCircleMore,
  Upload,
  Trash2,
  Video,
} from "lucide-react";

export default function VideoGalleryPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] =
    useState<File | null>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const admin =
      localStorage.getItem("mspace_admin") === "true";

    if (!admin) {
      window.location.replace("/admin/login");
      return;
    }

    loadVideos();
  }, []);

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

  async function uploadVideo() {
    if (!videoFile) {
      alert("Please select a video");
      return;
    }

    if (!thumbnailFile) {
      alert("Please select a thumbnail");
      return;
    }

    setUploading(true);

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
      setUploading(false);
      return;
    }

    const { error: thumbnailError } =
      await supabase.storage
        .from("Thumbnails")
        .upload(
          thumbnailFileName,
          thumbnailFile
        );

    if (thumbnailError) {
      alert(thumbnailError.message);
      setUploading(false);
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
      setUploading(false);
      return;
    }

    alert("Video uploaded successfully!");

    setVideoFile(null);
    setThumbnailFile(null);
    setUploading(false);

    loadVideos();
  }

  async function deleteVideo(id: number) {
    const confirmed = confirm(
      "Delete this video?"
    );

    if (!confirmed) return;

    const supabase = createClient();

    const { error } = await supabase
      .from("videos")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    loadVideos();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8f7ff",
        color: "#172554",
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
              Video Gallery
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
            onClick={() => {
              localStorage.removeItem(
                "mspace_admin"
              );
              window.location.href =
                "/admin/login";
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

      {/* Main */}
      <div
        style={{
          padding: "28px 34px 40px",
        }}
      >
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
            background: "transparent",
            border: "none",
            padding: 0,
            color: "#64748b",
            fontSize: "15px",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: "48px",
          }}
        >
          <ArrowLeft size={22} />
          Back to Manage
        </button>

        {/* Page title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              width: "84px",
              height: "84px",
              borderRadius: "22px",
              background: "#f1e8ff",
              color: "#7c3aed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Video size={42} />
          </div>

          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "40px",
                lineHeight: 1.1,
                fontWeight: 800,
                color: "#172554",
              }}
            >
              Video Gallery
            </h1>

            <div
              style={{
                fontSize: "18px",
                color: "#64748b",
                marginTop: "8px",
              }}
            >
              Upload and manage videos for members
            </div>
          </div>
        </div>

        {/* Upload card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "22px",
            padding: "28px",
            marginBottom: "30px",
            border: "1px solid #f0f0f0",
            boxShadow:
              "0 8px 30px rgba(30,41,59,0.06)",
          }}
        >
          <h2
            style={{
              margin: "0 0 20px",
              fontSize: "24px",
              color: "#172554",
            }}
          >
            Upload Video
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#475569",
                  marginBottom: "7px",
                }}
              >
                Video
              </div>

              <input
                type="file"
                accept="video/*"
                onChange={(e) =>
                  setVideoFile(
                    e.target.files?.[0] || null
                  )
                }
                style={{
                  width: "100%",
                  fontSize: "14px",
                }}
              />
            </div>

            <div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#475569",
                  marginBottom: "7px",
                }}
              >
                Thumbnail
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setThumbnailFile(
                    e.target.files?.[0] || null
                  )
                }
                style={{
                  width: "100%",
                  fontSize: "14px",
                }}
              />
            </div>

            <button
              onClick={uploadVideo}
              disabled={uploading}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "9px",
                padding: "14px",
                border: "none",
                borderRadius: "12px",
                background:
                  "linear-gradient(135deg, #7c3aed, #9333ea)",
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: 700,
                cursor: uploading
                  ? "not-allowed"
                  : "pointer",
                opacity: uploading ? 0.7 : 1,
                boxShadow:
                  "0 8px 18px rgba(124,58,237,0.20)",
              }}
            >
              <Upload size={20} />
              {uploading
                ? "Uploading..."
                : "Upload Video"}
            </button>
          </div>
        </div>

        {/* Videos */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "22px",
            padding: "28px",
            border: "1px solid #f0f0f0",
            boxShadow:
              "0 8px 30px rgba(30,41,59,0.06)",
          }}
        >
          <h2
            style={{
              margin: "0 0 24px",
              fontSize: "24px",
              color: "#172554",
            }}
          >
            Your Videos
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",
              gap: "20px",
            }}
          >
            {videos.map((video) => (
              <div
                key={video.id}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "16px",
                  background: "#f1f5f9",
                  border:
                    "1px solid #e2e8f0",
                }}
              >
                <video
                  controls
                  poster={video.thumbnail_url}
                  style={{
                    width: "100%",
                    height: "220px",
                    objectFit: "cover",
                    display: "block",
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
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    border: "none",
                    background: "#ef4444",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow:
                      "0 4px 12px rgba(239,68,68,0.25)",
                  }}
                >
                  <Trash2 size={21} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}