import Link from "next/link";
import { Inbox, Plus } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { RequestStatusBadge } from "@/components/app/status-badge";
import { buttonVariants } from "@/components/ui/button";
import type { FamilyRequest } from "@/lib/data/family";
import { disciplineMeta } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const typeLabel: Record<string, string> = {
  extra_visit: "Visita extra",
  change: "Cambio de visita",
  contact: "Contacto",
};

export function FamilyRequestsPanel({
  initialRequests,
}: {
  initialRequests: FamilyRequest[];
}) {
  return (
    <div className="space-y-3">
      {initialRequests.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Sin solicitudes"
          description="Cuando pidas una visita extra o un cambio aparecerá aquí."
        />
      ) : (
        initialRequests.map((request) => (
          <div key={request.id} className="rounded-xl border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold">
                  {typeLabel[request.type] ?? "Solicitud"}
                </p>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    disciplineMeta[request.discipline].className,
                  )}
                >
                  {disciplineMeta[request.discipline].label}
                </span>
              </div>
              <RequestStatusBadge status={request.status} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {request.requestedBy} · {request.date}
            </p>
            <p className="mt-2 text-sm leading-6">{request.reason}</p>
            {request.visitLabel && (
              <p className="mt-1 rounded-lg bg-muted/50 px-2 py-1 text-xs text-muted-foreground">
                Visita vinculada: {request.visitLabel}
              </p>
            )}
          </div>
        ))
      )}

      <Link
        href="/solicitudes?pedir=1&type=extra_visit"
        className={cn(buttonVariants({ variant: "outline" }), "w-full")}
      >
        <Plus className="size-4" />
        Nueva solicitud
      </Link>
    </div>
  );
}
