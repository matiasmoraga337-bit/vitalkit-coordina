import type { SupabaseClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import type { Discipline, VisitStatus } from "@/lib/mock-data";
import { formatVisitDate, formatVisitTime } from "@/lib/format";

type Client = SupabaseClient<Database>;

export type ProfessionalVisit = {
  id: string;
  household: string;
  patient: string;
  discipline: Discipline;
  date: string;
  time: string;
  address: string;
  status: VisitStatus;
};

export type ProfessionalAgenda = {
  discipline: Discipline;
  stats: {
    visitsToday: number;
    completedToday: number;
  };
  visits: ProfessionalVisit[];
  currentVisit: ProfessionalVisit | null;
};

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export async function getProfessionalAgenda(
  supabase: Client,
  professionalId: string,
): Promise<ProfessionalAgenda> {
  const { data: visits } = await supabase
    .from("visits")
    .select("*")
    .eq("professional_id", professionalId)
    .order("scheduled_at", { ascending: true });

  const rows = visits ?? [];
  const householdIds = [...new Set(rows.map((visit) => visit.household_id))];
  const elderIds = [
    ...new Set(rows.map((visit) => visit.elder_id).filter(Boolean)),
  ] as string[];

  const [householdsResult, eldersResult, professionalResult] = await Promise.all([
    householdIds.length
      ? supabase.from("households").select("id, name, address").in("id", householdIds)
      : Promise.resolve({ data: [], error: null }),
    elderIds.length
      ? supabase.from("elders").select("id, full_name").in("id", elderIds)
      : Promise.resolve({ data: [], error: null }),
    supabase.from("professionals").select("discipline").eq("id", professionalId).maybeSingle(),
  ]);

  const householdById = new Map(
    (householdsResult.data ?? []).map((household) => [household.id, household]),
  );
  const elderById = new Map(
    (eldersResult.data ?? []).map((elder) => [elder.id, elder.full_name]),
  );

  const now = new Date();

  const mappedVisits: ProfessionalVisit[] = rows
    .filter((visit) => visit.status !== "cancelled")
    .map((visit) => {
      const household = householdById.get(visit.household_id);
      return {
        id: visit.id,
        household: household?.name ?? "Hogar",
        patient: visit.elder_id ? (elderById.get(visit.elder_id) ?? "Persona mayor") : "Persona mayor",
        discipline: visit.discipline as Discipline,
        date: formatVisitDate(visit.scheduled_at),
        time: formatVisitTime(visit.scheduled_at),
        address: visit.address ?? household?.address ?? "Puerto Montt",
        status: visit.status as VisitStatus,
      };
    });

  const visitsToday = rows.filter(
    (visit) =>
      visit.status !== "cancelled" &&
      isSameDay(new Date(visit.scheduled_at), now),
  ).length;

  const completedToday = rows.filter(
    (visit) =>
      visit.status === "completed" &&
      isSameDay(new Date(visit.scheduled_at), now),
  ).length;

  const currentVisit =
    mappedVisits.find(
      (visit) => visit.status === "confirmed" || visit.status === "in_progress",
    ) ??
    mappedVisits.find((visit) => visit.status === "scheduled") ??
    null;

  return {
    discipline: (professionalResult.data?.discipline ?? "kinesiologia") as Discipline,
    stats: { visitsToday, completedToday },
    visits: mappedVisits,
    currentVisit,
  };
}

export type ProfessionalAvailabilityBlock = {
  weekday: number;
  startTime: string;
  endTime: string;
  active: boolean;
};

export async function getProfessionalAvailability(
  supabase: Client,
  professionalId: string,
): Promise<ProfessionalAvailabilityBlock[]> {
  const { data } = await supabase
    .from("availability")
    .select("*")
    .eq("professional_id", professionalId)
    .order("weekday", { ascending: true });

  return (data ?? []).map((block) => ({
    weekday: block.weekday,
    startTime: block.start_time,
    endTime: block.end_time,
    active: block.active,
  }));
}

export async function getProfessionalAgendaCached(professionalId: string) {
  "use cache: private";
  cacheLife({ stale: 300, revalidate: 60, expire: 600 });
  cacheTag("professional-agenda");
  const supabase = await createClient();
  return getProfessionalAgenda(supabase, professionalId);
}

export async function getProfessionalAvailabilityCached(professionalId: string) {
  "use cache: private";
  cacheLife({ stale: 300, revalidate: 60, expire: 600 });
  cacheTag("professional-availability");
  const supabase = await createClient();
  return getProfessionalAvailability(supabase, professionalId);
}
