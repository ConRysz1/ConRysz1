import { useEffect, type ReactNode } from "react";
import { getData, signOut, updateData, updateSession, useVault } from "../state/store";
import { toast } from "../ui/overlays";
import { Activity } from "./activity";
import { Billing } from "./billing";
import { CalendarPage } from "./calendar";
import { BellMenu, CommandPalette, ProfileMenu, openPaletteBus } from "./chrome";
import { Distributions } from "./distributions";
import { Documents } from "./documents";
import { Heirs } from "./heirs";
import { Messages } from "./messages";
import { Fiduciary, Governance, NextGen, Philanthropy, Projects, TaxCenter, Valuations } from "./modules";
import { Overview } from "./overview";
import { Reports } from "./reports";
import { Services } from "./services";
import { Settings } from "./settings";
import { Team } from "./team";
import { Trusts } from "./trusts";

const FAMILY: [string, string][] = [
  ["portal", "Overview"],
  ["trusts", "Trusts & entities"],
  ["distributions", "Distributions"],
  ["documents", "Documents"],
  ["calendar", "Calendar"],
  ["heirs", "Heirs & access"],
  ["messages", "Messages"],
  ["reports", "Reports"],
];

const SERVICES_NAV: [string, string][] = [
  ["svc-fiduciary", "Fiduciary roles"],
  ["svc-tax", "Tax center"],
  ["svc-valuation", "Valuations"],
  ["svc-governance", "Governance"],
  ["svc-charitable", "Philanthropy"],
  ["svc-nextgen", "Next generation"],
  ["projects", "Projects"],
];

const PLAN: [string, string][] = [
  ["services", "Services"],
  ["billing", "Billing"],
  ["team", "Your team"],
  ["account", "Settings"],
];

const PAGES: Record<string, () => ReactNode> = {
  portal: Overview,
  trusts: Trusts,
  distributions: Distributions,
  documents: Documents,
  calendar: CalendarPage,
  heirs: Heirs,
  messages: Messages,
  reports: Reports,
  services: Services,
  billing: Billing,
  team: Team,
  account: Settings,
  "svc-fiduciary": Fiduciary,
  "svc-tax": TaxCenter,
  "svc-valuation": Valuations,
  "svc-governance": Governance,
  "svc-charitable": Philanthropy,
  "svc-nextgen": NextGen,
  projects: Projects,
  activity: Activity,
};

export function Portal({ page }: { page: string }) {
  const data = useVault();
  const pending = data.dist.filter((row) => row.status === "Pending trustee review").length;
  const unread = data.threads.reduce((sum, thread) => sum + thread.unread, 0);
  const Page = PAGES[page] ?? Overview;

  useEffect(() => {
    if (getData().seen[page]) return;
    updateData((d) => { d.seen[page] = 1; });
  }, [page]);

  useEffect(() => {
    if (page === "trusts") return;
    updateSession((s) => {
      s.trustId = null;
      s.trustTab = "overview";
    });
  }, [page]);

  return (
    <div className="portal">
      <aside className="side" aria-label="Portal navigation">
        <a className="brand" href="#portal">VAULT</a>
        <div className="fam">Whitfield Family<small>Client since 2026 · Plan: Complete</small></div>
        <div className="grp">Family</div>
        {FAMILY.map((item) => <Nav key={item[0]} item={item} page={page} badge={item[0] === "distributions" ? pending : item[0] === "messages" ? unread : 0} />)}
        <div className="grp">Your services</div>
        {SERVICES_NAV.map((item) => <Nav key={item[0]} item={item} page={page} />)}
        <div className="grp">Plan</div>
        {PLAN.map((item) => <Nav key={item[0]} item={item} page={page} />)}
        <button
          className="side-out"
          type="button"
          onClick={() => {
            location.hash = "home";
            signOut();
            toast("Signed out");
          }}
        >
          <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></svg>
          <span>Log out</span>
        </button>
      </aside>
      <div className="pmain">
        <div className="topbar">
          <div className="search">
            <input
              type="search"
              placeholder="Search trusts, documents, people"
              aria-label="Search the portal"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  openPaletteBus(e.currentTarget.value);
                }
              }}
            />
          </div>
          <div className="top-right">
            <BellMenu />
            <ProfileMenu />
          </div>
        </div>
        <main className="content">
          <Page />
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}

function Nav({ item, page, badge = 0 }: { item: [string, string]; page: string; badge?: number }) {
  const on = page === item[0];
  return (
    <a className={"nav-i" + (on ? " on" : "")} href={"#" + item[0]} aria-current={on ? "page" : undefined}>
      <Icon id={item[0]} />
      <span className="lbl">{item[1]}</span>
      {item[0] === "distributions" || item[0] === "messages" ? <span className="badge" style={badge ? undefined : { display: "none" }}>{badge || ""}</span> : null}
    </a>
  );
}

function Icon({ id }: { id: string }) {
  const common = { className: "ico", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (id === "portal") return <svg {...common}><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /></svg>;
  if (id === "trusts") return <svg {...common}><path d="m12 2 9 5-9 5-9-5z" /><path d="m3 12 9 5 9-5" /><path d="m3 17 9 5 9-5" /></svg>;
  if (id === "distributions") return <svg {...common}><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 12h.01M18 12h.01" /></svg>;
  if (id === "documents") return <svg {...common}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></svg>;
  if (id === "calendar") return <svg {...common}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
  if (id === "heirs") return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
  if (id === "messages") return <svg {...common}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
  if (id === "reports") return <svg {...common}><path d="M3 3v18h18" /><path d="M8 17V10M13 17V6M18 17v-4" /></svg>;
  if (id === "svc-fiduciary") return <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>;
  if (id === "svc-tax") return <svg {...common}><path d="M4 4h16v16H4z" /><path d="M8 9h8M8 13h8M8 17h5" /></svg>;
  if (id === "svc-valuation") return <svg {...common}><path d="M3 3v18h18" /><path d="m7 15 4-4 3 3 5-6" /></svg>;
  if (id === "svc-governance") return <svg {...common}><path d="M3 21h18M5 21V10M19 21V10M9 21v-7M15 21v-7" /><path d="m12 3 9 6H3z" /></svg>;
  if (id === "svc-charitable") return <svg {...common}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z" /></svg>;
  if (id === "svc-nextgen") return <svg {...common}><path d="M22 10 12 5 2 10l10 5 10-5z" /><path d="M6 12v5c3 2 9 2 12 0v-5" /></svg>;
  if (id === "projects") return <svg {...common}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>;
  if (id === "services") return <svg {...common}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /><circle cx="12" cy="12" r="3" /></svg>;
  if (id === "billing") return <svg {...common}><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h4" /></svg>;
  if (id === "team") return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" /></svg>;
  return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>;
}
