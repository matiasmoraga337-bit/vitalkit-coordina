import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Navigation,
} from "lucide-react";
import { cacheLife, cacheTag } from "next/cache";
import { requireRole } from "@/lib/auth";
import { ProfessionalVisitActions } from "@/components/app/professional-visit-actions";
import { getProfessionalAgendaCached } from "@/lib/data/professional";
import { VisitStatusBadge } from "@/components/app/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { disciplineMeta } from "@/lib/mock-data";
import { formatLongDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const instant = false;

export default async function ProfessionalAgendaPage() {
  "use cache: private";
  cacheLife({ stale: 300, revalidate: 60, expire: 600 });
  cacheTag("professional-agenda");

  const { profile } = await requireRole("professional");
  const data = await getProfessionalAgendaCached(profile.id);
  const currentVisit = data.currentVisit ?? {
    id: "empty",
    household: "Sin visitas",
    patient: "Sin visitas asignadas",
    discipline: data.discipline,
    date: "?",
    time: "?",
    address: "?",
    status: "scheduled" as const,
  };
  const agendaVisits = data.visits.filter(
    (visit) => visit.status !== "completed" && visit.status !== "cancelled",
  );

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Agenda del profesional
            </p>
            <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              Hola, {profile.full_name.split(" ")[0]}. Tienes {agendaVisits.length}{" "}
              {agendaVisits.length === 1 ? "visita" : "visitas"}.
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Revisa tu ruta, registra el check-in y deja la nota de cada visita.
            </p>
          </div>
          <Badge className="w-fit rounded-full bg-sky-100 text-sky-800 hover:bg-sky-100">
            <CalendarDays className="size-3.5" />
            {formatLongDate()}
          </Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Visitas de hoy</CardDescription>
              <CardTitle className="font-heading text-3xl">{data.stats.visitsToday}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock3 className="size-4 text-primary" />
              {data.stats.visitsToday > 0 ? `${data.stats.visitsToday} en agenda` : "Sin visitas hoy"}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completadas hoy</CardDescription>
              <CardTitle className="font-heading text-3xl">{data.stats.completedToday}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="size-4 text-emerald-600" />
              {data.stats.completedToday > 0 ? "Visitas cerradas" : "Sin cierres aún"}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Próxima visita</CardDescription>
              <CardTitle className="text-lg">
                {currentVisit.time} · {currentVisit.household}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4 text-primary" />
              {currentVisit.address}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <CardHeader className="flex-row items-start justify-between gap-4">
              <div>
                <CardDescription>Ruta</CardDescription>
                <CardTitle className="text-xl">Próximas visitas</CardTitle>
              </div>
              <Badge variant="outline" className="rounded-full">
                {disciplineMeta[data.discipline].label}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {agendaVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center"
                >
                  <span className="w-16 shrink-0 rounded-lg bg-muted px-2 py-1 text-center text-sm font-semibold">
                    {visit.time}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{visit.household}</p>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          disciplineMeta[visit.discipline].className,
                        )}
                      >
                        {disciplineMeta[visit.discipline].label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {visit.patient} · {visit.date} · {visit.address}
                    </p>
                  </div>
                  <VisitStatusBadge status={visit.status} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-linear-to-br from-sky-50 to-white">
            <CardHeader>
              <CardDescription>Visita actual</CardDescription>
              <CardTitle className="text-xl">
                {currentVisit.patient}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border bg-card p-3 text-sm">
                <p className="font-semibold">{currentVisit.household}</p>
                <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="size-3.5" />
                  {currentVisit.address}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                  <Clock3 className="size-3.5" />
                  {currentVisit.date} · {currentVisit.time} hrs
                </p>
              </div>
              {data.currentVisit ? (
                <div className="space-y-2">
                  <ProfessionalVisitActions
                    visitId={data.currentVisit.id}
                    initialStatus={currentVisit.status}
                  />
                  <Button variant="ghost" className="w-full" disabled>
                    <Navigation className="size-4" />
                    Ver ruta
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay visitas pendientes.
                </p>
              )}
              <p className="text-xs leading-5 text-muted-foreground">
                El check-in y la nota se guardan en Supabase. “Ver ruta” se
                habilitará en la siguiente iteración.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}