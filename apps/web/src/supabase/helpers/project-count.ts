import { createClient } from "@/src/supabase/server";
import { Database } from "@/src/types/supabase";

export interface ProjectCountProps {
  companyId: Database["public"]["Tables"]["companies"]["Row"]["id"];
  includeAll?: boolean;
}

export async function projectCount({
  companyId,
  includeAll = false,
}: ProjectCountProps): Promise<number> {
  const supabase = await createClient();
  let query = supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId);
  if (!includeAll) {
    query = query.is("finished_at", null);
  }
  const { count } = await query;
  return count || 0;
}
