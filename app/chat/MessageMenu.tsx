import {
  Reply,
  Copy,
  Download,
  Trash2,
  Trash,
} from "lucide-react";


type MessageMenuProps = {
  open: boolean;
  x: number;
  y: number;
  selectedMessage: any;
  currentUser: "member" | "admin";
  onClose: () => void;
  onReply: () => void;
  onCopy: () => void;
  onSave: () => void;
  onDeleteForMe: () => void;
  onDeleteForEveryone: () => void;
};

export default function MessageMenu({
  open,
  x,
  y,
  selectedMessage,
  currentUser,
  onClose,
  onReply,
  onCopy,
  onSave,
  onDeleteForMe,
  onDeleteForEveryone,
}: MessageMenuProps) {

  if (!open || !selectedMessage) return null;

  const menuWidth = 190;
const menuHeight =
  selectedMessage?.sender === currentUser
    ? 232
    : 176;

const padding = 12;

const safeX = Math.min(
  Math.max(x, padding),
  window.innerWidth - menuWidth - padding
);

const safeY = Math.min(
  Math.max(y, padding),
  window.innerHeight - menuHeight - padding
);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.15)",
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
  position: "absolute",
  top: safeY,
  left: safeX,

  width: 190,

  background:
    "linear-gradient(180deg,#ffffff,#faf5ff)",

  border: "1px solid #ede9fe",

  borderRadius: "18px",

  boxShadow:
    "0 18px 45px rgba(124,58,237,.18)",

  backdropFilter: "blur(16px)",

  padding: "8px",

  overflow: "hidden",
}}
      >
        <div
  onClick={onReply}
  onMouseEnter={(e)=>{
    e.currentTarget.style.background="#f5f3ff";
  }}
  onMouseLeave={(e)=>{
    e.currentTarget.style.background="transparent";
  }}
  style={{
    display:"flex",
    alignItems:"center",
    gap:"12px",

    padding:"13px 14px",

    borderRadius:"12px",

    cursor:"pointer",

    transition:"0.2s",

    fontWeight:400,
    fontSize: "14px",
  }}
>
  <div
  style={{
    width: 30,
    height: 30,
    borderRadius: "50%",

    background: "#f5f3ff",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    flexShrink: 0,
  }}
>
  <Reply size={15} color="#7c3aed" />
</div>
  Reply
</div>

        <div
  onClick={onCopy}
  onMouseEnter={(e)=>{
    e.currentTarget.style.background="#f5f3ff";
  }}
  onMouseLeave={(e)=>{
    e.currentTarget.style.background="transparent";
  }}
  style={{
    display:"flex",
    alignItems:"center",
    gap:"12px",

    padding:"13px 14px",

    borderRadius:"12px",

    cursor:"pointer",

    transition:"0.2s",

    fontWeight:400,
    fontSize: "14px",
  }}
>
  <div
  style={{
    width: 30,
    height: 30,
    borderRadius: "50%",
    background: "#f8f8f8",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    flexShrink: 0,
  }}
>
  <Copy size={15} color="#555" />
</div>
  Copy
</div>

<div
  onClick={onSave}
  style={{
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "12px 18px",
    cursor: "pointer",
  }}
>
  <Download
    size={18}
    strokeWidth={2}
  />

  <span>Save</span>
</div>

        <div
  onClick={onDeleteForMe}
  onMouseEnter={(e)=>{
    e.currentTarget.style.background="#f5f3ff";
  }}
  onMouseLeave={(e)=>{
    e.currentTarget.style.background="transparent";
  }}
  style={{
    display:"flex",
    alignItems:"center",
    gap:"12px",

    padding:"13px 14px",

    borderRadius:"12px",

    cursor:"pointer",

    transition:"0.2s",

    fontWeight:400,
    fontSize: "14px",
  }}
>
  <div
  style={{
    width: 30,
    height: 30,
    borderRadius: "50%",
    background: "#f8f8f8",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    flexShrink: 0,
  }}
>
  <Trash2 size={15} color="#666" />
</div>
  Delete for me
</div>

       {selectedMessage?.sender === currentUser && (
  <div
    onClick={onDeleteForEveryone}
    onMouseEnter={(e)=>{
      e.currentTarget.style.background="#fef2f2";
    }}
    onMouseLeave={(e)=>{
      e.currentTarget.style.background="transparent";
    }}
    style={{
      display:"flex",
      alignItems:"center",
      gap:"12px",

      padding:"13px 14px",

      borderRadius:"12px",

      cursor:"pointer",

      transition:"0.2s",

      color:"#ef4444",

      fontWeight:500,
      fontSize: "14px",
    }}
  >
    <div
  style={{
    width: 30,
    height: 30,
    borderRadius: "50%",

    background: "#fef2f2",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    flexShrink: 0,
  }}
>
  <Trash size={15} color="#ef4444" />
</div>
    Delete for everyone
  </div>
)}
      </div>
    </div>
  );
}