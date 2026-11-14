import Link from "next/link";
import { ArrowLeft, CheckCircle2, LockKeyhole } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { LeadCheckoutForm } from "@/components/landing/lead-checkout-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { planById, plans, planVisitsTotal, type PlanId } from "@/lib/plans";
import { formatCLP } from "@/lib/format";

export const instant = false;

export const metadata = {
  title: "Checkout simulado — VitalKit",
  description: "Checkout de demostración para el plan VitalKit.",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan: planParam } = await searchParams;
  const planId = (plans.some((item) => item.id === planParam) ? planParam : "integral") as PlanId;
  const plan = planById[planId];

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link href="/" className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
            <Logo />
          </Link>
          <Badge variant="outline" className="ml-1 rounded-full text-[10px] uppercase tracking-wide">
            Pago simulado
          </Badge>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Volver
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div className="min-w-0 lg:sticky lg:top-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Checkout de demostración
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Estás a un paso de coordinar el cuidado.
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Elige tu plan, deja tus datos y simula el pago. No se realizará ningún
            cobro real.
          </p>

          <div className="mt-6 rounded-3xl border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Plan seleccionado
                </p>
                <h2 className="mt-1 font-heading text-2xl font-bold">{plan.name}</h2>
              </div>
              <Badge className="rounded-full bg-primary/10 text-primary hover:bg-primary/10">
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
            <div className="mt-5 flex flex-wrap gap-2">
              {plans.map((item) => (
                <Link
                  key={item.id}
                  href={`/checkout?plan=${item.id}`}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    item.id === plan.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
            <LockKeyhole className="mt-0.5 size-4 shrink-0 text-primary" />
            Pago simulado. No se guardan datos completos de tarjeta ni se crea una
            cuenta real.
          </p>
        </div>

        <LeadCheckoutForm plan={plan} />
      </main>
    </div>
  );
}
