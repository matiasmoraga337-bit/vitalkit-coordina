import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { Discipline, RequestStatus, VisitStatus } from "@/lib/mock-data";
import {
  ageFromBirthDate,
  formatRelativeDate,
  formatVisitDate,
  formatVisitTime,
} from "@/lib/format";

type Client = SupabaseClient<Database>;

const professionalRole: Record<Discipline, string> = {
  kinesiologia: "Kinesiólogo/a",
  nutricion: "Nutricionista",
  enfermeria: "Enfermero/a",
  aseo: "Aseo especializado",
};

export type FamilyVisit = {
  id: string;
  discipline: Discipline;
  professional: string;
  professionalRole: string;
  date: string;
  time: string;
  status: VisitStatus;
  note?: string;
};

export type FamilyRequest = {
  id: string;
  discipline: Discipline;
  requestedBy: string;
  date: string;
  status: RequestStatus;
  reason: string;
};

export type FamilyDashboard = {
  household: {
    familyName: string;
    contactName: string;
    elderName: string;
    elderAge: number | null;
    comuna: string;
    plan: string;
    planPrice: number;
    coordinator: string;
    startDate: string;
    address: string;
  };
  visits: FamilyVisit[];
  requests: FamilyRequest[];
  carePlan: {
    goals: string[];
    frequency: string;
    recommendations: string[];
    nextReview: string;
  } | null;
  stats: {
    visitsThisMonth: number;
    upcoming: number;
    pendingRequests: number;
    planVisits: number;
  };
};

export async function getFamilyDashboard(
  supabase: Client,
  profileId: string,
  contactName: string,
): Promise<FamilyDashboard | null> {
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("profile_id", profileId)
    .limit(1)
    .maybeSingle();

  if (!membership) return null;

  const { data: household, error: householdError } = await supabase
    .from("households")
    .select("*")
    .eq("id", membership.household_id)
    .single();

  if (householdError || !household) return null;

  const [planResult, coordinatorResult, elderResult, subscriptionResult, visitsResult, carePlanResult, requestsResult] =
    await Promise.all([
      household.plan_id
        ? supabase.from("plans").select("*").eq("id", household.plan_id).single()
        : Promise.resolve({ data: null, error: null }),
      household.coordinator_id
        ? supabase
            .from("profiles")
            .select("full_name")
            .eq("id", household.coordinator_id)
            .single()
        : Promise.resolve({ data: null, error: null }),
      supabase
        .from("elders")
        .select("*")
        .eq("household_id", household.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("subscriptions")
        .select("*")
        .eq("household_id", household.id)
        .order("start_date", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("visits")
        .select("*")
        .eq("household_id", household.id)
        .order("scheduled_at", { ascending: true }),
      supabase
        .from("care_plans")
        .select("*")
        .eq("household_id", household.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("requests")
        .select("*")
        .eq("household_id", household.id)
        .order("created_at", { ascending: false }),
    ]);

  const plan = planResult.data;
  const coordinator = coordinatorResult.data;
  const elder = elderResult.data;
  const subscription = subscriptionResult.data;
  const visits = visitsResult.data ?? [];
  const carePlan = carePlanResult.data;
  const requests = requestsResult.data ?? [];

  const professionalIds = [
    ...new Set(visits.map((visit) => visit.professional_id).filter(Boolean)),
  ] as string[];

  const completedVisitIds = visits
    .filter((visit) => visit.status === "completed")
    .map((visit) => visit.id);

  const [professionalProfilesResult, professionalDisciplinesResult, reportsResult] =
    await Promise.all([
      professionalIds.length
        ? supabase.from("profiles").select("id, full_name").in("id", professionalIds)
        : Promise.resolve({ data: [], error: null }),
      professionalIds.length
        ? supabase.from("professionals").select("id, discipline").in("id", professionalIds)
        : Promise.resolve({ data: [], error: null }),
      completedVisitIds.length
        ? supabase
            .from("visit_reports")
            .select("*")
            .in("visit_id", completedVisitIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

  const professionalNames = new Map(
    (professionalProfilesResult.data ?? []).map((item) => [item.id, item.full_name]),
  );
  const professionalDisciplines = new Map(
    (professionalDisciplinesResult.data ?? []).map((item) => [item.id, item.discipline]),
  );
  const reportsByVisit = new Map(
    (reportsResult.data ?? []).map((report) => [report.visit_id, report]),
  );

  const mappedVisits: FamilyVisit[] = visits.map((visit) => {
    const discipline = (professionalDisciplines.get(visit.professional_id ?? "") ??
      visit.discipline) as Discipline;
    const report = reportsByVisit.get(visit.id);

    return {
      id: visit.id,
      discipline,
      professional: professionalNames.get(visit.professional_id ?? "") ?? "Profesional asignado",
      professionalRole: professionalRole[discipline],
      date: formatVisitDate(visit.scheduled_at),
      time: formatVisitTime(visit.scheduled_at),
      status: visit.status as VisitStatus,
      note: report?.summary,
    };
  });

  const mappedRequests: FamilyRequest[] = requests.map((request) => ({
    id: request.id,
    discipline: request.discipline as Discipline,
    requestedBy: contactName,
    date: formatRelativeDate(request.created_at),
    status: request.status as RequestStatus,
    reason: request.reason,
  }));

  const now = new Date();
  const planVisits = plan?.visits
    ? Object.values(plan.visits as Record<string, number>).reduce(
        (total, value) => total + Number(value ?? 0),
        0,
      )
    : 0;

  const visitsThisMonth = visits.filter((visit) => {
    const date = new Date(visit.scheduled_at);
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear() &&
      visit.status !== "cancelled"
    );
  }).length;

  return {
    household: {
      familyName: household.name,
      contactName,
      elderName: elder?.full_name ?? "Persona mayor",
      elderAge: ageFromBirthDate(elder?.birth_date ?? null),
      comuna: household.comuna,
      plan: plan?.name ?? "Sin plan",
      planPrice: plan?.price_clp ?? 0,
      coordinator: coordinator?.full_name ?? "Sin coordinador",
      startDate: subscription?.start_date ?? "",
      address: household.address ?? household.comuna,
    },
    visits: mappedVisits,
    requests: mappedRequests,
    carePlan: carePlan
      ? {
          goals: carePlan.goals ?? [],
          frequency: carePlan.frequency ?? "",
          recommendations: carePlan.recommendations ?? [],
          nextReview: carePlan.next_review ? formatVisitDate(carePlan.next_review) : "",
        }
      : null,
    stats: {
      visitsThisMonth,
      upcoming: visits.filter(
        (visit) =>
          new Date(visit.scheduled_at) >= now &&
          (visit.status === "scheduled" || visit.status === "confirmed"),
      ).length,
      pendingRequests: requests.filter((request) => request.status === "pending").length,
      planVisits,
    },
  };
}
