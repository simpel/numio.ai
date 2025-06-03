"use client";
import { useState, useTransition } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Loader2 } from "lucide-react";

interface AddCompanyMemberFormProps {
  companyId: number;
  onSuccess?: () => void;
}

export default function AddCompanyMemberForm({
  companyId,
  onSuccess,
}: AddCompanyMemberFormProps) {
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      // You would look up the profileId by email here (stub for now)
      // In a real app, you might call a server action to get the profileId from the email
      // For now, just simulate failure
      setError("Profile lookup by email not implemented");
      // Example:
      // const profileId = await getProfileIdByEmail(email);
      // if (!profileId) { setError("No user found with that email"); return; }
      // const { success, error } = await addCompanyMember({ profileId, companyIds: [companyId] });
      // if (success) { setEmail(""); onSuccess?.(); } else { setError(error); }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Colleague Email"
        required
      />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          "Add Colleague"
        )}
      </Button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </form>
  );
}
