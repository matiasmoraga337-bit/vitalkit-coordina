import type { Metadata } from "next";
import { connection } from "next/server";
import { FullJourneyDemo } from "@/components/demo/full-journey-demo";
import { createDemoSlots } from "@/components/demo/demo-types";

export const instant = false;

export const metadata: Metadata = {
  title: "Flujo completo — Demo VitalKit",
  description:
    "Recorrido interactivo desde la compra del plan hasta el seguimiento del cuidado.",
};

export default async function FullJourneyDemoPage() {
  await connection();
  return <FullJourneyDemo initialSlots={createDemoSlots()} />;
}
