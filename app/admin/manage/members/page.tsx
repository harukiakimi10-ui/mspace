"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import {
  MessageCircleMore,
  LogOut,
  Users,
  Search,
  Ban,
  Smartphone,
  Trash2,
  Clock,
  ArrowLeft,
} from "lucide-react";
import ProfileAvatar from "@/app/chat/ProfileAvatar";

export default function MembersPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const admin =
      localStorage.getItem("mspace_admin") === "true";

    if (!admin) {
      window.location.replace("/admin/login");
      return;
    }

    setIsAdmin(true);
    loadMembers();

    const interval = setInterval(() => {
      loadMembers();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

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

    if (membersData) {
      const updatedMembers = membersData.map(
        (member) => {
          const lastVisit = visitsData?.find(
            (v) =>
              v.member_id === member.member_id
          );

          return {
            ...member,
            last_seen:
              lastVisit?.visited_at || null,
            device_banned:
              bannedDevices?.some(
                (d) =>
                  d.device_id ===
                  member.device_id
              ) || false,
          };
        }
      );

      setMembers(updatedMembers);
    }
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

    const confirmed = confirm(
      "Delete this member?"
    );

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

  function getLastSeenText(
    lastSeen: string | null
  ) {
    if (!lastSeen) return "Never";

    const diffMinutes = Math.floor(
      (Date.now() -
        new Date(lastSeen).getTime()) /
        60000
    );

    if (diffMinutes < 5) {
      return "Online";
    }

    if (diffMinutes < 60) {
      return `${diffMinutes} min ago`;
    }

    const diffHours = Math.floor(
      diffMinutes / 60
    );

    if (diffHours < 24) {
      return `${diffHours} hr ago`;
    }

    const diffDays = Math.floor(
      diffHours / 24
    );

    return `${diffDays} day${
      diffDays > 1 ? "s" : ""
    } ago`;
  }

  const filteredMembers =
    members.filter((member) => {
      const term =
        search.trim().toLowerCase();

      if (!term) return true;

      return (
        (member.name || "")
          .toLowerCase()
          .includes(term) ||
        (member.member_id || "")
          .toLowerCase()
          .includes(term) ||
        (member.device_id || "")
          .toLowerCase()
          .includes(term)
      );
    });

  if (!isAdmin) {
    return null;
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
          borderBottom:
            "1px solid #eeeeee",
          boxShadow:
            "0 4px 18px rgba(0,0,0,0.05)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        {/* Branding */}
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
              Members
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
              border:
                "1px solid #e5e5e5",
              padding: "9px 12px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <MessageCircleMore
              size={18}
            />
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
          background: "transparent",
          border: "none",
          color: "#64748b",
          fontSize: "16px",
          fontWeight: 700,
          padding: "4px 0",
          marginBottom: "20px",
          cursor: "pointer",
        }}
      >
        <ArrowLeft size={22} />
        Back to Manage
      </button>

      {/* Members heading */}
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
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "18px",
              background: "#f1e8ff",
              color: "#7c3aed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Users size={32} />
          </div>

          <div>
            <div
              style={{
                fontSize: "32px",
                fontWeight: 800,
                color: "#172554",
              }}
            >
              Members
            </div>

            <div
              style={{
                fontSize: "16px",
                color: "#64748b",
                marginTop: "3px",
              }}
            >
              View and manage your members
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#f1e8ff",
            color: "#6d28d9",
            padding: "9px 16px",
            borderRadius: "22px",
            fontSize: "17px",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {members.length}
        </div>
      </div>

      {/* Search */}
      <div
        style={{
          background: "#ffffff",
          border:
            "1px solid #e5e7eb",
          borderRadius: "16px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "0 14px",
          marginBottom: "18px",
          boxSizing: "border-box",
        }}
      >
        <Search
          size={21}
          color="#64748b"
        />

        <input
          type="text"
          placeholder="Search members..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            padding: "14px 0",
            fontSize: "16px",
            color: "#172554",
            background:
              "transparent",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Member cards */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        {filteredMembers.map(
          (member) => {
            const isOnline =
              member.last_seen &&
              Math.floor(
                (Date.now() -
                  new Date(
                    member.last_seen
                  ).getTime()) /
                  60000
              ) < 5;

            return (
              <div
                key={member.id}
                style={{
                  background:
                    "#ffffff",
                  borderRadius:
                    "20px",
                  padding: "16px",
                  border:
                    "1px solid #f0f0f0",
                  boxShadow:
                    "0 6px 24px rgba(30,41,59,0.06)",
                }}
              >
                {/* Member information */}
                <div
                  style={{
                    display: "flex",
                    alignItems:
                      "center",
                    gap: "12px",
                    minWidth: 0,
                  }}
                >
                  <ProfileAvatar
                    name={
                      member.name ||
                      "Member"
                    }
                    photoUrl={
                      member.photo_url
                    }
                    size={58}
                  />

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "17px",
                        fontWeight: 700,
                        color:
                          "#172554",
                        marginBottom:
                          "4px",
                        overflow:
                          "hidden",
                        textOverflow:
                          "ellipsis",
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {member.name ||
                        "Member"}
                    </div>

                    <div
                      style={{
                        fontSize:
                          "13px",
                        color:
                          "#64748b",
                        marginBottom:
                          "3px",
                        overflow:
                          "hidden",
                        textOverflow:
                          "ellipsis",
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      ID:{" "}
                      {member.member_id}
                    </div>

                    <div
                      style={{
                        fontSize:
                          "13px",
                        color:
                          "#475569",
                        overflow:
                          "hidden",
                        textOverflow:
                          "ellipsis",
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      Device:{" "}
                      {member.device_id
                        ? member.device_id.slice(
                            0,
                            8
                          )
                        : "None"}
                    </div>
                  </div>

                  {/* Status */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection:
                        "column",
                      alignItems:
                        "flex-end",
                      gap: "8px",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        background:
                          member.banned
                            ? "#fee2e2"
                            : "#dcfce7",
                        color:
                          member.banned
                            ? "#dc2626"
                            : "#16a34a",
                        padding:
                          "6px 10px",
                        borderRadius:
                          "18px",
                        fontSize:
                          "12px",
                        fontWeight: 700,
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      <span
                        style={{
                          marginRight:
                            "5px",
                        }}
                      >
                        ●
                      </span>
                      {member.banned
                        ? "Banned"
                        : "Active"}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems:
                          "center",
                        gap: "5px",
                        fontSize:
                          "12px",
                        color:
                          "#64748b",
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      <Clock
                        size={15}
                      />
                      {getLastSeenText(
                        member.last_seen
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1.25fr 1fr",
                    gap: "8px",
                    marginTop:
                      "14px",
                  }}
                >
                  <button
                    onClick={() =>
                      toggleBan(
                        member.id,
                        member.banned
                      )
                    }
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      gap: "5px",
                      padding:
                        "10px 5px",
                      border: "none",
                      borderRadius:
                        "11px",
                      background:
                        member.banned
                          ? "#dcfce7"
                          : "#fef3c7",
                      color:
                        member.banned
                          ? "#16a34a"
                          : "#92400e",
                      fontSize:
                        "13px",
                      fontWeight: 700,
                      cursor:
                        "pointer",
                    }}
                  >
                    <Ban
                      size={16}
                    />
                    {member.banned
                      ? "Unban"
                      : "Ban"}
                  </button>

                  {member.device_banned ? (
                    <button
                      onClick={() =>
                        unbanDevice(
                          member
                        )
                      }
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        gap: "5px",
                        padding:
                          "10px 5px",
                        border: "none",
                        borderRadius:
                          "11px",
                        background:
                          "#dcfce7",
                        color:
                          "#16a34a",
                        fontSize:
                          "13px",
                        fontWeight: 700,
                        cursor:
                          "pointer",
                      }}
                    >
                      <Smartphone
                        size={16}
                      />
                      Unban Device
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        banDevice(
                          member
                        )
                      }
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        gap: "5px",
                        padding:
                          "10px 5px",
                        border: "none",
                        borderRadius:
                          "11px",
                        background:
                          "#ffedd5",
                        color:
                          "#dc2626",
                        fontSize:
                          "13px",
                        fontWeight: 700,
                        cursor:
                          "pointer",
                      }}
                    >
                      <Smartphone
                        size={16}
                      />
                      Ban Device
                    </button>
                  )}

                  <button
                    onClick={() =>
                      deleteMember(
                        member.id
                      )
                    }
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      gap: "5px",
                      padding:
                        "10px 5px",
                      border: "none",
                      borderRadius:
                        "11px",
                      background:
                        "#fce7f3",
                      color:
                        "#e11d48",
                      fontSize:
                        "13px",
                      fontWeight: 700,
                      cursor:
                        "pointer",
                    }}
                  >
                    <Trash2
                      size={16}
                    />
                    Delete
                  </button>
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}