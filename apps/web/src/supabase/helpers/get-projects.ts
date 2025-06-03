import { createClient } from "@/src/supabase/server";

export interface GetProjectsProps {
  companyId?: number;
  profileId?: number;
  includeAll?: boolean;
}

export async function getProjects({
  companyId,
  profileId,
  includeAll = false,
}: GetProjectsProps = {}) {
  // Return empty if neither companyId nor profileId is provided
  if (companyId === undefined && profileId === undefined) {
    return [];
  }
  const supabase = await createClient();
  let query = supabase
    .from("projects")
    .select("id, name, company_id, finished_at");

  if (companyId !== undefined) {
    query = query.eq("company_id", companyId);
  }

  if (profileId !== undefined) {
    // Get project ids for this profile
    const { data: projectProfiles } = await supabase
      .from("project_profiles")
      .select("project_id")
      .eq("profile_id", profileId);
    const projectIds = projectProfiles?.map((pp) => pp.project_id) || [];
    if (projectIds.length > 0) {
      query = query.in("id", projectIds);
    } else {
      return [];
    }
  }

  if (!includeAll) {
    query = query.is("finished_at", null);
  }

  const { data: projects, error } = await query;
  if (error || !projects) return [];
  return projects;
}
