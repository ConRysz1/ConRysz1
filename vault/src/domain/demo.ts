import type { VaultData } from "./types";
import { guessCat } from "./calendar";
import seed from "./seed.json";

const EXTRA_EVENTS: [string, string, string, string, string, VaultData["cal"][number]["cat"], string, string][] = [
  ["Nov 5, 2026", "10:00 AM", "Q3 statement review with Sarah", "Whitfield Dynasty Trust", "Vault", "meeting", "Video call. Agenda: Q3 statement, Olivia’s request, year-end gifting.", ""],
  ["Nov 20, 2026", "", "Year-end gifting deadline reminder", "All trusts", "Vault", "tax", "Annual exclusion gifts should be completed by Dec 31.", ""],
  ["Dec 10, 2026", "2:00 PM", "Pre-meeting call with Michael (trust counsel)", "Family governance", "Vault", "meeting", "Review GRAT term and successor trustee agenda items.", ""],
  ["Dec 31, 2026", "", "Annual exclusion gifts complete", "All trusts", "You", "tax", "Confirm gifts to Gen 3 accounts are funded.", ""],
  ["Jan 15, 2027", "", "Q4 estimated tax payment", "2026 GRAT", "Vault", "tax", "Coordinated with Ortiz & Co.", ""],
  ["Jan 20, 2027", "11:00 AM", "ILIT premium payment", "Whitfield ILIT", "Vault", "payment", "Annual premium to carrier.", "annual"],
  ["Feb 1, 2027", "", "Monthly plan invoice", "All trusts", "Vault", "payment", "Billed by ACH.", "monthly"],
  ["Feb 15, 2027", "", "Foundation grant cycle opens", "Whitfield Charitable Remainder Trust", "Vault", "notice", "Family grant committee reviews requests.", ""],
  ["Mar 1, 2027", "", "Beneficiary K-1 inputs to CPA", "All trusts", "Vault", "tax", "Delivered to Daniel Ortiz, CPA.", ""],
  ["Mar 31, 2027", "", "Q1 trustee review", "Whitfield Dynasty Trust", "Vault", "meeting", "Quarterly review of distributions and investments with Morgan Lee.", ""],
];

export function freshVault(): VaultData {
  return migrate(structuredClone(seed));
}

export function migrate(raw: unknown): VaultData {
  const S = (raw && typeof raw === "object" ? raw : structuredClone(seed)) as VaultData;
  if (!S.prefs) S.prefs = { theme: "light", themeSet: true, delivery: "Portal and email" };
  if (!S.prefs.themeSet) {
    S.prefs.theme = "light";
    S.prefs.themeSet = true;
  }
  if (!S.activity) {
    S.activity = [
      { t: "Claire’s $250,000 distribution was approved", at: "Sep 30, 2026" },
      { t: "Q3 trustee meeting minutes uploaded", at: "Oct 20, 2026" },
      { t: "Olivia requested a $40,000 distribution", at: "Oct 28, 2026" },
    ];
  }
  if (!S.notifs) {
    S.notifs = [
      { t: "Olivia submitted a distribution request", at: "Oct 28", read: false },
      { t: "Minutes ready for your signature", at: "Oct 20", read: false },
      { t: "November statement is available", at: "Nov 1", read: false },
    ];
  }
  if (!S.threads) {
    S.threads = [
      {
        id: "sarah",
        who: "Sarah Kim",
        role: "Relationship lead",
        unread: 1,
        msgs: [
          {
            from: "them",
            text: "Hi Eleanor, your November statement is ready in Billing. Anything you’d like to review before the December family meeting?",
            at: "Nov 1",
          },
        ],
      },
      {
        id: "michael",
        who: "Michael Grant, J.D.",
        role: "Trust counsel",
        unread: 0,
        msgs: [
          { from: "them", text: "I’ve finished reviewing the restated Dynasty Trust. No changes needed to the distribution standard.", at: "Oct 14" },
          { from: "me", text: "Thank you, Michael. Can we discuss the GRAT term at the family meeting?", at: "Oct 15" },
          { from: "them", text: "Absolutely, I’ll add it to the agenda.", at: "Oct 15" },
        ],
      },
      {
        id: "priya",
        who: "Priya Shah",
        role: "Trust officer",
        unread: 0,
        msgs: [{ from: "them", text: "Olivia’s request is in review. I’ll have a decision within three business days.", at: "Oct 29" }],
      },
      { id: "tom", who: "Tom Becker", role: "Client service", unread: 0, msgs: [] },
    ];
  }
  S.docs.forEach((d) => {
    if (d.signed === undefined) d.signed = d.kind === "Minutes" ? false : null;
    if (!d.shared) d.shared = ["Eleanor Whitfield", "James Whitfield"];
    if (!d.size) d.size = d.kind === "Tax" ? "2.4 MB" : "640 KB";
  });
  S.cal.forEach((c) => {
    if (c.done === undefined) c.done = false;
  });
  if (!S.calV2) {
    S.cal.forEach((c, i) => {
      if (!c.id) c.id = "c" + i;
      if (!c.cat) c.cat = guessCat(c.item);
      if (c.time === undefined) c.time = "";
      if (c.notes === undefined) c.notes = "";
      if (!c.repeat) c.repeat = "none";
    });
    EXTRA_EVENTS.forEach((a, i) => {
      S.cal.push({
        id: "n" + i,
        date: a[0],
        time: a[1],
        item: a[2],
        trust: a[3],
        owner: a[4],
        cat: a[5],
        notes: a[6],
        repeat: a[7] === "monthly" || a[7] === "annual" ? a[7] : "none",
        done: false,
      });
    });
    S.calV2 = true;
  }
  if (!S.signV1) {
    S.docs.unshift({
      name: "2026 annual gift acknowledgment",
      trust: "Whitfield Dynasty Trust",
      date: "Oct 30, 2026",
      kind: "Consent",
      signed: false,
      shared: ["Eleanor Whitfield"],
      size: "210 KB",
    });
    S.tasks.forEach((t) => {
      if (t.id === "k2") t.doc = "Q3 trustee meeting minutes";
    });
    S.tasks.splice(2, 0, {
      id: "k4",
      text: "Sign the 2026 annual gift acknowledgment",
      sub: "Dynasty Trust · e-signature",
      action: "Sign",
      doc: "2026 annual gift acknowledgment",
    });
    S.signV1 = true;
  }
  if (!S.advisors) {
    S.advisors = [
      {
        id: "a1",
        name: "Morgan Lee",
        firm: "Harbor Wealth Partners",
        type: "Investment advisor",
        seat: "Advisor seat",
        email: "morgan@harborwealth.example",
        access: { documents: true, calendar: true, distributions: true, tax: false },
      },
      {
        id: "a2",
        name: "Daniel Ortiz, CPA",
        firm: "Ortiz & Co.",
        type: "CPA",
        seat: "CPA seat",
        email: "daniel@ortizco.example",
        access: { documents: true, calendar: true, distributions: false, tax: true },
      },
    ];
  }
  if (!S.svcV1) {
    S.fid = {
      decisions: [
        { date: "Oct 30, 2026", trust: "Whitfield Dynasty Trust", d: "Olivia · $40,000 medical distribution", o: "In review" },
        { date: "Sep 30, 2026", trust: "Whitfield Dynasty Trust", d: "Claire · $250,000 home purchase", o: "Approved" },
        { date: "Aug 14, 2026", trust: "Whitfield Dynasty Trust", d: "James · $60,000 graduate tuition", o: "Approved" },
        { date: "Jul 1, 2026", trust: "Whitfield Charitable Remainder Trust", d: "Annual unitrust payment to Eleanor", o: "Paid" },
        { date: "Mar 12, 2026", trust: "Whitfield ILIT", d: "Premium payment to carrier", o: "Paid" },
      ],
      protReq: [],
      protReview: "Sep 2026",
    };
    S.tax = S.trusts.map((t, i) => ({
      trust: t.name,
      status: ["Sent to CPA", "Ready for CPA", "Collecting data", "Ready for CPA", "Collecting data"][i % 5],
      k1: [3, 2, 3, 1, 0][i % 5],
    }));
    S.vals = [
      {
        asset: "Whitfield Holdings LLC",
        purpose: "Annual gifting and GRAT valuation",
        appraiser: "Meridian Valuation Group",
        due: "Jan 31, 2027",
        step: 2,
        docs: [
          ["Operating agreement", true],
          ["2025 financial statements", true],
          ["Q3 2026 financial statements", true],
          ["Property schedules", true],
          ["Debt schedules", true],
          ["Prior appraisal", true],
          ["Management interview", false],
        ],
      },
    ];
    S.gov = {
      charter: [
        { t: "Our values", st: "Agreed", x: "We hold our wealth as stewards for future generations, and we make decisions with honesty, generosity and humility." },
        { t: "How we make decisions", st: "Agreed", x: "Major family decisions are discussed at the annual meeting. Each adult family member has one vote; trustees decide trust matters independently." },
        { t: "Distribution philosophy", st: "Draft", x: "Distributions support health, education, a first home and meaningful work. Requests are made in writing and reviewed by the trustee." },
        { t: "Roles and succession", st: "Draft", x: "James Whitfield is named successor trustee. Each generation names a family representative to work with Vault." },
        { t: "Education and readiness", st: "Draft", x: "Heirs complete the Vault education program before receiving full portal access at age 25." },
      ],
      meeting: {
        date: "Dec 15, 2026",
        place: "Palm Beach and video",
        agenda: [
          "Review the year with the trustee",
          "GRAT term and successor trustee",
          "Distribution philosophy (charter section 3)",
          "Foundation grant priorities for 2027",
        ],
        rsvp: {},
      },
      poll: {
        q: "Should heirs complete the education program before full access at 25?",
        opts: ["Yes", "No", "Abstain"],
        votes: [3, 0, 1],
        voted: false,
      },
    };
    S.charity = {
      vehicles: [
        { name: "Whitfield Charitable Remainder Trust", type: "Charitable remainder trust", assets: 85000000 },
        { name: "Whitfield Foundation", type: "Private foundation", assets: 12000000 },
      ],
      grants: [
        { org: "Palm Beach Literacy Coalition", amt: 150000, veh: "Whitfield Foundation", st: "Paid", date: "Mar 2026" },
        { org: "St. Jude Children’s Research Hospital", amt: 200000, veh: "Whitfield Foundation", st: "Paid", date: "Jun 2026" },
        { org: "Norton Museum of Art", amt: 75000, veh: "Whitfield Foundation", st: "Approved", date: "Oct 2026" },
        { org: "Hope Through Education", amt: 100000, veh: "Whitfield Foundation", st: "Proposed", date: "Nov 2026" },
      ],
    };
    S.learn = {
      mods: [
        "Understanding your family’s trusts",
        "How distributions work",
        "Taxes and your inheritance",
        "Investing for the long term",
        "Philanthropy and the foundation",
        "Becoming a trustee",
      ],
      prog: { "Henry Whitfield": 3, "Ava Whitfield": 1, "Leo Whitfield": 0 },
    };
    S.projects = [
      {
        type: "Restructuring or decanting",
        name: "Decant 2014 Dynasty Trust to update the distribution standard",
        trust: "Whitfield Dynasty Trust",
        est: "$20K – $75K",
        step: 2,
        started: "Sep 2026",
      },
    ];
    S.svcV1 = true;
  }
  if (!S.seen) S.seen = {};
  return S;
}

export function logAct(d: VaultData, text: string) {
  const at = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  d.activity.unshift({ t: text, at });
  d.notifs.unshift({ t: text, at: at.replace(/, \d{4}$/, ""), read: true });
}
