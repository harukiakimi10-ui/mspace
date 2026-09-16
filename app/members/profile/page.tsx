"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Pencil } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function MemberProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [memberName, setMemberName] = useState("");
const [memberPhoto, setMemberPhoto] = useState("");
const [isMounted, setIsMounted] = useState(false);

const [loading, setLoading] = useState(true);


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
  {memberName || "Profile"}
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
  <div
    style={{
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      background: "#fff",
      padding: "0px",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      color: "#7c3aed",
      fontSize: "48px",
      fontWeight: 700,
    }}
  >
  {memberPhoto ? (
    <img
  src={
    memberPhoto ||
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Crect width='96' height='96' fill='%23ede9fe'/%3E%3C/svg%3E"
  }
  alt={memberName || "Member"}
  style={{
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  }}
/>
  ) : (
    memberName
      ? memberName.charAt(0).toUpperCase()
      : "M"
  )}
</div>
</div>

          {/* NAME */}
          <div
            style={{
              marginTop: "18px",
              fontSize: "24px",
              fontWeight: 700,
            }}
          >
            {memberName || "Member"}
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
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}