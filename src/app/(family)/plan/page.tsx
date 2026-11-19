import Link from "next/link";
import { cacheLife, cacheTag } from "next/cache";
import {
  ArrowRight,
  ClipboardList,
  Inbox,
  MessageCircle,
  Receipt,
  Target,
  Users,
} from "lucide-react";
import { CareJourney } from "@/components/family/care-journey";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
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
import { formatCLP } from "@/lib/format";

export const instant = false;

const accessLinks = [
  {
    href: "/solicitudes",
    label: "Solicitudes",
    description: "Pide una visita o un cambio.",
    icon: Inbox,
  },
  {
    href: "/factura",
    label: "Factura",
    description: "Revisa y paga tu plan mensual.",
    icon: Receipt,
  },
  {
    href: "/mensajes",
    label: "Mensajes",
    description: "Habla con tu coordinadora.",
    icon: MessageCircle,
  },
];

export default async function FamilyCarePlanPage() {
  "use cache: private";
  cacheLife({ stale: 300, revalidate: 60, expire: 600 });
  cacheTag("family-dashboard");

  const { profile } = await requireRole("family");
  const data = await getFamilyDashboardCached(profile.id, profile.full_name);

  if (!data) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Sin plan de cuidados"
        description="La coordinadora todavía no creó un plan para tu familia."
      />
    );
  }

  const planUsage = data.stats.planVisits
    ? Math.min(
        Math.round((data.stats.visitsThisMonth / data.stats.planVisits) * 100),
        100,
      )
    : 0;
  const team = [
    ...new Map(
      data.visits.map((visit) => [
        visit.professional,
        { name: visit.professional, role: visit.professionalRole },
      ]),
    ).values(),
  ];

  return (
    <div className="space-y-7">
      <PageHeader
        title="Mi cuidado"
        description={`El plan, el equipo y los accesos de ${data.household.elderName}.`}
        backHref="/inicio"
      />

      <CareJourney data={data} />

      <Card>
        <CardHeader>
          <CardDescription>Plan activo</CardDescription>
          <CardTitle className="text-xl">
            {data.household.plan} · {formatCLP(data.household.planPrice)} / mes
          </CardTitle>
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
                style={{ width: `${planUsage}%` }}
              />
            </div>
          </div>

          <Separator />

          <div>
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Users className="size-4 text-primary" />
              Equipo de cuidado
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {team.length > 0 ? (
                team.map((member) => (
                  <span
                    key={member.name}
                    className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {member.name} · {member.role}
                  </span>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Coordinación está asignando al equipo.
                </p>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Coordinadora: {data.household.coordinator} · Próxima revisión:{" "}
            {data.carePlan?.nextReview ?? "Sin fecha"}
          </p>
        </CardContent>
      </Card>

      {!data.carePlan ? (
        <EmptyState
          icon={ClipboardList}
          title="Tu plan se está preparando"
          description="Después de la evaluación inicial, coordinación definirá los objetivos y la frecuencia de las visitas."
        />
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
                  <div
                    key={recommendation}
                    className="rounded-xl border p-3 text-sm leading-6"
                  >
                    {recommendation}
                  </div>
                ))
              )}
              <p className="text-xs text-muted-foreground">
                Próxima revisión: {data.carePlan.nextReview}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <section className="space-y-3" aria-labelledby="access-title">
        <h2 id="access-title" className="font-heading text-lg font-bold">
          Accesos rápidos
        </h2>
        <div className="grid gap-2 sm:grid-cols-3">
          {accessLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-start gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/40"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{link.label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {link.description}
                  </span>
                </span>
                <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
