import { cn } from "@/lib/utils";

export function Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-xl bg-linear-to-br from-sky-400 via-sky-600 to-teal-700 text-white shadow-sm shadow-sky-900/20"
      >
        <svg viewBox="0 0 24 24" fill="none" className="size-5">
          <path
            d="M12 21s-7.2-4.4-7.2-10.1A4.2 4.2 0 0 1 12 7.9a4.2 4.2 0 0 1 7.2 3c0 5.7-7.2 10.1-7.2 10.1Z"
            fill="currentColor"
            opacity=".95"
          />
          <path
            d="M8.2 12.4h2.1l1.1-2.2 1.6 4.1 1.2-1.9h2.4"
            stroke="#070d1a"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {!compact && (
        <span className="font-heading text-lg font-bold tracking-tight text-foreground">
          VITAL<span className="text-primary">KIT</span>
        </span>
      )}
    </span>
  );
}
