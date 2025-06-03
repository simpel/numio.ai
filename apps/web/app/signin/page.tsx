import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/src/components/ui/card";
import { SignInWithEmailAndPasswordForm } from "@/src/forms/signin/SignInWithEmailAndPasswordForm";
import { SignInWithGoogle } from "@/src/components/SignInWithGoogle";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Sign in to your account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SignInWithEmailAndPasswordForm />
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="flex items-center w-full my-2">
            <div className="flex-grow border-t border-muted-foreground/20" />
            <span className="mx-2 text-muted-foreground text-xs">or</span>
            <div className="flex-grow border-t border-muted-foreground/20" />
          </div>
          <SignInWithGoogle className="w-full" variant="outline" />
        </CardFooter>
      </Card>
    </div>
  );
}
