export const PORTAL_PAGES: { id: string; label: string }[] = [
  { id: "portal", label: "Overview" },
  { id: "trusts", label: "Trusts & entities" },
  { id: "distributions", label: "Distributions" },
  { id: "documents", label: "Documents" },
  { id: "calendar", label: "Calendar" },
  { id: "heirs", label: "Heirs & access" },
  { id: "messages", label: "Messages" },
  { id: "reports", label: "Reports" },
  { id: "services", label: "Services" },
  { id: "billing", label: "Billing" },
  { id: "team", label: "Your team" },
  { id: "account", label: "Settings" },
  { id: "svc-fiduciary", label: "Fiduciary roles" },
  { id: "svc-tax", label: "Tax center" },
  { id: "svc-valuation", label: "Valuations" },
  { id: "svc-governance", label: "Governance" },
  { id: "svc-charitable", label: "Philanthropy" },
  { id: "svc-nextgen", label: "Next generation" },
  { id: "projects", label: "Projects" },
  { id: "activity", label: "Activity" },
];

export const PORTAL_IDS = new Set(PORTAL_PAGES.map((p) => p.id));

export function pageLabel(id: string): string {
  return PORTAL_PAGES.find((p) => p.id === id)?.label ?? "Search";
}

export const DEMO_CODE = "482913";

export const TEAM = [
  {
    id: "sarah",
    name: "Sarah Kim",
    role: "Relationship lead",
    color: "#2e5446",
    about: ["Anything at all", "Family meetings", "Plan changes"],
    email: "sarah.kim@vault.example",
    phone: "(561) 555-0110",
    status: "Available",
    reply: "within 4 hours",
  },
  {
    id: "michael",
    name: "Michael Grant, J.D.",
    role: "Trust counsel",
    color: "#8a6a32",
    about: ["Trust instruments", "Decanting", "Legal questions"],
    email: "michael.grant@vault.example",
    phone: "(561) 555-0124",
    status: "In meetings until 3 PM",
    reply: "within 1 business day",
  },
  {
    id: "priya",
    name: "Priya Shah",
    role: "Trust officer",
    color: "#5f7f94",
    about: ["Distributions", "Trustee decisions", "Crummey notices"],
    email: "priya.shah@vault.example",
    phone: "(561) 555-0131",
    status: "Available",
    reply: "within 4 hours",
  },
  {
    id: "tom",
    name: "Tom Becker",
    role: "Client service",
    color: "#4a7a68",
    about: ["Documents", "Portal access", "Billing"],
    email: "tom.becker@vault.example",
    phone: "(561) 555-0147",
    status: "Available",
    reply: "within 2 hours",
  },
] as const;

export const ADVISOR_COLORS = ["#8c5a78", "#6b5f94", "#7a6a4a", "#4f6d81"];

export const ACCESS_FIELDS: { key: "documents" | "calendar" | "distributions" | "tax"; label: string; hint: string }[] = [
  { key: "documents", label: "Documents", hint: "Instruments, minutes and records you share" },
  { key: "calendar", label: "Calendar", hint: "Deadlines and meetings" },
  { key: "distributions", label: "Distributions", hint: "Requests and decisions" },
  { key: "tax", label: "Tax packets", hint: "Year-end tax packets and K-1 inputs" },
];
