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
    "Missing notification or Supabase server environment variables"
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

    const subscription = body.subscription;
    const memberId = body.memberId;

    if (!memberId) {
      return Response.json(
        { error: "Missing memberId" },
        { status: 400 }
      );
    }

    if (!subscription?.endpoint) {
      return Response.json(
        { error: "Invalid push subscription" },
        { status: 400 }
      );
    }

    // Verify that this ID belongs to either
    // the MSpace admin or a registered member.

    const { data: admin } = await supabase
      .from("admins")
      .select("id")
      .eq("id", memberId)
      .maybeSingle();

    let validMemberId = admin?.id ?? null;

    if (!validMemberId) {
      const { data: member } = await supabase
        .from("members")
        .select("member_id")
        .eq("member_id", memberId)
        .maybeSingle();

      validMemberId = member?.member_id ?? null;
    }

    if (!validMemberId) {
      return Response.json(
        { error: "Invalid member ID" },
        { status: 400 }
      );
    }

    const { data: savedSubscription, error } = await supabase
  .from("push_subscriptions")
  .upsert(
    {
      member_id: validMemberId,
      endpoint: subscription.endpoint,
      subscription: subscription,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "endpoint",
    }
  )
  .select("id, member_id, endpoint")
  .single();

    if (error) {
      console.error(
        "Supabase push subscription error:",
        error
      );

      return Response.json(
        {
          error: "Failed to save push subscription",
        },
        { status: 500 }
      );
    }

    console.log(
      "MSpace push subscription saved for member:",
      validMemberId
    );

    return Response.json({
  success: true,
  message: "Push subscription saved",
  subscription: savedSubscription,
});

  } catch (error) {
    console.error(
      "Push subscription error:",
      error
    );

    return Response.json(
      {
        error: "Failed to save push subscription",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const memberId = searchParams.get("memberId");

    if (!memberId) {
      return Response.json(
        { saved: false },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("push_subscriptions")
      .select("id, member_id, endpoint")
      .eq("member_id", memberId)
      .limit(1);

    if (error) {
      console.error(
        "Supabase push subscription check error:",
        error
      );

      return Response.json(
        { saved: false },
        { status: 500 }
      );
    }

    const saved = !!data && data.length > 0;

    console.log(
      "Push subscription check:",
      {
        memberId,
        saved,
        count: data?.length ?? 0,
      }
    );

    return Response.json({
      saved,
    });

  } catch (error) {
    console.error(
      "Push subscription check error:",
      error
    );

    return Response.json(
      { saved: false },
      { status: 500 }
    );
  }
}