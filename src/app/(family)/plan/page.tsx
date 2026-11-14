import Link from "next/link";
import { cacheLife, cacheTag } from "next/cache";
import { ClipboardList, MessageCircle, Target, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PrintPlanButton } from "@/components/family/print-plan-button";
import { formatCLP } from "@/lib/format";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { requireRole } from "@/lib/auth";
import { getFamilyDashboardCached } from "@/lib/data/family";
import { cn } from "@/lib/utils";

export const instant = false;

export default async function FamilyCarePlanPage() {
  "use cache: private";
  cacheLife({ stale: 300, revalidate: 60, expire: 600 });
  cacheTag("family-dashboard");

  const { profile } = await requireRole("family");
  const data = await getFamilyDashboardCached(profile.id, profile.full_name);

  if (!data) {
    return (
      <>
        <EmptyState icon={ClipboardList} title="Sin plan de cuidados" description="La coordinadora todavía no creó un plan para tu familia." />
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Seguimiento"
          title="Plan de cuidados"
          description={`Objetivos y recomendaciones para ${data.household.elderName}.`}
          backHref="/inicio"
          actions={
            <Link href="/mensajes" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              <MessageCircle className="size-4" />
              Hablar con coordinación
            </Link>
          }
        />

        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div>
              <CardDescription>Plan activo</CardDescription>
              <CardTitle className="text-xl">
                {data.household.plan} ? {formatCLP(data.household.planPrice)} / mes
              </CardTitle>
            </div>
            <Badge variant="outline" className="rounded-full">
              {data.stats.visitsThisMonth} de {data.stats.planVisits} visitas
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Uso del mes</span>
                <span className="font-semibold">
                  {data.stats.visitsThisMonth} de {data.stats.planVisits}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${Math.min(
                      Math.round(
                        (data.stats.visitsThisMonth / Math.max(data.stats.planVisits, 1)) * 100,
                      ),
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Users className="size-4 text-primary" />
                Equipo de cuidado
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  ...new Map(
                    data.visits.map((visit) => [
                      visit.professional,
                      { name: visit.professional, role: visit.professionalRole },
                    ]),
                  ).values(),
                ].map((member) => (
                  <Badge key={member.name} variant="outline" className="rounded-full">
                    {member.name} ? {member.role}
                  </Badge>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Coordinadora: {data.household.coordinator} · Próxima revisión:{" "}
              {data.carePlan?.nextReview ?? "Sin fecha"}
            </p>
          </CardContent>
        </Card>

        {!data.carePlan ? (
          <EmptyState icon={ClipboardList} title="Sin plan registrado" description="La coordinadora completará el plan después de la evaluación inicial." />
        ) : (
          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardDescription>Frecuencia</CardDescription>
                <CardTitle className="text-xl">Cómo se organiza el cuidado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="rounded-xl bg-muted/50 p-3 text-sm leading-6">
                  {data.carePlan.frequency}
                </p>
                <Separator />
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <Target className="size-4 text-primary" />
                    Objetivos
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                    {data.carePlan.goals.map((goal) => (
                      <li key={goal} className="flex gap-2">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>Para la semana</CardDescription>
                <CardTitle className="text-xl">Recomendaciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.carePlan.recommendations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Sin recomendaciones adicionales.
                  </p>
                ) : (
                  data.carePlan.recommendations.map((recommendation) => (
                    <div key={recommendation} className="rounded-xl border p-3 text-sm leading-6">
                      {recommendation}
                    </div>
                  ))
                )}
                <p className="text-xs text-muted-foreground">
                  Próxima revisión: {data.carePlan.nextReview}
                </p>
                <div className="pt-1">
                  <PrintPlanButton />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}