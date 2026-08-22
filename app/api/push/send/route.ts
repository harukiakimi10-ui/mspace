import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (
  !publicKey ||
  !privateKey ||
  !subject ||
  !supabaseUrl ||
  !supabaseSecretKey
) {
  throw new Error(
    "Missing push notification environment variables"
  );
}

webpush.setVapidDetails(
  subject,
  publicKey,
  privateKey
);

const supabase = createClient(
  supabaseUrl,
  supabaseSecretKey
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const message =
  body.body || "You have a new message.";

// Keep push notification payload small.
// The full message remains unchanged in the chat.
const notificationBody =
  Array.from(String(message)).length > 180
    ? Array.from(String(message)).slice(0, 180).join("") + "…"
    : String(message);

    // MSpace has only one admin.
    const ADMIN_ID =
      "11111111-1111-1111-1111-111111111111";

    // If targetMemberId is provided:
    // Admin → specific member.
    //
    // If it is not provided:
    // Member → Admin.
    const targetMemberId =
      body.targetMemberId || ADMIN_ID;

    console.log(
      "Push notification target:",
      targetMemberId
    );

    // --------------------------------------------------
// Determine the sender's profile for the notification
// --------------------------------------------------

let senderName = "MSpace";
let senderPhoto = "/mspace-notification-icon.jpeg";

const conversationId = body.conversationId;

if (conversationId) {
  if (targetMemberId === ADMIN_ID) {
    // Member → Admin
    // The recipient is the admin, so the sender is
    // the member belonging to this conversation.

    const {
      data: conversation,
      error: conversationError,
    } = await supabase
      .from("conversations")
      .select("member_id")
      .eq("id", conversationId)
      .single();

    if (conversationError) {
      console.error(
        "Conversation lookup error:",
        conversationError
      );
    }

    if (conversation?.member_id) {
      const {
        data: member,
        error: memberError,
      } = await supabase
        .from("members")
        .select("name, photo_url")
        .eq("member_id", conversation.member_id)
        .single();

      if (memberError) {
        console.error(
          "Member profile lookup error:",
          memberError
        );
      }

      if (member) {
        senderName =
          member.name || "MSpace Member";

        senderPhoto =
  member.photo_url || "/mspace-notification-icon.jpeg";
      }
    }
  } else {
  // Admin → Member
  // The admin profile is stored in the settings table.

  const {
    data: settings,
    error: settingsError,
  } = await supabase
    .from("settings")
    .select("profile_name, profile_photo")
    .eq("id", 1)
    .single();

  if (settingsError) {
    console.error(
      "Admin settings lookup error:",
      settingsError
    );
  }

  if (settings) {
    senderName =
      settings.profile_name || "MSpace";

    senderPhoto =
  settings.profile_photo || "/mspace-notification-icon.jpeg";
  }
}
}

console.log(
  "Notification sender:",
  senderName
);

console.log(
  "Notification sender photo:",
  senderPhoto
);

    const {
      data: subscriptions,
      error,
    } = await supabase
      .from("push_subscriptions")
      .select(
        "id, member_id, subscription"
      )
      .eq(
        "member_id",
        targetMemberId
      );

    if (error) {
      console.error(
        "Subscription lookup error:",
        error
      );

      return Response.json(
        {
          error:
            "Failed to load push subscriptions",
        },
        { status: 500 }
      );
    }

    if (
  !subscriptions ||
  subscriptions.length === 0
) {
  console.error(
    "NO PUSH SUBSCRIPTION FOR TARGET:",
    {
      targetMemberId,
      conversationId,
    }
  );

  return Response.json(
    {
      success: false,
      error:
        "No push subscription found for target",
      targetMemberId,
      conversationId,
    },
    { status: 404 }
  );
}

console.log(
  "FOUND PUSH SUBSCRIPTIONS:",
  subscriptions.map((row) => ({
    id: row.id,
    member_id: row.member_id,
    endpoint:
      row.subscription?.endpoint
        ? row.subscription.endpoint.substring(0, 80) + "..."
        : null,
  }))
);

    const payload = JSON.stringify({
  title: senderName,
  body: notificationBody,

  // Sender's profile picture
  icon: senderPhoto,

  // MSpace branding
badge: "/mspace-notification-icon.jpeg",
});

    const results = [];

    for (const row of subscriptions) {
      try {
        await webpush.sendNotification(
          row.subscription,
          payload
        );

        console.log(
          "Push notification sent to:",
          row.member_id
        );

        results.push({
          id: row.id,
          member_id: row.member_id,
          success: true,
        });
      } catch (error: any) {
        console.error(
          "Push delivery error:",
          error
        );

        console.error("PUSH DELIVERY DETAILS:", {
  name: error?.name,
  message: error?.message,
  statusCode: error?.statusCode,
  body: error?.body,
  headers: error?.headers,
});

        results.push({
          id: row.id,
          member_id: row.member_id,
          success: false,
          statusCode:
            error?.statusCode || null,
        });
      }
    }

    const successful =
      results.filter(
        (result) => result.success
      ).length;

    const failed =
      results.filter(
        (result) => !result.success
      ).length;

    return Response.json({
      success: successful > 0,
      sent: successful,
      failed,
      total: results.length,
      targetMemberId,
      results,
    });
  } catch (error) {
    console.error(
      "Push send error:",
      error
    );

    return Response.json(
      {
        error:
          "Failed to send push notification",
      },
      { status: 500 }
    );
  }
}