"use client";

import { useState } from "react";
import { CheckCircle2, MapPin, XCircle } from "lucide-react";
import { comunaOptions, coveredComunas } from "@/lib/landing-data";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CoverageChecker() {
  const [comuna, setComuna] = useState("");
  const [result, setResult] = useState<"covered" | "pending" | null>(null);

  function check() {
    if (!comuna) return;
    setResult(coveredComunas.includes(comuna) ? "covered" : "pending");
  }

  return (
    <section id="cobertura" className="scroll-mt-20 border-b bg-muted/20">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Cobertura
          </p>
          <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            ¿Llegamos a tu comuna?
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            El piloto parte en Puerto Montt y Alerce. Si estás cerca, déjanos tus
            datos y evaluamos una extensión.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
          <h3 className="font-heading text-xl font-bold">Verifica la cobertura</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Selecciona tu comuna y te respondemos al instante.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <select
              value={comuna}
              onChange={(event) => {
                setComuna(event.target.value);
                setResult(null);
              }}
              className="h-11 flex-1 rounded-xl border bg-background px-3 text-sm"
              aria-label="Comuna"
            >
              <option value="">Selecciona tu comuna...</option>
              {comunaOptions.map((option) => (
                <option key={option.value} value={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={check}
              disabled={!comuna}
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Verificar
            </button>
          </div>

          {result && (
            <div
              role="status"
              className={cn(
                "mt-4 flex items-start gap-2 rounded-xl border p-3 text-sm",
                result === "covered"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-amber-200 bg-amber-50 text-amber-900",
              )}
            >
              {result === "covered" ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              ) : (
                <XCircle className="mt-0.5 size-4 shrink-0" />
              )}
              <div>
                <p className="font-semibold">
                  {result === "covered"
                    ? `Sí llegamos a ${comuna}.`
                    : `Aún no llegamos a ${comuna}.`}
                </p>
                <p className="mt-0.5">
                  {result === "covered"
                    ? "Puedes solicitar una evaluación inicial sin costo."
                    : "Déjanos tus datos y te avisamos cuando abramos la comuna."}
                </p>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="size-3.5 text-primary" />
            Puerto Montt y Alerce disponibles en el piloto.
          </div>
        </div>
      </div>
    </section>
  );
}
