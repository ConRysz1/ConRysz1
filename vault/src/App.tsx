import { useEffect, useLayoutEffect } from "react";
import { FeatureDetail, FeaturesPage } from "./site/features";
import { SiteFooter, SiteHeader } from "./site/chrome";
import { Home } from "./site/home";
import { Login } from "./site/login";
import { OnboardingFlow } from "./site/onboarding";
import { Portal } from "./portal/portal";
import { BASE_TITLE, classify, readHash, useHash } from "./state/router";
import { useSignedIn } from "./state/store";
import { Overlays } from "./ui/overlays";
import { FEATURES } from "./domain/features";
import { PORTAL_IDS } from "./domain/catalog";

function Screen() {
  const hash = useHash();
  const signedIn = useSignedIn();
  const screen = classify(readHash());
  const portalBlocked = screen.kind === "portal" && !signedIn;
  const loginBlocked = screen.kind === "login" && signedIn;
  const effective = portalBlocked ? ({ kind: "login" } as const) : loginBlocked ? ({ kind: "portal", page: "portal" } as const) : screen;

  useLayoutEffect(() => {
    const live = readHash();
    if (PORTAL_IDS.has(live) && !signedIn) location.hash = "login";
    if (live === "login" && signedIn) location.hash = "portal";
  }, [hash, signedIn]);

  useEffect(() => {
    document.body.classList.toggle("in-portal", effective.kind === "portal");
    if (effective.kind === "feature") {
      const feature = FEATURES.find((f) => f.id === effective.id);
      document.title = feature ? feature.name + " — Vault" : BASE_TITLE;
    } else {
      document.title = BASE_TITLE;
    }
  }, [effective]);

  useLayoutEffect(() => {
    if (effective.kind === "home" && effective.anchor) {
      document.getElementById(effective.anchor)?.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash, effective.kind]);

  const showChrome = effective.kind !== "portal";
  const showFooter = effective.kind !== "portal" && effective.kind !== "login";

  return (
    <>
      {showChrome ? <SiteHeader /> : null}
      {effective.kind === "home" ? <Home /> : null}
      {effective.kind === "features" ? <FeaturesPage /> : null}
      {effective.kind === "feature" ? <FeatureDetail id={effective.id} /> : null}
      {effective.kind === "start" ? <OnboardingFlow kind="start" /> : null}
      {effective.kind === "build" ? <OnboardingFlow kind="build" /> : null}
      {effective.kind === "login" ? <Login /> : null}
      {effective.kind === "portal" ? <Portal page={effective.page} /> : null}
      {showFooter ? <SiteFooter /> : null}
    </>
  );
}

export function App() {
  return (
    <Overlays>
      <Screen />
    </Overlays>
  );
}
