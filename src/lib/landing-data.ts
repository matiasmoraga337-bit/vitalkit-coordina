export const disciplines = [
  {
    id: "kinesiologia",
    name: "Kinesiología",
    short: "Movilidad y recuperación",
    image: "/landing/kine.webp",
    description:
      "Ejercicios, movilidad y recuperación funcional después de una cirugía o una caída.",
  },
  {
    id: "nutricion",
    name: "Nutrición",
    short: "Alimentación y energía",
    image: "/landing/nutri.webp",
    description:
      "Planes de alimentación adaptados a la persona mayor, sus gustos y tratamientos.",
  },
  {
    id: "enfermeria",
    name: "Enfermería",
    short: "Control y cuidado",
    image: "/landing/nurse.webp",
    description:
      "Control de signos vitales, medicación, curaciones y acompañamiento clínico.",
  },
  {
    id: "aseo",
    name: "Aseo especializado",
    short: "Un hogar seguro",
    image: "/landing/cleaner.webp",
    description:
      "Apoyo en el hogar para mantener espacios limpios, seguros y cómodos.",
  },
];

export const steps = [
  {
    title: "Evaluación inicial",
    description:
      "Conversamos con la familia, revisamos las necesidades y definimos objetivos.",
  },
  {
    title: "Plan de cuidados",
    description:
      "Armamos una combinación de disciplinas y visitas que se ajuste a la persona.",
  },
  {
    title: "Visitas coordinadas",
    description:
      "Los profesionales llegan a casa. La familia ve la agenda y el estado de cada visita.",
  },
  {
    title: "Seguimiento",
    description:
      "Cada visita deja una nota y un reporte. La coordinación ajusta el plan cuando hace falta.",
  },
];

export const faqs = [
  {
    question: "¿Qué incluye un plan?",
    answer:
      "Coordinación, evaluación inicial, agenda, visitas de las disciplinas incluidas, seguimiento y una sola factura. Las visitas adicionales se cobran aparte.",
  },
  {
    question: "¿Puedo cambiar de plan?",
    answer:
      "Sí. El plan se puede ajustar según la evolución de la persona y la frecuencia de visitas que necesite.",
  },
  {
    question: "¿Los profesionales están verificados?",
    answer:
      "Sí. Revisamos identidad, licencia, referencias y antecedentes antes de asignar a un profesional.",
  },
  {
    question: "¿Qué pasa si necesito una visita extra?",
    answer:
      "Puedes solicitarla desde la app. La coordinación revisa disponibilidad, confirma el profesional y avisa a la familia.",
  },
  {
    question: "¿Cómo se paga?",
    answer:
      "La idea es una sola factura mensual. En esta etapa el pago real no está integrado; la factura es simulada.",
  },
  {
    question: "¿Cubren mi comuna?",
    answer:
      "El piloto parte en Puerto Montt y Alerce. Estamos evaluando Puerto Varas, Frutillar y otras comunas cercanas.",
  },
];

export const coveredComunas = ["Puerto Montt", "Alerce"];
export const pendingComunas = [
  "Puerto Varas",
  "Frutillar",
  "Llanquihue",
  "Calbuco",
  "Maullín",
  "Otra comuna",
];

export const comunaOptions = [
  { value: "puerto-montt", label: "Puerto Montt" },
  { value: "alerce", label: "Alerce" },
  { value: "puerto-varas", label: "Puerto Varas" },
  { value: "frutillar", label: "Frutillar" },
  { value: "llanquihue", label: "Llanquihue" },
  { value: "calbuco", label: "Calbuco" },
  { value: "maullin", label: "Maullín" },
  { value: "otra", label: "Otra comuna" },
];
