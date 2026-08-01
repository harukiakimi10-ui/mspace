"use client";

import {
  Activity,
  Users,
  BellDot,
} from "lucide-react";

type StatsProps = {
  onlineCount: number;
  totalMembers: number;
  unreadCount: number;
};

export default function Stats({
  onlineCount,
  totalMembers,
  unreadCount,
}: StatsProps) {
  const cardStyle = {
    flex: 1,

    borderRadius: "18px",

    padding: "12px",

    minHeight: "78px",

    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "space-between",

    boxSizing: "border-box" as const,

    boxShadow: "0 14px 30px rgba(124,58,237,.10)",

    border: "1px solid rgba(255,255,255,.7)",
  };

  const titleRow = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const labelStyle = {
    fontSize: "14px",
    fontWeight: 700,
    color: "#444",
  };

  const numberStyle = {
  textAlign: "center" as const,
  fontSize: "24px",
  fontWeight: 700,
  margin: "8px 0 0",
  lineHeight: 1,
  color: "#222",
};

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        marginTop: "4px",
        marginBottom: "10px",
        width: "100%",
      }}
    >
      {/* ONLINE */}

      <div
        style={{
          ...cardStyle,
          background:
            "linear-gradient(135deg,#f0fdf4,#dcfce7)",
        }}
      >
        <div style={titleRow}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#dcfce7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Activity
              size={16}
              color="#16a34a"
              strokeWidth={2.3}
            />
          </div>

          <span style={labelStyle}>
            Online
          </span>
        </div>

        <div
          style={{
            ...numberStyle,
            color: "#16a34a",
          }}
        >
          {onlineCount}
        </div>
      </div>

      {/* MEMBERS */}

      <div
        style={{
          ...cardStyle,
          background:
            "linear-gradient(135deg,#eff6ff,#dbeafe)",
        }}
      >
        <div style={titleRow}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#dbeafe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Users
              size={16}
              color="#2563eb"
              strokeWidth={2.3}
            />
          </div>

          <span style={labelStyle}>
            Members
          </span>
        </div>

        <div
          style={{
            ...numberStyle,
            color: "#2563eb",
          }}
        >
          {totalMembers}
        </div>
      </div>

      {/* UNREAD */}

      <div
        style={{
          ...cardStyle,
          background:
            "linear-gradient(135deg,#fef2f2,#fee2e2)",
        }}
      >
        <div style={titleRow}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BellDot
              size={16}
              color="#dc2626"
              strokeWidth={2.3}
            />
          </div>

          <span style={labelStyle}>
            Unread
          </span>
        </div>

        <div
          style={{
            ...numberStyle,
            color: "#dc2626",
          }}
        >
          {unreadCount}
        </div>
      </div>
    </div>
  );
}