export type ThemePref = "light" | "dark" | "system";

export type Profile = {
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
};

export type Prefs = {
  theme: ThemePref;
  themeSet: boolean;
  delivery: string;
};

export type NotifyPrefs = {
  dist: boolean;
  deadlines: boolean;
  statement: boolean;
  docs: boolean;
  sms: boolean;
};

export type SecurityPrefs = { twofa: boolean; alerts: boolean };

export type Trust = {
  id: string;
  name: string;
  type: string;
  state: string;
  assets: number;
  trustee: string;
  protector: string;
  est: string;
  bens: string;
};

export type Signature = {
  by: string;
  at: string;
  typed: string;
  img: string | null;
  id: string;
};

export type VaultDoc = {
  name: string;
  trust: string;
  date: string;
  kind: string;
  signed: boolean | null;
  shared: string[];
  size: string;
  sig?: Signature;
};

export type Distribution = {
  who: string;
  trust: string;
  amount: number;
  purpose: string;
  status: string;
  date: string;
  files?: string[];
};

export type CalCat = "notice" | "payment" | "meeting" | "tax" | "valuation" | "personal";
export type Repeat = "none" | "monthly" | "annual";

export type CalEvent = {
  id: string;
  date: string;
  time: string;
  item: string;
  trust: string;
  owner: string;
  cat: CalCat;
  notes: string;
  repeat: Repeat;
  done: boolean;
  user?: boolean;
};

export type Heir = { name: string; gen: string; role: string; access: string };

export type Task = {
  id: string;
  text: string;
  sub: string;
  action: string;
  go?: string;
  doc?: string;
};

export type ActivePlan = {
  trustee: boolean;
  protector: boolean;
  tax: boolean;
  entities: boolean;
  valuation: boolean;
  governance: boolean;
  charitable: boolean;
  nextgen: boolean;
};

export type ActivityItem = { t: string; at: string };
export type Notif = { t: string; at: string; read: boolean };
export type ChatMsg = { from: "me" | "them"; text: string; at: string };
export type Thread = { id: string; who: string; role: string; unread: number; msgs: ChatMsg[] };

export type AdvisorAccess = {
  documents: boolean;
  calendar: boolean;
  distributions: boolean;
  tax: boolean;
};

export type Advisor = {
  id: string;
  name: string;
  firm: string;
  type: string;
  seat: string;
  email: string;
  access: AdvisorAccess;
};

export type Fiduciary = {
  decisions: { date: string; trust: string; d: string; o: string }[];
  protReq: { what: string; st: string }[];
  protReview: string;
};

export type TaxPacket = { trust: string; status: string; k1: number };

export type Valuation = {
  asset: string;
  purpose: string;
  appraiser: string;
  due: string;
  step: number;
  docs: [string, boolean][];
};

export type Governance = {
  charter: { t: string; st: string; x: string }[];
  meeting: { date: string; place: string; agenda: string[]; rsvp: Record<string, string> };
  poll: { q: string; opts: string[]; votes: number[]; voted: boolean };
};

export type Charity = {
  vehicles: { name: string; type: string; assets: number }[];
  grants: { org: string; amt: number; veh: string; st: string; date: string }[];
};

export type Learning = { mods: string[]; prog: Record<string, number> };

export type Project = {
  type: string;
  name: string;
  trust: string;
  est: string;
  step: number;
  started: string;
};

export type VaultData = {
  profile: Profile;
  prefs: Prefs;
  notify: NotifyPrefs;
  security: SecurityPrefs;
  aua: number;
  trusts: Trust[];
  docs: VaultDoc[];
  dist: Distribution[];
  cal: CalEvent[];
  heirs: Heir[];
  tasks: Task[];
  active: ActivePlan;
  activity: ActivityItem[];
  notifs: Notif[];
  threads: Thread[];
  advisors: Advisor[];
  fid: Fiduciary;
  tax: TaxPacket[];
  vals: Valuation[];
  gov: Governance;
  charity: Charity;
  learn: Learning;
  projects: Project[];
  seen: Record<string, number>;
  onbHidden?: boolean;
  calV2?: boolean;
  signV1?: boolean;
  svcV1?: boolean;
};

export type FeatureGroup = { id: string; name: string; blurb: string };

export type Feature = {
  id: string;
  g: string;
  name: string;
  short: string;
  price: string;
  who: string;
  inc: string[];
  how: string[];
  rel: string[];
  over: string;
  ben: string[][];
  ex: string;
  pv: { title: string; rows: string[][] };
  faq: string[][];
  note?: string;
};

export type Onboarding = {
  step: number;
  name: string;
  email: string;
  phone: string;
  state: string;
  source: string;
  aIdx: number;
  trusts: number;
  entities: number;
  heirs: number;
  svc: {
    trustee: boolean;
    trusteeAssets: number;
    protector: boolean;
    tax: boolean;
    valuation: boolean;
    valN: number;
    governance: boolean;
    charitable: boolean;
    charN: number;
    nextgen: boolean;
    advisor: boolean;
  };
  slot: string | null;
  mode: string;
  attend: { me: boolean; spouse: boolean; advisor: boolean; attorney: boolean };
  notes: string;
  agree: boolean;
  ref: string | null;
};
