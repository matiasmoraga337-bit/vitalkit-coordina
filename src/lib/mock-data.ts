export type Role = "family" | "coordinator" | "professional";

export type Discipline = "kinesiologia" | "nutricion" | "enfermeria" | "aseo";

export type VisitStatus =
  | "scheduled"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export type RequestStatus = "pending" | "approved" | "rejected";

export const disciplineMeta: Record<
  Discipline,
  { label: string; short: string; className: string; dot: string }
> = {
  kinesiologia: {
    label: "Kinesiología",
    short: "Kine",
    className: "bg-kine/10 text-kine",
    dot: "bg-kine",
  },
  nutricion: {
    label: "Nutrición",
    short: "Nutri",
    className: "bg-nutri/10 text-nutri",
    dot: "bg-nutri",
  },
  enfermeria: {
    label: "Enfermería",
    short: "Enfermería",
    className: "bg-nurse/10 text-nurse",
    dot: "bg-nurse",
  },
  aseo: {
    label: "Aseo",
    short: "Aseo",
    className: "bg-cleaner/10 text-cleaner",
    dot: "bg-cleaner",
  },
};

export const visitStatusMeta: Record<
  VisitStatus,
  { label: string; className: string }
> = {
  scheduled: { label: "Agendada", className: "bg-muted text-muted-foreground" },
  confirmed: {
    label: "Confirmada",
    className: "bg-sky-100 text-sky-800",
  },
  in_progress: {
    label: "En curso",
    className: "bg-amber-100 text-amber-800",
  },
  completed: {
    label: "Completada",
    className: "bg-emerald-100 text-emerald-800",
  },
  cancelled: {
    label: "Cancelada",
    className: "bg-red-100 text-red-800",
  },
};

export const requestStatusMeta: Record<
  RequestStatus,
  { label: string; className: string }
> = {
  pending: { label: "Pendiente", className: "bg-amber-100 text-amber-800" },
  approved: {
    label: "Aprobada",
    className: "bg-emerald-100 text-emerald-800",
  },
  rejected: { label: "Rechazada", className: "bg-red-100 text-red-800" },
};

export const demoHousehold = {
  familyName: "Familia Rojas",
  contactName: "Carolina Rojas",
  elderName: "Elena Rojas",
  elderAge: 78,
  comuna: "Puerto Montt",
  plan: "Integral",
  planPrice: 236000,
  coordinator: "Valentina Soto",
  startDate: "2026-10-01",
  address: "Villa Los Volcanes, Puerto Montt",
};

export const demoVisits: Array<{
  id: string;
  discipline: Discipline;
  professional: string;
  professionalRole: string;
  date: string;
  time: string;
  status: VisitStatus;
  note?: string;
}> = [
  {
    id: "visit-001",
    discipline: "kinesiologia",
    professional: "Diego Pérez",
    professionalRole: "Kinesiólogo",
    date: "Vie 14 nov",
    time: "10:30",
    status: "confirmed",
  },
  {
    id: "visit-002",
    discipline: "enfermeria",
    professional: "Andrea Silva",
    professionalRole: "Enfermera",
    date: "Lun 17 nov",
    time: "09:00",
    status: "scheduled",
  },
  {
    id: "visit-003",
    discipline: "nutricion",
    professional: "Camila Muñoz",
    professionalRole: "Nutricionista",
    date: "Mié 19 nov",
    time: "11:00",
    status: "scheduled",
  },
  {
    id: "visit-004",
    discipline: "aseo",
    professional: "Paula Díaz",
    professionalRole: "Aseo especializado",
    date: "Vie 21 nov",
    time: "15:00",
    status: "scheduled",
  },
  {
    id: "visit-005",
    discipline: "kinesiologia",
    professional: "Diego Pérez",
    professionalRole: "Kinesiólogo",
    date: "Vie 7 nov",
    time: "10:30",
    status: "completed",
    note: "Elena completó la rutina de movilidad sin dolor. Se ajustaron dos ejercicios para la semana.",
  },
];

export const demoRequests: Array<{
  id: string;
  discipline: Discipline;
  requestedBy: string;
  date: string;
  status: RequestStatus;
  reason: string;
}> = [
  {
    id: "request-001",
    discipline: "kinesiologia",
    requestedBy: "Carolina Rojas",
    date: "Hoy, 09:12",
    status: "pending",
    reason: "Elena tuvo más dolor de lo habitual en la rodilla derecha.",
  },
  {
    id: "request-002",
    discipline: "enfermeria",
    requestedBy: "Carolina Rojas",
    date: "Ayer, 18:40",
    status: "approved",
    reason: "Control de presión y curaciones.",
  },
];

export const demoCarePlan = {
  goals: [
    "Recuperar movilidad de rodilla derecha después de la cirugía.",
    "Mantener presión arterial estable y controlar la medicación.",
    "Mejorar la alimentación y la hidratación diaria.",
  ],
  frequency: "Kinesiología 2 veces por semana · Enfermería semanal · Nutrición quincenal",
  nextReview: "Vie 21 nov",
  recommendations: [
    "Caminar 10 minutos dentro de casa, con apoyo, dos veces al día.",
    "Registrar presión arterial tres veces por semana.",
    "Evitar escaleras sin acompañamiento.",
  ],
};

export const demoCoordinatorStats = {
  visitsToday: 5,
  unassigned: 1,
  pendingRequests: 2,
  activeHouseholds: 14,
};

export const demoProfessionalAgenda = [
  {
    id: "pro-001",
    household: "Familia Rojas",
    patient: "Elena Rojas",
    discipline: "kinesiologia" as Discipline,
    date: "Hoy",
    time: "10:30",
    address: "Villa Los Volcanes, Puerto Montt",
    status: "confirmed" as VisitStatus,
  },
  {
    id: "pro-002",
    household: "Familia Pérez",
    patient: "Hugo Pérez",
    discipline: "kinesiologia" as Discipline,
    date: "Hoy",
    time: "12:00",
    address: "Alerce, Puerto Montt",
    status: "scheduled" as VisitStatus,
  },
  {
    id: "pro-003",
    household: "Familia Silva",
    patient: "Marta Silva",
    discipline: "kinesiologia" as Discipline,
    date: "Mañana",
    time: "09:00",
    address: "Centro, Puerto Montt",
    status: "scheduled" as VisitStatus,
  },
];
