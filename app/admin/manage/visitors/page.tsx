"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  MessageCircleMore,
  LogOut,
  ArrowLeft,
  Eye,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import ProfileAvatar from "@/app/chat/ProfileAvatar";

export default function RecentVisitorsPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdminAndLoad() {
      const supabase = createClient();

      const storedAdmin = localStorage.getItem("mspace_admin");

      if (storedAdmin !== "true") {
        window.location.href = "/admin/login";
        return;
      }

      setIsAdmin(true);

      const { data, error } = await supabase
        .from("page_visits")
        .select("*")
        .order("visited_at", {
          ascending: false,
        })
        .limit(1000);

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      /*
       * Keep only the newest visit for each member.
       */
      const uniqueVisitors: any[] = [];
      const seenMembers = new Set<string>();

      for (const visit of data || []) {
        const memberKey = visit.member_id;

        if (!memberKey || seenMembers.has(memberKey)) {
          continue;
        }

        seenMembers.add(memberKey);
        uniqueVisitors.push(visit);

        if (uniqueVisitors.length === 20) {
          break;
        }
      }

      /*
       * Load the actual member information for the
       * 20 unique visitors.
       */
      const memberIds = uniqueVisitors
        .map((visit) => visit.member_id)
        .filter(Boolean);

      let members: any[] = [];

      if (memberIds.length > 0) {
        const { data: memberData } = await supabase
          .from("members")
          .select("*")
          .in("member_id", memberIds);

        members = memberData || [];
      }

      const mergedVisitors = uniqueVisitors.map((visit) => {
        const member = members.find(
          (item) => item.member_id === visit.member_id
        );

        return {
          ...visit,
          member,
        };
      });

      setVisitors(mergedVisitors);
      setLoading(false);
    }

    checkAdminAndLoad();
  }, []);

  function getVisitTime(visitedAt: string) {
    const date = new Date(visitedAt);
    const now = new Date();

    const sameDay =
      date.toDateString() === now.toDateString();

    if (sameDay) {
      return `Today, ${date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })}`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })}`;
    }

    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  if (!isAdmin || loading) {
    return null;
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
      window.location.href = "/admin/manage";
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

        {/* Recent Visitors heading */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "14px",
            marginBottom: "24px",
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
                width: "64px",
                height: "64px",
                borderRadius: "20px",
                background: "#f1e8ff",
                color: "#6d28d9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Eye size={32} />
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: "30px",
                  fontWeight: 800,
                  color: "#172554",
                }}
              >
                Recent Visitors
              </div>

              <div
                style={{
                  fontSize: "16px",
                  color: "#64748b",
                  marginTop: "4px",
                }}
              >
                Latest 20 unique visitors
              </div>
            </div>
          </div>

          <div
            style={{
              background: "#f1e8ff",
              color: "#6d28d9",
              padding: "11px 17px",
              borderRadius: "22px",
              fontSize: "18px",
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {visitors.length}
          </div>
        </div>

        {/* Visitor Cards */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {visitors.map((visitor) => {
            const member = visitor.member;

            if (!member) return null;

            return (
              <div
                key={visitor.member_id}
                onClick={() => {
                  window.location.href = `/admin/manage/members/${member.member_id}`;
                }}
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  padding: "16px",
                  border: "1px solid #f0f0f0",
                  boxShadow:
                    "0 6px 24px rgba(30,41,59,0.06)",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <ProfileAvatar
                  name={member.name || "Member"}
                  photoUrl={member.photo_url}
                  size={64}
                />

                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
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
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      marginTop: "7px",
                      color: "#64748b",
                      fontSize: "14px",
                    }}
                  >
                    <Clock size={19} />
                    <span>
                      {getVisitTime(visitor.visited_at)}
                    </span>
                  </div>
                </div>

                <ChevronRight
                  size={28}
                  color="#64748b"
                  style={{
                    flexShrink: 0,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}