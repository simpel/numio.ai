import { createClient } from "@/src/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const next = requestUrl.searchParams.get("next")?.toString();

  const supabase = await createClient();
  let user;
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
    // Fetch the user after session exchange
    const { data: userData } = await supabase.auth.getUser();
    user = userData.user;
  } else {
    const { data: userData } = await supabase.auth.getUser();
    user = userData.user;
  }

  // If no user, redirect to login
  if (!user) {
    return NextResponse.redirect(`${origin}/signin`);
  }

  // Fetch the user's profile from the 'profiles' table
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarded")
    .eq("id", user.id)
    .single();

  // If no profile or onboarded is false, redirect to /welcome
  if (!profile || !profile.onboarded) {
    return NextResponse.redirect(`${origin}/welcome`);
  }

  return NextResponse.redirect(`${origin}/${next ?? "home"}`);
}
