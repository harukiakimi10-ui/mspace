import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: member } = await supabase
    .from("members")
    .select("*")
    .eq("member_id", id)
    .single();

  if (!member) {
    return <p>Member not found</p>;
  }

  return (
    <main
      style={{
        maxWidth: "600px",
        margin: "50px auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {member.photo_url && (
        <img
          src={member.photo_url}
          alt={member.name}
          style={{
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: "20px",
          }}
        />
      )}

      <h1>{member.name}</h1>

      <p>
        <strong>Member ID:</strong>
      </p>

      <p>{member.member_id}</p>

      <p>Welcome to the MSpace profile page.</p>
    </main>
  );
}