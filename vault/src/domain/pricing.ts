import type { VaultData } from "./types";

export function tierBps(assets: number): number {
  if (assets < 100e6) return 6;
  if (assets < 250e6) return 5.5;
  if (assets < 500e6) return 5;
  if (assets < 2.5e9) return 4.5;
  return 4;
}

export function bpsMonthly(assets: number, min = 0): number {
  return Math.max((assets * tierBps(assets)) / 10000 / 12, min);
}

export const SERVICE_CATS = ["Fiduciary roles", "Compliance & admin", "Family services"] as const;

export type ServiceId = keyof VaultData["active"];

export type ServiceDef = {
  id: ServiceId;
  cat: (typeof SERVICE_CATS)[number];
  name: string;
  price: string;
  desc: string;
  module: string;
  calc: (d: VaultData) => number;
  use: (d: VaultData) => string;
};

export function vaultTrusts(d: VaultData) {
  return d.trusts.filter((t) => t.trustee === "Vault");
}

export function eduSeats(d: VaultData): number {
  return d.heirs.filter((h) => h.access === "Education").length;
}

function shortName(name: string): string {
  return name.replace("Whitfield ", "");
}

export const SERVICES: ServiceDef[] = [
  {
    id: "trustee",
    cat: "Fiduciary roles",
    name: "Serving as trustee",
    price: "Tier bps on trust assets · min $2,500/mo per trust",
    desc: "Vault serves as legal trustee: holds title, approves distributions and is accountable for the trust.",
    module: "svc-fiduciary",
    calc: (d) => vaultTrusts(d).reduce((s, t) => s + bpsMonthly(t.assets, 2500), 0),
    use: (d) => "Trustee of " + vaultTrusts(d).map((t) => shortName(t.name)).join(", "),
  },
  {
    id: "protector",
    cat: "Fiduciary roles",
    name: "Trust protector",
    price: "Tier bps on trust assets · min $5,000/mo",
    desc: "Independent oversight that can replace trustees, change trust location or update terms as laws change.",
    module: "svc-fiduciary",
    calc: () => bpsMonthly(640000000, 5000),
    use: () => "Would cover the Dynasty Trust ($640M)",
  },
  {
    id: "tax",
    cat: "Compliance & admin",
    name: "Trust tax coordination",
    price: "$350/mo per trust",
    desc: "We organize each trust’s tax data and K-1 inputs and deliver them to your CPA, who prepares and files.",
    module: "svc-tax",
    calc: (d) => 350 * d.trusts.length,
    use: (d) => d.trusts.length + " trusts and entities · CPA: Ortiz & Co.",
  },
  {
    id: "entities",
    cat: "Compliance & admin",
    name: "Additional entities",
    price: "5 included · $200/mo each after",
    desc: "Every trust and LLC on Vault is tracked with its documents, owners and deadlines.",
    module: "trusts",
    calc: (d) => Math.max(0, d.trusts.length - 5) * 200,
    use: (d) => d.trusts.length + " of 5 included entities used",
  },
  {
    id: "valuation",
    cat: "Compliance & admin",
    name: "Valuation support",
    price: "$583/mo per appraised asset",
    desc: "We manage the annual appraisals needed for gifting, GRATs and estate planning.",
    module: "svc-valuation",
    calc: (d) => 583 * Math.max(1, d.vals?.length ?? 1),
    use: (d) => {
      const n = d.vals?.length ?? 1;
      const names = (d.vals ?? [{ asset: "Whitfield Holdings LLC" }]).map((x) => x.asset).join(", ");
      return n + " asset" + (n > 1 ? "s" : "") + ": " + names;
    },
  },
  {
    id: "governance",
    cat: "Family services",
    name: "Family governance",
    price: "$3,500/mo",
    desc: "Annual family meetings, a written family charter and support for decisions across generations.",
    module: "svc-governance",
    calc: () => 3500,
    use: () => "Next meeting Dec 15 · charter in draft",
  },
  {
    id: "charitable",
    cat: "Family services",
    name: "Charitable vehicles",
    price: "$1,000/mo per vehicle",
    desc: "We run foundations, donor-advised funds and charitable trusts, including filings and grant tracking.",
    module: "svc-charitable",
    calc: (d) => 1000 * (d.charity?.vehicles.length ?? 1),
    use: (d) => (d.charity?.vehicles.length ?? 1) + " vehicles: foundation and charitable trust",
  },
  {
    id: "nextgen",
    cat: "Family services",
    name: "Next-generation seats",
    price: "2 included · $150/mo per heir after",
    desc: "Portal access and age-appropriate financial education for younger heirs.",
    module: "svc-nextgen",
    calc: (d) => 150 * Math.max(0, eduSeats(d) - 2),
    use: (d) => eduSeats(d) + " heirs with education access · 2 included",
  },
];

export function serviceById(id: string): ServiceDef | undefined {
  return SERVICES.find((s) => s.id === id);
}

export function baseFee(d: VaultData): number {
  return bpsMonthly(d.aua, 0);
}

export function addOnTotal(d: VaultData): number {
  return SERVICES.reduce((sum, svc) => sum + (d.active[svc.id] ? svc.calc(d) : 0), 0);
}

export function planTotal(d: VaultData): number {
  return baseFee(d) + addOnTotal(d);
}

export const COST_COLORS = ["#2e5446", "#4a7a68", "#b8914d", "#d4b06a", "#8fa29a", "#c9bfa8"];

export const PROJECT_TYPES: [string, string, string][] = [
  ["Onboarding and migration", "$7.5K – $35K", "Moving trusts and records to Vault"],
  ["Restructuring or decanting", "$20K – $75K", "Updating or moving an existing trust"],
  ["Estate settlement", "$35K – $150K", "Administration when a family member passes"],
  ["Drafting", "From $10K", "New instruments through our affiliated law firm"],
];

export const PROJECT_STEPS = ["Scoping", "Engagement letter", "Attorney review", "Documents signed", "Complete"];
export const VALUATION_STEPS = ["Engaged", "Documents", "Site visit", "Draft report", "Final"];
export const TAX_STEPS = ["Collecting data", "Ready for CPA", "Sent to CPA", "Filed by CPA"];
