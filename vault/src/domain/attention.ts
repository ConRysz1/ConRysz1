import type { VaultData } from "./types";

export type AttentionItem = {
  text: string;
  sub: string;
  kind: "task" | "sign" | "link";
  taskId?: string;
  docIndex?: number;
  hash?: string;
  label: string;
  tone: string;
};

export function attentionItems(d: VaultData): AttentionItem[] {
  const out: AttentionItem[] = [];
  d.tasks.forEach((t) => {
    out.push({
      text: t.text,
      sub: t.sub,
      kind: "task",
      taskId: t.id,
      label: t.action,
      tone: t.action.toLowerCase(),
    });
  });
  d.docs.forEach((doc, i) => {
    if (doc.signed === false && !d.tasks.some((t) => t.doc === doc.name)) {
      out.push({
        text: "Sign “" + doc.name + "”",
        sub: doc.trust + " · e-signature",
        kind: "sign",
        docIndex: i,
        label: "Sign",
        tone: "sign",
      });
    }
  });
  const collecting = d.tax?.filter((x) => x.status === "Collecting data").length ?? 0;
  if (collecting) {
    out.push({
      text: "Upload statements for " + collecting + " tax packet" + (collecting > 1 ? "s" : ""),
      sub: "Tax center · due by Mar 15",
      kind: "link",
      hash: "svc-tax",
      label: "Open",
      tone: "review",
    });
  }
  d.vals?.forEach((v) => {
    const miss = v.docs.filter((doc) => !doc[1]).length;
    if (miss) {
      out.push({
        text: miss + " document" + (miss > 1 ? "s" : "") + " needed for the " + v.asset + " valuation",
        sub: "Valuations · due " + v.due,
        kind: "link",
        hash: "svc-valuation",
        label: "Open",
        tone: "review",
      });
    }
  });
  if (d.gov) {
    if (!d.gov.meeting.rsvp[d.profile.name]) {
      out.push({
        text: "RSVP for the annual family meeting",
        sub: "Governance · " + d.gov.meeting.date,
        kind: "link",
        hash: "svc-governance",
        label: "RSVP",
        tone: "confirm",
      });
    }
    if (!d.gov.poll.voted) {
      out.push({
        text: "Vote: " + d.gov.poll.q,
        sub: "Governance · family vote",
        kind: "link",
        hash: "svc-governance",
        label: "Vote",
        tone: "confirm",
      });
    }
    const drafts = d.gov.charter.filter((c) => c.st === "Draft").length;
    if (drafts) {
      out.push({
        text: drafts + " family charter section" + (drafts > 1 ? "s" : "") + " to review",
        sub: "Governance · charter",
        kind: "link",
        hash: "svc-governance",
        label: "Review",
        tone: "review",
      });
    }
  }
  const proposed = d.charity?.grants.filter((g) => g.st === "Proposed").length ?? 0;
  if (proposed) {
    out.push({
      text: proposed + " grant" + (proposed > 1 ? "s" : "") + " awaiting approval",
      sub: "Philanthropy",
      kind: "link",
      hash: "svc-charitable",
      label: "Review",
      tone: "confirm",
    });
  }
  const unread = d.threads.reduce((s, t) => s + t.unread, 0);
  if (unread) {
    out.push({
      text: unread + " unread message" + (unread > 1 ? "s" : "") + " from your team",
      sub: "Messages",
      kind: "link",
      hash: "messages",
      label: "Read",
      tone: "review",
    });
  }
  return out;
}

export function gettingStarted(d: VaultData): { label: string; done: boolean; hash: string }[] {
  return [
    { label: "Review your family structure", done: !!d.seen.trusts, hash: "trusts" },
    { label: "Sign your pending documents", done: !d.docs.some((doc) => doc.signed === false), hash: "documents" },
    { label: "Invite a family member", done: d.heirs.length > 7, hash: "heirs" },
    { label: "Connect your advisor or CPA", done: d.advisors.length > 0, hash: "team" },
    { label: "Turn on two-step verification", done: !!d.security.twofa, hash: "account" },
    { label: "Explore your services", done: !!d.seen.services, hash: "services" },
  ];
}

export function activityType(text: string): string {
  const t = text.toLowerCase();
  if (/distribution|grant/.test(t)) return "Distributions & grants";
  if (/sign|document|upload|minutes|statement|packet/.test(t)) return "Documents & tax";
  if (/calendar|meeting|call|event|completed/.test(t)) return "Calendar & meetings";
  if (/invite|access|advisor|disconnect/.test(t)) return "People & access";
  return "Services & plan";
}

export const ACTIVITY_FILTERS = [
  "All",
  "Distributions & grants",
  "Documents & tax",
  "Calendar & meetings",
  "People & access",
  "Services & plan",
];

export function notifRoute(text: string): string {
  const t = text.toLowerCase();
  if (/distribution/.test(t)) return "distributions";
  if (/signature|sign|minutes|document/.test(t)) return "documents";
  if (/statement|invoice/.test(t)) return "billing";
  if (/message/.test(t)) return "messages";
  if (/grant/.test(t)) return "svc-charitable";
  if (/tax/.test(t)) return "svc-tax";
  return "activity";
}
