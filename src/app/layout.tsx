import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "VitalKit Coordina",
    template: "%s · VitalKit Coordina",
  },
  description:
    "Coordinación de cuidado domiciliario para familias de Puerto Montt: plan, agenda, visitas y reportes en un solo lugar.",
  applicationName: "VitalKit Coordina",
  appleWebApp: {
    capable: true,
    title: "VitalKit",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#0369a1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn(inter.variable, spaceGrotesk.variable)}>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <TooltipProvider>{children}</TooltipProvider>
        <PwaRegister />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
