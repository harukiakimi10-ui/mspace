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
  throw new Error("Missing push notification environment variables");
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

export async function POST() {
  try {
    const { data, error } = await supabase
      .from("push_subscriptions")
      .select("subscription")
      .limit(1)
      .single();

    if (error || !data?.subscription) {
      console.error("Subscription lookup error:", error);

      return Response.json(
        {
          error: "No push subscription found",
        },
        { status: 404 }
      );
    }

    await webpush.sendNotification(
      data.subscription,
      JSON.stringify({
        title: "MSpace",
        body: "🔔 This is a test notification from MSpace.",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
      })
    );

    console.log("MSpace test notification sent successfully");

    return Response.json({
      success: true,
      message: "Test notification sent",
    });
  } catch (error) {
    console.error(
      "MSpace test notification error:",
      error
    );

    return Response.json(
      {
        error: "Failed to send test notification",
      },
      { status: 500 }
    );
  }
}