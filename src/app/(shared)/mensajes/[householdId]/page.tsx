import { notFound } from "next/navigation";
import { FeedbackBanner } from "@/components/app/feedback-banner";
import { MessageThreadView } from "@/components/app/message-thread";
import { PageHeader } from "@/components/app/page-header";
import { requireRole } from "@/lib/auth";
import { getFamilyThread, getThreadForCoordinator } from "@/lib/data/messages";

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

  const thread =
    profile.role === "family"
      ? await getFamilyThread(supabase, profile.id, user.id)
      : await getThreadForCoordinator(supabase, householdId, user.id);

  if (!thread || thread.householdId !== householdId) {
    notFound();
  }

  return (
    <>
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
    </>
  );
}
