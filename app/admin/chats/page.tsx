"use client";

import Header from "./components/Header";
import Stats from "./components/Stats";
import ConversationList from "./components/ConversationList";
import {
  Search,
  Activity,
  Users,
  BellDot,
} from "lucide-react";
import NotificationButton from "@/app/NotificationButton";
import { createClient } from "@/utils/supabase/client";
import {
  useEffect,
  useState,
  useRef,
} from "react";

export default function AdminChatsPage() {

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkDesktop();

    window.addEventListener("resize", checkDesktop);

    return () => {
      window.removeEventListener("resize", checkDesktop);
    };
  }, []);

  


const [conversations, setConversations] = useState<any[]>(() => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const cached =
      localStorage.getItem(
        "mspace-admin-conversations"
      );

    return cached
      ? JSON.parse(cached)
      : [];
  } catch {
    return [];
  }
});


const [selectedConversation, setSelectedConversation] = useState<any>(null);
const [messages, setMessages] = useState<any[]>([]);
const [reply, setReply] = useState("");
const [onlineCount, setOnlineCount] = useState(0);
const [conversationSearch, setConversationSearch] = useState("");
const conversationRefreshTimeout =
  useRef<ReturnType<typeof setTimeout> | null>(null);

const conversationListRef = useRef<HTMLDivElement>(null);  

const totalMembers = conversations.length;
const filteredConversations = conversations.filter((chat) => {
  const search = conversationSearch.trim().toLowerCase();

  if (!search) return true;

  const name = chat.member?.name?.toLowerCase() || "";
  const memberId = chat.member?.member_id?.toLowerCase() || "";

  return name.includes(search) || memberId.includes(search);
});
const unreadCount = conversations.filter(
  (c) => c.has_unread
).length;

function scheduleConversationRefresh() {
  if (conversationRefreshTimeout.current) {
    clearTimeout(conversationRefreshTimeout.current);
  }

  conversationRefreshTimeout.current =
    setTimeout(() => {
      loadConversations();
      conversationRefreshTimeout.current = null;
    }, 300);
}


async function testPushNotification() {
  try {
    const response = await fetch("/api/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "MSpace Test",
        body: "Push notifications are working! 🔔",
      }),
    });

    const data = await response.json();

    console.log("MSpace push test:", data);

    if (!response.ok) {
      alert(data?.error || "Push notification test failed.");
      return;
    }

    alert("Push notification sent. Check the subscribed admin devices.");
  } catch (error) {
    console.error("MSpace push test error:", error);
    alert("Could not send push notification.");
  }
}

const supabase = createClient();

useEffect(() => {
  if (localStorage.getItem("mspace_admin") !== "true") {
    window.location.replace("/admin/login");
    return;
  }

  loadConversations();

  const channel = supabase
    .channel("admin-conversations")
    .on(
  "postgres_changes",
  {
    event: "*",
    schema: "public",
    table: "messages",
  },
  (payload) => {
    console.log(
      "Admin conversation realtime message:",
      payload.eventType
    );

    scheduleConversationRefresh();

    if (
  selectedConversation &&
  (payload.new as any)?.conversation_id ===
    selectedConversation.id
) {
  loadMessages(selectedConversation.id);
}
  }
)
    .on(
  "postgres_changes",
  {
    event: "UPDATE",
    schema: "public",
    table: "conversations",
  },
  (payload) => {
    console.log(
      "Admin conversation realtime update:",
      payload.eventType
    );

    const updatedConversation = payload.new as any;

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === updatedConversation.id
          ? {
              ...conversation,
              member_typing:
                updatedConversation.member_typing,
            }
          : conversation
      )
    );
  }
)
    .subscribe();

  return () => {
  if (conversationRefreshTimeout.current) {
    clearTimeout(conversationRefreshTimeout.current);
    conversationRefreshTimeout.current = null;
  }

  supabase.removeChannel(channel);
};
}, []);

useEffect(() => {
  const list = conversationListRef.current;

  if (!list) return;

  const saveScrollPosition = () => {
    sessionStorage.setItem(
      "mspace-conversation-list-scroll",
      String(list.scrollTop)
    );
  };

  list.addEventListener(
    "scroll",
    saveScrollPosition,
    { passive: true }
  );

  return () => {
    list.removeEventListener(
      "scroll",
      saveScrollPosition
    );
  };
}, []);

useEffect(() => {
  const selectedId = sessionStorage.getItem(
    "mspace-selected-conversation-id"
  );

  if (!selectedId) return;

  const restoreSelectedConversation = () => {
    const element = document.querySelector(
      `[data-conversation-id="${selectedId}"]`
    ) as HTMLElement | null;

    if (!element) return;

    element.scrollIntoView({
      block: "center",
      behavior: "auto",
    });
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(restoreSelectedConversation);
  });
}, []);

useEffect(() => {
  if (!selectedConversation) return;

  const channel = supabase
    .channel(`admin-chat-${selectedConversation.id}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${selectedConversation.id}`,
      },
      () => {
        console.log("Admin received realtime message");
        loadMessages(selectedConversation.id);
      }
    )
    .subscribe((status) => {
      console.log("Admin realtime:", status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}, [selectedConversation]);

useEffect(() => {
  const html = document.documentElement;
  const body = document.body;

  const previousHtmlOverflow = html.style.overflow;
  const previousBodyOverflow = body.style.overflow;
  const previousHtmlHeight = html.style.height;
  const previousBodyHeight = body.style.height;
  const previousHtmlOverscroll = html.style.overscrollBehavior;
  const previousBodyOverscroll = body.style.overscrollBehavior;

  html.style.overflow = "hidden";
  body.style.overflow = "hidden";

  html.style.height = "100%";
  body.style.height = "100%";

  html.style.overscrollBehavior = "none";
  body.style.overscrollBehavior = "none";

  return () => {
    html.style.overflow = previousHtmlOverflow;
    body.style.overflow = previousBodyOverflow;

    html.style.height = previousHtmlHeight;
    body.style.height = previousBodyHeight;

    html.style.overscrollBehavior = previousHtmlOverscroll;
    body.style.overscrollBehavior = previousBodyOverscroll;
  };
}, []);

async function loadConversations() {
  console.time("loadConversations");
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .order("updated_at", { ascending: false });
  console.log("Conversation count:", data?.length);
console.log(data);

  if (error) {
    console.log(error);
    return;
  }

console.log("Supabase conversations:", data);
console.log("Supabase error:", error);

  const result: any[] = [];

await Promise.all(
  (data || []).map(async (conversation) => {
    const { data: member } = await supabase
  .from("members")
  .select(
  "member_id, name, photo_url, is_online, online_at, last_seen"
)
  .eq("member_id", conversation.member_id)
  .single();

    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("conversation_id", conversation.id)
      .eq("sender", "member")
      .eq("is_read", false);

   const { data: lastMessage } = await supabase
  .from("messages")
  .select(
    "content, message_type, sender, created_at, file_duration, is_deleted, is_read"
  )
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    result.push({
      ...conversation,
      member,
      has_unread: (count || 0) > 0,
      unreadCount: count || 0,
      lastMessage,
    });
  })
);

console.log("Result length:", result.length);
result.sort((a, b) => {
  const aTime = a.lastMessage
    ? new Date(a.lastMessage.created_at).getTime()
    : 0;

  const bTime = b.lastMessage
    ? new Date(b.lastMessage.created_at).getTime()
    : 0;

  return bTime - aTime;
});
setConversations(result);

requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const savedScroll = sessionStorage.getItem(
      "mspace-conversation-list-scroll"
    );

    if (!savedScroll) return;

    const list = conversationListRef.current;

    if (!list) return;

    list.scrollTop = Number(savedScroll);
  });
});

try {
  localStorage.setItem(
    "mspace-admin-conversations",
    JSON.stringify(result)
  );
} catch (error) {
  console.error(
    "MSpace conversation cache save error:",
    error
  );
}

const now = Date.now();

const activeOnlineCount = result.filter((c) => {
  if (!c.member?.is_online) return false;

  if (!c.member?.online_at) return false;

  const onlineAt = new Date(
    c.member.online_at
  ).getTime();

  // Consider online only if the
  // presence heartbeat is recent.
  return now - onlineAt < 2 * 60 * 1000;
}).length;

setOnlineCount(activeOnlineCount);

console.timeEnd("loadConversations");
}


async function loadMessages(conversationId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.log(error);
    return;
  }

  setMessages(data || []);
}

async function sendReply() {
  if (!selectedConversation || !reply.trim()) return;

  const { data, error } = await supabase
    .from("messages")
    .insert({
  conversation_id: selectedConversation.id,
  sender: "admin",
  content: reply,
})
.select()
.single();
console.log("Inserted admin message:", data);

  if (error) {
    console.log(error);
    return;
  }

  setReply("");
  loadMessages(selectedConversation.id);
  loadConversations();
}

  return isDesktop ? (
  /* =========================
     DESKTOP ADMIN CHAT LIST
     ========================= */
  <div
    style={{
      position: "fixed",
      inset: 0,
      width: "100%",
      height: "100dvh",
      minHeight: 0,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      background: "#f7f7fb",
    }}
  >
    <Header />

    <div
      style={{
        position: "relative",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      {/* Desktop stats */}
<div
  style={{
    position: "absolute",
    top: 5,
    left: 25,
    width: 550,
    height: 84,
    boxSizing: "border-box",
    display: "flex",
    gap: 14,
    padding: "8px 0",
    background: "#f7f7fb",
    zIndex: 1100,
  }}
>
  {/* ONLINE */}
  <div
    style={{
      flex: 1,
      borderRadius: 14,
      padding: "10px 16px",
      background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
      border: "1px solid rgba(255,255,255,.8)",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "#dcfce7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Activity
          size={16}
          color="#16a34a"
          strokeWidth={2.3}
        />
      </div>

      <span
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#444",
        }}
      >
        Online
      </span>
    </div>

    <div
      style={{
        textAlign: "center",
        fontSize: 24,
        fontWeight: 700,
        lineHeight: 1,
        color: "#16a34a",
        marginTop: 6,
      }}
    >
      {onlineCount}
    </div>
  </div>

  {/* MEMBERS */}
  <div
    style={{
      flex: 1,
      borderRadius: 14,
      padding: "10px 16px",
      background: "linear-gradient(135deg,#eff6ff,#dbeafe)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
      border: "1px solid rgba(255,255,255,.8)",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "#dbeafe",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Users
          size={16}
          color="#2563eb"
          strokeWidth={2.3}
        />
      </div>

      <span
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#444",
        }}
      >
        Members
      </span>
    </div>

    <div
      style={{
        textAlign: "center",
        fontSize: 24,
        fontWeight: 700,
        lineHeight: 1,
        color: "#2563eb",
        marginTop: 6,
      }}
    >
      {totalMembers}
    </div>
  </div>

  {/* UNREAD */}
  <div
    style={{
      flex: 1,
      borderRadius: 14,
      padding: "10px 16px",
      background: "linear-gradient(135deg,#fef2f2,#fee2e2)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
      border: "1px solid rgba(255,255,255,.8)",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "#fee2e2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <BellDot
          size={16}
          color="#dc2626"
          strokeWidth={2.3}
        />
      </div>

      <span
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#444",
        }}
      >
        Unread
      </span>
    </div>

    <div
      style={{
        textAlign: "center",
        fontSize: 24,
        fontWeight: 700,
        lineHeight: 1,
        color: "#dc2626",
        marginTop: 6,
      }}
    >
      {unreadCount}
    </div>
  </div>
</div>

      {/* Desktop conversation sidebar */}
      <div
        style={{
          position: "absolute",
          left: 25,
          top: 98,
          bottom: 0,
          width: 550,
          background: "#fff",
          border: "1px solid #ece8f4",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Search */}
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid #f0edf5",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              height: 40,
              borderRadius: 12,
              background: "#f6f4fa",
              display: "flex",
              alignItems: "center",
              padding: "0 14px",
              gap: 10,
            }}
          >
            <Search
              size={18}
              color="#7c3aed"
              strokeWidth={2.2}
            />

            <input
              type="text"
              value={conversationSearch}
              onChange={(e) =>
                setConversationSearch(e.target.value)
              }
              placeholder="Search conversations"
              style={{
                flex: 1,
                minWidth: 0,
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 14,
                color: "#111",
              }}
            />
          </div>
        </div>

        {/* Conversation list */}
        <div
          ref={conversationListRef}
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
            overscrollBehaviorY: "contain",
          }}
        >
          <ConversationList
            conversations={filteredConversations}
          />
        </div>
      </div>

      {/* Empty desktop chat area */}
      <div
        style={{
          position: "absolute",
          left: 600,
          right: 24,
          top: 14,
          bottom: 0,
          borderRadius: 16,
          background: "#faf9fc",
          border: "1px solid #ece8f4",
        }}
      />
    </div>
  </div>
) : (
  /* =========================
     MOBILE — EXISTING LAYOUT
     ========================= */
  <div
    style={{
      position: "fixed",
      inset: 0,
      width: "100%",
      height: "100dvh",
      minHeight: 0,

      display: "flex",
      flexDirection: "column",

      overflow: "hidden",

      background: "#fff",

      overscrollBehavior: "none",
    }}
  >
    {/* Fixed Header + Counters */}
    <div
      style={{
        flexShrink: 0,
        position: "relative",
        zIndex: 1000,
        background: "#fff",
        overflow: "hidden",
      }}
    >
      <Header />

      <div style={{ padding: "8px 20px 0" }}>
        <Stats
          onlineCount={onlineCount}
          totalMembers={totalMembers}
          unreadCount={unreadCount}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "10px 20px",
          }}
        />

        {!isDesktop && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: "8px 0 4px",
            }}
          >
            <NotificationButton isAdmin={true} />
          </div>
        )}
      </div>

      <div
        style={{
          borderTop: "1px solid #e5e7eb",
          marginTop: "8px",
        }}
      />
    </div>

    {/* ONLY THIS AREA SCROLLS */}
    <div
      ref={conversationListRef}
      style={{
        flex: 1,
        minHeight: 0,
        height: 0,

        overflowY: "auto",
        overflowX: "hidden",

        WebkitOverflowScrolling: "touch",

        overscrollBehaviorY: "contain",
      }}
    >
      <ConversationList
        conversations={conversations}
      />
    </div>
  </div>
);
}