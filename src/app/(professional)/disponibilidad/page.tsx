import { Clock3 } from "lucide-react";
import { cacheLife, cacheTag } from "next/cache";
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
import { getProfessionalAvailabilityCached } from "@/lib/data/professional";

export const instant = false;

export default async function ProfessionalAvailabilityPage() {
  "use cache: private";
  cacheLife({ stale: 300, revalidate: 60, expire: 600 });
  cacheTag("professional-availability");

  const { profile } = await requireRole("professional");
  const blocks = await getProfessionalAvailabilityCached(profile.id);

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