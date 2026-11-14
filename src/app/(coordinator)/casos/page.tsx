import Link from "next/link";
import { cacheLife, cacheTag } from "next/cache";
import { ArrowRight, Inbox, Users } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getCoordinatorCasesCached } from "@/lib/data/coordinator";

export const instant = false;

export default async function CoordinatorCasesPage() {
  "use cache: private";
  cacheLife({ stale: 300, revalidate: 60, expire: 600 });
  cacheTag("coordinator-cases");

  await requireRole("coordinator");
  const cases = await getCoordinatorCasesCached();

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Casos"
          title="Familias del piloto"
          description="Cada hogar con su plan, próxima visita y solicitudes pendientes."
          backHref="/tablero"
          actions={<Badge variant="outline" className="rounded-full">{cases.length} hogares</Badge>}
        />

        {cases.length === 0 ? (
          <EmptyState icon={Users} title="Sin hogares" description="La coordinación todavía no creó casos." />
        ) : (
          <div className="grid gap-3">
            {cases.map((household) => (
              <Link key={household.id} href={`/casos/${household.id}`} className="group">
                <Card className="transition-colors group-hover:bg-muted/30">
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Users className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{household.name}</p>
                        <Badge variant="outline" className="rounded-full">{household.plan}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {household.elder} · {household.comuna} · {household.coordinator}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="text-muted-foreground">{household.nextVisit}</span>
                      {household.pendingRequests > 0 && (
                        <Badge className="rounded-full bg-amber-100 text-amber-800 hover:bg-amber-100">
                          <Inbox className="size-3" />
                          {household.pendingRequests} pendiente(s)
                        </Badge>
                      )}
                      <ArrowRight className="size-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}