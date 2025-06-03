import { createClient } from "@/src/supabase/server";
import { Database } from "@/src/types/supabase";
import { isAuthenticated } from "./is-authenticated";

export interface CheckRoleProps {
  roleNames: Database["public"]["Enums"]["roles"][];
  profileId: Database["public"]["Tables"]["profiles"]["Row"]["id"];
  relation?: "AND" | "OR";
}
export async function hasRole({
  roleNames,
  profileId,
  relation = "AND",
}: CheckRoleProps): Promise<boolean> {
  const profile = await isAuthenticated();

  let profileToCheck: Database["public"]["Tables"]["profiles"]["Row"] | null =
    null;

  if (profileId) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select()
      .eq("id", profileId)
      .single();
    profileToCheck = data;
  } else {
    profileToCheck = profile;
  }

  if (
    !profileToCheck ||
    !profileToCheck.roles ||
    profileToCheck.roles.length === 0
  )
    return false;

  // Check if all roleNames are part of the roles
  if (relation === "AND") {
    return roleNames.every((role) => profileToCheck.roles.includes(role));
  } else {
    return roleNames.some((role) => profileToCheck.roles.includes(role));
  }
}
