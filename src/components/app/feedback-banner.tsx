import { AlertCircle, CheckCircle2 } from "lucide-react";

export function FeedbackBanner({
  error,
  ok,
}: {
  error?: string;
  ok?: string;
}) {
  if (!error && !ok) return null;

  if (error) {
    return (
      <div
        role="alert"
        className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
      >
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div
      role="status"
      className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800"
    >
      <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
      <p>{ok}</p>
    </div>
  );
}
