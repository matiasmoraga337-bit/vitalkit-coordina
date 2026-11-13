import type { SupabaseClient } from "@supabase/supabase-js";
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
      supabase.from("professionals").select("id, discipline"),
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
