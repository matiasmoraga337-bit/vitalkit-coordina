import { CheckCheck, MessageCircle, Send } from "lucide-react";
import { SubmitButton } from "@/components/app/submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { MessageThread } from "@/lib/data/messages";
import { formatRelativeDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { markMessagesRead, sendMessage } from "@/app/actions/messages";

export function MessageThreadView({
  thread,
  redirectTo,
}: {
  thread: MessageThread;
  redirectTo: string;
}) {
  return (
    <Card className="flex min-h-[60vh] flex-col">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardDescription>{thread.householdName}</CardDescription>
          <CardTitle className="text-xl">{thread.otherName}</CardTitle>
        </div>
        {thread.unreadCount > 0 && (
          <form action={markMessagesRead}>
            <input type="hidden" name="household_id" value={thread.householdId} />
            <input type="hidden" name="redirect_to" value={redirectTo} />
            <SubmitButton variant="outline" size="sm" pendingText="Marcando...">
              <CheckCheck className="size-4" />
              Marcar leído
            </SubmitButton>
          </form>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex-1 space-y-3 overflow-y-auto rounded-xl bg-muted/30 p-3">
          {thread.messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-10 text-center">
              <MessageCircle className="size-8 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium">Aún no hay mensajes</p>
              <p className="text-xs text-muted-foreground">Escribe el primero para coordinar la visita.</p>
            </div>
          ) : (
            thread.messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex", message.isOwn ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                    message.isOwn
                      ? "bg-primary text-primary-foreground"
                      : "border bg-card text-foreground",
                  )}
                >
                  <p className={cn("text-[10px] font-semibold", message.isOwn ? "text-primary-foreground/70" : "text-muted-foreground")}>
                    {message.senderName} · {formatRelativeDate(message.createdAt)}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap leading-6">{message.body}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <form action={sendMessage} className="space-y-2">
          <input type="hidden" name="household_id" value={thread.householdId} />
          <input type="hidden" name="redirect_to" value={redirectTo} />
          <Textarea
            name="body"
            required
            rows={3}
            placeholder="Escribe un mensaje a coordinación..."
          />
          <SubmitButton className="w-full" pendingText="Enviando...">
            <Send className="size-4" />
            Enviar mensaje
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
