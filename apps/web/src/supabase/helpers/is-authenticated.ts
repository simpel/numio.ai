import { createClient } from "@/src/supabase/server";
import { hasRole } from "@/src/supabase/helpers/has-role";
import { redirect } from "next/navigation";
import { Database } from "@/src/types/supabase";

/**
 * Options for the isAuthenticated function.
 * @property {string} [next] - The URL to redirect to after successful authentication.
 * @property {Database["public"]["Enums"]["role"][]} [roles] - Array of roles required for access.
 */
interface IsAuthenticatedOptions {
  next?: string;
  roles?: Database["public"]["Enums"]["roles"][];
}

/**
 * Checks if the current user is authenticated and optionally has required roles.
 * If not authenticated or missing required roles, redirects to the signin page.
 *
 * @param {IsAuthenticatedOptions} [options] - Options for authentication and role checking.
 * @param {string} [options.next] - The URL to redirect to after successful authentication.
 * @param {Database["public"]["Enums"]["role"][]} [options.roles] - Array of roles required for access.
 * @returns {Promise<Database["public"]["Tables"]["profiles"]["Row"]>} The authenticated user's profile row.
 */
export async function isAuthenticated({
  next,
  roles,
}: IsAuthenticatedOptions = {}): Promise<
  Database["public"]["Tables"]["profiles"]["Row"]
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/signin${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select()
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    redirect(`/signin${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  }
  if (roles && roles.length > 0) {
    if (!profile) {
      redirect(`/signin${next ? `?next=${encodeURIComponent(next)}` : ""}`);
    }
    const hasRoleCheck = await hasRole({
      profileId: profile.id,
      roleNames: roles,
    });
    if (!hasRoleCheck) {
      redirect(`/signin${next ? `?next=${encodeURIComponent(next)}` : ""}`);
    }
  }
  return profile;
}
