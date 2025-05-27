"use client";

import { useTransition } from "react";
import { Button } from "@/src/components/ui/button";
import { Loader2 } from "lucide-react";
import { signInWithGoogle } from "@/src/server/actions/auth";
import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/src/components/ui/button";
import * as React from "react";
import { cn } from "../lib/utils";
import { GoogleIcon } from "../icons/google";

// Define ButtonProps to match the Button component
export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function SignInWithGoogle(props: ButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      {...props}
      type="button"
      onClick={() =>
        startTransition(() => {
          signInWithGoogle("/home");
        })
      }
      disabled={pending || props.disabled}
      variant={props.variant ?? "default"}
      className={cn(props.className, "font-semibold")}
    >
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <GoogleIcon className="mr-2 h-4 w-4" />
      )}
      Sign in with Google
    </Button>
  );
}
