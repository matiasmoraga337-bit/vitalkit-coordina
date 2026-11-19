import {
  CalendarCheck2,
  ClipboardList,
  HeartPulse,
  Stethoscope,
} from "lucide-react";
import type { FamilyDashboard } from "@/lib/data/family";
import { cn } from "@/lib/utils";

const stages = [
  {
    id: "evaluation",
    label: "Evaluación inicial",
    description: "Conocemos a la persona y sus necesidades.",
    icon: Stethoscope,
  },
  {
    id: "plan",
    label: "Plan de cuidado",
    description: "Definimos objetivos y frecuencia.",
    icon: ClipboardList,
  },
  {
    id: "visits",
    label: "Visitas coordinadas",
    description: "Los profesionales llegan a casa.",
    icon: CalendarCheck2,
  },
  {
    id: "followup",
    label: "Seguimiento",
    description: "Revisamos avances y ajustamos.",
    icon: HeartPulse,
  },
] as const;

export function careJourneyStage(data: FamilyDashboard) {
  const hasCompletedVisit = data.visits.some(
    (visit) => visit.status === "completed" && visit.note,
  );

  if (hasCompletedVisit) return 3;
  if (data.carePlan) return 2;
  return 0;
}

export function CareJourney({
  data,
  className,
}: {
  data: FamilyDashboard;
  className?: string;
}) {
  const current = careJourneyStage(data);

  return (
    <section className={cn("space-y-3", className)} aria-labelledby="care-journey-title">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 id="care-journey-title" className="font-heading text-lg font-bold">
          Tu camino de cuidado
        </h2>
        <span className="text-xs text-muted-foreground">
          Etapa {current + 1} de {stages.length}
        </span>
      </div>

      <ol className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        {stages.map((stage, index) => {
          const state =
            index < current ? "done" : index === current ? "current" : "upcoming";
          const Icon = stage.icon;

          return (
            <li
              key={stage.id}
              aria-current={state === "current" ? "step" : undefined}
              className="flex min-w-0 gap-2"
            >
              <span
                className={cn(
                  "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border text-xs",
                  state === "current" &&
                    "border-primary bg-primary text-primary-foreground",
                  state === "done" && "border-primary/20 bg-primary/10 text-primary",
                  state === "upcoming" && "text-muted-foreground",
                )}
              >
                <Icon className="size-3.5" />
              </span>
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-xs font-semibold",
                    state === "upcoming" && "text-muted-foreground",
                  )}
                >
                  {stage.label}
                </p>
                <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
                  {stage.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
