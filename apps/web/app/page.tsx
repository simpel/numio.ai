import { SignInWithGoogle } from "@/src/components/SignInWithGoogle";
import { createClient } from "@/src/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();

  const user = await supabase.auth.getUser();

  return (
    <div className="container mx-auto flex flex-col items-center justify-center h-96">
      <h1 className="text-7xl font-thin mb-10">
        Welcome to <span className="font-bold">Numio</span>
      </h1>
      <p className="text-center mb-6 text-2xl font-light">
        Our app streamlines the process of reviewing changes to contracts,
        ensuring accuracy and compliance. With intuitive tools and real-time
        collaboration, you can efficiently manage contract modifications.
      </p>

      <SignInWithGoogle size={"lg"} />
    </div>
  );
}
