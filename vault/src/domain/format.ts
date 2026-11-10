export function money(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}

export function shortMoney(n: number): string {
  return n >= 1e9
    ? "$" + (n / 1e9).toFixed(2).replace(/\.?0+$/, "") + "B"
    : "$" + Math.round(n / 1e6) + "M";
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function todayLabel(): string {
  return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function longDate(d = new Date()): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function tagClass(s: string): "warn" | "ok" | "mute" | "info" {
  if (/Pending|You/.test(s)) return "warn";
  if (/Paid|Approved|Active|Full|Signed/.test(s)) return "ok";
  if (/Withdrawn|None/.test(s)) return "mute";
  return "info";
}

export function phoneLast4(phone: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  return digits.slice(-4) || "0142";
}

export function fileSizeLabel(bytes: number): string {
  return bytes > 1048576
    ? (bytes / 1048576).toFixed(1) + " MB"
    : Math.max(1, Math.round(bytes / 1024)) + " KB";
}

export function parseAmount(raw: string): number {
  return Number((raw || "").replace(/[^0-9.]/g, ""));
}

export function sigId(): string {
  return "VLT-" + Math.random().toString(16).slice(2, 10).toUpperCase();
}

export function refId(): string {
  return "VLT-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function signedStamp(now = new Date()): string {
  return (
    now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " at " +
    now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  );
}

export function inputDate(d: Date): string {
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

export function formatTimeInput(value: string): string {
  if (!value) return "";
  const [hs, mm] = value.split(":");
  const hh = Number(hs);
  return ((hh % 12) || 12) + ":" + mm + " " + (hh < 12 ? "AM" : "PM");
}
