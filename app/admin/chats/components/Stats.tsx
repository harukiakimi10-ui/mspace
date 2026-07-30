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
  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        margin: "25px 0",
        flexWrap: "nowrap",
justifyContent: "space-between",
      }}
    >
      <div
        style={{
          background: "#e8f5e9",
          padding: "20px",
          borderRadius: "12px",
          minWidth: "180px",
        }}
      >
        <h3>🟢 Online</h3>
        <h2>{onlineCount}</h2>
      </div>

      <div
        style={{
          background: "#e3f2fd",
          padding: "20px",
          borderRadius: "12px",
          minWidth: "180px",
        }}
      >
        <h3>👥 Members</h3>
        <h2>{totalMembers}</h2>
      </div>

      <div
        style={{
          background: "#ffebee",
          padding: "20px",
          borderRadius: "12px",
          minWidth: "180px",
        }}
      >
        <h3>🔴 Unread</h3>
        <h2>{unreadCount}</h2>
      </div>
    </div>
  );
}