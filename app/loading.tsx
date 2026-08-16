export default function Loading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#6d28d9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src="/mspace-icon.png"
        alt="MSpace"
        style={{
          width: "120px",
          height: "120px",
          objectFit: "contain",
        }}
      />
    </div>
  );
}