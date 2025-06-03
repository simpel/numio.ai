"use server";

import { isAuthenticated } from "@/src/supabase/helpers/is-authenticated";
import { createClient } from "@/src/supabase/server";
import { redirect } from "next/navigation";

export async function onboarding(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/signin");
  }

  await isAuthenticated({
    roles: ["user"],
    next: "/signin",
  });

  const first_name = formData.get("first_name") as string;
  const last_name = formData.get("last_name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;

  const currentProfile = await supabase
    .from("profiles")
    .select("roles")
    .eq("user_id", user.id)
    .single();

  console.log(currentProfile);

  // Upsert profile
  const { data, error } = await supabase.from("profiles").upsert(
    {
      first_name,
      last_name,
      email,
      user_id: user.id,
      phone,
      onboarded: true,
      roles: currentProfile?.data?.roles,
    },
    { onConflict: "user_id" }
  );

  console.dir(error, { depth: null });

  if (error) {
    return {
      error: "We're sorry, something went wrong when creating your profile!",
      success: false,
    };
  }

  return { success: true, data };
}
