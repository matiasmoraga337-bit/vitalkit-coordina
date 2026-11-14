"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "#incluye", label: "Qué incluye" },
  { href: "#como", label: "Cómo funciona" },
  { href: "#cobertura", label: "Cobertura" },
  { href: "#planes", label: "Planes" },
  { href: "#faq", label: "FAQ" },
];

export function LandingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
          <Logo />
        </Link>

        <nav className="ml-6 hidden items-center gap-6 lg:flex" aria-label="Navegación principal">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Ingresar
          </Link>
          <Link href="/demo" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Probar demo
          </Link>
          <a href="#evaluacion" className={cn(buttonVariants({ size: "sm" }))}>
            Solicitar evaluación
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className={cn(buttonVariants({ variant: "outline", size: "icon" }), "ml-auto md:hidden")}
          aria-expanded={open}
          aria-controls="landing-mobile-nav"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {open && (
        <div id="landing-mobile-nav" className="border-t bg-background px-4 py-4 md:hidden">
          <nav className="grid gap-1" aria-label="Navegación mobile">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 grid gap-2">
            <a href="#evaluacion" onClick={() => setOpen(false)} className={cn(buttonVariants())}>
              Solicitar evaluación
            </a>
            <Link href="/demo" className={cn(buttonVariants({ variant: "outline" }))}>
              Probar demo
            </Link>
            <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }))}>
              Ingresar
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
