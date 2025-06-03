import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/src/components/ui/card";
import { SignUpWithEmailAndPasswordForm } from "@/src/forms/signup/SignUpWithEmailAndPasswordForm";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Welcome to Numio!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SignUpWithEmailAndPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
