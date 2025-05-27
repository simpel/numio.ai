"use server";

import { createClient } from "@/src/supabase/server";
import { redirect } from "next/navigation";

export async function onboarding(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const first_name = formData.get("first_name") as string;
  const last_name = formData.get("last_name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;

  console.log("onboarding", { first_name, last_name, email, phone });

  // Upsert profile
  const { data, error } = await supabase.from("profiles").upsert({
    first_name,
    last_name,
    email,
    user_id: user.id,
    phone,
    onboarded: true,
  });

  if (error) {
    console.log(error);

    return {
      error: "We're sorry, something went wrong when creating your profile!",
      success: false,
    };
  }

  return { success: true, data };
}
