
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type Conversation = {
  id: string;
  admin_cleared_at: string | null;
};

type MessageMetadata = {
  id: string;
  created_at: string;
  deleted_for: string | null;
  is_deleted: boolean | null;
  deleted_at: string | null;
  is_read: boolean | null;
};

const MAX_CONCURRENT_SYNCS = 3;

export default function AdminConversationSync() {
  const pathname = usePathname();
  const startedRef = useRef(false);
  const cancelledRef = useRef(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (pathname === "/admin/login" || startedRef.current) return;

    startedRef.current = true;
    cancelledRef.current = false;

    const supabase = createClient();

    function isCancelled() {
      return cancelledRef.current;
    }

    function isCurrentlyOpen(conversationId: string) {
      return window.location.pathname ===
        `/admin/chats/${conversationId}`;
    }

    function notifySyncStatus(
  conversationId: string,
  syncing: boolean
) {
  try {
    const stored = sessionStorage.getItem(
      "mspace-admin-syncing-conversations"
    );

    const current: string[] = stored
      ? JSON.parse(stored)
      : [];

    const updated = syncing
      ? current.includes(conversationId)
        ? current
        : [...current, conversationId]
      : current.filter((id) => id !== conversationId);

    sessionStorage.setItem(
      "mspace-admin-syncing-conversations",
      JSON.stringify(updated)
    );
  } catch (error) {
    console.error("Failed to save sync status:", error);
  }

  window.dispatchEvent(
    new CustomEvent("mspace-admin-conversation-sync", {
      detail: { conversationId, syncing },
    })
  );
}

    function getMetadataSignature(
      messages: MessageMetadata[]
    ) {
      return JSON.stringify(
        messages
          .filter((message) => message.deleted_for !== "admin")
          .map((message) => [
            message.id,
            message.created_at,
            message.deleted_for,
            message.is_deleted,
            message.deleted_at,
            message.is_read,
          ])
      );
    }

    async function syncConversation(
      conversation: Conversation
    ) {
      const conversationId = conversation.id;
      const cacheKey = `mspace-messages-${conversationId}`;

      let cachedMessages: any[] = [];
      let cacheExists = false;

      try {
        const cached = localStorage.getItem(cacheKey);

        if (cached !== null) {
          const parsed = JSON.parse(cached);

          if (Array.isArray(parsed)) {
            cachedMessages = parsed;
            cacheExists = true;
          }
        }
      } catch (error) {
        console.error(
          "MSpace message cache validation failed:",
          conversationId,
          error
        );
      }

      if (isCancelled() || isCurrentlyOpen(conversationId)) return;

      // Check lightweight metadata for the entire conversation.
      let metadataQuery = supabase
        .from("messages")
        .select(
          "id, created_at, deleted_for, is_deleted, deleted_at, is_read"
        )
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (conversation.admin_cleared_at) {
        metadataQuery = metadataQuery.gt(
          "created_at",
          conversation.admin_cleared_at
        );
      }

      const {
        data: serverMetadata,
        error: metadataError,
      } = await metadataQuery;

      if (isCancelled()) return;

      if (metadataError) {
        console.error(
          "MSpace metadata check failed:",
          conversationId,
          metadataError
        );
        return;
      }

      const serverMessages =
        (serverMetadata || []) as MessageMetadata[];

      const needsSync =
        !cacheExists ||
        getMetadataSignature(serverMessages) !==
          getMetadataSignature(cachedMessages);

      if (!needsSync) return;

      if (isCurrentlyOpen(conversationId)) return;

      notifySyncStatus(conversationId, true);

      try {
        if (isCancelled() || isCurrentlyOpen(conversationId)) return;

        let historyQuery = supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true });

        if (conversation.admin_cleared_at) {
          historyQuery = historyQuery.gt(
            "created_at",
            conversation.admin_cleared_at
          );
        }

        const {
          data: history,
          error: historyError,
        } = await historyQuery;

        if (isCancelled()) return;

        if (historyError) {
          console.error(
            "MSpace full conversation sync failed:",
            conversationId,
            historyError
          );
          return;
        }

        // Never overwrite the cache while this conversation is open.
        if (isCurrentlyOpen(conversationId)) return;

        const visibleMessages = (history || []).filter(
          (message: any) => message.deleted_for !== "admin"
        );

        try {
          localStorage.setItem(
            cacheKey,
            JSON.stringify(visibleMessages)
          );

          console.log(
            "MSpace conversation synchronized:",
            conversationId,
            visibleMessages.length
          );
        } catch (error) {
          console.error(
            "MSpace conversation cache save failed:",
            conversationId,
            error
          );
        }
      } finally {
        notifySyncStatus(conversationId, false);
      }
    }

    
    let cycleRunning = false;

    async function runSyncCycle() {
      if (isCancelled() || cycleRunning) return;

      cycleRunning = true;

      try {
        // Verify the admin session before database access.
        const response = await fetch("/api/admin/session", {
          method: "GET",
          cache: "no-store",
        });

        if (isCancelled()) return;

        if (response.status === 401) {
          window.location.replace("/admin/login");
          return;
        }

        if (!response.ok) {
          console.error(
            "MSpace background sync session verification failed:",
            response.status
          );
          return;
        }

        // Retrieve all conversations visible to the admin.
        const {
          data: conversations,
          error,
        } = await supabase
          .from("conversations")
          .select("id, admin_cleared_at")
          .eq("hidden_from_admin", false);

        if (isCancelled()) return;

        if (error) {
          console.error(
            "MSpace background conversation lookup failed:",
            error
          );
          return;
        }

        const items = (conversations || []) as Conversation[];

        console.log(
          "MSpace background sync checking conversations:",
          items.length
        );

        let nextIndex = 0;

        async function worker() {
          while (!isCancelled()) {
            const index = nextIndex++;

            if (index >= items.length) return;

            try {
              await syncConversation(items[index]);
            } catch (error) {
              console.error(
                "MSpace background sync error:",
                items[index].id,
                error
              );
            }
          }
        }

        await Promise.all(
          Array.from(
            {
              length: Math.min(
                MAX_CONCURRENT_SYNCS,
                items.length
              ),
            },
            () => worker()
          )
        );

        if (!isCancelled()) {
          console.log(
            "MSpace background conversation sync cycle finished."
          );
        }
      } catch (error) {
        console.error(
          "MSpace background sync cycle failed:",
          error
        );
      } finally {
        cycleRunning = false;
      }
    }

    void runSyncCycle();

intervalRef.current = window.setInterval(() => {
  void runSyncCycle();
}, 15000);

    // Navigation does not cancel the synchronization process.
    return () => {};
  }, [pathname]);

  // Cancel only when the shared admin layout actually unmounts.
  useEffect(() => {
  return () => {
    cancelledRef.current = true;

    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };
}, []);

  return null;
}
