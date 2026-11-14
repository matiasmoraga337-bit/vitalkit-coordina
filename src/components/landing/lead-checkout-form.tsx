"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, LockKeyhole, UserRound } from "lucide-react";
import { PaymentResult } from "@/components/payments/payment-result";
import {
  SimulatedCardForm,
  type SimulatedPaymentInput,
  type SimulatedPaymentResponse,
} from "@/components/payments/simulated-card-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { buttonVariants } from "@/components/ui/button";
import { comunaOptions } from "@/lib/landing-data";
import { formatCLP } from "@/lib/format";
import { planVisitsTotal, type Plan } from "@/lib/plans";
import { createLeadCheckout, type CheckoutState } from "@/app/actions/leads";
import { cn } from "@/lib/utils";

export function LeadCheckoutForm({ plan }: { plan: Plan }) {
  const [step, setStep] = useState(1);
  const [contact, setContact] = useState({
    name: "",
    email: "",
    phone: "",
    comuna: "",
    message: "",
  });
  const [result, setResult] = useState<CheckoutState>({ ok: false });

  function updateContact(key: keyof typeof contact, value: string) {
    setContact((current) => ({ ...current, [key]: value }));
  }

  function reviewContact(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStep(2);
  }

  async function pay(
    input: SimulatedPaymentInput,
  ): Promise<SimulatedPaymentResponse> {
    const formData = new FormData();
    formData.set("name", contact.name);
    formData.set("email", contact.email);
    formData.set("phone", contact.phone);
    formData.set("comuna", contact.comuna);
    formData.set("message", contact.message);
    formData.set("plan_id", plan.id);
    formData.set("card_last4", input.cardLast4);
    formData.set("consent", "on");
    formData.set("website", "");

    const next = await createLeadCheckout({ ok: false }, formData);

    if (next.ok && next.approved) {
      setResult(next);
      return {
        ok: true,
        approved: true,
        reference: next.reference,
      };
    }

    setResult({ ok: false, error: next.error });
    return {
      ok: false,
      approved: false,
      error: next.error ?? "Pago rechazado.",
    };
  }

  if (result.ok) {
    return (
      <PaymentResult
        approved
        amount={plan.price}
        reference={result.reference}
        title="Pago simulado aprobado"
        description="Recibimos tu solicitud y el pago de demostración. Coordinación te contactará para continuar. No se creó una cuenta real ni se realizó un cobro."
        actions={
          <>
            <Link href="/demo" className={cn(buttonVariants({ size: "sm" }))}>
              Probar demo
            </Link>
            <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              Ingresar
            </Link>
            <Link href="/" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              Volver al sitio
            </Link>
          </>
        }
      />
    );
  }

  return (
    <div className="min-w-0 rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2">
        {[1, 2].map((item) => (
          <span
            key={item}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              item <= step ? "bg-primary" : "bg-muted",
            )}
          />
        ))}
      </div>

      {step === 1 ? (
        <form onSubmit={reviewContact} className="mt-5 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Paso 1 de 2
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold">
              ¿A quién vamos a cuidar?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Déjanos tus datos y luego simulamos el pago del plan {plan.name}.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs font-medium">
              Nombre
              <Input
                value={contact.name}
                onChange={(event) => updateContact("name", event.target.value)}
                required
                autoComplete="name"
                placeholder="Tu nombre"
              />
            </label>
            <label className="space-y-1 text-xs font-medium">
              Correo
              <Input
                type="email"
                value={contact.email}
                onChange={(event) => updateContact("email", event.target.value)}
                required
                autoComplete="email"
                placeholder="tu@correo.cl"
              />
            </label>
            <label className="space-y-1 text-xs font-medium">
              Teléfono
              <Input
                type="tel"
                value={contact.phone}
                onChange={(event) => updateContact("phone", event.target.value)}
                autoComplete="tel"
                placeholder="+56 9 ..."
              />
            </label>
            <label className="space-y-1 text-xs font-medium">
              Comuna
              <select
                value={contact.comuna}
                onChange={(event) => updateContact("comuna", event.target.value)}
                className="h-9 w-full rounded-lg border bg-background px-2.5 text-sm"
              >
                <option value="">Selecciona tu comuna</option>
                {comunaOptions.map((option) => (
                  <option key={option.value} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block space-y-1 text-xs font-medium">
            Mensaje
            <Textarea
              value={contact.message}
              onChange={(event) => updateContact("message", event.target.value)}
              rows={3}
              placeholder="Cuéntanos brevemente qué necesita la persona."
            />
          </label>

          <label className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
            <input
              type="checkbox"
              required
              className="mt-0.5 size-4 rounded border-input"
            />
            Autorizo a VitalKit a contactarme para coordinar una evaluación. Mis
            datos no se comparten con terceros.
          </label>

          <div className="rounded-xl bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">
            <span className="flex items-start gap-2">
              <LockKeyhole className="mt-0.5 size-4 shrink-0 text-primary" />
              Pago simulado de demostración. No se realizará ningún cobro real.
            </span>
          </div>

          <button type="submit" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
            Continuar al pago
            <ArrowRight className="size-4" />
          </button>
        </form>
      ) : (
        <div className="mt-5">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Editar datos
          </button>

          <div className="mt-4 flex items-start gap-3 rounded-xl border bg-muted/20 p-3">
            <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
              <UserRound className="size-4" />
            </span>
            <div className="min-w-0 text-sm">
              <p className="font-semibold">{contact.name || "Tus datos"}</p>
              <p className="truncate text-xs text-muted-foreground">
                {contact.email || "Correo"} · {contact.comuna || "Comuna"}
              </p>
            </div>
            <CheckCircle2 className="ml-auto size-4 text-emerald-600" />
          </div>

          <div className="mt-4">
            <SimulatedCardForm
              amount={plan.price}
              onSubmit={pay}
              submitLabel={`Pagar ${formatCLP(plan.price)}`}
            />
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Plan {plan.name} · {planVisitsTotal(plan)} visitas incluidas · Pago
            simulado
          </p>
        </div>
      )}
    </div>
  );
}
