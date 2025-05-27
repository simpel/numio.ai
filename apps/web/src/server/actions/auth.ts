"use server";

import { createClient } from "@/src/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function signInWithEmail(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: error.message };
  }
  return { success: true };
}

export async function signInWithGoogle(next: string = "/") {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback${
        next ? `?next=${encodeURIComponent(next)}` : ""
      }`,
    },
  });

  if (data.url) {
    redirect(data.url);
  }

  if (error) {
    return { error: error.message };
  }
  return { success: true };
}

export async function signOut(redirectTo: string = "/") {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`${redirectTo}?code=signed_out&type=success`);
}
