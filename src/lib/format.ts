import { format, formatDistanceToNowStrict, isValid, parseISO } from "date-fns";

function toDate(value: string | number | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : typeof value === "number" ? new Date(value) : parseISO(value);
  return isValid(date) ? date : null;
}

export function formatDate(value: string | number | Date | null | undefined, pattern = "d MMM yyyy"): string {
  const date = toDate(value);
  return date ? format(date, pattern) : "—";
}

export function formatDateTime(value: string | number | Date | null | undefined): string {
  return formatDate(value, "d MMM yyyy, h:mm a");
}

export function timeAgo(value: string | number | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return "";
  try {
    return formatDistanceToNowStrict(date, { addSuffix: true });
  } catch {
    return "";
  }
}

export function titleCase(value: string | number | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  return str
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export function formatTimeOfDay(
  value: string | { time?: string; timestamp?: number } | null | undefined,
): string {
  if (!value) return "—";

  let raw: string | undefined;
  if (typeof value === "string") raw = value;
  else raw = value.time ?? (value.timestamp !== undefined ? new Date(value.timestamp).toISOString() : undefined);

  if (!raw) return "—";

  // If already looks like "h:mm am/pm", return as-is
  if (/^\d{1,2}:\d{2}\s*(am|pm)$/i.test(raw.trim())) return raw.trim();

  // Try parsing as ISO time or 24-hour "HH:mm"
  const match = raw.match(/(\d{1,2}):(\d{2})/);
  if (!match) return raw;

  const hour = parseInt(match[1]!, 10);
  const minute = match[2]!;
  const ampm = hour >= 12 ? "pm" : "am";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

  return `${displayHour}:${minute} ${ampm}`;
}

export function formatDashaBalance(
  value:
    | string
    | { lord?: string; yearsRemaining?: number; nakshatra?: string }
    | null
    | undefined,
): string {
  if (!value) return "—";
  if (typeof value === "string") return value;
  const years =
    typeof value.yearsRemaining === "number" ? `${value.yearsRemaining.toFixed(2)} years` : null;
  return (
    [value.lord ? `${value.lord} remaining` : null, years, value.nakshatra]
      .filter(Boolean)
      .join(" · ") || "—"
  );
}

export function formatInr(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function pct(value: number | null | undefined, digits = 0): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const normalized = value <= 1 ? value * 100 : value;
  return `${normalized.toFixed(digits)}%`;
}

export function plural(count: number, singular: string, pluralForm?: string): string {
  return `${count} ${count === 1 ? singular : (pluralForm ?? `${singular}s`)}`;
}

export function initials(name: string | null | undefined): string {
  return (
    (name ?? "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "VM"
  );
}

export function heightLabel(cm: number | null | undefined): string {
  if (!cm) return "—";
  const totalInches = Math.round(cm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}'${inches}" · ${cm} cm`;
}

export function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}
