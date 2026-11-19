"use client";

import { useState } from "react";
import {
  Apple,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ClipboardList,
  FileText,
  HeartPulse,
  Home,
  Inbox,
  MessageCircle,
  Receipt,
  Send,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { VisitStatusBadge } from "@/components/app/status-badge";
import { CareJourney } from "@/components/family/care-journey";
import { VisitTimeline } from "@/components/family/visit-timeline";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FamilyDashboard, FamilyVisit } from "@/lib/data/family";
import { formatCLP } from "@/lib/format";
import { disciplineMeta, type Discipline, type VisitStatus } from "@/lib/mock-data";
import { planVisitsTotal, type Plan } from "@/lib/plans";
import { cn } from "@/lib/utils";
import {
  buildDemoFrequency,
  buildDemoGoals,
  disciplineOrder,
  professionalByDiscipline,
  type DemoAllocation,
  type DemoContact,
  type DemoSlot,
  type DemoSurvey,
} from "./demo-types";

type Screen = "home" | "calendar" | "messages" | "care" | "visit";
type Message = { from: "coordinator" | "family"; text: string; time: string };

const navItems = [
  { id: "home" as const, label: "Inicio", icon: Home },
  { id: "calendar" as const, label: "Calendario", icon: CalendarDays },
  { id: "messages" as const, label: "Mensajes", icon: MessageCircle },
  { id: "care" as const, label: "Mi cuidado", icon: ClipboardList },
];

const disciplineIcons: Record<
  Discipline,
  React.ComponentType<{ className?: string }>
> = {
  kinesiologia: Stethoscope,
  nutricion: Apple,
  enfermeria: HeartPulse,
  aseo: Sparkles,
};

function buildInitialMessages(patientName: string, familyName: string): Message[] {
  return [
    {
      from: "coordinator",
      text: `Hola ${familyName.split(" ")[0]}, ya recibimos la evaluación de ${patientName}. Te dejé el plan recomendado.`,
      time: "09:12",
    },
    {
      from: "family",
      text: "Gracias, revisé el plan y ajusté una visita.",
      time: "09:18",
    },
    {
      from: "coordinator",
      text: "Perfecto. La primera visita de kinesiología quedó confirmada.",
      time: "09:20",
    },
  ];
}

export function FamilyAppDemo({
  plan,
  allocation,
  contact,
  survey,
  slot,
  onRestart,
}: {
  plan: Plan;
  allocation: DemoAllocation;
  contact: DemoContact;
  survey: DemoSurvey;
  slot: DemoSlot;
  onRestart: () => void;
}) {
  const [screen, setScreen] = useState<Screen>("home");
  const [visitStatus, setVisitStatus] = useState<VisitStatus>("confirmed");
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [visitOrigin, setVisitOrigin] = useState<"home" | "calendar">("home");
  const [messages, setMessages] = useState<Message[]>(() =>
    buildInitialMessages(contact.patientName, contact.familyName),
  );
  const [draft, setDraft] = useState("");

  const visits = buildVisits(allocation, visitStatus, contact);
  const firstVisit = visits[0];
  const selectedVisit =
    visits.find((visit) => visit.id === selectedVisitId) ?? firstVisit;
  const activeNav = screen === "visit" ? visitOrigin : screen;

  const goals = buildDemoGoals(survey);
  const frequency = buildDemoFrequency(allocation);
  const dashboard: FamilyDashboard = {
    household: {
      familyName: contact.familyName,
      contactName: contact.familyName,
      elderName: contact.patientName,
      elderAge: 78,
      comuna: contact.comuna,
      plan: plan.name,
      planPrice: plan.price,
      coordinator: slot.coordinator,
      startDate: "Hoy",
      address: contact.address,
    },
    visits,
    requests: [],
    carePlan: {
      goals,
      frequency,
      recommendations: [
        "Caminar 10 minutos dentro de casa, con apoyo, dos veces al día.",
        "Registrar la presión arterial tres veces por semana.",
        "Mantener los medicamentos ordenados y visibles.",
      ],
      nextReview: "En 7 días",
    },
    stats: {
      visitsThisMonth: visits.filter((visit) => visit.status === "completed").length,
      upcoming: visits.filter((visit) => visit.status !== "completed").length,
      pendingRequests: 0,
      planVisits: planVisitsTotal(plan),
    },
  };

  function openVisit(id: string, origin: "home" | "calendar" = "home") {
    setSelectedVisitId(id);
    setVisitOrigin(origin);
    setScreen("visit");
  }

  function sendMessage() {
    if (!draft.trim()) return;
    setMessages((current) => [
      ...current,
      { from: "family", text: draft.trim(), time: "Ahora" },
    ]);
    setDraft("");
  }

  return (
    <div className="mx-auto flex min-h-[80dvh] w-full max-w-7xl">
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-card lg:flex">
        <div className="border-b px-4 py-4">
          <Logo />
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full">
              Familia
            </Badge>
            <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-wide">
              Demo
            </Badge>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3" aria-label="Navegación familiar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setScreen(item.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <div className="rounded-xl bg-muted/60 p-3">
            <p className="truncate text-sm font-semibold">{contact.familyName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {plan.name} · {contact.patientName}
            </p>
          </div>
          <button
            type="button"
            onClick={onRestart}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mt-2 w-full justify-start")}
          >
            Reiniciar demo
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-2 border-b bg-background px-4 lg:hidden">
          <Logo compact />
          <span className="font-heading text-sm font-bold">VITALKIT</span>
          <Badge variant="outline" className="ml-auto rounded-full text-[10px] uppercase tracking-wide">
            Demo
          </Badge>
        </header>

        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 pb-24 sm:px-6 lg:pb-10">
          {screen === "home" && (
            <HomeScreen
              dashboard={dashboard}
              firstVisit={firstVisit}
              plan={plan}
              allocation={allocation}
              contact={contact}
              onOpenVisit={() => firstVisit && openVisit(firstVisit.id, "home")}
              onGoCare={() => setScreen("care")}
            />
          )}
          {screen === "calendar" && (
            <CalendarScreen
              patientName={contact.patientName}
              visits={visits}
              onOpenVisit={(id) => openVisit(id, "calendar")}
            />
          )}
          {screen === "messages" && (
            <MessagesScreen
              messages={messages}
              draft={draft}
              onDraftChange={setDraft}
              onSend={sendMessage}
            />
          )}
          {screen === "care" && (
            <CareScreen
              plan={plan}
              allocation={allocation}
              goals={goals}
              frequency={frequency}
              contact={contact}
              slot={slot}
              onGoMessages={() => setScreen("messages")}
            />
          )}
          {screen === "visit" && selectedVisit && (
            <VisitScreen
              visit={selectedVisit}
              patientName={contact.patientName}
              address={contact.address}
              isFirst={selectedVisit.id === firstVisit?.id}
              visitStatus={visitStatus}
              onBack={() => setScreen(visitOrigin)}
              onStart={() => setVisitStatus("in_progress")}
              onComplete={() => setVisitStatus("completed")}
            />
          )}
        </main>

        <nav
          className="sticky bottom-0 z-20 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
          aria-label="Navegación familiar"
        >
          <div className="mx-auto grid h-16 max-w-md grid-cols-4 items-center px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setScreen(item.id)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-lg py-1 text-[10px] font-medium",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

function HomeScreen({
  dashboard,
  firstVisit,
  plan,
  allocation,
  contact,
  onOpenVisit,
  onGoCare,
}: {
  dashboard: FamilyDashboard;
  firstVisit?: FamilyVisit;
  plan: Plan;
  allocation: DemoAllocation;
  contact: DemoContact;
  onOpenVisit: () => void;
  onGoCare: () => void;
}) {
  const completed = firstVisit?.status === "completed";
  const totalSelected = disciplineOrder.reduce(
    (total, discipline) => total + allocation[discipline],
    0,
  );

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-muted-foreground">
          Hola, {contact.familyName.split(" ")[0]}
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight">
          Así está el cuidado de {contact.patientName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {plan.name} · {contact.comuna} · Coordinación {dashboard.household.coordinator}
        </p>
      </header>

      <CareJourney data={dashboard} />

      {firstVisit && (
        <div className="rounded-2xl border border-primary/20 bg-card p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "grid size-11 place-items-center rounded-2xl",
                  disciplineMeta[firstVisit.discipline].className,
                )}
              >
                <Stethoscope className="size-5" />
              </span>
              <div>
                <h2 className="font-heading text-xl font-bold">
                  {completed
                    ? "Visita completada"
                    : firstVisit.status === "in_progress"
                      ? "Visita en curso"
                      : `Próxima visita · ${disciplineMeta[firstVisit.discipline].label}`}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {firstVisit.professional} · {firstVisit.professionalRole}
                </p>
              </div>
            </div>
            <VisitStatusBadge status={firstVisit.status} />
          </div>

          <div className="mt-4">
            <VisitTimeline status={firstVisit.status} />
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Fecha y hora</p>
              <p className="mt-1 font-semibold">
                {firstVisit.date} · {firstVisit.time} hrs
              </p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Dirección</p>
              <p className="mt-1 font-semibold">{dashboard.household.address}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenVisit}
            className={cn(buttonVariants(), "mt-4")}
          >
            {completed ? "Ver reporte" : "Ver visita"}
            <ArrowRight className="size-4" />
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border bg-card p-4">
          <h2 className="font-heading text-lg font-bold">Tu plan</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {plan.name} · {formatCLP(plan.price)} / mes
          </p>
          <p className="mt-1 text-sm font-semibold">
            {totalSelected} de {planVisitsTotal(plan)} visitas del mes
          </p>
          <button
            type="button"
            onClick={onGoCare}
            className={cn(buttonVariants({ variant: "outline" }), "mt-3 w-full")}
          >
            Ver mi cuidado
          </button>
        </div>

        <div className="rounded-2xl border bg-card p-4">
          <h2 className="font-heading text-lg font-bold">
            {completed ? "Último reporte" : "Seguimiento"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {completed
              ? `${contact.patientName} completó la rutina de movilidad sin dolor. Se ajustaron dos ejercicios para la semana.`
              : "Cuando se complete la primera visita, aquí verás el reporte y las recomendaciones."}
          </p>
          {completed && (
            <button
              type="button"
              onClick={onOpenVisit}
              className={cn(buttonVariants({ variant: "outline" }), "mt-3 w-full")}
            >
              Ver reporte completo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CalendarScreen({
  patientName,
  visits,
  onOpenVisit,
}: {
  patientName: string;
  visits: FamilyVisit[];
  onOpenVisit: (id: string) => void;
}) {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Calendario</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Las visitas coordinadas para {patientName}, en orden.
        </p>
      </header>

      <div className="space-y-2">
        {visits.map((visit) => {
          const Icon = disciplineIcons[visit.discipline];
          return (
            <button
              key={visit.id}
              type="button"
              onClick={() => onOpenVisit(visit.id)}
              className="flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:bg-muted/40"
            >
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-xl",
                  disciplineMeta[visit.discipline].className,
                )}
              >
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">
                  {disciplineMeta[visit.discipline].label}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {visit.date} · {visit.time} · {visit.professional}
                </span>
              </span>
              <VisitStatusBadge status={visit.status} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MessagesScreen({
  messages,
  draft,
  onDraftChange,
  onSend,
}: {
  messages: Message[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
}) {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Mensajes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Habla con Valentina, tu coordinadora.
        </p>
      </header>

      <div className="space-y-3">
        {messages.map((message, index) => {
          const own = message.from === "family";
          return (
            <div key={`${message.time}-${index}`} className={cn("flex", own ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-6",
                  own
                    ? "bg-primary text-primary-foreground"
                    : "border bg-card text-foreground",
                )}
              >
                <p>{message.text}</p>
                <p className={cn("mt-1 text-[10px]", own ? "text-primary-foreground/70" : "text-muted-foreground")}>
                  {message.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSend();
        }}
        className="flex items-center gap-2"
      >
        <Input
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder="Escribe un mensaje..."
          aria-label="Mensaje para coordinación"
        />
        <button
          type="submit"
          className={cn(buttonVariants({ size: "icon" }))}
          aria-label="Enviar mensaje"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}

function CareScreen({
  plan,
  allocation,
  goals,
  frequency,
  contact,
  slot,
  onGoMessages,
}: {
  plan: Plan;
  allocation: DemoAllocation;
  goals: string[];
  frequency: string;
  contact: DemoContact;
  slot: DemoSlot;
  onGoMessages: () => void;
}) {
  const team = disciplineOrder
    .filter((discipline) => allocation[discipline] > 0)
    .map((discipline) => ({
      discipline,
      ...professionalByDiscipline[discipline],
    }));

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Mi cuidado</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          El plan, el equipo y los accesos de {contact.patientName}.
        </p>
      </header>

      <div className="rounded-2xl border bg-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Plan activo</p>
            <h2 className="mt-1 font-heading text-xl font-bold">
              {plan.name} · {formatCLP(plan.price)} / mes
            </h2>
          </div>
          <Badge className="rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
            Activo
          </Badge>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{frequency}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Evaluación inicial: {slot.day} {slot.date} · {slot.time} hrs
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Próxima revisión: En 7 días
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border bg-card p-4">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
            <ClipboardList className="size-4 text-primary" />
            Objetivos
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
            {goals.map((goal) => (
              <li key={goal} className="flex gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                {goal}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border bg-card p-4">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
            <Users className="size-4 text-primary" />
            Tu equipo
          </h2>
          <div className="mt-3 space-y-2">
            {team.map((member) => (
              <div key={member.discipline} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">
                  {disciplineMeta[member.discipline].label}
                </span>
                <span className="font-medium">{member.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border bg-card p-4">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
            <Receipt className="size-4 text-primary" />
            Factura
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">Noviembre · Plan {plan.name}</p>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="font-semibold">{formatCLP(plan.price)}</span>
            <Badge variant="outline" className="rounded-full">
              Pagada
            </Badge>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
            <Inbox className="size-4 text-primary" />
            Solicitudes
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            No tienes solicitudes pendientes.
          </p>
          <button
            type="button"
            onClick={onGoMessages}
            className={cn(buttonVariants({ variant: "outline" }), "mt-3 w-full")}
          >
            Pedir un cambio
          </button>
        </div>

        <div className="rounded-2xl border bg-card p-4">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
            <MessageCircle className="size-4 text-primary" />
            Coordinación
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            ¿Necesitas cambiar una visita o resolver una duda?
          </p>
          <button
            type="button"
            onClick={onGoMessages}
            className={cn(buttonVariants({ variant: "outline" }), "mt-3 w-full")}
          >
            Hablar con Valentina
          </button>
        </div>
      </div>
    </div>
  );
}

function VisitScreen({
  visit,
  patientName,
  address,
  isFirst,
  visitStatus,
  onBack,
  onStart,
  onComplete,
}: {
  visit: FamilyVisit;
  patientName: string;
  address: string;
  isFirst: boolean;
  visitStatus: VisitStatus;
  onBack: () => void;
  onStart: () => void;
  onComplete: () => void;
}) {
  const status = isFirst ? visitStatus : visit.status;
  const completed = status === "completed";
  const Icon = disciplineIcons[visit.discipline];

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver
      </button>

      <div className="rounded-2xl border bg-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "grid size-11 place-items-center rounded-2xl",
                disciplineMeta[visit.discipline].className,
              )}
            >
              <Icon className="size-5" />
            </span>
            <div>
              <h1 className="font-heading text-xl font-bold">
                {disciplineMeta[visit.discipline].label}
              </h1>
              <p className="text-sm text-muted-foreground">
                {visit.professional} · {visit.professionalRole}
              </p>
            </div>
          </div>
          <VisitStatusBadge status={status} />
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Fecha y hora</p>
            <p className="mt-1 font-semibold">
              {visit.date} · {visit.time} hrs
            </p>
          </div>
          <div className="rounded-xl bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Dirección</p>
            <p className="mt-1 font-semibold">{address}</p>
          </div>
        </div>

        <div className="mt-4">
          <VisitTimeline status={status} />
        </div>
      </div>

      {isFirst && !completed && (
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-sm font-semibold">Control de la demo</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            En la app real, el profesional actualiza el estado de la visita. Aquí
            puedes simular el avance.
          </p>
          <button
            type="button"
            onClick={status === "in_progress" ? onComplete : onStart}
            className={cn(buttonVariants(), "mt-3")}
          >
            {status === "in_progress" ? "Simular fin de visita" : "Simular inicio de visita"}
            <ArrowRight className="size-4" />
          </button>
        </div>
      )}

      {completed && (
        <>
          <div className="rounded-2xl border bg-card p-4">
            <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
              <FileText className="size-4 text-primary" />
              Reporte de la visita
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {patientName} completó la rutina de movilidad sin dolor. Se ajustaron
              dos ejercicios para la semana.
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-4">
            <h2 className="font-heading text-lg font-bold">Seguimiento</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              La coordinación revisará el avance y ajustará el plan. La próxima
              revisión está agendada para dentro de 7 días.
            </p>
            <button
              type="button"
              onClick={onBack}
              className={cn(buttonVariants({ variant: "outline" }), "mt-3")}
            >
              Volver al inicio
            </button>
          </div>
        </>
      )}

      {!isFirst && (
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            Esta visita está agendada. La coordinación confirmará los detalles
            antes de la atención.
          </p>
        </div>
      )}
    </div>
  );
}

function buildVisits(
  allocation: DemoAllocation,
  status: VisitStatus,
  contact: DemoContact,
): FamilyVisit[] {
  const visits: FamilyVisit[] = [];
  let offset = 2;

  for (const discipline of disciplineOrder) {
    for (let index = 0; index < allocation[discipline]; index += 1) {
      const professional = professionalByDiscipline[discipline];
      const isFirst = visits.length === 0;
      visits.push({
        id: `visit-${discipline}-${index}`,
        discipline,
        professional: professional.name,
        professionalRole: professional.role,
        scheduledAt: new Date(Date.now() + offset * 86_400_000).toISOString(),
        date: offset === 2 ? "En 2 días" : `En ${offset} días`,
        time: index === 0 ? "10:30" : "09:00",
        status: isFirst ? status : "scheduled",
        note: isFirst && status === "completed"
          ? `${contact.patientName} completó la rutina de movilidad sin dolor.`
          : undefined,
      });
      offset += 3;
    }
  }

  return visits;
}

