import Link from "next/link";
import { cacheLife, cacheTag } from "next/cache";
import { ArrowRight, CalendarDays, CalendarX2, Stethoscope } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { VisitStatusBadge } from "@/components/app/status-badge";
import { FamilyCalendarList } from "@/components/family/family-calendar-list";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
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
      <EmptyState
        icon={CalendarX2}
        title="Sin hogar asignado"
        description="La coordinadora todavía no vinculó tu cuenta."
      />
    );
  }

  const nextVisit = data.visits.find(
    (visit) =>
      visit.status === "scheduled" ||
      visit.status === "confirmed" ||
      visit.status === "in_progress",
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Calendario"
        title="Las visitas de Elena"
        description="Próximas atenciones y el historial reciente del plan."
        backHref="/inicio"
        actions={
          <Badge variant="outline" className="rounded-full">
            {data.visits.filter((visit) => visit.status === "scheduled" || visit.status === "confirmed").length} próximas
          </Badge>
        }
      />

      {nextVisit ? (
        <Card className="border-primary/20 bg-linear-to-br from-sky-50 via-white to-teal-50">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <span
              className={cn(
                "grid size-12 shrink-0 place-items-center rounded-2xl",
                disciplineMeta[nextVisit.discipline].className,
              )}
            >
              <Stethoscope className="size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Próxima visita
              </p>
              <p className="font-heading text-lg font-bold">
                {disciplineMeta[nextVisit.discipline].label}
              </p>
              <p className="text-sm text-muted-foreground">
                {nextVisit.professional} · {nextVisit.date} · {nextVisit.time}
              </p>
            </div>
            <VisitStatusBadge status={nextVisit.status} />
            <Link href={`/visitas/${nextVisit.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              Ver detalle
              <ArrowRight className="size-4" />
            </Link>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={CalendarDays}
          title="Sin visitas próximas"
          description="Puedes pedir una visita extra o un cambio a coordinación."
          action={
            <Link href="/solicitudes?pedir=1&type=extra_visit" className={cn(buttonVariants())}>
              Pedir una visita
            </Link>
          }
        />
      )}

      <FamilyCalendarList visits={data.visits} />
    </div>
  );
}
