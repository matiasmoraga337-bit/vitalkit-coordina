import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { VisitStatusBadge } from "@/components/app/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getInitials } from "@/lib/auth/roles";
import { getCoordinatorDashboard } from "@/lib/data/coordinator";
import { disciplineMeta } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const instant = false;

export default async function CoordinatorCalendarPage() {
  const { supabase, profile } = await requireRole("coordinator");
  const data = await getCoordinatorDashboard(supabase);

  const groups = new Map<string, typeof data.visits>();
  for (const visit of data.visits) {
    const current = groups.get(visit.date) ?? [];
    current.push(visit);
    groups.set(visit.date, current);
  }

  return (
    <AppShell
      role="coordinator"
      user={{ name: profile.full_name, detail: "Coordinación", initials: getInitials(profile.full_name) }}
    >
      <div className="space-y-6">
        <PageHeader
          eyebrow="Calendario"
          title="Agenda de coordinación"
          description="Todas las visitas pendientes del piloto, agrupadas por día."
          backHref="/tablero"
        />

        {data.visits.length === 0 ? (
          <EmptyState icon={CalendarDays} title="Sin visitas" description="No hay visitas pendientes en la agenda." />
        ) : (
          <div className="space-y-5">
            {[...groups.entries()].map(([date, visits]) => (
              <section key={date} className="space-y-2">
                <h2 className="font-heading text-lg font-bold">{date}</h2>
                <div className="grid gap-2">
                  {visits.map((visit) => (
                    <Link key={visit.id} href={`/visitas/${visit.id}`} className="group">
                      <Card className="transition-colors group-hover:bg-muted/30">
                        <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
                          <span className="w-16 shrink-0 rounded-lg bg-muted px-2 py-1 text-center text-sm font-semibold">
                            {visit.time}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold">{visit.professional}</p>
                              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", disciplineMeta[visit.discipline].className)}>
                                {disciplineMeta[visit.discipline].label}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {visit.household} · {visit.elder}
                            </p>
                          </div>
                          <VisitStatusBadge status={visit.status} />
                          <ArrowRight className="size-4 text-muted-foreground" />
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
