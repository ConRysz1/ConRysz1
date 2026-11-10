import type { CalCat, CalEvent } from "./types";

export const CATS: Record<CalCat, { n: string; c: string }> = {
  notice: { n: "Notices", c: "#4a7a68" },
  payment: { n: "Payments", c: "#b8914d" },
  meeting: { n: "Meetings", c: "#2e5446" },
  tax: { n: "Tax & filings", c: "#8a6a32" },
  valuation: { n: "Valuations", c: "#5f7f94" },
  personal: { n: "Your events", c: "#8c5a78" },
};

export function guessCat(item: string): CalCat {
  const t = item.toLowerCase();
  if (/notice|crummey/.test(t)) return "notice";
  if (/payment|annuity|unitrust/.test(t)) return "payment";
  if (/meeting|review|call/.test(t)) return "meeting";
  if (/tax|k-1|packet|filing|990/.test(t)) return "tax";
  if (/valuation|apprais/.test(t)) return "valuation";
  return "personal";
}

export function dateOnly(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function todayDate(): Date {
  return dateOnly(new Date());
}

export function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function fmtD(d: Date, options?: Intl.DateTimeFormatOptions): string {
  return d.toLocaleDateString("en-US", options ?? { month: "short", day: "numeric", year: "numeric" });
}

export function parseDisplayDate(s: string): Date {
  return dateOnly(new Date(s));
}

export function timeMinutes(t: string): number {
  if (!t) return -1;
  const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return -1;
  const h = (Number(m[1]) % 12) + (m[3].toUpperCase() === "PM" ? 12 : 0);
  return h * 60 + Number(m[2]);
}

export function relLabel(d: Date, today = todayDate()): string {
  const n = Math.round((dateOnly(d).getTime() - today.getTime()) / 864e5);
  if (n === 0) return "Today";
  if (n === 1) return "Tomorrow";
  if (n < 0) return Math.abs(n) + " days ago";
  return "In " + n + " days";
}

export type Occurrence = { event: CalEvent; date: Date };

export function occurrences(
  events: CalEvent[],
  from: Date,
  to: Date,
  filters: Record<CalCat, boolean>,
): Occurrence[] {
  const out: Occurrence[] = [];
  for (const event of events) {
    if (!filters[event.cat]) continue;
    const base = dateOnly(new Date(event.date));
    if (Number.isNaN(base.getTime())) continue;
    if (event.repeat === "monthly" || event.repeat === "annual") {
      const cursor = new Date(base);
      let guard = 0;
      while (cursor <= to && guard < 200) {
        if (cursor >= from) out.push({ event, date: new Date(cursor) });
        if (event.repeat === "monthly") cursor.setMonth(cursor.getMonth() + 1);
        else cursor.setFullYear(cursor.getFullYear() + 1);
        guard += 1;
      }
    } else if (base >= from && base <= to) {
      out.push({ event, date: base });
    }
  }
  out.sort((a, b) => a.date.getTime() - b.date.getTime() || timeMinutes(a.event.time) - timeMinutes(b.event.time));
  return out;
}

export function nextWeekdays(count: number, from = new Date()): Date[] {
  const days: Date[] = [];
  let d = dateOnly(from);
  while (days.length < count) {
    d = new Date(d);
    d.setDate(d.getDate() + 1);
    if (d.getDay() % 6) days.push(new Date(d));
  }
  return days;
}
