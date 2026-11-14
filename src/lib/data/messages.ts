import type { SupabaseClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type Client = SupabaseClient<Database>;

export type MessageView = {
  id: string;
  body: string;
  createdAt: string;
  senderId: string;
  senderName: string;
  isOwn: boolean;
  readAt: string | null;
};

export type MessageThread = {
  householdId: string;
  householdName: string;
  otherName: string;
  messages: MessageView[];
  unreadCount: number;
};

async function mapMessages(
  supabase: Client,
  rows: Database["public"]["Tables"]["messages"]["Row"][],
  currentUserId: string,
): Promise<MessageView[]> {
  const senderIds = [...new Set(rows.map((row) => row.sender_id))];
  const { data: profiles } = senderIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", senderIds)
    : { data: [] as Array<{ id: string; full_name: string }> };

  const names = new Map((profiles ?? []).map((profile) => [profile.id, profile.full_name]));

  return rows.map((row) => ({
    id: row.id,
    body: row.body,
    createdAt: row.created_at,
    senderId: row.sender_id,
    senderName: names.get(row.sender_id) ?? "Usuario",
    isOwn: row.sender_id === currentUserId,
    readAt: row.read_at,
  }));
}

export async function getFamilyThread(
  supabase: Client,
  profileId: string,
  currentUserId: string,
): Promise<MessageThread | null> {
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("profile_id", profileId)
    .limit(1)
    .maybeSingle();

  if (!membership) return null;

  const { data: household } = await supabase
    .from("households")
    .select("id, name, coordinator_id")
    .eq("id", membership.household_id)
    .single();

  if (!household) return null;

  const [messagesResult, coordinatorResult] = await Promise.all([
    supabase
      .from("messages")
      .select("*")
      .eq("household_id", household.id)
      .order("created_at", { ascending: true }),
    household.coordinator_id
      ? supabase.from("profiles").select("full_name").eq("id", household.coordinator_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  const rows = messagesResult.data ?? [];
  const messages = await mapMessages(supabase, rows, currentUserId);

  return {
    householdId: household.id,
    householdName: household.name,
    otherName: coordinatorResult.data?.full_name ?? "Coordinación",
    messages,
    unreadCount: rows.filter(
      (message) => message.sender_id !== currentUserId && !message.read_at,
    ).length,
  };
}

export async function getCoordinatorThreads(
  supabase: Client,
  currentUserId: string,
): Promise<
  Array<{
    householdId: string;
    householdName: string;
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: number;
  }>
> {
  const [householdsResult, messagesResult] = await Promise.all([
    supabase.from("households").select("id, name").order("name"),
    supabase.from("messages").select("*").order("created_at", { ascending: false }),
  ]);

  const messages = messagesResult.data ?? [];

  return (householdsResult.data ?? []).map((household) => {
    const householdMessages = messages.filter((message) => message.household_id === household.id);
    const last = householdMessages[0];
    return {
      householdId: household.id,
      householdName: household.name,
      lastMessage: last?.body ?? "Sin mensajes",
      lastMessageAt: last?.created_at ?? "",
      unreadCount: householdMessages.filter(
        (message) => message.sender_id !== currentUserId && !message.read_at,
      ).length,
    };
  });
}

export async function getThreadForCoordinator(
  supabase: Client,
  householdId: string,
  currentUserId: string,
): Promise<MessageThread | null> {
  const { data: household } = await supabase
    .from("households")
    .select("id, name")
    .eq("id", householdId)
    .maybeSingle();

  if (!household) return null;

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("household_id", householdId)
    .order("created_at", { ascending: true });

  const { data: member } = await supabase
    .from("household_members")
    .select("profile_id")
    .eq("household_id", householdId)
    .limit(1)
    .maybeSingle();

  const familyProfile = member
    ? await supabase.from("profiles").select("full_name").eq("id", member.profile_id).maybeSingle()
    : { data: null };

  const rows = messages ?? [];

  return {
    householdId: household.id,
    householdName: household.name,
    otherName: familyProfile.data?.full_name ?? household.name,
    messages: await mapMessages(supabase, rows, currentUserId),
    unreadCount: rows.filter(
      (message) => message.sender_id !== currentUserId && !message.read_at,
    ).length,
  };
}

export async function getFamilyThreadCached(profileId: string, currentUserId: string) {
  "use cache: private";
  cacheLife({ stale: 300, revalidate: 60, expire: 600 });
  cacheTag("messages");
  const supabase = await createClient();
  return getFamilyThread(supabase, profileId, currentUserId);
}

export async function getCoordinatorThreadsCached(currentUserId: string) {
  "use cache: private";
  cacheLife({ stale: 300, revalidate: 60, expire: 600 });
  cacheTag("messages");
  const supabase = await createClient();
  return getCoordinatorThreads(supabase, currentUserId);
}

export async function getThreadForCoordinatorCached(
  householdId: string,
  currentUserId: string,
) {
  "use cache: private";
  cacheLife({ stale: 300, revalidate: 60, expire: 600 });
  cacheTag("messages");
  const supabase = await createClient();
  return getThreadForCoordinator(supabase, householdId, currentUserId);
}
