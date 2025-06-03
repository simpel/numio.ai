import { createClient } from "@/src/supabase/server";
import {
  projectCount,
  ProjectCountProps,
} from "@/src/supabase/helpers/project-count";
import { isAuthenticated } from "./is-authenticated";
import { GetProjectsProps, getProjects } from "./get-projects";

export interface GetCompaniesProps {
  withProjects?: GetProjectsProps;
  withCount?: ProjectCountProps;
}

export async function getCompanies({
  withProjects,
  withCount,
}: GetCompaniesProps = {}) {
  const profile = await isAuthenticated();
  const supabase = await createClient();

  // Get companies associated with the profile
  const { data: profileCompanies } = await supabase
    .from("profile_companies")
    .select("company_id")
    .eq("profile_id", profile.id);
  const companyIds =
    profileCompanies?.map((profileCompany) => profileCompany.company_id) || [];

  if (companyIds.length === 0) return [];

  // Get company details
  const { data: companies, error } = await supabase
    .from("companies")
    .select()
    .in("id", companyIds);
  if (error || !companies) return [];

  // For each company, optionally fetch projects and/or count
  const results = await Promise.all(
    companies.map(async (company: { id: number; name: string }) => {
      let projects: any[] = [];
      let projectCountValue: number | undefined = undefined;
      // Handle projects
      if (withProjects) {
        projects = await getProjects({
          ...withProjects,
          companyId: company.id,
        });
      }
      // Handle count
      if (withCount) {
        projectCountValue = await projectCount({
          ...withCount,
          companyId: company.id,
        });
      }
      return {
        ...company,
        ...(withProjects ? { projects } : {}),
        ...(withCount ? { projectCount: projectCountValue } : {}),
      };
    })
  );
  return results;
}
