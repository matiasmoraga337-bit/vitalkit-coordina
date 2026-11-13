import { notFound } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { FeedbackBanner } from "@/components/app/feedback-banner";
import { MessageThreadView } from "@/components/app/message-thread";
import { PageHeader } from "@/components/app/page-header";
import { requireRole } from "@/lib/auth";
import { getInitials } from "@/lib/auth/roles";
import { getFamilyThread, getThreadForCoordinator } from "@/lib/data/messages";
import type { Role } from "@/lib/mock-data";

export const instant = false;

export default async function MessageThreadPage({
  params,
  searchParams,
}: {
  params: Promise<{ householdId: string }>;
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { householdId } = await params;
  const { error, ok } = await searchParams;
  const { supabase, user, profile } = await requireRole(["family", "coordinator"]);
  const role: Role = profile.role === "coordinator" ? "coordinator" : "family";

  const thread =
    profile.role === "family"
      ? await getFamilyThread(supabase, profile.id, user.id)
      : await getThreadForCoordinator(supabase, householdId, user.id);

  if (!thread || thread.householdId !== householdId) {
    notFound();
  }

  return (
    <AppShell
      role={role}
      user={{ name: profile.full_name, detail: "Mensajes", initials: getInitials(profile.full_name) }}
    >
      <div className="space-y-6">
        <PageHeader
          eyebrow="Mensajes"
          title={thread.householdName}
          description={`Conversación con ${thread.otherName}.`}
          backHref="/mensajes"
        />
        <FeedbackBanner error={error} ok={ok} />
        <MessageThreadView thread={thread} redirectTo={`/mensajes/${householdId}`} />
      </div>
    </AppShell>
  );
}
