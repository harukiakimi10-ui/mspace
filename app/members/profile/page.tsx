"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Pencil } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import ProfileAvatar from "@/app/chat/ProfileAvatar";

export default function MemberProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [memberName, setMemberName] = useState("");
const [memberPhoto, setMemberPhoto] = useState("");
const [isMounted, setIsMounted] = useState(false);

const [loading, setLoading] = useState(true);

const [language, setLanguage] =
  useState<"en" | "zh">("en");

useEffect(() => {
  setLanguage(
    navigator.language.startsWith("zh")
      ? "zh"
      : "en"
  );
}, []);

const t = {
  en: {
    profile: "Profile",
    member: "Member",
    editProfile: "Edit Profile",
  },

  zh: {
    profile: "个人资料",
    member: "成员",
    editProfile: "编辑个人资料",
  },
}[language];


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

    setMemberName(cachedName);
    setMemberPhoto(cachedPhoto);
    setIsMounted(true);

    const memberId =
      localStorage.getItem("mspace_member_id");

    if (!memberId) {
      router.push("/");
      return;
    }

    const { data, error } = await supabase
      .from("members")
      .select("name, photo_url")
      .eq("member_id", memberId)
      .single();

    if (error) {
      console.log(
        "Could not load member profile:",
        error
      );
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

    setLoading(false);
  }

  loadMember();
}, [router]);

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
          padding: "0 14px",
          borderBottom: "1px solid #eee",
          boxShadow: "0 1px 5px rgba(0,0,0,0.06)",
        }}
      >
        <button
  type="button"
  onClick={() => router.push("/members")}
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
    marginLeft: "8px",
    fontSize: "18px",
    fontWeight: 700,
  }}
>
  {memberName || t.profile}
</div>
      </div>

      {/* PROFILE */}
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "35px 20px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* AVATAR */}
          <ProfileAvatar
  name={memberName || "Member"}
  photoUrl={memberPhoto}
  size={120}
/>

          {/* NAME */}
          <div
            style={{
              marginTop: "18px",
              fontSize: "24px",
              fontWeight: 700,
            }}
          >
            {memberName || t.member}
          </div>

          {/* EDIT BUTTON */}
          <button
            type="button"
            onClick={() => router.push("/members/profile/edit")}
            style={{
              marginTop: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "12px 24px",
              border: "none",
              borderRadius: "12px",
              background:
                "linear-gradient(90deg,#7c3aed,#9333ea)",
              color: "#fff",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow:
                "0 5px 15px rgba(124,58,237,0.25)",
            }}
          >
            <Pencil size={18} />
{t.editProfile}
          </button>
        </div>
      </div>
    </div>
  );
}