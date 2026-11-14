import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/inicio/:path*",
    "/calendario/:path*",
    "/solicitudes/:path*",
    "/plan/:path*",
    "/factura/:path*",
    "/mensajes/:path*",
    "/visitas/:path*",
    "/tablero/:path*",
    "/casos/:path*",
    "/solicitudes-coordinacion/:path*",
    "/profesionales/:path*",
    "/calendario-coordinacion/:path*",
    "/agenda/:path*",
    "/disponibilidad/:path*",
    "/leads/:path*",
  ],
};
