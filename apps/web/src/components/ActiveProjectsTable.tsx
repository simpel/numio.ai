"use client";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/src/components/ui/table";

export default function ActiveProjectsTable({ projects }: { projects: any[] }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Active Projects</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell>{project.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
