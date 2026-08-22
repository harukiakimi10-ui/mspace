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

    // --------------------------------------------------
// Save push subscription
//
// Members: ONE subscription per member.
// Admin: multiple subscriptions are allowed.
// --------------------------------------------------

const ADMIN_ID =
  "11111111-1111-1111-1111-111111111111";

let savedSubscription;

// ADMIN
// --------------------------------------------------
if (validMemberId === ADMIN_ID) {
  const { data, error } = await supabase
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
      "Supabase admin push subscription error:",
      error
    );

    return Response.json(
      {
        error: "Failed to save admin push subscription",
      },
      { status: 500 }
    );
  }

  savedSubscription = data;
}

// MEMBER
// --------------------------------------------------
else {
  // Find whether this exact browser push endpoint
  // already exists anywhere in MSpace.
  const {
    data: existingEndpoint,
    error: endpointError,
  } = await supabase
    .from("push_subscriptions")
    .select("id, member_id, endpoint, subscription")
    .eq("endpoint", subscription.endpoint)
    .maybeSingle();

  if (endpointError) {
    console.error(
      "Existing push endpoint lookup error:",
      endpointError
    );

    return Response.json(
      {
        error:
          "Failed to check existing push subscription",
      },
      { status: 500 }
    );
  }

  // ------------------------------------------------
  // This browser endpoint already exists
  // ------------------------------------------------
  if (existingEndpoint) {
    // Same member already owns this browser subscription.
    // Just update the subscription information.
    if (existingEndpoint.member_id === validMemberId) {
      const { data, error } = await supabase
        .from("push_subscriptions")
        .update({
          subscription: subscription,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingEndpoint.id)
        .select("id, member_id, endpoint")
        .single();

      if (error) {
        console.error(
          "Supabase push subscription update error:",
          error
        );

        return Response.json(
          {
            error:
              "Failed to update push subscription",
          },
          { status: 500 }
        );
      }

      savedSubscription = data;
    }

    // ------------------------------------------------
    // Endpoint belongs to another member.
    // Reassign this browser subscription to the
    // member currently using this browser.
    // ------------------------------------------------
    else {
      console.log(
        "Reassigning push endpoint from member:",
        existingEndpoint.member_id,
        "to member:",
        validMemberId
      );

      const { data, error } = await supabase
        .from("push_subscriptions")
        .update({
          member_id: validMemberId,
          subscription: subscription,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingEndpoint.id)
        .select("id, member_id, endpoint")
        .single();

      if (error) {
        console.error(
          "Supabase push subscription reassignment error:",
          error
        );

        return Response.json(
          {
            error:
              "Failed to reassign push subscription",
          },
          { status: 500 }
        );
      }

      savedSubscription = data;
    }
  }

  // ------------------------------------------------
  // This is a completely new browser subscription.
  // ------------------------------------------------
  else {
    const { data, error } = await supabase
      .from("push_subscriptions")
      .insert({
        member_id: validMemberId,
        endpoint: subscription.endpoint,
        subscription: subscription,
        updated_at: new Date().toISOString(),
      })
      .select("id, member_id, endpoint")
      .single();

    if (error) {
      console.error(
        "Supabase push subscription insert error:",
        error
      );

      return Response.json(
        {
          error:
            "Failed to create push subscription",
        },
        { status: 500 }
      );
    }

    savedSubscription = data;
  }
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
const endpoint = searchParams.get("endpoint");

if (!memberId || !endpoint) {
  return Response.json(
    { saved: false },
    { status: 400 }
  );
}

    const { data, error } = await supabase
  .from("push_subscriptions")
  .select("id, member_id, endpoint")
  .eq("member_id", memberId)
  .eq("endpoint", endpoint)
  .maybeSingle();

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

    const saved = !!data;

    console.log(
      "Push subscription check:",
      {
        memberId,
        saved,
        count: data ? 1 : 0,
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