import type { SupabaseClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import type { AppRole } from "@/lib/auth/roles";

type Client = SupabaseClient<Database>;

export type VisitDetailData = {
  visit: Database["public"]["Tables"]["visits"]["Row"];
  household: Database["public"]["Tables"]["households"]["Row"];
  elder: Database["public"]["Tables"]["elders"]["Row"] | null;
  professional: {
    id: string;
    name: string;
    discipline: string;
  } | null;
  report: Database["public"]["Tables"]["visit_reports"]["Row"] | null;
  incidents: Array<Database["public"]["Tables"]["incidents"]["Row"]>;
  carePlan: Database["public"]["Tables"]["care_plans"]["Row"] | null;
  professionals: Array<{ id: string; name: string; discipline: string }>;
};

export async function getVisitDetail(
  supabase: Client,
  visitId: string,
  role: AppRole,
): Promise<VisitDetailData | null> {
  const { data: visit, error } = await supabase
    .from("visits")
    .select("*")
    .eq("id", visitId)
    .maybeSingle();

  if (error || !visit) return null;

  const [householdResult, elderResult, professionalProfileResult, professionalResult, reportResult, incidentsResult, carePlanResult] =
    await Promise.all([
      supabase.from("households").select("*").eq("id", visit.household_id).single(),
      visit.elder_id
        ? supabase.from("elders").select("*").eq("id", visit.elder_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      visit.professional_id
        ? supabase.from("profiles").select("full_name").eq("id", visit.professional_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      visit.professional_id
        ? supabase
            .from("professionals")
            .select("discipline")
            .eq("id", visit.professional_id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      supabase.from("visit_reports").select("*").eq("visit_id", visit.id).maybeSingle(),
      supabase
        .from("incidents")
        .select("*")
        .eq("visit_id", visit.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("care_plans")
        .select("*")
        .eq("household_id", visit.household_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  if (!householdResult.data) return null;

  let professionals: Array<{ id: string; name: string; discipline: string }> = [];

  if (role === "coordinator" || role === "admin") {
    const [professionalsResult, profilesResult] = await Promise.all([
      supabase.from("professionals").select("id, discipline").order("discipline"),
      supabase.from("profiles").select("id, full_name"),
    ]);

    const names = new Map((profilesResult.data ?? []).map((profile) => [profile.id, profile.full_name]));
    professionals = (professionalsResult.data ?? []).map((professional) => ({
      id: professional.id,
      name: names.get(professional.id) ?? "Profesional",
      discipline: professional.discipline,
    }));
  }

  return {
    visit,
    household: householdResult.data,
    elder: elderResult.data ?? null,
    professional: visit.professional_id
      ? {
          id: visit.professional_id,
          name: professionalProfileResult.data?.full_name ?? "Profesional",
          discipline: professionalResult.data?.discipline ?? visit.discipline,
        }
      : null,
    report: reportResult.data ?? null,
    incidents: incidentsResult.data ?? [],
    carePlan: carePlanResult.data ?? null,
    professionals,
  };
}

export async function getVisitDetailCached(visitId: string, role: AppRole) {
  "use cache: private";
  cacheLife({ stale: 300, revalidate: 60, expire: 600 });
  cacheTag("visit-detail");
  const supabase = await createClient();
  return getVisitDetail(supabase, visitId, role);
}
