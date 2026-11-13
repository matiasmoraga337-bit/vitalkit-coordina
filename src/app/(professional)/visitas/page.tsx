import Link from "next/link";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { VisitStatusBadge } from "@/components/app/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getInitials } from "@/lib/auth/roles";
import { getProfessionalAgenda } from "@/lib/data/professional";
import { disciplineMeta } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const instant = false;

export default async function ProfessionalVisitsPage() {
  const { supabase, profile } = await requireRole("professional");
  const data = await getProfessionalAgenda(supabase, profile.id);
  const completed = data.visits.filter((visit) => visit.status === "completed");
  const active = data.visits.filter((visit) => visit.status !== "completed");

  return (
    <AppShell
      role="professional"
      user={{ name: profile.full_name, detail: "Profesional", initials: getInitials(profile.full_name) }}
    >
      <div className="space-y-6">
        <PageHeader
          eyebrow="Historial"
          title="Mis visitas"
          description="Atenciones pendientes y visitas completadas."
          backHref="/agenda"
          actions={<Badge variant="outline" className="rounded-full">{completed.length} completadas</Badge>}
        />

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold">Pendientes</h2>
          {active.length === 0 ? (
            <EmptyState icon={ClipboardCheck} title="Sin visitas pendientes" description="No tienes atenciones programadas." />
          ) : (
            <div className="grid gap-3">
              {active.map((visit) => (
                <Link key={visit.id} href={`/visitas/${visit.id}`} className="group">
                  <Card className="transition-colors group-hover:bg-muted/30">
                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                      <span className="w-20 shrink-0 rounded-xl bg-muted px-2 py-2 text-center text-sm font-semibold">{visit.time}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{visit.household}</p>
                        <p className="text-sm text-muted-foreground">{visit.patient} · {visit.date}</p>
                        <span className={cn("mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold", disciplineMeta[visit.discipline].className)}>
                          {disciplineMeta[visit.discipline].label}
                        </span>
                      </div>
                      <VisitStatusBadge status={visit.status} />
                      <ArrowRight className="size-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold">Completadas</h2>
          {completed.length === 0 ? (
            <EmptyState icon={ClipboardCheck} title="Sin visitas completadas" description="Cuando cierres una visita aparecerá aquí." />
          ) : (
            <div className="grid gap-3">
              {completed.map((visit) => (
                <Link key={visit.id} href={`/visitas/${visit.id}`} className="group">
                  <Card className="transition-colors group-hover:bg-muted/30">
                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                      <span className="w-20 shrink-0 rounded-xl bg-muted px-2 py-2 text-center text-sm font-semibold">{visit.time}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{visit.household}</p>
                        <p className="text-sm text-muted-foreground">{visit.patient} · {visit.date}</p>
                      </div>
                      <VisitStatusBadge status={visit.status} />
                      <ArrowRight className="size-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
