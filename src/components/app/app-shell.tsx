"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  Home,
  Inbox,
  LayoutDashboard,
  Menu,
  Receipt,
  UserCheck,
  Users,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/mock-data";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
};

const roleConfig: Record<
  Role,
  {
    label: string;
    userName: string;
    userDetail: string;
    initials: string;
    home: string;
    nav: NavItem[];
  }
> = {
  family: {
    label: "Familia",
    userName: "Carolina Rojas",
    userDetail: "Plan Integral · Elena Rojas",
    initials: "CR",
    home: "/inicio",
    nav: [
      { label: "Inicio", href: "/inicio", icon: Home },
      { label: "Calendario", href: "/calendario", icon: CalendarDays, disabled: true },
      { label: "Solicitudes", href: "/solicitudes", icon: Inbox, disabled: true },
      { label: "Plan de cuidados", href: "/plan", icon: ClipboardList, disabled: true },
      { label: "Factura", href: "/factura", icon: Receipt, disabled: true },
    ],
  },
  coordinator: {
    label: "Coordinación",
    userName: "Valentina Soto",
    userDetail: "Coordinadora del piloto",
    initials: "VS",
    home: "/tablero",
    nav: [
      { label: "Tablero", href: "/tablero", icon: LayoutDashboard },
      { label: "Casos", href: "/casos", icon: Users, disabled: true },
      { label: "Solicitudes", href: "/solicitudes", icon: Inbox, disabled: true },
      { label: "Profesionales", href: "/profesionales", icon: UserCheck, disabled: true },
    ],
  },
  professional: {
    label: "Profesional",
    userName: "Diego Pérez",
    userDetail: "Kinesiólogo · Puerto Montt",
    initials: "DP",
    home: "/agenda",
    nav: [
      { label: "Mi agenda", href: "/agenda", icon: CalendarDays },
      { label: "Visitas", href: "/visitas", icon: ClipboardCheck, disabled: true },
      { label: "Disponibilidad", href: "/disponibilidad", icon: Clock3, disabled: true },
    ],
  },
};

function SidebarContent({ role }: { role: Role }) {
  const pathname = usePathname();
  const config = roleConfig[role];

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-5 pb-4">
        <Link href="/" className="inline-flex rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
          <Logo />
        </Link>
        <div className="mt-3 flex items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            {config.label}
          </Badge>
          <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-wide">
            Demo
          </Badge>
        </div>
      </div>

      <Separator />

      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Navegación principal">
        {config.nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          if (item.disabled) {
            return (
              <span
                key={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground/60"
                aria-disabled="true"
              >
                <Icon className="size-4" />
                <span className="flex-1">{item.label}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                  Pronto
                </span>
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {config.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{config.userName}</p>
            <p className="truncate text-xs text-muted-foreground">{config.userDetail}</p>
          </div>
        </div>
        <p className="mt-3 px-1 text-[11px] leading-relaxed text-muted-foreground">
          MVP en construcción · datos de demostración
        </p>
      </div>
    </div>
  );
}

export function AppShell({ role, children }: { role: Role; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-card lg:block">
        <SidebarContent role={role} />
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur lg:hidden">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="outline" size="icon" aria-label="Abrir menú">
                  <Menu className="size-4" />
                </Button>
              }
            />
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Menú de navegación</SheetTitle>
              </SheetHeader>
              <SidebarContent role={role} />
            </SheetContent>
          </Sheet>
          <Logo compact />
          <span className="font-heading text-sm font-bold">VITALKIT</span>
          <Badge variant="outline" className="ml-auto rounded-full text-[10px] uppercase tracking-wide">
            Demo
          </Badge>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
