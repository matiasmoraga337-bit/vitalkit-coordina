"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarX2 } from "lucide-react";
import { endOfWeek, format, isSameWeek, parseISO, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { EmptyState } from "@/components/app/empty-state";
import { VisitStatusBadge } from "@/components/app/status-badge";
import { buttonVariants } from "@/components/ui/button";
import type { FamilyVisit } from "@/lib/data/family";
import { disciplineMeta, type Discipline } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const filterOptions: Array<{ id: "all" | Discipline; label: string }> = [
  { id: "all", label: "Todas" },
  { id: "kinesiologia", label: "Kinesiología" },
  { id: "nutricion", label: "Nutrición" },
  { id: "enfermeria", label: "Enfermería" },
  { id: "aseo", label: "Aseo" },
];

function groupByWeek(visits: FamilyVisit[]) {
  const groups = new Map<string, { label: string; visits: FamilyVisit[] }>();

  for (const visit of visits) {
    const date = parseISO(visit.scheduledAt);
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    const key = format(start, "yyyy-MM-dd");
    if (!groups.has(key)) {
      groups.set(key, {
        label: `${format(start, "d MMM", { locale: es })} – ${format(end, "d MMM", { locale: es })}`,
        visits: [],
      });
    }
    groups.get(key)?.visits.push(visit);
  }

  return [...groups.entries()].map(([key, value]) => ({ key, ...value }));
}

function VisitRow({ visit }: { visit: FamilyVisit }) {
  return (
    <Link href={`/visitas/${visit.id}`} className="group block">
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 transition-colors group-hover:bg-muted/30 sm:flex-row sm:items-center">
        <span className="w-16 shrink-0 rounded-lg bg-muted px-2 py-1 text-center text-sm font-semibold">
          {visit.time}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{disciplineMeta[visit.discipline].label}</p>
          <p className="text-sm text-muted-foreground">
            {visit.professional} · {visit.professionalRole}
          </p>
          <p className="text-xs text-muted-foreground">{visit.date}</p>
        </div>
        <VisitStatusBadge status={visit.status} />
        <ArrowRight className="size-4 text-muted-foreground" />
      </div>
    </Link>
  );
}

export function FamilyCalendarList({ visits }: { visits: FamilyVisit[] }) {
  const [filter, setFilter] = useState<"all" | Discipline>("all");

  const filtered = useMemo(
    () => visits.filter((visit) => filter === "all" || visit.discipline === filter),
    [filter, visits],
  );

  const upcoming = filtered.filter(
    (visit) =>
      visit.status === "scheduled" ||
      visit.status === "confirmed" ||
      visit.status === "in_progress",
  );
  const past = filtered.filter(
    (visit) => visit.status === "completed" || visit.status === "cancelled",
  );
  const now = new Date();
  const thisWeek = upcoming.filter((visit) =>
    isSameWeek(parseISO(visit.scheduledAt), now, { weekStartsOn: 1 }),
  );
  const later = upcoming.filter(
    (visit) => !isSameWeek(parseISO(visit.scheduledAt), now, { weekStartsOn: 1 }),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setFilter(option.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold",
              filter === option.id
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {thisWeek.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-heading text-lg font-bold">Esta semana</h2>
          <div className="grid gap-2">
            {thisWeek.map((visit) => (
              <VisitRow key={visit.id} visit={visit} />
            ))}
          </div>
        </section>
      )}

      {later.length > 0 && (
        <div className="space-y-5">
          {groupByWeek(later).map((group) => (
            <section key={group.key} className="space-y-2">
              <h2 className="font-heading text-lg font-bold capitalize">{group.label}</h2>
              <div className="grid gap-2">
                {group.visits.map((visit) => (
                  <VisitRow key={visit.id} visit={visit} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {upcoming.length === 0 && (
        <EmptyState
          icon={CalendarX2}
          title="Sin visitas próximas"
          description="Puedes pedir una visita extra o un cambio a coordinación."
          action={
            <Link href="/solicitudes?pedir=1&type=extra_visit" className={cn(buttonVariants())}>
              Pedir una visita
            </Link>
          }
        />
      )}

      {past.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-heading text-lg font-bold">Historial</h2>
          <div className="grid gap-2">
            {past.map((visit) => (
              <VisitRow key={visit.id} visit={visit} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
