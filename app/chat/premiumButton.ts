export const premiumButton = {
  width: 42,
  height: 42,

  borderRadius: "50%",

  border: "1px solid rgba(255,255,255,.18)",

  background:
    "linear-gradient(135deg,#8b5cf6 0%,#6d28d9 55%,#5b21b6 100%)",

  color: "#fff",

  display: "flex",
  justifyContent: "center",
  alignItems: "center",

  cursor: "pointer",

  boxShadow:
    "0 10px 30px rgba(109,40,217,.35), inset 0 1px 1px rgba(255,255,255,.25)",

  transition:
    "transform .18s ease, box-shadow .18s ease, filter .18s ease",

  backdropFilter: "blur(12px)",

  WebkitBackdropFilter: "blur(12px)",

  userSelect: "none" as const,
};