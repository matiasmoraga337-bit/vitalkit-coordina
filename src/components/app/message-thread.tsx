"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { CheckCheck, Loader2, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { buttonVariants } from "@/components/ui/button";
import type { MessageThread, MessageView } from "@/lib/data/messages";
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
  const [messages, setMessages] = useState(thread.messages);
  const [unreadCount, setUnreadCount] = useState(thread.unreadCount);
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || pending) return;

    const optimistic: MessageView = {
      id: `optimistic-${Date.now()}`,
      body,
      createdAt: new Date().toISOString(),
      senderId: "me",
      senderName: "Tú",
      isOwn: true,
      readAt: null,
    };

    setMessages((current) => [...current, optimistic]);
    setDraft("");

    const formData = new FormData();
    formData.set("household_id", thread.householdId);
    formData.set("body", body);
    formData.set("redirect_to", redirectTo);

    startTransition(async () => {
      const result = await sendMessage(formData);

      if (result?.error) {
        setMessages((current) =>
          current.filter((message) => message.id !== optimistic.id),
        );
        setDraft(body);
        toast.error(result.error);
        return;
      }

      toast.success("Mensaje enviado.");
    });
  }

  function handleMarkRead() {
    if (unreadCount === 0) return;
    const previous = unreadCount;
    setUnreadCount(0);

    const formData = new FormData();
    formData.set("household_id", thread.householdId);
    formData.set("redirect_to", redirectTo);

    startTransition(async () => {
      const result = await markMessagesRead(formData);
      if (result?.error) {
        setUnreadCount(previous);
        toast.error(result.error);
        return;
      }
      toast.success("Mensajes marcados como leídos.");
    });
  }

  return (
    <Card className="flex min-h-[60vh] flex-col">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardDescription>{thread.householdName}</CardDescription>
          <CardTitle className="text-xl">{thread.otherName}</CardTitle>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkRead}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <CheckCheck className="size-4" />
            Marcar leído
          </button>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex-1 space-y-3 overflow-y-auto rounded-xl bg-muted/30 p-3">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-10 text-center">
              <MessageCircle className="size-8 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium">Aún no hay mensajes</p>
              <p className="text-xs text-muted-foreground">Escribe el primero para coordinar la visita.</p>
            </div>
          ) : (
            messages.map((message) => (
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
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="space-y-2">
          <Textarea
            name="body"
            required
            rows={3}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Escribe un mensaje a coordinación..."
          />
          <button
            type="submit"
            className={cn(buttonVariants(), "w-full")}
            disabled={pending}
            aria-busy={pending}
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="size-4" />
                Enviar mensaje
              </>
            )}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
