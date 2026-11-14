import { BadgeCheck, MapPin, UserCheck, UserX } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { FeedbackBanner } from "@/components/app/feedback-banner";
import { PageHeader } from "@/components/app/page-header";
import { SubmitButton } from "@/components/app/submit-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import {
  getCoordinatorAvailability,
  getCoordinatorDashboard,
} from "@/lib/data/coordinator";
import { verifyProfessional } from "@/app/actions/professionals";
import { disciplineMeta } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const instant = false;

const weekdays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default async function CoordinatorProfessionalsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await searchParams;
  const { supabase } = await requireRole("coordinator");
  const [data, availability] = await Promise.all([
    getCoordinatorDashboard(supabase),
    getCoordinatorAvailability(supabase),
  ]);

  const availabilityByProfessional = new Map<string, typeof availability>();
  for (const block of availability) {
    const current = availabilityByProfessional.get(block.professional_id) ?? [];
    current.push(block);
    availabilityByProfessional.set(block.professional_id, current);
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Equipo"
          title="Profesionales"
          description="Verificación, cobertura y disponibilidad del equipo del piloto."
          backHref="/tablero"
          actions={<Badge variant="outline" className="rounded-full">{data.professionals.length} profesionales</Badge>}
        />

        <FeedbackBanner error={error} ok={ok} />

        {data.professionals.length === 0 ? (
          <EmptyState icon={UserCheck} title="Sin profesionales" description="Agrega profesionales para comenzar." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data.professionals.map((professional) => {
              const blocks = availabilityByProfessional.get(professional.id) ?? [];
              const activeDays = blocks.filter((block) => block.active).map((block) => weekdays[block.weekday]);
              const summary = activeDays.length
                ? `${activeDays[0]}–${activeDays[activeDays.length - 1]} · ${blocks[0]?.start_time.slice(0, 5)}–${blocks[0]?.end_time.slice(0, 5)}`
                : "Sin disponibilidad";

              return (
                <Card key={professional.id}>
                  <CardHeader className="flex-row items-start justify-between gap-4">
                    <div>
                      <CardDescription>{disciplineMeta[professional.discipline].label}</CardDescription>
                      <CardTitle className="text-xl">{professional.name}</CardTitle>
                    </div>
                    <Badge
                      className={cn(
                        "rounded-full",
                        professional.verification === "verified" && "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
                        professional.verification === "pending" && "bg-amber-100 text-amber-800 hover:bg-amber-100",
                        professional.verification === "rejected" && "bg-red-100 text-red-800 hover:bg-red-100",
                      )}
                    >
                      {professional.verification}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <MapPin className="size-4 text-primary" />
                        {professional.coverage.join(", ")}
                      </p>
                      <p className="flex items-center gap-2">
                        <BadgeCheck className="size-4 text-primary" />
                        {professional.visitsToday} visita(s) hoy
                      </p>
                      <p className="flex items-center gap-2">
                        <UserCheck className="size-4 text-primary" />
                        {summary}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <form action={verifyProfessional}>
                        <input type="hidden" name="professional_id" value={professional.id} />
                        <input type="hidden" name="verification" value="verified" />
                        <SubmitButton size="sm" pendingText="Verificando...">
                          Verificar
                        </SubmitButton>
                      </form>
                      <form action={verifyProfessional}>
                        <input type="hidden" name="professional_id" value={professional.id} />
                        <input type="hidden" name="verification" value="rejected" />
                        <SubmitButton
                          variant="outline"
                          size="sm"
                          pendingText="Rechazando..."
                        >
                          <UserX className="size-4" />
                          Rechazar
                        </SubmitButton>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
