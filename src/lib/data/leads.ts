import type { SupabaseClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type Client = SupabaseClient<Database>;

export type Lead = Database["public"]["Tables"]["leads"]["Row"];

export type LeadWithPayment = Lead & {
  paymentStatus: string | null;
  paymentReference: string | null;
  paymentAmount: number | null;
};

export async function getLeads(supabase: Client): Promise<LeadWithPayment[]> {
  const { data } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  const leads = data ?? [];
  if (leads.length === 0) return [];

  const { data: payments } = await supabase
    .from("payments")
    .select("lead_id, status, authorization_code, amount_clp, created_at")
    .in("lead_id", leads.map((lead) => lead.id))
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  const byLead = new Map<string, NonNullable<typeof payments>[number]>();
  for (const payment of payments ?? []) {
    if (payment.lead_id && !byLead.has(payment.lead_id)) {
      byLead.set(payment.lead_id, payment);
    }
  }

  return leads.map((lead) => {
    const payment = byLead.get(lead.id);
    return {
      ...lead,
      paymentStatus: payment?.status ?? null,
      paymentReference: payment?.authorization_code ?? null,
      paymentAmount: payment?.amount_clp ?? null,
    };
  });
}

export async function getLeadsCached() {
  "use cache: private";
  cacheLife({ stale: 300, revalidate: 60, expire: 600 });
  cacheTag("leads");
  const supabase = await createClient();
  return getLeads(supabase);
}
