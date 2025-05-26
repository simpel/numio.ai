"use client";

import { useTransition } from "react";
import { Button } from "@/src/components/ui/button";
import { Loader2 } from "lucide-react";
import { signOut } from "@/src/server/actions/auth";

export function SignOutButton({ redirectTo = "/" }: { redirectTo?: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      onClick={() => startTransition(() => signOut(redirectTo))}
      disabled={pending}
      variant="outline"
    >
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Sign Out
    </Button>
  );
}
