import type { SupabaseClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import type { Discipline, RequestStatus, VisitStatus } from "@/lib/mock-data";
import { formatRelativeDate, formatVisitDate, formatVisitTime } from "@/lib/format";

type Client = SupabaseClient<Database>;

const professionalRole: Record<Discipline, string> = {
  kinesiologia: "Kinesiología",
  nutricion: "Nutrición",
  enfermeria: "Enfermería",
  aseo: "Aseo",
};

export type CoordinatorVisit = {
  id: string;
  householdId: string;
  time: string;
  date: string;
  professional: string;
  household: string;
  elder: string;
  discipline: Discipline;
  status: VisitStatus;
};

export type CoordinatorRequest = {
  id: string;
  householdId: string;
  type: string;
  discipline: Discipline;
  requestedBy: string;
  date: string;
  status: RequestStatus;
  reason: string;
};

export type CoordinatorProfessional = {
  id: string;
  name: string;
  discipline: Discipline;
  verification: string;
  coverage: string[];
  visitsToday: number;
};

export type CoordinatorDashboard = {
  stats: {
    visitsToday: number;
    pendingVisits: number;
    unassigned: number;
    pendingRequests: number;
    activeHouseholds: number;
  };
  visits: CoordinatorVisit[];
  requests: CoordinatorRequest[];
  professionals: CoordinatorProfessional[];
};

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export async function getCoordinatorDashboard(
  supabase: Client,
): Promise<CoordinatorDashboard> {
  const [householdsResult, visitsResult, requestsResult, profilesResult, professionalsResult, eldersResult] =
    await Promise.all([
      supabase.from("households").select("id, name"),
      supabase.from("visits").select("*").order("scheduled_at", { ascending: true }),
      supabase.from("requests").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name"),
      supabase.from("professionals").select("id, discipline, verification, coverage"),
      supabase.from("elders").select("id, household_id, full_name"),
    ]);

  const households = householdsResult.data ?? [];
  const visits = visitsResult.data ?? [];
  const requests = requestsResult.data ?? [];
  const profiles = profilesResult.data ?? [];
  const professionals = professionalsResult.data ?? [];
  const elders = eldersResult.data ?? [];

  const profileNames = new Map(profiles.map((profile) => [profile.id, profile.full_name]));
  const professionalDisciplines = new Map(
    professionals.map((professional) => [professional.id, professional.discipline]),
  );
  const householdNames = new Map(households.map((household) => [household.id, household.name]));
  const elderNames = new Map(elders.map((elder) => [elder.id, elder.full_name]));

  const now = new Date();

  const mappedVisits: CoordinatorVisit[] = visits
    .filter((visit) => visit.status !== "completed" && visit.status !== "cancelled")
    .map((visit) => ({
      id: visit.id,
      householdId: visit.household_id,
      time: formatVisitTime(visit.scheduled_at),
      date: formatVisitDate(visit.scheduled_at),
      professional: visit.professional_id
        ? (profileNames.get(visit.professional_id) ?? "Sin asignar")
        : "Sin asignar",
      household: householdNames.get(visit.household_id) ?? "Hogar",
      elder: visit.elder_id ? (elderNames.get(visit.elder_id) ?? "Persona mayor") : "Persona mayor",
      discipline: (professionalDisciplines.get(visit.professional_id ?? "") ??
        visit.discipline) as Discipline,
      status: visit.status as VisitStatus,
    }));

  const mappedRequests: CoordinatorRequest[] = requests.map((request) => ({
    id: request.id,
    householdId: request.household_id,
    type: request.type,
    discipline: request.discipline as Discipline,
    requestedBy: request.requested_by
      ? (profileNames.get(request.requested_by) ?? "Familia")
      : "Familia",
    date: formatRelativeDate(request.created_at),
    status: request.status as RequestStatus,
    reason: request.reason,
  }));

  const visitsToday = visits.filter(
    (visit) =>
      visit.status !== "cancelled" &&
      isSameDay(new Date(visit.scheduled_at), now),
  ).length;

  const pendingVisits = visits.filter(
    (visit) => visit.status !== "completed" && visit.status !== "cancelled",
  ).length;

  const unassigned = visits.filter(
    (visit) =>
      !visit.professional_id &&
      visit.status !== "completed" &&
      visit.status !== "cancelled",
  ).length;

  const mappedProfessionals: CoordinatorProfessional[] = professionals.map((professional) => ({
    id: professional.id,
    name: profileNames.get(professional.id) ?? "Profesional",
    discipline: professional.discipline as Discipline,
    verification: professional.verification,
    coverage: professional.coverage,
    visitsToday: visits.filter(
      (visit) =>
        visit.professional_id === professional.id &&
        visit.status !== "cancelled" &&
        isSameDay(new Date(visit.scheduled_at), now),
    ).length,
  }));

  return {
    stats: {
      visitsToday,
      pendingVisits,
      unassigned,
      pendingRequests: requests.filter((request) => request.status === "pending").length,
      activeHouseholds: households.length,
    },
    visits: mappedVisits,
    requests: mappedRequests,
    professionals: mappedProfessionals,
  };
}

export { professionalRole };

export type CoordinatorCaseSummary = {
  id: string;
  name: string;
  comuna: string;
  elder: string;
  plan: string;
  coordinator: string;
  nextVisit: string;
  pendingRequests: number;
};

export async function getCoordinatorCases(supabase: Client): Promise<CoordinatorCaseSummary[]> {
  const [householdsResult, eldersResult, plansResult, profilesResult, visitsResult, requestsResult] =
    await Promise.all([
      supabase.from("households").select("*").order("name"),
      supabase.from("elders").select("*"),
      supabase.from("plans").select("id, name"),
      supabase.from("profiles").select("id, full_name"),
      supabase.from("visits").select("*").order("scheduled_at", { ascending: true }),
      supabase.from("requests").select("id, household_id, status"),
    ]);

  const elderByHousehold = new Map((eldersResult.data ?? []).map((elder) => [elder.household_id, elder.full_name]));
  const planById = new Map((plansResult.data ?? []).map((plan) => [plan.id, plan.name]));
  const profileById = new Map((profilesResult.data ?? []).map((profile) => [profile.id, profile.full_name]));
  const pendingByHousehold = new Map<string, number>();

  for (const request of requestsResult.data ?? []) {
    if (request.status === "pending") {
      pendingByHousehold.set(request.household_id, (pendingByHousehold.get(request.household_id) ?? 0) + 1);
    }
  }

  return (householdsResult.data ?? []).map((household) => {
    const nextVisit = (visitsResult.data ?? []).find(
      (visit) =>
        visit.household_id === household.id &&
        visit.status !== "completed" &&
        visit.status !== "cancelled",
    );

    return {
      id: household.id,
      name: household.name,
      comuna: household.comuna,
      elder: elderByHousehold.get(household.id) ?? "Persona mayor",
      plan: household.plan_id ? (planById.get(household.plan_id) ?? "Sin plan") : "Sin plan",
      coordinator: household.coordinator_id ? (profileById.get(household.coordinator_id) ?? "Sin coordinador") : "Sin coordinador",
      nextVisit: nextVisit ? `${formatVisitDate(nextVisit.scheduled_at)} ? ${formatVisitTime(nextVisit.scheduled_at)}` : "Sin pr?xima visita",
      pendingRequests: pendingByHousehold.get(household.id) ?? 0,
    };
  });
}

export async function getCoordinatorCase(supabase: Client, householdId: string) {
  const dashboard = await getCoordinatorDashboard(supabase);

  const [householdResult, elderResult, subscriptionResult, carePlanResult, incidentsResult, invoicesResult] =
    await Promise.all([
      supabase.from("households").select("*").eq("id", householdId).maybeSingle(),
      supabase.from("elders").select("*").eq("household_id", householdId).limit(1).maybeSingle(),
      supabase.from("subscriptions").select("*").eq("household_id", householdId).order("start_date", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("care_plans").select("*").eq("household_id", householdId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("incidents").select("*").eq("household_id", householdId).order("created_at", { ascending: false }),
      supabase.from("invoices").select("*").eq("household_id", householdId).order("issued_at", { ascending: false }),
    ]);

  if (!householdResult.data) return null;

  const household = householdResult.data;
  const [planResult, coordinatorResult] = await Promise.all([
    household.plan_id ? supabase.from("plans").select("name, price_clp").eq("id", household.plan_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    household.coordinator_id ? supabase.from("profiles").select("full_name").eq("id", household.coordinator_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
  ]);

  return {
    household,
    elder: elderResult.data ?? null,
    plan: planResult.data ?? null,
    coordinator: coordinatorResult.data?.full_name ?? "Sin coordinador",
    subscription: subscriptionResult.data ?? null,
    carePlan: carePlanResult.data ?? null,
    incidents: incidentsResult.data ?? [],
    invoices: invoicesResult.data ?? [],
    visits: dashboard.visits.filter((visit) => visit.householdId === householdId),
    requests: dashboard.requests.filter((request) => request.householdId === householdId),
  };
}

export async function getCoordinatorAvailability(supabase: Client) {
  const { data } = await supabase
    .from("availability")
    .select("*")
    .order("weekday", { ascending: true });

  return data ?? [];
}

export async function getCoordinatorDashboardCached() {
  "use cache: private";
  cacheLife({ stale: 300, revalidate: 60, expire: 600 });
  cacheTag("coordinator-dashboard");
  const supabase = await createClient();
  return getCoordinatorDashboard(supabase);
}

export async function getCoordinatorCaseCached(householdId: string) {
  "use cache: private";
  cacheLife({ stale: 300, revalidate: 60, expire: 600 });
  cacheTag("coordinator-case");
  const supabase = await createClient();
  return getCoordinatorCase(supabase, householdId);
}

export async function getCoordinatorAvailabilityCached() {
  "use cache: private";
  cacheLife({ stale: 300, revalidate: 60, expire: 600 });
  cacheTag("coordinator-availability");
  const supabase = await createClient();
  return getCoordinatorAvailability(supabase);
}

export async function getCoordinatorCasesCached() {
  "use cache: private";
  cacheLife({ stale: 300, revalidate: 60, expire: 600 });
  cacheTag("coordinator-cases");
  const supabase = await createClient();
  return getCoordinatorCases(supabase);
}
