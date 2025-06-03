"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { onboarding } from "@/src/server/actions/onboarding";
import { useTransition } from "react";
import { Button } from "@/src/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { isValidPhoneNumber } from "react-phone-number-input";
import { PhoneInput } from "@/src/components/PhoneInput";
import { toast } from "sonner";
import { redirect } from "next/navigation";

const schema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email(),
  phone: z.string().refine(isValidPhoneNumber, {
    message: "Invalid phone number",
  }),
});

export default function OnboardingForm({
  defaultValues,
}: {
  defaultValues: any;
}) {
  const [isPending, startTransition] = useTransition();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  async function onSubmit(values: any) {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      const { success, error } = await onboarding(formData);
      if (success) {
        toast.success("Onboarding successful");
        redirect("/home");
      } else {
        toast.error(error);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input {...field} required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input {...field} required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your e-mail</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  required
                  placeholder="email@example.com"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem className="flex flex-col items-start">
              <FormLabel className="text-left">Phone Number</FormLabel>
              <FormControl className="w-full">
                <PhoneInput
                  placeholder="Enter a phone number"
                  {...field}
                  countries={["SE", "FI", "DK"]}
                />
              </FormControl>
              <FormDescription className="text-left">
                Enter a phone number
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Submitting..." : "Submit"}
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="mr-2 h-4 w-4" />
          )}
        </Button>
      </form>
    </Form>
  );
}
