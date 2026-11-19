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

export const demoSlots: DemoSlot[] = [
  {
    id: "manana",
    day: "Mañana",
    date: "20 nov",
    time: "10:00",
    coordinator: "Valentina Soto",
  },
  {
    id: "jueves",
    day: "Jueves",
    date: "21 nov",
    time: "15:30",
    coordinator: "Valentina Soto",
  },
  {
    id: "viernes",
    day: "Viernes",
    date: "22 nov",
    time: "09:00",
    coordinator: "Valentina Soto",
  },
];

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
