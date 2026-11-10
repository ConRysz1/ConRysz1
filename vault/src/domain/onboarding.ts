import type { Onboarding } from "./types";
import { tierBps } from "./pricing";
import { money } from "./format";

export const AUA_STEPS = [
  20e6, 30e6, 40e6, 50e6, 75e6, 100e6, 150e6, 200e6, 250e6, 350e6, 500e6, 750e6, 1e9, 1.5e9, 2e9, 2.5e9, 3.5e9, 5e9,
];

export function fmtAua(a: number): string {
  return a >= 1e9 ? "$" + (a / 1e9).toString().replace(/\.0$/, "") + "B" : "$" + Math.round(a / 1e6) + "M";
}

export function essentialMonthly(a: number): number {
  return Math.max((a * tierBps(a)) / 10000 / 12, 3000);
}

export function newOnboarding(): Onboarding {
  return {
    step: 1,
    name: "",
    email: "",
    phone: "",
    state: "Florida",
    source: "My advisor",
    aIdx: 6,
    trusts: 3,
    entities: 5,
    heirs: 4,
    svc: {
      trustee: false,
      trusteeAssets: 5,
      protector: false,
      tax: false,
      valuation: false,
      valN: 1,
      governance: false,
      charitable: false,
      charN: 1,
      nextgen: false,
      advisor: false,
    },
    slot: null,
    mode: "Video call",
    attend: { me: true, spouse: false, advisor: false, attorney: false },
    notes: "",
    agree: false,
    ref: null,
  };
}

export function onboardingLines(kind: "start" | "build", o: Onboarding): [string, number][] {
  const a = AUA_STEPS[o.aIdx] ?? AUA_STEPS[6];
  const raw = (a * tierBps(a)) / 10000 / 12;
  const lines: [string, number][] = [
    ["Essential · " + tierBps(a) + " bps on " + fmtAua(a) + (raw < 3000 ? " (minimum)" : ""), essentialMonthly(a)],
  ];
  if (kind !== "build") return lines;
  const s = o.svc;
  if (s.trustee) {
    const ta = AUA_STEPS[s.trusteeAssets] ?? a;
    lines.push(["Serving as trustee · " + fmtAua(ta) + " in trust", Math.max((ta * tierBps(ta)) / 10000 / 12, 2500)]);
  }
  if (s.protector) {
    const pa = AUA_STEPS[s.trusteeAssets] ?? a;
    lines.push(["Trust protector · " + fmtAua(pa) + " in trust", Math.max((pa * tierBps(pa)) / 10000 / 12, 5000)]);
  }
  if (s.tax) lines.push(["Trust tax coordination · " + o.trusts + " trusts", 350 * o.trusts]);
  if (o.entities > 5) lines.push(["Additional entities · " + (o.entities - 5), 200 * (o.entities - 5)]);
  if (s.valuation) lines.push(["Valuation support · " + s.valN + " asset" + (s.valN > 1 ? "s" : ""), 583 * s.valN]);
  if (s.governance) lines.push(["Family governance", 3500]);
  if (s.charitable) lines.push(["Charitable vehicles · " + s.charN, 1000 * s.charN]);
  if (s.nextgen && o.heirs > 2) lines.push(["Next-generation seats · " + (o.heirs - 2) + " beyond 2 included", 150 * (o.heirs - 2)]);
  return lines;
}

export function lineTotal(lines: [string, number][]): number {
  return lines.reduce((s, l) => s + l[1], 0);
}

export function moneyLines(lines: [string, number][]): string {
  return money(lineTotal(lines));
}

export const RESIDENCE_STATES = ["Florida", "New York", "California", "Texas", "Delaware", "South Dakota", "Nevada", "Other"];
export const HEARD_FROM = ["My advisor", "My bank", "My CPA", "My attorney", "Another family", "Other"];
export const MEET_MODES = ["Video call", "Phone call", "In person"];
