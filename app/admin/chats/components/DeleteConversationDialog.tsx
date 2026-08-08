"use client";

import { Trash2 } from "lucide-react";

type Props = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteConversationDialog({
  open,
  onCancel,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 310,
          maxWidth: "90%",
          background: "#fff",
          borderRadius: 16,
          padding: 18,
          boxShadow: "0 20px 50px rgba(0,0,0,.25)",
          animation: "fadeIn .2s ease",
        }}
      >
        <div
  style={{
    display: "flex",
    justifyContent: "center",
    marginBottom: 12,
  }}
>
  <Trash2
    size={30}
    color="#dc3545"
    strokeWidth={2.2}
  />
</div>

        <h2
          style={{
            textAlign: "center",
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          Delete Chat
        </h2>

        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginTop: 16,
            lineHeight: 1.6,
          }}
        >
          Are you sure you want to delete this conversation?
          <br />
          <br />
          All messages will be permanently deleted.
        </p>

        <div
  style={{
    display: "flex",
    gap: 12,
    marginTop: 20,
  }}
>
  <button
    onClick={onCancel}
    style={{
      flex: 1,
      height: 42,
      borderRadius: 12,
      border: "1px solid #ddd",
      background: "#f5f5f5",
      color: "#222",
      fontWeight: 600,
      fontSize: 15,
      cursor: "pointer",
    }}
  >
    Cancel
  </button>

  <button
    onClick={onConfirm}
    style={{
      flex: 1,
      height: 42,
      borderRadius: 12,
      border: "none",
      background: "#c62828",
      color: "#fff",
      fontWeight: 600,
      fontSize: 15,
      cursor: "pointer",
    }}
  >
    Delete
  </button>
</div>
      </div>
    </div>
  );
}