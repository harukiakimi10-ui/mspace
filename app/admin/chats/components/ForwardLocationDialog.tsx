"use client";

import { useEffect, useState } from "react";
import { X, MapPin, Search, Send } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

type Recipient = {
  conversationId: string;
  memberId: string;
  name: string;
  photoUrl?: string | null;
};

type ForwardLocationDialogProps = {
  open: boolean;
  onClose: () => void;
  onForward: (conversationIds: string[]) => Promise<void>;
};

export default function ForwardLocationDialog({
  open,
  onClose,
  onForward,
}: ForwardLocationDialogProps) {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;

    setSelectedIds([]);
    setSearch("");

    const loadRecipients = async () => {
  setLoading(true);

  try {
    // --------------------------------------------------
    // 1. LOAD EXISTING ADMIN CACHE IMMEDIATELY
    // --------------------------------------------------

    try {
      const cached = localStorage.getItem(
        "mspace-admin-conversations"
      );

      if (cached) {
        const conversations = JSON.parse(cached);

        const cachedRecipients: Recipient[] = conversations
  .filter(
    (conversation: any) =>
      conversation?.id &&
      conversation?.member?.member_id
  )
  .sort(
    (a: any, b: any) =>
      new Date(b.updated_at || 0).getTime() -
      new Date(a.updated_at || 0).getTime()
  )
  .map((conversation: any) => ({
    conversationId: conversation.id,
    memberId: conversation.member.member_id,
    name:
      conversation.member.name ||
      "Member",
    photoUrl:
      conversation.member.photo_url ?? null,
  }));

        if (cachedRecipients.length > 0) {
          setRecipients(cachedRecipients);
          setLoading(false);
        }
      }
    } catch (cacheError) {
      console.error(
        "Forward recipient cache error:",
        cacheError
      );
    }

    // --------------------------------------------------
    // 2. REFRESH FROM SUPABASE IN BACKGROUND
    // --------------------------------------------------

    const { data: conversations, error } = await supabase
  .from("conversations")
  .select("id, member_id, updated_at")
  .order("updated_at", {
    ascending: false,
  });

    if (error) throw error;

    const memberIds = [
      ...new Set(
        (conversations ?? [])
          .map(
            (conversation) =>
              conversation.member_id
          )
          .filter(Boolean)
      ),
    ];

    if (memberIds.length === 0) {
      setRecipients([]);
      return;
    }

    const { data: members, error: membersError } =
      await supabase
        .from("members")
        .select(
          "member_id, name, photo_url"
        )
        .in("member_id", memberIds);

    if (membersError) throw membersError;

    const memberMap = new Map(
      (members ?? []).map((member) => [
        member.member_id,
        member,
      ])
    );

    const freshRecipients: Recipient[] = [];

    for (const conversation of conversations ?? []) {
      const member = memberMap.get(
        conversation.member_id
      );

      if (!member) continue;

      freshRecipients.push({
        conversationId: conversation.id,
        memberId: member.member_id,
        name: member.name || "Member",
        photoUrl:
          member.photo_url ?? null,
      });
    }

    setRecipients(freshRecipients);
  } catch (error) {
    console.error(
      "Forward recipient loading error:",
      error
    );
  } finally {
    setLoading(false);
  }
};

    void loadRecipients();
  }, [open]);

  if (!open) return null;

  const filteredRecipients = recipients.filter((recipient) =>
    recipient.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const toggleRecipient = (conversationId: string) => {
    setSelectedIds((current) =>
      current.includes(conversationId)
        ? current.filter((id) => id !== conversationId)
        : [...current, conversationId]
    );
  };

  const handleForward = async () => {
  console.log("FORWARD DIALOG BUTTON CLICKED");
  console.log("FORWARD DIALOG SELECTED IDS:", selectedIds);

  if (selectedIds.length === 0 || sending) return;

  setSending(true);

    try {
      await onForward(selectedIds);
      onClose();
    } catch (error) {
      console.error(
        "Forward location error:",
        error
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9000,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          maxHeight: "80vh",
          background: "#ffffff",
          borderRadius: 22,
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 18px 14px",
            borderBottom: "1px solid #eee",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <MapPin
              size={21}
              color="#6d28d9"
            />

            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#222",
              }}
            >
              Forward Location
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              border: "none",
              background: "transparent",
              padding: 6,
              cursor: "pointer",
            }}
          >
            <X size={21} color="#555" />
          </button>
        </div>

        {/* SEARCH */}
        <div
          style={{
            padding: 14,
            borderBottom: "1px solid #eee",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#f7f7f8",
              borderRadius: 12,
              padding: "9px 12px",
            }}
          >
            <Search size={17} color="#777" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search members..."
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 15,
              }}
            />
          </div>
        </div>

        {/* RECIPIENTS */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 8,
          }}
        >
          {loading ? (
            <div
              style={{
                padding: 30,
                textAlign: "center",
                color: "#777",
              }}
            >
              Loading members...
            </div>
          ) : filteredRecipients.length === 0 ? (
            <div
              style={{
                padding: 30,
                textAlign: "center",
                color: "#777",
              }}
            >
              No members found.
            </div>
          ) : (
            filteredRecipients.map((recipient) => {
              const selected =
                selectedIds.includes(
                  recipient.conversationId
                );

              return (
                <button
                  key={recipient.conversationId}
                  type="button"
                  onClick={() =>
                    toggleRecipient(
                      recipient.conversationId
                    )
                  }
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "11px 10px",
                    border: "none",
                    background: selected
                      ? "#f3e8ff"
                      : "transparent",
                    borderRadius: 14,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      overflow: "hidden",
                      background: "#eee",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {recipient.photoUrl ? (
                      <img
                        src={recipient.photoUrl}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          fontSize: 17,
                          fontWeight: 700,
                          color: "#777",
                        }}
                      >
                        {recipient.name
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>

                  <span
                    style={{
                      flex: 1,
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#222",
                    }}
                  >
                    {recipient.name}
                  </span>

                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      border: selected
                        ? "2px solid #6d28d9"
                        : "2px solid #ccc",
                      background: selected
                        ? "#6d28d9"
                        : "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {selected ? "✓" : ""}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* SEND */}
        <div
          style={{
            padding: 14,
            borderTop: "1px solid #eee",
          }}
        >
          <button
            type="button"
            onClick={handleForward}
            disabled={
              selectedIds.length === 0 || sending
            }
            style={{
              width: "100%",
              height: 48,
              border: "none",
              borderRadius: 14,
              background:
                selectedIds.length === 0 || sending
                  ? "#d8d8d8"
                  : "#6d28d9",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontSize: 15,
              fontWeight: 700,
              cursor:
                selectedIds.length === 0 || sending
                  ? "default"
                  : "pointer",
            }}
          >
            <Send size={17} />

            {sending
              ? "Sending..."
              : selectedIds.length > 0
              ? `Forward to ${selectedIds.length}`
              : "Select members"}
          </button>
        </div>
      </div>
    </div>
  );
}