import { SignInWithGoogle } from "@/src/components/SignInWithGoogle";
import { SignOutButton } from "@/src/components/SignOutButton";
import { createClient } from "@/src/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();

  const user = await supabase.auth.getUser();

  return (
    <div>
      <h1>HOME</h1>
      EMAIL: {user.data.user?.email}
      <SignOutButton />
      <SignInWithGoogle />
    </div>
  );
}
