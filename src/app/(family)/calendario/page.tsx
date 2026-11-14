import Link from "next/link";
import { cacheLife, cacheTag } from "next/cache";
import { ArrowRight, CalendarDays, CalendarX2 } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { VisitStatusBadge } from "@/components/app/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getFamilyDashboardCached } from "@/lib/data/family";
import { disciplineMeta } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const instant = false;

export default async function FamilyCalendarPage() {
  "use cache: private";
  cacheLife({ stale: 300, revalidate: 60, expire: 600 });
  cacheTag("family-dashboard");

  const { profile } = await requireRole("family");
  const data = await getFamilyDashboardCached(profile.id, profile.full_name);

  if (!data) {
    return (
      <>
        <EmptyState icon={CalendarX2} title="Sin hogar asignado" description="La coordinadora todavía no vinculó tu cuenta." />
      </>
    );
  }

  const upcoming = data.visits.filter(
    (visit) => visit.status === "scheduled" || visit.status === "confirmed" || visit.status === "in_progress",
  );
  const past = data.visits.filter(
    (visit) => visit.status === "completed" || visit.status === "cancelled",
  );

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Calendario"
          title="Las visitas de Elena"
          description="Próximas atenciones y el historial reciente del plan."
          backHref="/inicio"
          actions={<Badge variant="outline" className="rounded-full">{upcoming.length} próximas</Badge>}
        />

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold">Próximas visitas</h2>
          {upcoming.length === 0 ? (
            <EmptyState icon={CalendarDays} title="Sin visitas próximas" description="La coordinadora todavía no agendó la siguiente visita." />
          ) : (
            <div className="grid gap-3">
              {upcoming.map((visit) => (
                <Link key={visit.id} href={`/visitas/${visit.id}`} className="group">
                  <Card className="transition-colors group-hover:bg-muted/30">
                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                      <div className="flex w-20 shrink-0 flex-col rounded-xl bg-muted px-2 py-2 text-center">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">{visit.date.split(",")[0]}</span>
                        <span className="font-heading text-lg font-bold">{visit.time}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{disciplineMeta[visit.discipline].label}</p>
                        <p className="text-sm text-muted-foreground">
                          {visit.professional} · {visit.professionalRole}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <VisitStatusBadge status={visit.status} />
                        <ArrowRight className="size-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold">Historial</h2>
          {past.length === 0 ? (
            <EmptyState icon={CalendarX2} title="Sin visitas anteriores" description="Cuando se complete una visita aparecerá aquí." />
          ) : (
            <div className="grid gap-3">
              {past.map((visit) => (
                <Link key={visit.id} href={`/visitas/${visit.id}`} className="group">
                  <Card className={cn("transition-colors group-hover:bg-muted/30", visit.status === "cancelled" && "opacity-70")}>
                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                      <div className="flex w-20 shrink-0 flex-col rounded-xl bg-muted px-2 py-2 text-center">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">{visit.date.split(",")[0]}</span>
                        <span className="font-heading text-lg font-bold">{visit.time}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{disciplineMeta[visit.discipline].label}</p>
                        <p className="text-sm text-muted-foreground">
                          {visit.professional} · {visit.professionalRole}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <VisitStatusBadge status={visit.status} />
                        <ArrowRight className="size-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
