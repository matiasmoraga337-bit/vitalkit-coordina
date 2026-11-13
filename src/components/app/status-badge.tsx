import { cn } from "@/lib/utils";
import {
  requestStatusMeta,
  visitStatusMeta,
  type RequestStatus,
  type VisitStatus,
} from "@/lib/mock-data";

export function VisitStatusBadge({ status }: { status: VisitStatus }) {
  const meta = visitStatusMeta[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        meta.className,
      )}
    >
      {meta.label}
    </span>
  );
}

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const meta = requestStatusMeta[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        meta.className,
      )}
    >
      {meta.label}
    </span>
  );
}
