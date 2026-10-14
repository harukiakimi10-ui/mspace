self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const title = data.title || "MSpace";

  const unreadCount = Number(data.unreadCount || 0);

  const options = {
    body: data.body || "You have a new message.",
    icon: data.icon || "/mspace-notification-icon.jpeg",
    badge: data.badge || "/mspace-notification-icon.jpeg",
    data: {
  url: data.url || "/members",
  conversationId: data.conversationId || null,
},
  };

  event.waitUntil(
    (async () => {
      // Update the MSpace Home Screen app badge.
      if (
        "setAppBadge" in self.navigator &&
        unreadCount > 0
      ) {
        try {
          await self.navigator.setAppBadge(
            unreadCount
          );
        } catch (error) {
          console.error(
            "MSpace app badge error:",
            error
          );
        }
      }

      await self.registration.showNotification(
        title,
        options
      );
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/members";

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

self.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.type !== "MSPACE_UPDATE_BADGE") {
    return;
  }

  const count = Number(event.data.count || 0);

  event.waitUntil(
    (async () => {
      try {
        if (
          "setAppBadge" in self.navigator &&
          typeof self.navigator.setAppBadge === "function"
        ) {
          if (count > 0) {
            await self.navigator.setAppBadge(count);
          } else if (
            "clearAppBadge" in self.navigator &&
            typeof self.navigator.clearAppBadge === "function"
          ) {
            await self.navigator.clearAppBadge();
          }
        }
      } catch (error) {
        console.error(
          "MSpace badge update error:",
          error
        );
      }
    })()
  );
});


self.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.type === "MSPACE_SET_OPEN_CONVERSATION") {
    self.mspaceOpenConversationId =
      event.data.conversationId || null;
    return;
  }

  if (event.data.type === "MSPACE_CLOSE_READ_NOTIFICATIONS") {
    const conversationId = event.data.conversationId;

    event.waitUntil(
      self.registration.getNotifications().then((notifications) => {
        for (const notification of notifications) {
          if (
            notification.data?.conversationId === conversationId
          ) {
            notification.close();
          }
        }
      })
    );
  }
});
