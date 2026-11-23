import { disciplineMeta, type Discipline } from "@/lib/mock-data";
import type { Plan, PlanVisits } from "@/lib/plans";

export type DemoContact = {
  patientName: string;
  familyName: string;
  email: string;
  phone: string;
  comuna: string;
  address: string;
};

export type DemoSurvey = {
  mobility: string;
  memory: string;
  medication: string;
  mood: string;
  concerns: string[];
};

export type DemoSlot = {
  id: string;
  day: string;
  date: string;
  time: string;
  coordinator: string;
};

export type DemoAllocation = PlanVisits;

export const defaultContact: DemoContact = {
  patientName: "Elena Rojas",
  familyName: "Carolina Rojas",
  email: "carolina@correo.cl",
  phone: "+56 9 8765 4321",
  comuna: "Puerto Montt",
  address: "Villa Los Volcanes 123, Puerto Montt",
};

export const defaultSurvey: DemoSurvey = {
  mobility: "Con apoyo",
  memory: "Olvidos ocasionales",
  medication: "Todos los días",
  mood: "Variable",
  concerns: ["Movilidad", "Medicación"],
};

export function createDemoSlots(now = new Date()): DemoSlot[] {
  const today = new Date(now);
  today.setHours(12, 0, 0, 0);

  const weekday = new Intl.DateTimeFormat("es-CL", { weekday: "long" });
  const shortDate = new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "short",
  });

  return [
    { id: "manana", businessDays: 1, time: "10:00" },
    { id: "siguiente", businessDays: 3, time: "15:30" },
    { id: "ultimo", businessDays: 4, time: "09:00" },
  ].map(({ id, businessDays, time }) => {
    const date = addBusinessDays(today, businessDays);
    const diffDays = Math.round(
      (date.getTime() - today.getTime()) / 86_400_000,
    );
    const day =
      diffDays === 1
        ? "Mañana"
        : weekday
            .format(date)
            .replace(/^./, (letter) => letter.toUpperCase());

    return {
      id,
      day,
      date: shortDate.format(date).replace(/\.$/, ""),
      time,
      coordinator: "Valentina Soto",
    };
  });
}

function addBusinessDays(start: Date, days: number) {
  const date = new Date(start);
  let added = 0;

  while (added < days) {
    date.setDate(date.getDate() + 1);
    const weekday = date.getDay();
    if (weekday !== 0 && weekday !== 6) added += 1;
  }

  return date;
}

export const disciplineOrder: Discipline[] = [
  "kinesiologia",
  "nutricion",
  "enfermeria",
  "aseo",
];

export const professionalByDiscipline: Record<
  Discipline,
  { name: string; role: string }
> = {
  kinesiologia: { name: "Diego Pérez", role: "Kinesiólogo/a" },
  nutricion: { name: "Camila Muñoz", role: "Nutricionista" },
  enfermeria: { name: "Andrea Silva", role: "Enfermero/a" },
  aseo: { name: "Paula Díaz", role: "Aseo especializado" },
};

export function recommendAllocation(
  plan: Plan,
  survey: DemoSurvey,
): DemoAllocation {
  const allocation = { ...plan.visits };

  // La propuesta siempre usa el total de visitas del plan.
  // Las visitas que no calzan con la encuesta se redistribuyen.
  if (!survey.concerns.includes("Alimentación") && allocation.nutricion > 0) {
    allocation.enfermeria += allocation.nutricion;
    allocation.nutricion = 0;
  }

  if (!survey.concerns.includes("Aseo") && allocation.aseo > 0) {
    allocation.kinesiologia += allocation.aseo;
    allocation.aseo = 0;
  }

  if (survey.medication === "No necesita ayuda" && allocation.enfermeria > 0) {
    allocation.kinesiologia += 1;
    allocation.enfermeria -= 1;
  }

  return allocation;
}

export function buildDemoGoals(survey: DemoSurvey) {
  const goals = [
    survey.concerns.includes("Movilidad") && "Mejorar movilidad y seguridad",
    survey.medication !== "No necesita ayuda" && "Ordenar la medicación",
    survey.concerns.includes("Alimentación") && "Mejorar alimentación e hidratación",
    survey.concerns.includes("Aseo") && "Mantener un hogar seguro",
  ].filter(Boolean) as string[];

  return goals.length > 0
    ? goals
    : ["Mantener el bienestar y la autonomía"];
}

export function buildDemoFrequency(allocation: DemoAllocation) {
  const parts = disciplineOrder
    .filter((discipline) => allocation[discipline] > 0)
    .map(
      (discipline) =>
        `${disciplineMeta[discipline].label}: ${allocation[discipline]} visita${
          allocation[discipline] === 1 ? "" : "s"
        }/mes`,
    );

  return parts.join(" · ");
}
