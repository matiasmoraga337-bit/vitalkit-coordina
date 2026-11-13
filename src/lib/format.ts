export function formatCLP(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatVisitDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const formatted = new Intl.DateTimeFormat("es-CL", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1).replace(".", "");
}

export function formatVisitTime(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatRelativeDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startDate.getTime() - startToday.getTime()) / 86400000);

  if (diffDays === 0) return `Hoy, ${formatVisitTime(date)}`;
  if (diffDays === -1) return `Ayer, ${formatVisitTime(date)}`;
  if (diffDays === 1) return `Mañana, ${formatVisitTime(date)}`;
  return `${formatVisitDate(date)} · ${formatVisitTime(date)}`;
}

export function ageFromBirthDate(value: string | null) {
  if (!value) return null;
  const birth = new Date(value);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const month = today.getMonth() - birth.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

export function formatLongDate(value: string | Date = new Date()) {
  const date = typeof value === "string" ? new Date(value) : value;
  const formatted = new Intl.DateTimeFormat("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
