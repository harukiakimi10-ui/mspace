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
    ? "STICKER"
    : null,

      reply_file_url:
  replyMessage?.message_type === "image" ||
  replyMessage?.message_type === "video" ||
  replyMessage?.message_type === "sticker" ||
  replyMessage?.message_type === "voice"
    ? replyMessage.file_url
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

  if (error) throw error;

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
      : null,

  reply_file_url:
    replyMessage?.message_type === "image" ||
    replyMessage?.message_type === "video" ||
    replyMessage?.message_type === "sticker" ||
    replyMessage?.message_type === "voice"
      ? replyMessage.file_url
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

  return data;
}


