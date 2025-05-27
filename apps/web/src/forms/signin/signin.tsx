"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signInWithEmail, signInWithGoogle } from "@/src/server/actions/auth";
import { useState } from "react";
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

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export function SignInForm() {
  const [error, setError] = useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);

    setError(null);
    const result = await signInWithEmail(formData);
    if (result?.error) setError(result.error);
  };

  const handleGoogle = async () => {
    setError(null);
    const result = await signInWithGoogle();
    if (result?.error) setError(result.error);
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 border rounded-lg shadow">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
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
                <FormLabel>Password</FormLabel>
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
          <Button type="submit" className="w-full">
            Sign in with Email
          </Button>
        </form>
      </Form>
      <div className="my-4 text-center">or</div>
      <Button onClick={handleGoogle} className="w-full" variant="outline">
        Sign in with Google
      </Button>
      {error && <div className="text-red-500 mt-4">{error}</div>}
    </div>
  );
}
