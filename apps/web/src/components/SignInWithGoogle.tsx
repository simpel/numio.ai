"use client";

import { useTransition } from "react";
import { Button } from "@/src/components/ui/button";
import { Loader2 } from "lucide-react";
import { signInWithGoogle } from "@/src/server/actions/auth";

export function SignInWithGoogle() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      onClick={() =>
        startTransition(() => {
          signInWithGoogle("/home");
        })
      }
      disabled={pending}
      variant="outline"
    >
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Sign in with Google
    </Button>
  );
}
