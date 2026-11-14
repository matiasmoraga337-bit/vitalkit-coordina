import { Clock3 } from "lucide-react";
import { AvailabilityForm } from "@/components/app/availability-form";
import { PageHeader } from "@/components/app/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getProfessionalAvailability } from "@/lib/data/professional";

export const instant = false;

export default async function ProfessionalAvailabilityPage() {
  const { supabase, profile } = await requireRole("professional");
  const blocks = await getProfessionalAvailability(supabase, profile.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Disponibilidad"
        title="Tu semana de atención"
        description="Define los días y horarios en que puedes recibir visitas."
        backHref="/agenda"
      />

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardDescription>Bloques semanales</CardDescription>
            <CardTitle className="text-xl">Horario referencial</CardTitle>
          </div>
          <Clock3 className="size-5 text-primary" />
        </CardHeader>
        <CardContent>
          <AvailabilityForm initialBlocks={blocks} />
        </CardContent>
      </Card>
    </div>
  );
}
