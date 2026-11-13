import type { Database } from "@/lib/supabase/database.types";

export type AppRole = Database["public"]["Enums"]["app_role"];

export const roleHome: Record<AppRole, string> = {
  family: "/inicio",
  coordinator: "/tablero",
  professional: "/agenda",
  admin: "/tablero",
};

export const roleLabel: Record<AppRole, string> = {
  family: "Familia",
  coordinator: "Coordinación",
  professional: "Profesional",
  admin: "Administración",
};

export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
