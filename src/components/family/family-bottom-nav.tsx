"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ClipboardList, Home, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/inicio", label: "Inicio", icon: Home },
  { href: "/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/mensajes", label: "Mensajes", icon: MessageCircle },
  { href: "/plan", label: "Mi cuidado", icon: ClipboardList },
];

export function FamilyBottomNav({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      aria-label="Navegación familiar"
    >
      <div className="mx-auto grid h-16 max-w-md grid-cols-4 items-center px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/plan"
              ? pathname === "/plan" ||
                pathname.startsWith("/solicitudes") ||
                pathname.startsWith("/factura")
              : item.href === "/calendario"
                ? pathname.startsWith("/calendario") ||
                  pathname.startsWith("/visitas")
                : pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={cn(
                "relative flex flex-col items-center gap-0.5 rounded-lg py-1 text-[10px] font-medium",
                active ? "text-primary" : "text-muted-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-5" />
              {item.label}
              {item.href === "/mensajes" && unreadCount > 0 && (
                <span className="absolute right-4 top-0 grid min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
