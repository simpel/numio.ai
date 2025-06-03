import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import OnboardingForm from "@/src/forms/onboarding/OnboardingForm";
import { createClient } from "@/src/supabase/server";

export default async function WelcomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Fetch user details from the users table
  const { data: userDetails } = await supabase
    .from("users")
    .select("email, phone, displayname")
    .eq("id", user?.id)
    .single();

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome! Complete your profile</CardTitle>
        </CardHeader>
        <CardContent>
          <OnboardingForm
            defaultValues={{
              first_name: "",
              last_name: "",
              email: userDetails?.email || user?.email || "",
              phone: userDetails?.phone || user?.phone || "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
