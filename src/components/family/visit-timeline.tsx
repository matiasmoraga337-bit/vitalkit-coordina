import { Check, Circle, XCircle } from "lucide-react";
import type { VisitStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const steps = [
  { id: "scheduled", label: "Agendada" },
  { id: "confirmed", label: "Confirmada" },
  { id: "in_progress", label: "En curso" },
  { id: "completed", label: "Completada" },
] as const;

const order: Record<VisitStatus, number> = {
  scheduled: 0,
  confirmed: 1,
  in_progress: 2,
  completed: 3,
  cancelled: -1,
};

export function VisitTimeline({
  status,
  cancellationReason,
}: {
  status: VisitStatus;
  cancellationReason?: string | null;
}) {
  if (status === "cancelled") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">
        <p className="flex items-center gap-2 font-semibold">
          <XCircle className="size-4" />
          Visita cancelada
        </p>
        {cancellationReason && <p className="mt-1 text-red-800">{cancellationReason}</p>}
      </div>
    );
  }

  const current = order[status];

  return (
    <div className="grid grid-cols-4 gap-1" aria-label="Estado de la visita">
      {steps.map((step, index) => {
        const done = index <= current;
        const active = index === current;
        return (
          <div key={step.id} className="flex flex-col items-center gap-1 text-center">
            <span
              className={cn(
                "grid size-6 place-items-center rounded-full border text-[10px]",
                done
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/30 bg-background text-muted-foreground",
                active && "ring-4 ring-primary/15",
              )}
            >
              {done ? <Check className="size-3.5" /> : <Circle className="size-2.5" />}
            </span>
            <span
              className={cn(
                "text-[10px] leading-tight",
                active ? "font-semibold text-foreground" : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
