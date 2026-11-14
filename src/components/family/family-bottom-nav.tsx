"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Ellipsis,
  Home,
  MessageCircle,
  Plus,
  Receipt,
  ClipboardList,
} from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const items = [
  { href: "/inicio", label: "Inicio", icon: Home },
  { href: "/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/mensajes", label: "Mensajes", icon: MessageCircle },
];

export function FamilyBottomNav({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      aria-label="Navegación familiar"
    >
      <div className="mx-auto grid h-16 max-w-md grid-cols-5 items-center px-2">
        {items.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg py-1 text-[10px] font-medium",
                active ? "text-primary" : "text-muted-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}

        <Link
          href="/inicio?pedir=1&type=extra_visit"
          className="mx-auto -mt-6 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30"
          aria-label="Pedir una visita"
        >
          <Plus className="size-6" />
        </Link>

        {items.slice(2).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
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
                <span className="absolute right-3 top-0 grid min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}

        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <SheetTrigger
            render={
              <button
                type="button"
                className="flex flex-col items-center gap-0.5 rounded-lg py-1 text-[10px] font-medium text-muted-foreground"
                aria-label="Más opciones"
              >
                <Ellipsis className="size-5" />
                Más
              </button>
            }
          />
          <SheetContent side="bottom" className="rounded-t-3xl">
            <SheetHeader>
              <SheetTitle>Más opciones</SheetTitle>
            </SheetHeader>
            <div className="grid gap-2 px-4 pb-6">
              <Link
                href="/plan"
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 rounded-xl border p-3 text-sm font-medium"
              >
                <ClipboardList className="size-4 text-primary" />
                Plan de cuidados
              </Link>
              <Link
                href="/factura"
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 rounded-xl border p-3 text-sm font-medium"
              >
                <Receipt className="size-4 text-primary" />
                Ver factura
              </Link>
              <div className="flex items-center justify-between rounded-xl border p-3 text-sm font-medium">
                Tema
                <ThemeToggle />
              </div>
              <form action={signOut}>
                <Button type="submit" variant="outline" className="w-full">
                  Cerrar sesión
                </Button>
              </form>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
