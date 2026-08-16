import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export async function getMessages(conversationId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data ?? [];
}


export async function sendTextMessage(payload: {
  conversationId: string;
  content: string;
  replyMessage?: any;
}) {
  const { conversationId, content, replyMessage } = payload;

  // Save the message first
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender: "member",
      message_type: "text",
      content,
      is_read: false,

      reply_to_id: replyMessage?.id ?? null,

      reply_file_duration:
        replyMessage?.message_type === "voice"
          ? replyMessage.file_duration ?? null
          : null,

      reply_preview:
  replyMessage?.message_type === "text"
    ? replyMessage.content
    : replyMessage?.message_type === "image"
    ? "📷 Photo"
    : replyMessage?.message_type === "video"
    ? "🎥 Video"
    : replyMessage?.message_type === "voice"
    ? "🎤 Voice"
    : replyMessage?.message_type === "sticker"
    ? "🏷️ Sticker"
    : replyMessage?.message_type === "location"
    ? "📍 Location"
    : null,

      reply_file_url:
  replyMessage?.message_type === "image" ||
  replyMessage?.message_type === "video" ||
  replyMessage?.message_type === "sticker" ||
  replyMessage?.message_type === "voice"
    ? replyMessage.file_url
    : replyMessage?.message_type === "location"
    ? replyMessage.content
    : null,

      reply_thumbnail_url:
        replyMessage?.message_type === "video"
          ? (
              replyMessage.reply_thumbnail_url ??
              replyMessage.thumbnail_url ??
              replyMessage.file_url
            )
          : null,

      reply_message_type:
        replyMessage?.message_type ?? null,

      reply_sender:
        replyMessage?.sender ?? null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  /*
   * Send push notification in the background.
   * Do NOT wait for it before returning the message.
   */
  void fetch("/api/push/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "MSpace",
      body: content || "New message",
      conversationId,

      // IMPORTANT:
      // Replace this with the real admin/member ID
      // that should receive the notification.
      targetMemberId:
        "11111111-1111-1111-1111-111111111111",
    }),
  })
    .then(async (pushResponse) => {
      const pushResult = await pushResponse.text();

      console.log(
        "PUSH RESPONSE STATUS:",
        pushResponse.status
      );

      console.log(
        "PUSH RESPONSE BODY:",
        pushResult
      );

      if (!pushResponse.ok) {
        console.error(
          "Push request failed:",
          pushResponse.status,
          pushResult
        );
      }
    })
    .catch((pushError) => {
      console.error(
        "Push notification error:",
        pushError
      );
    });

  // Return immediately after the message is saved
  return data;
}

export async function sendStickerMessage(
  conversationId: string,
  sticker: string,
  replyMessage?: any
) {

  const { data, error } = await supabase
    .from("messages")
    .insert({
  conversation_id: conversationId,
  sender: "member",
  message_type: "sticker",
  content: "[sticker]",
  file_url: sticker,
  is_read: false,

  reply_to_id: replyMessage?.id ?? null,

  reply_file_duration:
  replyMessage?.message_type === "voice"
    ? replyMessage.file_duration ?? null
    : null,

  reply_preview:
  replyMessage?.message_type === "text"
    ? replyMessage.content
    : replyMessage?.message_type === "image"
    ? "📷 Photo"
    : replyMessage?.message_type === "video"
    ? "🎥 Video"
    : replyMessage?.message_type === "sticker"
    ? "🏷️ Sticker"
    : replyMessage?.message_type === "voice"
    ? "🎤 Voice message"
    : replyMessage?.message_type === "location"
    ? "📍 Location"
    : null,

  reply_file_url:
  replyMessage?.message_type === "image" ||
  replyMessage?.message_type === "video" ||
  replyMessage?.message_type === "sticker" ||
  replyMessage?.message_type === "voice"
    ? replyMessage.file_url
    : replyMessage?.message_type === "location"
    ? replyMessage.content
    : null,

  reply_thumbnail_url:
    replyMessage?.message_type === "video"
      ? (
          replyMessage.reply_thumbnail_url ??
          replyMessage.thumbnail_url ??
          replyMessage.file_url
        )
      : null,

  reply_message_type: replyMessage?.message_type ?? null,
  reply_sender: replyMessage?.sender ?? null,
  


})
    .select()
    .single();

  if (error) {
  console.log("Supabase error:", error);
  throw error;
}

/*
 * Send push notification to the admin.
 * Do NOT wait for the push request before returning.
 */
void fetch("/api/push/send", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "MSpace",
    body: "New sticker",
    conversationId,

    // We will verify this admin ID next.
    targetMemberId:
      "11111111-1111-1111-1111-111111111111",
  }),
})
  .then(async (pushResponse) => {
    const pushResult = await pushResponse.text();

    console.log(
      "STICKER PUSH RESPONSE STATUS:",
      pushResponse.status
    );

    console.log(
      "STICKER PUSH RESPONSE BODY:",
      pushResult
    );

    if (!pushResponse.ok) {
      console.error(
        "Sticker push request failed:",
        pushResponse.status,
        pushResult
      );
    }
  })
  .catch((pushError) => {
    console.error(
      "Sticker push notification error:",
      pushError
    );
  });

return data;
}


export async function sendLocationMessage(
  conversationId: string,
  latitude: number,
  longitude: number,
  sender: "member" | "admin" = "member"
) {

  console.log("LOCATION SEND DEBUG:", {
  conversationId,
  latitude,
  longitude,
  sender,
});
  const locationUrl =
    `https://www.google.com/maps?q=${latitude},${longitude}`;

    console.log(
  "LOCATION MESSAGE SENDER:",
  sender
);

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender,
      message_type: "location",
      content: locationUrl,
      is_read: false,
    })
    .select()
    .single();

  if (error) {
  console.error("Location message error:", error);

  alert(
    `Location error:\n${error.message}`
  );

  throw error;
}

/*
 * Send push notification to the admin
 * only when the member sends the location.
 */
if (sender === "member") {
  void fetch("/api/push/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "MSpace",
      body: "New location",
      conversationId,

      // Same admin recipient used by the other notifications.
      targetMemberId:
        "11111111-1111-1111-1111-111111111111",
    }),
  })
    .then(async (pushResponse) => {
      const pushResult = await pushResponse.text();

      console.log(
        "LOCATION PUSH RESPONSE STATUS:",
        pushResponse.status
      );

      console.log(
        "LOCATION PUSH RESPONSE BODY:",
        pushResult
      );

      if (!pushResponse.ok) {
        console.error(
          "Location push request failed:",
          pushResponse.status,
          pushResult
        );
      }
    })
    .catch((pushError) => {
      console.error(
        "Location push notification error:",
        pushError
      );
    });
}

return data;
}