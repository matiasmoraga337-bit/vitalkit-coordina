import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VitalKit Coordina",
    short_name: "VitalKit",
    description:
      "Coordinación de cuidado domiciliario: plan, agenda, visitas y reportes en un solo lugar.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f8fb",
    theme_color: "#0369a1",
    lang: "es-CL",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
