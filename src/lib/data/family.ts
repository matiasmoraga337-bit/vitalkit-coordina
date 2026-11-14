import type { SupabaseClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
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
  scheduledAt: string;
  date: string;
  time: string;
  status: VisitStatus;
  note?: string;
};

export type FamilyRequest = {
  id: string;
  type: string;
  discipline: Discipline;
  requestedBy: string;
  date: string;
  status: RequestStatus;
  reason: string;
  visitId: string | null;
  visitLabel: string | null;
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

type NestedHousehold = {
  id: string;
  name: string;
  comuna: string;
  address: string | null;
  plan_id: string | null;
  plans: {
    id: string;
    name: string;
    price_clp: number;
    visits: Record<string, number> | null;
  } | null;
  coordinator: { full_name: string } | null;
  elders: Array<{
    id: string;
    full_name: string;
    birth_date: string | null;
  }>;
  subscriptions: Array<{ start_date: string; status: string }>;
  care_plans: Array<{
    goals: string[] | null;
    frequency: string | null;
    recommendations: string[] | null;
    next_review: string | null;
    created_at: string;
  }>;
};

type NestedVisit = {
  id: string;
  discipline: Discipline;
  scheduled_at: string;
  status: VisitStatus;
  professionals: {
    discipline: Discipline | null;
    profiles: { full_name: string } | null;
  } | null;
  visit_reports: { summary: string } | null;
};

export async function getFamilyDashboard(
  supabase: Client,
  profileId: string,
  contactName: string,
): Promise<FamilyDashboard | null> {
  const { data: membership } = await supabase
    .from("household_members")
    .select(
      "household_id, households(*, plans(*), coordinator:profiles!households_coordinator_id_fkey(full_name), elders(*), subscriptions(*), care_plans(*))",
    )
    .eq("profile_id", profileId)
    .limit(1)
    .maybeSingle();

  if (!membership?.households) return null;

  const household = membership.households as unknown as NestedHousehold;

  const [visitsResult, requestsResult] = await Promise.all([
    supabase
      .from("visits")
      .select(
        "*, professionals!visits_professional_id_fkey(id, discipline, profiles!professionals_id_fkey(full_name)), visit_reports(*)",
      )
      .eq("household_id", household.id)
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("requests")
      .select("*")
      .eq("household_id", household.id)
      .order("created_at", { ascending: false }),
  ]);

  const visits = (visitsResult.data ?? []) as unknown as NestedVisit[];
  const requests = requestsResult.data ?? [];

  const elder = [...(household.elders ?? [])].sort((a, b) =>
    a.full_name.localeCompare(b.full_name),
  )[0];
  const subscription = [...(household.subscriptions ?? [])].sort((a, b) =>
    b.start_date.localeCompare(a.start_date),
  )[0];
  const carePlan = [...(household.care_plans ?? [])].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  )[0];
  const plan = household.plans;

  const mappedVisits: FamilyVisit[] = visits.map((visit) => {
    const discipline = (visit.professionals?.discipline ??
      visit.discipline) as Discipline;
    return {
      id: visit.id,
      discipline,
      professional:
        visit.professionals?.profiles?.full_name ?? "Profesional asignado",
      professionalRole: professionalRole[discipline],
      scheduledAt: visit.scheduled_at,
      date: formatVisitDate(visit.scheduled_at),
      time: formatVisitTime(visit.scheduled_at),
      status: visit.status,
      note: visit.visit_reports?.summary,
    };
  });

  const visitLabels = new Map(
    visits.map((visit) => {
      const discipline = (visit.professionals?.discipline ??
        visit.discipline) as Discipline;
      return [
        visit.id,
        `${professionalRole[discipline]} ? ${formatVisitDate(visit.scheduled_at)} ${formatVisitTime(visit.scheduled_at)}`,
      ];
    }),
  );

  const mappedRequests: FamilyRequest[] = requests.map((request) => ({
    id: request.id,
    type: request.type,
    discipline: request.discipline as Discipline,
    requestedBy: contactName,
    date: formatRelativeDate(request.created_at),
    status: request.status as RequestStatus,
    reason: request.reason,
    visitId: request.visit_id,
    visitLabel: request.visit_id ? (visitLabels.get(request.visit_id) ?? null) : null,
  }));

  const now = new Date();
  const planVisits = plan?.visits
    ? Object.values(plan.visits).reduce(
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
      coordinator: household.coordinator?.full_name ?? "Sin coordinador",
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
          nextReview: carePlan.next_review
            ? formatVisitDate(carePlan.next_review)
            : "",
        }
      : null,
    stats: {
      visitsThisMonth,
      upcoming: visits.filter(
        (visit) =>
          new Date(visit.scheduled_at) >= now &&
          (visit.status === "scheduled" || visit.status === "confirmed"),
      ).length,
      pendingRequests: requests.filter((request) => request.status === "pending")
        .length,
      planVisits,
    },
  };
}

export type FamilyInvoice = {
  id: string;
  period: string;
  planAmount: number;
  extrasAmount: number;
  total: number;
  status: string;
  issuedAt: string;
  dueAt: string | null;
};

export async function getFamilyInvoices(
  supabase: Client,
  profileId: string,
): Promise<FamilyInvoice[]> {
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("profile_id", profileId)
    .limit(1)
    .maybeSingle();

  if (!membership) return [];

  const { data } = await supabase
    .from("invoices")
    .select("*")
    .eq("household_id", membership.household_id)
    .order("issued_at", { ascending: false });

  return (data ?? []).map((invoice) => ({
    id: invoice.id,
    period: invoice.period,
    planAmount: invoice.plan_amount_clp,
    extrasAmount: invoice.extras_amount_clp,
    total: invoice.total_clp,
    status: invoice.status,
    issuedAt: invoice.issued_at,
    dueAt: invoice.due_at,
  }));
}

export async function getFamilyDashboardCached(
  profileId: string,
  contactName: string,
) {
  "use cache: private";
  cacheLife({ stale: 300, revalidate: 60, expire: 600 });
  cacheTag("family-dashboard");
  const supabase = await createClient();
  return getFamilyDashboard(supabase, profileId, contactName);
}

export async function getFamilyInvoicesCached(profileId: string) {
  "use cache: private";
  cacheLife({ stale: 300, revalidate: 60, expire: 600 });
  cacheTag("family-invoices");
  const supabase = await createClient();
  return getFamilyInvoices(supabase, profileId);
}
