"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  ClipboardList,
  Clock3,
  HeartPulse,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SimulatedCardForm,
  type SimulatedPaymentInput,
  type SimulatedPaymentResponse,
} from "@/components/payments/simulated-card-form";
import { disciplineMeta, type Discipline } from "@/lib/mock-data";
import { formatCLP } from "@/lib/format";
import {
  planById,
  plans,
  planVisitsTotal,
  type Plan,
  type PlanId,
} from "@/lib/plans";
import { cn } from "@/lib/utils";
import { FamilyAppDemo } from "./family-app-demo";
import {
  buildDemoFrequency,
  buildDemoGoals,
  defaultContact,
  defaultSurvey,
  demoSlots,
  disciplineOrder,
  recommendAllocation,
  type DemoAllocation,
  type DemoContact,
  type DemoSurvey,
} from "./demo-types";

const stageOrder = [
  "landing",
  "checkout",
  "survey",
  "evaluation",
  "plan",
  "app",
] as const;

type Stage = (typeof stageOrder)[number];

const stageLabels: Record<Stage, string> = {
  landing: "Landing",
  checkout: "Checkout",
  survey: "Encuesta inicial",
  evaluation: "Evaluación",
  plan: "Plan de cuidado",
  app: "App familiar",
};

const heroImages = [
  { src: "/landing/kine.webp", alt: "Kinesiólogo a domicilio" },
  { src: "/landing/nutri.webp", alt: "Nutricionista" },
  { src: "/landing/nurse.webp", alt: "Enfermera a domicilio" },
  { src: "/landing/cleaner.webp", alt: "Aseo especializado" },
];

export function FullJourneyDemo() {
  const [stage, setStage] = useState<Stage>("landing");
  const [planId, setPlanId] = useState<PlanId>("integral");
  const [contact, setContact] = useState<DemoContact>(defaultContact);
  const [survey, setSurvey] = useState<DemoSurvey>(defaultSurvey);
  const [slotId, setSlotId] = useState(demoSlots[0].id);
  const [allocation, setAllocation] = useState<DemoAllocation>(() =>
    recommendAllocation(planById.integral, defaultSurvey),
  );
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const plan = planById[planId];
  const slot = demoSlots.find((item) => item.id === slotId) ?? demoSlots[0];
  const recommended = recommendAllocation(plan, survey);
  const stageIndex = stageOrder.indexOf(stage);

  function resetDemo() {
    setStage("landing");
    setPlanId("integral");
    setContact(defaultContact);
    setSurvey(defaultSurvey);
    setSlotId(demoSlots[0].id);
    setAllocation(recommendAllocation(planById.integral, defaultSurvey));
    setPaymentReference(null);
  }

  function choosePlan(id: PlanId) {
    setPlanId(id);
    setStage("checkout");
  }

  function updateContact(key: keyof DemoContact, value: string) {
    setContact((current) => ({ ...current, [key]: value }));
  }

  async function handlePayment(
    input: SimulatedPaymentInput,
  ): Promise<SimulatedPaymentResponse> {
    if (!contact.patientName.trim() || !contact.familyName.trim()) {
      return {
        ok: false,
        approved: false,
        error: "Completa el nombre del paciente y del familiar.",
      };
    }

    if (!contact.address.trim()) {
      return {
        ok: false,
        approved: false,
        error: "Ingresa la dirección donde se realizarán las visitas.",
      };
    }

    if (input.cardLast4 === "0002") {
      return {
        ok: false,
        approved: false,
        error: "Pago rechazado. Intenta con la tarjeta de prueba aprobada.",
      };
    }

    setPaymentReference("SIM-DEMO");
    setStage("survey");
    return { ok: true, approved: true, reference: "SIM-DEMO" };
  }

  function confirmEvaluation() {
    setAllocation(recommendAllocation(plan, survey));
    setStage("plan");
  }

  function confirmPlan() {
    setStage("app");
  }

  function adjustAllocation(discipline: Discipline, value: number) {
    setAllocation((current) => {
      const nextValue = Math.max(0, value);
      if (nextValue === current[discipline]) return current;

      const total = disciplineOrder.reduce(
        (sum, item) => sum + current[item],
        0,
      );

      if (nextValue > current[discipline] && total >= planVisitsTotal(plan)) {
        return current;
      }

      return { ...current, [discipline]: nextValue };
    });
  }

  return (
    <div className="min-h-dvh bg-background">
      <div className="sticky top-0 z-[70] bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2 text-xs">
          <span className="rounded-full border border-white/25 px-2 py-0.5 font-semibold">
            Demo
          </span>
          <span className="truncate text-white/80">{stageLabels[stage]}</span>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden sm:inline text-white/60">
              Paso {stageIndex + 1} de {stageOrder.length}
            </span>
            <button
              type="button"
              onClick={resetDemo}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <RotateCcw className="size-3.5" />
              Reiniciar
            </button>
          </div>
        </div>
        <div className="h-0.5 bg-white/10">
          <div
            className="h-full bg-primary transition-[width] duration-300"
            style={{ width: `${((stageIndex + 1) / stageOrder.length) * 100}%` }}
          />
        </div>
      </div>

      {stage === "landing" && <DemoLanding onSelectPlan={choosePlan} />}

      {stage === "checkout" && (
        <DemoCheckout
          plan={plan}
          contact={contact}
          onChange={updateContact}
          onBack={() => setStage("landing")}
          onPayment={handlePayment}
        />
      )}

      {stage === "survey" && (
        <DemoSurveyStep
          patientName={contact.patientName}
          survey={survey}
          reference={paymentReference}
          onChange={(next) => setSurvey(next)}
          onContinue={() => setStage("evaluation")}
        />
      )}

      {stage === "evaluation" && (
        <DemoEvaluationStep
          patientName={contact.patientName}
          slotId={slotId}
          onSelect={setSlotId}
          onBack={() => setStage("survey")}
          onContinue={confirmEvaluation}
        />
      )}

      {stage === "plan" && (
        <DemoPlanStep
          plan={plan}
          survey={survey}
          allocation={allocation}
          onAdjust={adjustAllocation}
          onRestore={() => setAllocation(recommended)}
          onBack={() => setStage("evaluation")}
          onConfirm={confirmPlan}
        />
      )}

      {stage === "app" && (
        <FamilyAppDemo
          plan={plan}
          allocation={allocation}
          contact={contact}
          survey={survey}
          slot={slot}
          onRestart={resetDemo}
        />
      )}
    </div>
  );
}

function DemoLanding({ onSelectPlan }: { onSelectPlan: (id: PlanId) => void }) {
  return (
    <div>
      <header className="border-b">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link href="/" className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
            <Logo />
          </Link>
          <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-wide">
            Demo
          </Badge>
          <Link
            href="/demo"
            className="ml-auto inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Volver a demos
          </Link>
        </div>
      </header>

      <section className="border-b">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <span className="size-1.5 rounded-full bg-primary" />
              Cuidado coordinado en Puerto Montt
            </span>
            <h1 className="mt-5 max-w-2xl font-heading text-4xl font-bold leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl">
              Todos los cuidados de tu familia, en un solo plan.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Kinesiología, nutrición, enfermería y aseo coordinados en una
              suscripción mensual. Sin contratar por separado, sin coordinar
              horarios, sin sorpresas.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href="#planes" className={cn(buttonVariants({ size: "lg" }))}>
                Ver planes
                <ArrowRight className="size-4" />
              </a>
              <Link href="/demo" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                Volver a demos
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                Pago simulado
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarCheck2 className="size-4 text-primary" />
                Una sola agenda
              </span>
              <span className="inline-flex items-center gap-2">
                <HeartPulse className="size-4 text-primary" />
                Seguimiento cercano
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {heroImages.map((image, index) => (
              <div
                key={image.src}
                className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border bg-muted"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 1024px) 45vw, 260px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="planes" className="scroll-mt-20 border-b bg-muted/20">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Elige tu plan
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              En esta demo puedes recorrer el proceso completo. No se realizará
              ningún cobro real.
            </p>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className={cn(
                  "flex flex-col rounded-2xl border bg-card p-5",
                  plan.popular && "border-primary",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-heading text-xl font-bold">{plan.name}</h3>
                  {plan.popular && (
                    <Badge className="rounded-full bg-primary/10 text-primary hover:bg-primary/10">
                      Más elegido
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
                <p className="mt-4 font-heading text-3xl font-bold">
                  {formatCLP(plan.price)}
                  <span className="text-sm font-medium text-muted-foreground"> / mes</span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {planVisitsTotal(plan)} visitas al mes
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  {plan.features.slice(0, 4).map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => onSelectPlan(plan.id)}
                  className={cn(buttonVariants(), "mt-auto w-full")}
                >
                  Elegir {plan.name}
                  <ArrowRight className="size-4" />
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto w-full max-w-7xl px-4 py-6 text-xs text-muted-foreground sm:px-6">
        Demo interactiva · Los datos, la disponibilidad y el pago son ficticios.
      </footer>
    </div>
  );
}

function DemoCheckout({
  plan,
  contact,
  onChange,
  onBack,
  onPayment,
}: {
  plan: Plan;
  contact: DemoContact;
  onChange: (key: keyof DemoContact, value: string) => void;
  onBack: () => void;
  onPayment: (input: SimulatedPaymentInput) => Promise<SimulatedPaymentResponse>;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a planes
      </button>

      <div className="mt-4 max-w-2xl">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Confirma tu plan
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Déjanos los datos del paciente y del familiar que coordina el cuidado.
          El pago es simulado.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div className="rounded-2xl border bg-card p-5 lg:sticky lg:top-16">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Plan seleccionado</p>
              <h2 className="mt-1 font-heading text-2xl font-bold">{plan.name}</h2>
            </div>
            <Badge variant="outline" className="rounded-full">
              {planVisitsTotal(plan)} visitas
            </Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
          <p className="mt-4 font-heading text-4xl font-bold">{formatCLP(plan.price)}</p>
          <p className="text-sm text-muted-foreground">por mes</p>
          <ul className="mt-4 space-y-2 text-sm">
            {plan.features.map((feature) => (
              <li key={feature} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                {feature}
              </li>
            ))}
          </ul>
          <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            Pago simulado. No se guardan datos completos de tarjeta.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs font-medium sm:col-span-2">
              Nombre del paciente
              <Input
                value={contact.patientName}
                onChange={(event) => onChange("patientName", event.target.value)}
                placeholder="Nombre de la persona que necesita cuidado"
              />
            </label>
            <label className="space-y-1 text-xs font-medium">
              Tu nombre (familiar)
              <Input
                value={contact.familyName}
                onChange={(event) => onChange("familyName", event.target.value)}
                placeholder="Quién coordina el cuidado"
              />
            </label>
            <label className="space-y-1 text-xs font-medium">
              Correo de contacto
              <Input
                type="email"
                value={contact.email}
                onChange={(event) => onChange("email", event.target.value)}
              />
            </label>
            <label className="space-y-1 text-xs font-medium">
              Teléfono de contacto
              <Input
                type="tel"
                value={contact.phone}
                onChange={(event) => onChange("phone", event.target.value)}
              />
            </label>
            <label className="space-y-1 text-xs font-medium">
              Comuna
              <select
                value={contact.comuna}
                onChange={(event) => onChange("comuna", event.target.value)}
                className="h-9 w-full rounded-lg border bg-background px-2.5 text-sm"
              >
                <option>Puerto Montt</option>
                <option>Alerce</option>
                <option>Puerto Varas</option>
              </select>
            </label>
            <label className="space-y-1 text-xs font-medium sm:col-span-2">
              Dirección donde se realizarán las visitas
              <Input
                value={contact.address}
                onChange={(event) => onChange("address", event.target.value)}
                autoComplete="street-address"
                placeholder="Calle, número, depto o casa"
              />
            </label>
          </div>

          <div className="mt-5">
            <SimulatedCardForm
              amount={plan.price}
              onSubmit={onPayment}
              submitLabel={`Pagar ${formatCLP(plan.price)}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoSurveyStep({
  patientName,
  survey,
  reference,
  onChange,
  onContinue,
}: {
  patientName: string;
  survey: DemoSurvey;
  reference: string | null;
  onChange: (survey: DemoSurvey) => void;
  onContinue: () => void;
}) {
  function update(key: keyof DemoSurvey, value: string | string[]) {
    onChange({ ...survey, [key]: value });
  }

  function toggleConcern(concern: string) {
    update(
      "concerns",
      survey.concerns.includes(concern)
        ? survey.concerns.filter((item) => item !== concern)
        : [...survey.concerns, concern],
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <div className="max-w-2xl">
        <Badge className="rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
          Pago aprobado · {reference ?? "SIM-DEMO"}
        </Badge>
        <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight">
          Cuéntanos cómo está {patientName}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Estas respuestas ayudan a coordinación a preparar la evaluación inicial.
          No reemplazan una evaluación clínica.
        </p>
      </div>

      <div className="mt-6 space-y-5">
        <SurveyQuestion
          title="Movilidad"
          options={["Sin ayuda", "Con apoyo", "Mayormente sentada", "Postrada"]}
          value={survey.mobility}
          onChange={(value) => update("mobility", value)}
        />
        <SurveyQuestion
          title="Memoria y orientación"
          options={["Sin dificultad", "Olvidos ocasionales", "Olvidos frecuentes"]}
          value={survey.memory}
          onChange={(value) => update("memory", value)}
        />
        <SurveyQuestion
          title="Medicamentos"
          options={["No necesita ayuda", "A veces", "Todos los días"]}
          value={survey.medication}
          onChange={(value) => update("medication", value)}
        />
        <SurveyQuestion
          title="Ánimo"
          options={["Estable", "Variable", "Bajo"]}
          value={survey.mood}
          onChange={(value) => update("mood", value)}
        />

        <fieldset>
          <legend className="text-sm font-semibold">¿Qué preocupa más hoy?</legend>
          <p className="mt-1 text-sm text-muted-foreground">
            Puedes elegir más de una opción.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Movilidad", "Alimentación", "Medicación", "Curaciones", "Aseo", "Compañía"].map(
              (concern) => {
                const selected = survey.concerns.includes(concern);
                return (
                  <button
                    key={concern}
                    type="button"
                    onClick={() => toggleConcern(concern)}
                    aria-pressed={selected}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition-colors",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {concern}
                  </button>
                );
              },
            )}
          </div>
        </fieldset>
      </div>

      <div className="mt-8 flex justify-end">
        <button type="button" onClick={onContinue} className={cn(buttonVariants())}>
          Continuar
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

function SurveyQuestion({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold">{title}</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              aria-pressed={selected}
              className={cn(
                "flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                selected
                  ? "border-primary bg-primary/5 font-medium"
                  : "hover:bg-muted/40",
              )}
            >
              {option}
              {selected && <CheckCircle2 className="size-4 text-primary" />}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function DemoEvaluationStep({
  patientName,
  slotId,
  onSelect,
  onBack,
  onContinue,
}: {
  patientName: string;
  slotId: string;
  onSelect: (id: string) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a la encuesta
      </button>

      <div className="mt-4 max-w-2xl">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Agenda la evaluación inicial
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Elige un horario para que coordinación conozca a {patientName} y revise
          sus necesidades en casa.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="space-y-3">
          {demoSlots.map((slot) => {
            const selected = slot.id === slotId;
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => onSelect(slot.id)}
                aria-pressed={selected}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-colors",
                  selected
                    ? "border-primary bg-primary/5"
                    : "bg-card hover:bg-muted/40",
                )}
              >
                <div>
                  <p className="font-semibold">
                    {slot.day} · {slot.time} hrs
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {slot.date} · En casa · 45 min
                  </p>
                </div>
                <span
                  className={cn(
                    "grid size-6 place-items-center rounded-full border",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {selected ? <CheckCircle2 className="size-3.5" /> : <Clock3 className="size-3.5" />}
                </span>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              VS
            </span>
            <div>
              <p className="font-semibold">Valentina Soto</p>
              <p className="text-xs text-muted-foreground">Coordinación VitalKit</p>
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
            <li>Evaluación en casa, sin costo.</li>
            <li>Revisión de movilidad, medicación y rutina.</li>
            <li>Propuesta de plan al terminar.</li>
          </ul>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button type="button" onClick={onContinue} className={cn(buttonVariants())}>
          Confirmar evaluación
          <CalendarCheck2 className="size-4" />
        </button>
      </div>
    </div>
  );
}

function DemoPlanStep({
  plan,
  survey,
  allocation,
  onAdjust,
  onRestore,
  onBack,
  onConfirm,
}: {
  plan: Plan;
  survey: DemoSurvey;
  allocation: DemoAllocation;
  onAdjust: (discipline: Discipline, value: number) => void;
  onRestore: () => void;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const total = disciplineOrder.reduce(
    (sum, discipline) => sum + allocation[discipline],
    0,
  );
  const planTotal = planVisitsTotal(plan);
  const pending = planTotal - total;
  const goals = buildDemoGoals(survey);
  const frequency = buildDemoFrequency(allocation);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a la evaluación
      </button>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-2xl">
          <Badge className="rounded-full bg-primary/10 text-primary hover:bg-primary/10">
            Propuesta inicial
          </Badge>
          <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight">
            Plan de cuidado
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Valentina preparó esta propuesta inicial según la evaluación. Puedes
            personalizarla y distribuir las {planTotal} visitas como prefieras.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {plan.name} · {formatCLP(plan.price)} / mes
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.75fr] lg:items-start">
        <div className="space-y-4">
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
            <p className="mt-3 text-xs text-muted-foreground">{frequency}</p>
          </div>

          <div className="space-y-2">
            {disciplineOrder.map((discipline) => (
              <AllocationRow
                key={discipline}
                discipline={discipline}
                value={allocation[discipline]}
                canAdd={total < planTotal}
                onChange={(value) => onAdjust(discipline, value)}
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 lg:sticky lg:top-16">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Tu plan</p>
              <p className="mt-1 font-heading text-xl font-bold">{plan.name}</p>
            </div>
            <Badge variant="outline" className="rounded-full">
              {total} de {planTotal} visitas
            </Badge>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${Math.round((total / Math.max(planTotal, 1)) * 100)}%`,
              }}
            />
          </div>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Puedes mover las visitas entre disciplinas sin cambiar el precio del
            plan. El único límite es el total contratado.
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Para mover una visita, quita una de una disciplina y agrégala a otra.
          </p>

          <p
            className={cn(
              "mt-2 text-xs font-medium",
              pending === 0 ? "text-emerald-700" : "text-amber-700",
            )}
          >
            {pending === 0
              ? `Las ${planTotal} visitas están asignadas.`
              : pending === 1
                ? "Te queda 1 visita por asignar."
                : `Te quedan ${pending} visitas por asignar.`}
          </p>

          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={onRestore}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Restaurar propuesta inicial
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={pending !== 0}
              className={cn(buttonVariants())}
            >
              Confirmar plan
              <ArrowRight className="size-4" />
            </button>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Para continuar, asigna las {planTotal} visitas del plan.
          </p>
        </div>
      </div>
    </div>
  );
}

function AllocationRow({
  discipline,
  value,
  canAdd,
  onChange,
}: {
  discipline: Discipline;
  value: number;
  canAdd: boolean;
  onChange: (value: number) => void;
}) {
  const meta = disciplineMeta[discipline];

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3">
      <div className="flex items-center gap-3">
        <span className={cn("size-2.5 rounded-full", meta.dot)} />
        <div>
          <p className="text-sm font-semibold">{meta.label}</p>
          <p className="text-xs text-muted-foreground">
            {value} {value === 1 ? "visita" : "visitas"} al mes
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onChange(value - 1)}
          disabled={value <= 0}
          className={cn(buttonVariants({ variant: "outline", size: "icon" }), "size-7")}
          aria-label={`Quitar una visita de ${meta.label}`}
        >
          <Minus className="size-3.5" />
        </button>
        <span className="w-5 text-center text-sm font-semibold">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          disabled={!canAdd}
          className={cn(buttonVariants({ variant: "outline", size: "icon" }), "size-7")}
          aria-label={`Agregar una visita de ${meta.label}`}
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
