"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  MessageCircleMore,
  LogOut,
  ArrowLeft,
  Clock,
  Ban,
  Smartphone,
  Trash2,
  ChevronLeft,
  UserRound,
} from "lucide-react";
import ProfileAvatar from "@/app/chat/ProfileAvatar";

export default function MemberDetailsPage() {
  const params = useParams();
  const memberId = params.member_id as string;

  const [isAdmin, setIsAdmin] = useState(false);
  const [member, setMember] = useState<any>(null);
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  function getLastSeenText(lastSeen: string | null) {
  if (!lastSeen) return "Never";

  const now = new Date();
  const date = new Date(lastSeen);

  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Just now";

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  return date.toLocaleDateString();
}

  useEffect(() => {
    async function checkAdminAndLoad() {
      const supabase = createClient();

      const storedAdmin = localStorage.getItem("mspace_admin");

      if (storedAdmin !== "true") {
        window.location.href = "/admin/login";
        return;
      }

      setIsAdmin(true);

      const { data: memberData, error: memberError } =
        await supabase
          .from("members")
          .select("*")
          .eq("member_id", memberId)
          .single();

      if (memberError || !memberData) {
        setLoading(false);
        return;
      }

      setMember(memberData);

      const { data: visitData } = await supabase
        .from("page_visits")
        .select("*")
        .eq("member_id", memberData.member_id)
        .order("visited_at", {
          ascending: false,
        });

      setVisits(visitData || []);
      setLoading(false);
    }

    if (memberId) {
      checkAdminAndLoad();
    }
  }, [memberId]);

  if (!isAdmin || loading) {
    return null;
  }

  if (!member) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f8f7ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#64748b",
          fontSize: "16px",
        }}
      >
        Member not found
      </div>
    );
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
          boxShadow: "0 4px 18px rgba(0,0,0,0.05)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >

        {/* Back */}

        <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: 0,
  }}
>
  <button
    onClick={() => {
  window.location.href = "/admin/manage/visitors";
}}
    style={{
      width: "42px",
      height: "42px",
      cursor: "pointer",
      borderRadius: "50%",
      background: "rgba(255,255,255,0.55)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      border: "1px solid rgba(255,255,255,0.65)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#64748b",
      boxShadow:
        "0 8px 24px rgba(0,0,0,0.10)",
      flexShrink: 0,
      padding: 0,
    }}
  >
    <ChevronLeft size={30} strokeWidth={2.2} />
  </button>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: "25px",
                fontWeight: 800,
                color: "#6d28d9",
                lineHeight: 1.1,
              }}
            >
              MSpace
            </div>

            <div
              style={{
                fontSize: "14px",
                color: "#64748b",
                marginTop: "4px",
              }}
            >
              Manage
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => {
              window.location.href = "/admin/chats";
            }}
            style={{
              height: "48px",
              padding: "0 16px",
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
              background: "#ffffff",
              color: "#1f2937",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <MessageCircleMore size={22} />
            Chats
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("mspace_admin");
              window.location.href = "/admin/login";
            }}
            style={{
              height: "48px",
              padding: "0 16px",
              borderRadius: "16px",
              border: "none",
              background: "#dc2626",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <LogOut size={22} />
            Logout
          </button>
        </div>
      </div>

      {/* Page content */}
      <div
        style={{
          padding: "28px 20px 40px",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >

        {/* Member profile card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "24px",
            padding: "22px",
            border: "1px solid #f0f0f0",
            boxShadow: "0 8px 30px rgba(30,41,59,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
            }}
          >
            <ProfileAvatar
              name={member.name || "Member"}
              photoUrl={member.photo_url}
              size={92}
            />

            <div
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  color: "#172554",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {member.name || "Member"}
              </div>

              <div
                style={{
                  fontSize: "15px",
                  color: "#64748b",
                  marginTop: "7px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                ID: {member.member_id}
              </div>

              <div
                style={{
                  fontSize: "15px",
                  color: "#475569",
                  marginTop: "5px",
                }}
              >
                Device:{" "}
                {member.device_id
                  ? member.device_id.slice(0, 8)
                  : "None"}
              </div>
            </div>

            <div
              style={{
                background: member.banned
                  ? "#fee2e2"
                  : "#dcfce7",
                color: member.banned
                  ? "#dc2626"
                  : "#16a34a",
                padding: "9px 14px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              ● {member.banned ? "Banned" : "Active"}
            </div>
          </div>

          {/* Last seen */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "18px",
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            <Clock size={19} />
            <span>
              Last seen: {getLastSeenText(member.last_seen)}
            </span>
          </div>

          {/* Actions */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.25fr 1fr",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            <button
              onClick={async () => {
                const supabase = createClient();

                const { error } = await supabase
                  .from("members")
                  .update({
                    banned: !member.banned,
                  })
                  .eq("id", member.id);

                if (error) {
                  alert(error.message);
                  return;
                }

                setMember({
                  ...member,
                  banned: !member.banned,
                });
              }}
              style={{
                padding: "12px 8px",
                border: "none",
                borderRadius: "13px",
                background: member.banned
                  ? "#dcfce7"
                  : "#fef3c7",
                color: member.banned
                  ? "#16a34a"
                  : "#92400e",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <Ban size={18} />
              {member.banned ? "Unban" : "Ban"}
            </button>

            <button
              onClick={async () => {
                if (!member.device_id) {
                  alert("No device ID found");
                  return;
                }

                const supabase = createClient();

                if (member.device_banned) {
                  const { error } = await supabase
                    .from("banned_devices")
                    .delete()
                    .eq("device_id", member.device_id);

                  if (error) {
                    alert(error.message);
                    return;
                  }

                  setMember({
                    ...member,
                    device_banned: false,
                  });

                  return;
                }

                const { error } = await supabase
                  .from("banned_devices")
                  .insert({
                    device_id: member.device_id,
                  });

                if (error) {
                  alert(error.message);
                  return;
                }

                setMember({
                  ...member,
                  device_banned: true,
                });
              }}
              style={{
                padding: "12px 8px",
                border: "none",
                borderRadius: "13px",
                background: member.device_banned
                  ? "#dcfce7"
                  : "#ffedd5",
                color: member.device_banned
                  ? "#16a34a"
                  : "#dc2626",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <Smartphone size={18} />
              {member.device_banned
                ? "Unban Device"
                : "Ban Device"}
            </button>

            <button
              onClick={async () => {
                const confirmed = confirm(
                  "Delete this member?"
                );

                if (!confirmed) return;

                const supabase = createClient();

                const { error } = await supabase
                  .from("members")
                  .delete()
                  .eq("id", member.id);

                if (error) {
                  alert(error.message);
                  return;
                }

                window.location.href =
                  "/admin/manage/members";
              }}
              style={{
                padding: "12px 8px",
                border: "none",
                borderRadius: "13px",
                background: "#fce7f3",
                color: "#e11d48",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>

        {/* Visit History */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "24px",
            padding: "22px",
            marginTop: "20px",
            border: "1px solid #f0f0f0",
            boxShadow: "0 8px 30px rgba(30,41,59,0.06)",
          }}
        >
          {/* Visit History Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              marginBottom: "18px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "18px",
                  background: "#f1e8ff",
                  color: "#6d28d9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Clock size={29} />
              </div>

              <div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 800,
                    color: "#172554",
                  }}
                >
                  Visit History
                </div>

                <div
                  style={{
                    fontSize: "14px",
                    color: "#64748b",
                    marginTop: "3px",
                  }}
                >
                  All visits from this member
                </div>
              </div>
            </div>

            <div
              style={{
                background: "#f1e8ff",
                color: "#6d28d9",
                padding: "9px 15px",
                borderRadius: "20px",
                fontSize: "16px",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {visits.length}
            </div>
          </div>

          {/* Visits */}
          {visits.length === 0 ? (
            <div
              style={{
                padding: "24px 10px",
                textAlign: "center",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              No visits recorded yet.
            </div>
          ) : (
            <div>
              {visits.slice(0, 5).map((visit, index) => (
                <div
                  key={visit.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px 0",
                    borderBottom:
                      index === Math.min(visits.length, 5) - 1
                        ? "none"
                        : "1px solid #eef0f4",
                  }}
                >
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "12px",
                      background: "#f8f7ff",
                      color: "#64748b",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Clock size={19} />
                  </div>

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#1e293b",
                        fontWeight: 600,
                      }}
                    >
                      {new Date(
                        visit.visited_at
                      ).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>

                    <div
                      style={{
                        fontSize: "13px",
                        color: "#64748b",
                        marginTop: "3px",
                      }}
                    >
                      {new Date(
                        visit.visited_at
                      ).toLocaleTimeString(undefined, {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: "13px",
                      color: "#64748b",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {getLastSeenText(visit.visited_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
  }