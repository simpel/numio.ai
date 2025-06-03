"use server";

import { createClient } from "@/src/supabase/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function signUpWithEmail(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message };
  }

  if (data.user?.id) {
    const { data: userDetails } = await supabase
      .from("users")
      .select("onboarded")
      .eq("id", data.user.id)
      .single();

    revalidatePath("/", "layout");
    if (userDetails?.onboarded) {
      redirect("/home");
    }
  }

  revalidatePath("/", "layout");
  redirect("/welcome");
}

export async function signInWithEmail(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user?.id) {
    const { data: userDetails } = await supabase
      .from("users")
      .select("onboarded")
      .eq("id", data.user.id)
      .single();

    revalidatePath("/", "layout");
    if (userDetails?.onboarded) {
      redirect("/home");
    }
  }

  revalidatePath("/", "layout");
  redirect("/welcome");
}

export async function signInWithGoogle(next: string = "/home") {
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
