export type PlanId = "esencial" | "integral" | "premium";

export type PlanVisits = {
  kinesiologia: number;
  nutricion: number;
  enfermeria: number;
  aseo: number;
};

export type Plan = {
  id: PlanId;
  name: string;
  price: number;
  description: string;
  tagline: string;
  visits: PlanVisits;
  features: string[];
  popular?: boolean;
};

export const plans: Plan[] = [
  {
    id: "esencial",
    name: "Esencial",
    price: 99000,
    tagline: "La entrada más accesible",
    description: "Acompañamiento preventivo y control básico en casa.",
    visits: { kinesiologia: 2, nutricion: 0, enfermeria: 1, aseo: 0 },
    features: [
      "2 visitas de kinesiología",
      "1 visita de enfermería",
      "Evaluación funcional inicial",
      "Agenda, notas y seguimiento",
      "Coordinación incluida",
    ],
  },
  {
    id: "integral",
    name: "Integral",
    price: 236000,
    tagline: "El más completo para el día a día",
    description: "Cobertura multidisciplinaria para un cuidado coordinado.",
    visits: { kinesiologia: 4, nutricion: 1, enfermeria: 2, aseo: 1 },
    features: [
      "4 visitas de kinesiología",
      "1 visita de nutrición",
      "2 visitas de enfermería",
      "1 visita de aseo especializado",
      "Plan de cuidados y reportes",
      "Chat con coordinación",
    ],
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: 372000,
    tagline: "Para pacientes de alta demanda",
    description: "Mayor frecuencia para post-operados o crónicos.",
    visits: { kinesiologia: 6, nutricion: 2, enfermeria: 3, aseo: 2 },
    features: [
      "6 visitas de kinesiología",
      "2 visitas de nutrición",
      "3 visitas de enfermería",
      "2 visitas de aseo especializado",
      "Coordinación dedicada",
      "Reportes ampliados",
    ],
  },
];

export const planById = Object.fromEntries(
  plans.map((plan) => [plan.id, plan]),
) as Record<PlanId, Plan>;

export const marketPrices: Record<keyof PlanVisits, number> = {
  kinesiologia: 25000,
  nutricion: 30000,
  enfermeria: 30000,
  aseo: 35000,
};

export const extraPrices: Record<keyof PlanVisits, number> = {
  kinesiologia: 24000,
  nutricion: 30000,
  enfermeria: 27000,
  aseo: 27000,
};

export function planVisitsTotal(plan: Plan) {
  return Object.values(plan.visits).reduce((total, value) => total + value, 0);
}
