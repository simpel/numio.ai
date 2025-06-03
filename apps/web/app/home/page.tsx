import CompanyTable from "@/src/components/CompanyTable";
import ActiveProjectsTable from "@/src/components/ActiveProjectsTable";
import { getProfile } from "@/src/supabase/helpers/get-profile";
import { hasRole } from "@/src/supabase/helpers/has-role";

export default async function HomePage() {
  // Use the helper to get profile, companies, roles, and active projects
  const { profile, companies, projects } = await getProfile({
    withCompanies: {},
    withProjects: { includeAll: false },
  });
  if (!profile) return null;

  const isAdmin = await hasRole({
    profileId: profile.id,
    roleNames: ["superadmin", "owner"],
    relation: "OR",
  });

  // companies may already have projects/count if you want, but for now just pass as is
  // projects is already filtered for active projects

  return (
    <div className="container mx-auto py-8">
      <CompanyTable companies={companies} isAdmin={isAdmin} />
      <div className="mt-12">
        <ActiveProjectsTable projects={projects} />
      </div>
    </div>
  );
}
