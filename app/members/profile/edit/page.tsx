"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Camera, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function EditMemberProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [memberId, setMemberId] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberPhoto, setMemberPhoto] = useState("");
  const [selectedPhoto, setSelectedPhoto] =
    useState<File | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState("");

  useEffect(() => {
  const body = document.body;
  const html = document.documentElement;

  const previousBodyOverflow = body.style.overflow;
  const previousHtmlOverflow = html.style.overflow;
  const previousBodyOverscroll = body.style.overscrollBehavior;
  const previousHtmlOverscroll = html.style.overscrollBehavior;

  body.style.overflow = "hidden";
  html.style.overflow = "hidden";

  body.style.overscrollBehavior = "none";
  html.style.overscrollBehavior = "none";

  return () => {
    body.style.overflow = previousBodyOverflow;
    html.style.overflow = previousHtmlOverflow;

    body.style.overscrollBehavior =
      previousBodyOverscroll;

    html.style.overscrollBehavior =
      previousHtmlOverscroll;
  };
}, []);

  useEffect(() => {
  async function loadMember() {
    const cachedName =
      localStorage.getItem("mspace-member-name") || "";

    const cachedPhoto =
      localStorage.getItem("mspace-member-photo") || "";

    if (cachedName) {
      setMemberName(cachedName);
    }

    if (cachedPhoto) {
      setMemberPhoto(cachedPhoto);
    }

    const id =
      localStorage.getItem("mspace_member_id");

    if (!id) {
      router.push("/");
      return;
    }

      setMemberId(id);

      const { data, error } = await supabase
        .from("members")
        .select("name, photo_url")
        .eq("member_id", id)
        .single();

      if (error) {
        console.log(
          "Could not load member profile:",
          error
        );
        return;
      }

      if (data) {
  const name = data.name || "";
  const photo = data.photo_url || "";

  setMemberName(name);
  setMemberPhoto(photo);

  localStorage.setItem(
    "mspace-member-name",
    name
  );

  localStorage.setItem(
    "mspace-member-photo",
    photo
  );
}
    }

    loadMember();
  }, [router]);

  const handlePhotoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] || null;

    if (!file) return;

    setSelectedPhoto(file);

    const previewUrl = URL.createObjectURL(file);
    setPreviewPhoto(previewUrl);
  };

  const displayedPhoto =
    previewPhoto || memberPhoto;

    const saveProfile = async () => {
  if (!memberId) return;

  const trimmedName = memberName.trim();

  if (!trimmedName) {
    alert("Please enter your name");
    return;
  }

  try {
    let photoUrl = memberPhoto;

    if (selectedPhoto) {
      const fileExtension =
        selectedPhoto.name.split(".").pop() || "jpg";

      const filePath =
        `${Date.now()}.${fileExtension}`;

      const { data, error: uploadError } =
        await supabase.storage
          .from("avatars")
          .upload(
            filePath,
            selectedPhoto,
            {
              upsert: true,
            }
          );

      if (uploadError) {
        console.log(
          "Profile photo upload error:",
          uploadError
        );

        alert(
          `Photo upload failed: ${uploadError.message}`
        );

        return;
      }

      photoUrl =
        `https://trmbblhdiolnbdnhlepv.supabase.co/storage/v1/object/public/avatars/${data.path}`;
    }

    const { error } = await supabase
      .from("members")
      .update({
        name: trimmedName,
        photo_url: photoUrl,
      })
      .eq("member_id", memberId);

    if (error) {
      console.log(
        "Profile update error:",
        error
      );

      alert(
        `Profile update failed: ${error.message}`
      );

      return;
    }

    router.push("/members/profile");
  } catch (error) {
    console.log(
      "Save profile error:",
      error
    );

    alert("Could not save your profile.");
  }
};

  return (
    <div
  style={{
    position: "fixed",
    inset: 0,
    width: "100%",
    height: "100dvh",
    overflow: "hidden",
    background: "#fff",
    color: "#111827",
  }}
>
      {/* HEADER */}
      <div
        style={{
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 14px",
          borderBottom: "1px solid #eee",
          boxShadow:
            "0 1px 5px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <button
  type="button"
  onClick={() => router.back()}
  style={{
    width: "40px",
    height: "40px",
    border: "none",
    background: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    borderRadius: "50%",
    padding: 0,
  }}
>
  <ChevronLeft
    size={24}
    strokeWidth={2.5}
    color="#111827"
  />
</button>

          <div
            style={{
              fontSize: "18px",
              fontWeight: 700,
            }}
          >
            Edit Profile
          </div>
        </div>

        <button
  type="button"
  onClick={saveProfile}
  style={{
            border: "none",
            borderRadius: "10px",
            padding: "9px 18px",
            background:
              "linear-gradient(90deg,#7c3aed,#9333ea)",
            color: "#fff",
            fontSize: "15px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Save
        </button>
      </div>

      {/* CONTENT */}
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          margin: "0 auto",
          padding: "35px 20px 50px",
          boxSizing: "border-box",
        }}
      >
        {/* PROFILE PHOTO */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "35px",
          }}
        >
          <label
            style={{
              position: "relative",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              cursor: "pointer",
              display: "block",
            }}
          >
            {displayedPhoto ? (
              <img
                src={displayedPhoto}
                alt={memberName || "Member"}
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  display: "block",
                  border: "5px solid #ede9fe",
                }}
              />
            ) : (
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg,#ede9fe,#ddd6fe)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#7c3aed",
                  fontSize: "42px",
                  fontWeight: 700,
                  border: "5px solid #ede9fe",
                  boxSizing: "border-box",
                }}
              >
                {memberName
                  ? memberName.charAt(0).toUpperCase()
                  : "M"}
              </div>
            )}

            <div
              style={{
                position: "absolute",
                right: "0",
                bottom: "0",
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg,#7c3aed,#9333ea)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "3px solid #fff",
                boxShadow:
                  "0 4px 12px rgba(124,58,237,0.3)",
              }}
            >
              <Camera
                size={19}
                color="#fff"
              />
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{
                display: "none",
              }}
            />
          </label>
        </div>

        {/* NAME */}
        <label
          style={{
            display: "block",
            fontSize: "16px",
            fontWeight: 700,
            marginBottom: "8px",
          }}
        >
          Name
        </label>

        <input
          type="text"
          value={memberName}
          onChange={(e) =>
            setMemberName(e.target.value)
          }
          style={{
            width: "100%",
            height: "52px",
            boxSizing: "border-box",
            border: "1px solid #d1d5db",
            borderRadius: "12px",
            padding: "0 15px",
            fontSize: "16px",
            outline: "none",
          }}
        />

        {/* PHOTO */}
        <label
          style={{
            display: "block",
            fontSize: "16px",
            fontWeight: 700,
            marginTop: "28px",
            marginBottom: "8px",
          }}
        >
          Profile Photo
        </label>

        <label
          style={{
            width: "100%",
            minHeight: "150px",
            boxSizing: "border-box",
            border:
              "2px dashed #d8b4fe",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#7c3aed",
            background: "#faf5ff",
          }}
        >
          <ImageIcon size={38} />

          <div
            style={{
              marginTop: "8px",
              fontSize: "16px",
              fontWeight: 700,
            }}
          >
            Tap to change photo
          </div>

          <div
            style={{
              marginTop: "5px",
              fontSize: "13px",
              color: "#6b7280",
            }}
          >
            JPG, PNG or WebP
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            style={{
              display: "none",
            }}
          />
        </label>
      </div>
    </div>
  );
}