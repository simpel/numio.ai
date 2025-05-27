import Link from "next/link";
import { createClient } from "@/src/supabase/server";
import { SignOutButton } from "./SignOutButton";
import { SignInWithGoogle } from "./SignInWithGoogle";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 backdrop-blur bg-white/80">
      <div className="container mx-auto flex items-center justify-between h-16">
        <Link href="/" className="font-bold text-lg tracking-tight">
          Numio
        </Link>
        <nav className="flex items-center gap-4">
          {user ? <SignOutButton /> : <SignInWithGoogle />}
        </nav>
      </div>
    </header>
  );
}
