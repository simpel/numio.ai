"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { addCompany } from "@/src/server/actions/companies";
// Stub: import the server action for adding a profile to a company
// import { addProfileToCompany } from "@/src/server/actions/companies";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/src/components/ui/table";
import { Database } from "../types/supabase";
import AddCompanyMemberForm from "@/src/forms/company/AddCompanyMemberForm";

export default function CompanyTable({
  companies,
  isAdmin,
}: {
  companies: (Database["public"]["Tables"]["companies"]["Row"] & {
    activeProjects?: number;
  })[];
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");

  // State for Add Colleague dialog
  const [colleagueDialogOpen, setColleagueDialogOpen] = useState<number | null>(
    null
  );

  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", name);
      const { success, error } = await addCompany(formData);
      if (success) {
        setOpen(false);
        setName("");
        window.location.reload();
      } else {
        setError(error ?? null);
      }
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Companies</h2>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Add Company</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Add Company</DialogTitle>
              <form onSubmit={handleAddCompany} className="space-y-4">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Company Name"
                  required
                />
                <Button type="submit" disabled={pending} className="w-full">
                  {pending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Add"
                  )}
                </Button>
                {error && <div className="text-red-500 mt-2">{error}</div>}
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Active Projects</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id}>
              <TableCell>{company.name}</TableCell>
              <TableCell>{company.activeProjects ?? 0}</TableCell>
              <TableCell className="flex gap-2">
                <Link href={`/company/${company.id}`}>
                  <Button>See Company</Button>
                </Link>
                {isAdmin && (
                  <Dialog
                    open={colleagueDialogOpen === company.id}
                    onOpenChange={(open) =>
                      setColleagueDialogOpen(open ? company.id : null)
                    }
                  >
                    <DialogTrigger asChild>
                      <Button>Add Colleague</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogTitle>Add Colleague to {company.name}</DialogTitle>
                      <AddCompanyMemberForm
                        companyId={company.id}
                        onSuccess={() => setColleagueDialogOpen(null)}
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
