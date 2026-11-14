import { notFound } from "next/navigation";
import { cacheLife, cacheTag } from "next/cache";
import { MessageThreadView } from "@/components/app/message-thread";
import { PageHeader } from "@/components/app/page-header";
import { requireRole } from "@/lib/auth";
import { getFamilyThreadCached, getThreadForCoordinatorCached } from "@/lib/data/messages";

export const instant = false;

export default async function MessageThreadPage({
  params,
}: {
  params: Promise<{ householdId: string }>;
}) {
  "use cache: private";
  cacheLife({ stale: 300, revalidate: 60, expire: 600 });
  cacheTag("messages");

  const { householdId } = await params;
  const { user, profile } = await requireRole(["family", "coordinator"]);

  const thread =
    profile.role === "family"
      ? await getFamilyThreadCached(profile.id, user.id)
      : await getThreadForCoordinatorCached(householdId, user.id);

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
        <MessageThreadView thread={thread} redirectTo={`/mensajes/${householdId}`} />
      </div>
    </>
  );
}