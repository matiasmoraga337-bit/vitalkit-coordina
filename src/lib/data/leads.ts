import type { SupabaseClient } from "@supabase/supabase-js";
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
