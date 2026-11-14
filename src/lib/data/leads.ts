import type { SupabaseClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type Client = SupabaseClient<Database>;

export type Lead = Database["public"]["Tables"]["leads"]["Row"];

export async function getLeads(supabase: Client): Promise<Lead[]> {
  const { data } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getLeadsCached() {
  "use cache: private";
  cacheLife({ stale: 300, revalidate: 60, expire: 600 });
  cacheTag("leads");
  const supabase = await createClient();
  return getLeads(supabase);
}
