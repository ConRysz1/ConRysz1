import { useSyncExternalStore } from "react";
import type { CalCat, Onboarding, VaultData } from "../domain/types";
import { freshVault, migrate } from "../domain/demo";
import { newOnboarding } from "../domain/onboarding";
import { todayDate } from "../domain/calendar";

const DATA_KEY = "vault-portal-v2";
const SESSION_KEY = "vault-signed-in";

export type CalView = "month" | "week" | "agenda";
export type SettingsTab = "profile" | "notifications" | "security" | "preferences";
export type TrustTab = "overview" | "beneficiaries" | "documents" | "activity";

export type Session = {
  trustId: string | null;
  docFilter: string;
  settingsTab: SettingsTab;
  docQuery: string;
  docSort: "new" | "name";
  distFilter: string;
  threadId: string;
  trustTab: TrustTab;
  activityFilter: string;
  activityQuery: string;
  calView: CalView;
  calRef: number;
  calSel: number | null;
  calFilters: Record<CalCat, boolean>;
  messageDraft: string | null;
  ob: { start: Onboarding; build: Onboarding };
};

function loadData(): VaultData {
  try {
    const raw = JSON.parse(localStorage.getItem(DATA_KEY) || "null") as unknown;
    if (raw && typeof raw === "object" && Array.isArray((raw as VaultData).trusts)) {
      return migrate(raw);
    }
  } catch {
    /* keep the fresh demo */
  }
  const fresh = freshVault();
  persist(fresh);
  return fresh;
}

function persist(next: VaultData) {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(next));
  } catch {
    /* demo storage can fill up once signatures are drawn */
  }
}

function applyTheme(theme: VaultData["prefs"]["theme"]) {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
}

function blankSession(): Session {
  return {
    trustId: null,
    docFilter: "All",
    settingsTab: "profile",
    docQuery: "",
    docSort: "new",
    distFilter: "All",
    threadId: "sarah",
    trustTab: "overview",
    activityFilter: "All",
    activityQuery: "",
    calView: "month",
    calRef: todayDate().getTime(),
    calSel: null,
    calFilters: { notice: true, payment: true, meeting: true, tax: true, valuation: true, personal: true },
    messageDraft: null,
    ob: { start: newOnboarding(), build: newOnboarding() },
  };
}

let data = loadData();
let session = blankSession();
let signedIn = false;
try {
  signedIn = sessionStorage.getItem(SESSION_KEY) === "1";
} catch {
  signedIn = false;
}
applyTheme(data.prefs.theme);

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getData(): VaultData {
  return data;
}
export function getSession(): Session {
  return session;
}
export function getSignedIn(): boolean {
  return signedIn;
}

export function updateData(recipe: (draft: VaultData) => void) {
  const next = structuredClone(data);
  recipe(next);
  data = next;
  persist(data);
  applyTheme(data.prefs.theme);
  emit();
}

export function updateSession(recipe: (draft: Session) => void) {
  const next = structuredClone(session);
  recipe(next);
  session = next;
  emit();
}

export function resetDemo() {
  data = freshVault();
  persist(data);
  applyTheme(data.prefs.theme);
  emit();
}

export function signIn() {
  signedIn = true;
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* ignore */
  }
  emit();
}

export function signOut() {
  signedIn = false;
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
  emit();
}

export function useVault(): VaultData {
  return useSyncExternalStore(subscribe, getData, getData);
}
export function useSession(): Session {
  return useSyncExternalStore(subscribe, getSession, getSession);
}
export function useSignedIn(): boolean {
  return useSyncExternalStore(subscribe, getSignedIn, getSignedIn);
}
