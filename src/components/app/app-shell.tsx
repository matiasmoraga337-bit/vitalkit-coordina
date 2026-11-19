"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  Home,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
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
import { signOut } from "@/app/actions/auth";

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
      { label: "Calendario", href: "/calendario", icon: CalendarDays },
      { label: "Mensajes", href: "/mensajes", icon: MessageCircle },
      { label: "Mi cuidado", href: "/plan", icon: ClipboardList },
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
      { label: "Casos", href: "/casos", icon: Users },
      { label: "Solicitudes", href: "/solicitudes-coordinacion", icon: Inbox },
      { label: "Profesionales", href: "/profesionales", icon: UserCheck },
      { label: "Leads", href: "/leads", icon: UserPlus },
      { label: "Calendario", href: "/calendario-coordinacion", icon: CalendarDays },
      { label: "Mensajes", href: "/mensajes", icon: MessageCircle },
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
      { label: "Visitas", href: "/visitas", icon: ClipboardCheck },
      { label: "Disponibilidad", href: "/disponibilidad", icon: Clock3 },
    ],
  },
};

function SidebarContent({ role, user }: { role: Role; user?: { name: string; detail: string; initials: string } }) {
  const pathname = usePathname();
  const router = useRouter();
  const config = roleConfig[role];

  useEffect(() => {
    const priority = [
      "/solicitudes",
      "/mensajes",
      "/agenda",
      "/tablero",
      "/casos",
      "/calendario",
      "/plan",
      "/factura",
    ];
    const targets = config.nav
      .filter((item) => !item.disabled && item.href !== pathname)
      .sort(
        (a, b) =>
          (priority.indexOf(a.href) === -1 ? 99 : priority.indexOf(a.href)) -
          (priority.indexOf(b.href) === -1 ? 99 : priority.indexOf(b.href)),
      );

    targets.forEach((item) => router.prefetch(item.href));
  }, [config.nav, pathname, router]);
  const displayUser = user ?? {
    name: config.userName,
    detail: config.userDetail,
    initials: config.initials,
  };

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
          const active =
            pathname === item.href ||
            (role === "family" &&
              item.href === "/plan" &&
              (pathname.startsWith("/solicitudes") ||
                pathname.startsWith("/factura"))) ||
            (role === "family" &&
              item.href === "/calendario" &&
              pathname.startsWith("/visitas"));

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
              prefetch={true}
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
            {displayUser.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{displayUser.name}</p>
            <p className="truncate text-xs text-muted-foreground">{displayUser.detail}</p>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between px-1">
          <span className="text-xs text-muted-foreground">Tema</span>
          <ThemeToggle />
        </div>
        <form action={signOut} className="mt-2">
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
          >
            <LogOut className="size-4" />
            Cerrar sesión
          </Button>
        </form>
        <p className="mt-3 px-1 text-[11px] leading-relaxed text-muted-foreground">
          MVP en construcción · datos de demostración
        </p>
      </div>
    </div>
  );
}

export function AppShell({
  role,
  user,
  bottomNav,
  children,
}: {
  role: Role;
  user?: { name: string; detail: string; initials: string };
  bottomNav?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background">
      <a
        href="#app-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Saltar al contenido
      </a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-card lg:block">
        <SidebarContent role={role} user={user} />
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
              <SidebarContent role={role} user={user} />
            </SheetContent>
          </Sheet>
          <Logo compact />
          <span className="font-heading text-sm font-bold">VITALKIT</span>
          <Badge variant="outline" className="ml-auto rounded-full text-[10px] uppercase tracking-wide">
            Demo
          </Badge>
          <ThemeToggle />
        </header>

        <main
          id="app-content"
          className={cn(
            "mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8",
            bottomNav && "pb-24 lg:pb-8",
          )}
        >
          {children}
        </main>
      </div>
      {bottomNav}
    </div>
  );
}
