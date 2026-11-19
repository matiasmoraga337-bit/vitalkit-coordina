import type { Metadata } from "next";
import { FullJourneyDemo } from "@/components/demo/full-journey-demo";

export const metadata: Metadata = {
  title: "Flujo completo — Demo VitalKit",
  description:
    "Recorrido interactivo desde la compra del plan hasta el seguimiento del cuidado.",
};

export default function FullJourneyDemoPage() {
  return <FullJourneyDemo />;
}
