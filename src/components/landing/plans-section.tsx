import { Check } from "lucide-react";
import { PlanCta } from "@/components/landing/plan-cta";
import { Badge } from "@/components/ui/badge";
import { plans } from "@/lib/plans";
import { formatCLP } from "@/lib/format";
import { cn } from "@/lib/utils";

export function PlansSection() {
  return (
    <section id="planes" className="scroll-mt-20 border-b bg-muted/20">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Planes
          </p>
          <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Un plan para cada necesidad.
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            Todos incluyen coordinación, evaluación inicial, agenda, seguimiento
            y una sola factura.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-card p-5",
                plan.popular && "border-primary shadow-lg shadow-primary/10",
              )}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-5 rounded-full bg-primary text-primary-foreground">
                  Más elegido
                </Badge>
              )}
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {plan.tagline}
              </p>
              <h3 className="mt-1 font-heading text-2xl font-bold">{plan.name}</h3>
              <div className="mt-4 flex items-end gap-1">
                <span className="font-heading text-4xl font-bold tracking-tight">
                  {formatCLP(plan.price)}
                </span>
                <span className="pb-1 text-sm text-muted-foreground">/ mes</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {plan.description}
              </p>
              <ul className="mt-5 flex-1 space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <PlanCta
                  planId={plan.id}
                  variant={plan.popular ? "default" : "outline"}
                  label={`Elegir ${plan.name}`}
                />
              </div>
            </article>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Precios de referencia del piloto. Las visitas adicionales se cobran
          aparte.
        </p>
      </div>
    </section>
  );
}
