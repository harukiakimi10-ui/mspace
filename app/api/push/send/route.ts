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

    const title = body.title || "MSpace";

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
      return Response.json(
        {
          error:
            "No push subscription found for target",
          targetMemberId,
        },
        { status: 404 }
      );
    }

    const payload = JSON.stringify({
  title,
  body: notificationBody,
  icon: "/icon-192.png",
  badge: "/icon-192.png",
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

        // Remove expired/invalid subscriptions.
        if (
          error?.statusCode === 404 ||
          error?.statusCode === 410
        ) {
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("id", row.id);

          console.log(
            "Removed expired push subscription:",
            row.id
          );
        }

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