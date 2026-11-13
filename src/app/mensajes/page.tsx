import Link from "next/link";
import { ArrowRight, Inbox, MessageCircle } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { EmptyState } from "@/components/app/empty-state";
import { FeedbackBanner } from "@/components/app/feedback-banner";
import { MessageThreadView } from "@/components/app/message-thread";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getInitials } from "@/lib/auth/roles";
import { getCoordinatorThreads, getFamilyThread } from "@/lib/data/messages";
import { formatRelativeDate } from "@/lib/format";
import type { Role } from "@/lib/mock-data";

export const instant = false;

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await searchParams;
  const { supabase, user, profile } = await requireRole(["family", "coordinator"]);
  const role: Role = profile.role === "coordinator" ? "coordinator" : "family";

  if (profile.role === "family") {
    const thread = await getFamilyThread(supabase, profile.id, user.id);
    return (
      <AppShell
        role="family"
        user={{ name: profile.full_name, detail: "Mensajes", initials: getInitials(profile.full_name) }}
      >
        <div className="space-y-6">
          <PageHeader
            eyebrow="Mensajes"
            title="Habla con tu coordinadora"
            description="Un solo canal para cambios, dudas y seguimiento."
            backHref="/inicio"
          />
          <FeedbackBanner error={error} ok={ok} />
          {thread ? (
            <MessageThreadView thread={thread} redirectTo="/mensajes" />
          ) : (
            <EmptyState icon={MessageCircle} title="Sin hogar asignado" description="La coordinadora todavía no vinculó tu cuenta." />
          )}
        </div>
      </AppShell>
    );
  }

  const threads = await getCoordinatorThreads(supabase, user.id);

  return (
    <AppShell
      role={role}
      user={{ name: profile.full_name, detail: "Mensajes", initials: getInitials(profile.full_name) }}
    >
      <div className="space-y-6">
        <PageHeader
          eyebrow="Mensajes"
          title="Conversaciones"
          description="Elige un hogar para responder a la familia."
          backHref="/tablero"
          actions={<Badge variant="outline" className="rounded-full">{threads.length} hogares</Badge>}
        />
        <FeedbackBanner error={error} ok={ok} />
        <div className="grid gap-3">
          {threads.map((thread) => (
            <Link key={thread.householdId} href={`/mensajes/${thread.householdId}`} className="group">
              <Card className="transition-colors group-hover:bg-muted/30">
                <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <Inbox className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{thread.householdName}</p>
                      {thread.unreadCount > 0 && (
                        <Badge className="rounded-full bg-amber-100 text-amber-800 hover:bg-amber-100">
                          {thread.unreadCount} nuevo(s)
                        </Badge>
                      )}
                    </div>
                    <p className="truncate text-sm text-muted-foreground">{thread.lastMessage}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {thread.lastMessageAt ? formatRelativeDate(thread.lastMessageAt) : ""}
                    <ArrowRight className="size-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
