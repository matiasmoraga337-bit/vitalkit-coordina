import Link from "next/link";
import { cacheLife, cacheTag } from "next/cache";
import { ClipboardList, MessageCircle, Target } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
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
                <Button variant="outline" className="w-full" disabled>
                  Descargar plan
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}