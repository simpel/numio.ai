"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signUpWithEmail } from "@/src/server/actions/auth";
import { useState, useTransition } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/src/components/ui/form";
import { Loader2 } from "lucide-react";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export function SignUpWithEmailAndPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm({
    resolver: zodResolver(schema),
    mode: "all",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);

      const result = await signUpWithEmail(formData);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <Form {...form}>
      {error && <div className="text-red-500 mt-4">{error}</div>}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your e-mail</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Email" autoComplete="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your password</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder="Password"
                  autoComplete="current-password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={isPending || !form.formState.isValid}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Sign up"
          )}
        </Button>
      </form>
    </Form>
  );
}
