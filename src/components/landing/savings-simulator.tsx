"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Calculator } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { marketPrices, plans, planById, type PlanId, type PlanVisits } from "@/lib/plans";
import { disciplineMeta } from "@/lib/mock-data";
import { formatCLP } from "@/lib/format";
import { cn } from "@/lib/utils";

const order: Array<keyof PlanVisits> = [
  "kinesiologia",
  "nutricion",
  "enfermeria",
  "aseo",
];

const initialNeeds: PlanVisits = {
  kinesiologia: 4,
  nutricion: 1,
  enfermeria: 2,
  aseo: 1,
};

function recommendPlan(needs: PlanVisits) {
  return (
    plans.find((plan) =>
      order.every((discipline) => plan.visits[discipline] >= needs[discipline]),
    ) ?? planById.premium
  );
}

export function SavingsSimulator() {
  const [needs, setNeeds] = useState<PlanVisits>(initialNeeds);

  const separate = useMemo(
    () =>
      order.reduce(
        (total, discipline) => total + needs[discipline] * marketPrices[discipline],
        0,
      ),
    [needs],
  );

  const recommended = recommendPlan(needs);
  const difference = separate - recommended.price;
  const selectedPlan = recommended.id as PlanId;

  function selectPlan() {
    window.dispatchEvent(
      new CustomEvent("vitalkit:select-plan", { detail: selectedPlan }),
    );
    document.getElementById("evaluacion")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section id="ahorro" className="scroll-mt-20 border-b">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Simulador
          </p>
          <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Descubre cuánto cuesta tu cuidado.
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            Ajusta las visitas que necesitas al mes y compáralo con contratar
            todo por separado.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Calculator className="size-4 text-primary" />
              <h3 className="font-heading text-lg font-bold">Necesidades mensuales</h3>
            </div>
            <div className="mt-4 space-y-4">
              {order.map((discipline) => (
                <div key={discipline}>
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor={`slider-${discipline}`} className="flex items-center gap-2 text-sm font-medium">
                      <span className={cn("size-2 rounded-full", disciplineMeta[discipline].dot)} />
                      {disciplineMeta[discipline].label}
                    </label>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">
                      {needs[discipline]} visitas
                    </span>
                  </div>
                  <input
                    id={`slider-${discipline}`}
                    type="range"
                    min={0}
                    max={8}
                    step={1}
                    value={needs[discipline]}
                    onChange={(event) =>
                      setNeeds((current) => ({
                        ...current,
                        [discipline]: Number(event.target.value),
                      }))
                    }
                    className="mt-2 w-full accent-primary"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Comparación mensual
            </p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Contratando por separado</span>
                <span className="font-semibold line-through decoration-red-400/70">
                  {formatCLP(separate)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Plan recomendado</span>
                <span className="font-semibold">{recommended.name}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-t pt-3">
                <span className="font-medium">Precio del plan</span>
                <span className="font-heading text-2xl font-bold">
                  {formatCLP(recommended.price)}
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-xl border bg-card p-3 text-sm">
              {difference > 0 ? (
                <p>
                  El plan cuesta <strong>{formatCLP(difference)} menos</strong> que
                  contratar por separado, e incluye coordinación y seguimiento.
                </p>
              ) : difference === 0 ? (
                <p>
                  El plan cuesta lo mismo que contratar por separado, pero incluye
                  coordinación, verificación y seguimiento.
                </p>
              ) : (
                <p>
                  El plan cuesta <strong>{formatCLP(Math.abs(difference))} más</strong>,
                  pero incluye coordinación, verificación y seguimiento.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={selectPlan}
              className={cn(buttonVariants({ size: "lg" }), "mt-4 w-full")}
            >
              Solicitar evaluación
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
