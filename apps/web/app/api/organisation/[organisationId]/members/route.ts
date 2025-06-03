import { NextResponse } from "next/server";
import { createClient } from "@/src/supabase/server";
import { isAuthenticated } from "@/src/supabase/helpers/is-authenticated";

export async function GET(
  request: Request,
  { params }: { params: { organisationId: string } }
) {
  // Only allow admins
  try {
    await isAuthenticated({ roles: ["admin"] });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "Forbidden: Admins only", data: [] },
      { status: 403 }
    );
  }

  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const organisationId = params.organisationId;
  const q = searchParams.get("q")?.toLowerCase() || "";
  const takeParam = searchParams.get("take");
  const take = takeParam ? parseInt(takeParam, 10) : undefined;

  // Get all profile_ids associated with the organisation
  const { data: profileOrgRows, error: orgError } = await supabase
    .from("profile_organisations")
    .select("profile_id")
    .eq("organisation_id", organisationId);

  if (orgError) {
    return NextResponse.json(
      { success: false, error: orgError.message, data: [] },
      { status: 500 }
    );
  }
  const profileIds = (profileOrgRows || [])
    .map((row) => row.profile_id)
    .filter((id): id is number => !!id);

  if (profileIds.length === 0) {
    return NextResponse.json({ success: true, data: [] });
  }

  // Query profiles with filter
  let query = supabase
    .from("profiles")
    .select("id, email, first_name, last_name, avatar")
    .in("id", profileIds);

  if (q) {
    query = query.or(
      `email.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%`
    );
  }

  if (take && !isNaN(take) && take > 0) {
    query = query.limit(take);
  }

  const { data: profiles, error } = await query;
  if (error) {
    return NextResponse.json(
      { success: false, error: error.message, data: [] },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: profiles });
}
