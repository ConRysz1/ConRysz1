import { useEffect, useState } from "react";
import { PORTAL_IDS } from "../domain/catalog";
import { FEATURES } from "../domain/features";

export const BASE_TITLE = "Vault — The trust platform for generational wealth";

export function readHash(): string {
  const raw = (location.hash || "").replace(/^#/, "");
  return raw || "home";
}

export function useHash(): string {
  const [hash, setHash] = useState(readHash);
  useEffect(() => {
    const onChange = () => setHash(readHash());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash;
}

export type Screen =
  | { kind: "home"; anchor: string | null }
  | { kind: "features" }
  | { kind: "feature"; id: string }
  | { kind: "start" }
  | { kind: "build" }
  | { kind: "login" }
  | { kind: "portal"; page: string };

const FEATURE_IDS = new Set(FEATURES.map((f) => f.id));
const HOME_ANCHORS = new Set(["home", "how", "pricing", "partners"]);

export function classify(hash: string): Screen {
  if (PORTAL_IDS.has(hash)) return { kind: "portal", page: hash };
  if (hash === "get-started") return { kind: "start" };
  if (hash === "build-plan") return { kind: "build" };
  if (hash === "features") return { kind: "features" };
  if (hash.startsWith("feature-") && FEATURE_IDS.has(hash.slice(8))) return { kind: "feature", id: hash.slice(8) };
  if (hash === "login") return { kind: "login" };
  if (HOME_ANCHORS.has(hash)) return { kind: "home", anchor: hash === "home" ? null : hash };
  return { kind: "home", anchor: null };
}

export function go(hash: string) {
  if (readHash() === hash) window.dispatchEvent(new HashChangeEvent("hashchange"));
  else location.hash = hash;
}
