import { Clock3 } from "lucide-react";
import { FeedbackBanner } from "@/components/app/feedback-banner";
import { SubmitButton } from "@/components/app/submit-button";
import { PageHeader } from "@/components/app/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireRole } from "@/lib/auth";
import { getProfessionalAvailability } from "@/lib/data/professional";
import { updateAvailability } from "@/app/actions/availability";

export const instant = false;

const weekdays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default async function ProfessionalAvailabilityPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await searchParams;
  const { supabase, profile } = await requireRole("professional");
  const blocks = await getProfessionalAvailability(supabase, profile.id);
  const byWeekday = new Map(blocks.map((block) => [block.weekday, block]));

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Disponibilidad"
          title="Tu semana de atención"
          description="Define los días y horarios en que puedes recibir visitas."
          backHref="/agenda"
        />

        <FeedbackBanner error={error} ok={ok} />

        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div>
              <CardDescription>Bloques semanales</CardDescription>
              <CardTitle className="text-xl">Horario referencial</CardTitle>
            </div>
            <Clock3 className="size-5 text-primary" />
          </CardHeader>
          <CardContent>
            <form action={updateAvailability} className="space-y-3">
              {weekdays.map((label, weekday) => {
                const block = byWeekday.get(weekday);
                return (
                  <div
                    key={weekday}
                    className="grid items-center gap-2 rounded-xl border p-3 sm:grid-cols-[1fr_auto_auto_auto]"
                  >
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        name={`active_${weekday}`}
                        defaultChecked={block?.active ?? false}
                        className="size-4 rounded border-input"
                      />
                      {label}
                    </label>
                    <Input
                      name={`start_${weekday}`}
                      type="time"
                      defaultValue={block?.startTime.slice(0, 5) ?? "09:00"}
                      className="w-full sm:w-28"
                    />
                    <Input
                      name={`end_${weekday}`}
                      type="time"
                      defaultValue={block?.endTime.slice(0, 5) ?? "18:00"}
                      className="w-full sm:w-28"
                    />
                    <span className="text-xs text-muted-foreground">hrs</span>
                  </div>
                );
              })}
              <SubmitButton className="w-full" pendingText="Guardando...">
                Guardar disponibilidad
              </SubmitButton>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
