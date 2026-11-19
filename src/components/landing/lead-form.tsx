"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { SubmitButton } from "@/components/app/submit-button";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { comunaOptions } from "@/lib/landing-data";
import { plans, type PlanId } from "@/lib/plans";
import { createLead, type LeadFormState } from "@/app/actions/leads";
import { cn } from "@/lib/utils";

const initialState: LeadFormState = { ok: false };

export function LeadForm() {
  const [state, formAction] = useActionState(createLead, initialState);
  const [plan, setPlan] = useState<PlanId>("integral");

  useEffect(() => {
    function handlePlan(event: Event) {
      const custom = event as CustomEvent<PlanId>;
      if (custom.detail) setPlan(custom.detail);
    }
    window.addEventListener("vitalkit:select-plan", handlePlan);
    return () => window.removeEventListener("vitalkit:select-plan", handlePlan);
  }, []);

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-950">
        <span className="grid size-12 place-items-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="size-6" />
        </span>
        <h3 className="mt-4 font-heading text-2xl font-bold">Solicitud recibida</h3>
        <p className="mt-2 text-sm leading-6">
          Gracias. La coordinación revisará tus datos y te contactará para
          coordinar una evaluación inicial sin costo.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link href="/demo" className={cn(buttonVariants({ variant: "outline" }))}>
            Probar la app
          </Link>
          <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }))}>
            Ingresar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <ShieldCheck className="size-5" />
        </span>
        <div>
          <h3 className="font-heading text-xl font-bold">Solicita una evaluación</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Déjanos los datos del paciente y de quien coordina el cuidado. Sin costo y sin compromiso.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-xs font-medium sm:col-span-2">
          Nombre del paciente
          <Input
            name="patient_name"
            required
            autoComplete="off"
            placeholder="Nombre de la persona que necesita cuidado"
          />
        </label>
        <label className="space-y-1 text-xs font-medium">
          Tu nombre (familiar)
          <Input name="name" required autoComplete="name" placeholder="Quién coordina el cuidado" />
        </label>
        <label className="space-y-1 text-xs font-medium">
          Correo de contacto
          <Input name="email" type="email" required autoComplete="email" placeholder="tu@correo.cl" />
        </label>
        <label className="space-y-1 text-xs font-medium">
          Teléfono de contacto
          <Input name="phone" type="tel" autoComplete="tel" placeholder="+56 9 ..." />
        </label>
        <label className="space-y-1 text-xs font-medium">
          Comuna
          <select
            name="comuna"
            className="h-9 w-full rounded-lg border bg-background px-2.5 text-sm"
            defaultValue=""
          >
            <option value="">Selecciona tu comuna</option>
            {comunaOptions.map((option) => (
              <option key={option.value} value={option.label}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-medium sm:col-span-2">
          Dirección donde se realizarán las visitas
          <Input
            name="address"
            required
            autoComplete="street-address"
            placeholder="Calle, número, depto o casa"
          />
        </label>
      </div>

      <fieldset className="mt-4">
        <legend className="text-xs font-medium">Plan de interés</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {plans.map((item) => (
            <label
              key={item.id}
              className={cn(
                "cursor-pointer rounded-xl border p-3 text-sm transition-colors focus-within:ring-2 focus-within:ring-ring",
                plan === item.id
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted/40",
              )}
            >
              <input
                type="radio"
                name="plan_id"
                value={item.id}
                checked={plan === item.id}
                onChange={() => setPlan(item.id)}
                className="sr-only"
              />
              <span className="block font-semibold">{item.name}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {item.tagline}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-4">
        <legend className="text-xs font-medium">¿Qué necesita la persona?</legend>
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
          {[
            ["need_kinesiologia", "Kinesiología"],
            ["need_nutricion", "Nutrición"],
            ["need_enfermeria", "Enfermería"],
            ["need_aseo", "Aseo"],
          ].map(([name, label]) => (
            <label key={name} className="flex items-center gap-2 rounded-lg border px-3 py-2">
              <input type="checkbox" name={name} className="size-4 rounded border-input" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="mt-4 block space-y-1 text-xs font-medium">
        Mensaje
        <Textarea
          name="message"
          rows={3}
          placeholder="Cuéntanos brevemente qué necesita la persona."
        />
      </label>

      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <label className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
        <input type="checkbox" name="consent" required className="mt-0.5 size-4 rounded border-input" />
        Autorizo a VitalKit a contactarme para coordinar una evaluación. Mis datos
        no se comparten con terceros.
      </label>

      {state.error && (
        <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      )}

      <SubmitButton className="mt-4 w-full" pendingText="Enviando solicitud...">
        Enviar solicitud
        <ArrowRight className="size-4" />
      </SubmitButton>
    </form>
  );
}
