import {
  getCompanies,
  GetCompaniesProps,
} from "@/src/supabase/helpers/get-companies";
import { isAuthenticated } from "@/src/supabase/helpers/is-authenticated";
import {
  getProjects,
  GetProjectsProps,
} from "@/src/supabase/helpers/get-projects";

export interface GetProfileProps {
  withCompanies?: GetCompaniesProps;
  withProjects?: GetProjectsProps;
}

export async function getProfile({
  withCompanies,
  withProjects,
}: GetProfileProps = {}) {
  const profile = await isAuthenticated();

  let companies: any[] = [];
  if (withCompanies) {
    companies = await getCompanies(withCompanies);
  }

  let projects: any[] = [];
  if (withProjects) {
    projects = await getProjects({ profileId: profile.id, ...withProjects });
  }

  return { profile, companies, projects };
}
