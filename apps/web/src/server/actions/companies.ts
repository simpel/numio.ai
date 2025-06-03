"use server";
import { createClient } from "@/src/supabase/server";
import { isAuthenticated } from "@/src/supabase/helpers/is-authenticated";
import { hasRole } from "@/src/supabase/helpers/has-role";

export async function addCompany(formData: FormData) {
  const profile = await isAuthenticated();
  if (!profile) {
    return {
      success: false,
      error: "You must be logged in to create a company.",
    };
  }
  // Check role
  const hasCorrectRole = await hasRole({
    profileId: profile.id,
    roleNames: ["superadmin", "owner"],
    relation: "OR",
  });

  if (!hasCorrectRole) {
    return {
      success: false,
      error: "You do not have permission to create a company.",
    };
  }
  const name = formData.get("name") as string;
  if (!name) {
    return { success: false, error: "Company name is required" };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .insert({ name })
    .select()
    .single();
  if (error) {
    return {
      error: "We're sorry, something went wrong when creating the company!",
      success: false,
    };
  }
  // Associate the profile with the new company
  const { error: associationError } = await supabase
    .from("profile_companies")
    .insert({ profile_id: profile.id, company_id: data.id });
  if (associationError) {
    return {
      error: "Company created, but failed to associate profile with company.",
      success: false,
    };
  }
  return { success: true, data };
}

export interface AddCompanyMemberProps {
  profileId: number;
  companyIds: number[];
}

export async function addCompanyMember({
  profileId,
  companyIds,
}: AddCompanyMemberProps) {
  // Only allow admins to add members
  const adminProfile = await isAuthenticated({ roles: ["admin"] });
  if (!adminProfile) {
    return {
      success: false,
      error: "You must be an admin to add company members.",
    };
  }
  const supabase = await createClient();
  if (!profileId || !Array.isArray(companyIds) || companyIds.length === 0) {
    return { success: false, error: "profileId and companyIds are required" };
  }
  const inserts = companyIds.map((companyId) => ({
    profile_id: profileId,
    company_id: companyId,
  }));
  const { error } = await supabase
    .from("profile_companies")
    .upsert(inserts, { onConflict: "profile_id,company_id" });
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}
