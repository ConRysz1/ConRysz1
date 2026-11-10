import { useEffect, useState } from "react";
import { FEATURES, FEATURE_GROUPS } from "../domain/features";
import { useHash } from "../state/router";
import { useSignedIn } from "../state/store";

export function SiteHeader() {
  const hash = useHash();
  const signedIn = useSignedIn();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [suppress, setSuppress] = useState(false);
  const onFeatures = hash === "features" || hash.startsWith("feature-");

  useEffect(() => {
    setMenu(false);
    setOpen(false);
  }, [hash]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("#featDD")) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <header className="site-header">
      <div className="wrap">
        <a className="logo" href="#home" aria-label="Vault home">
          VAULT
        </a>
        <nav className={"nav" + (menu ? " open" : "")} id="siteNav" aria-label="Main">
          <div
            className={"dd" + (open ? " open" : "") + (suppress ? " suppress" : "")}
            id="featDD"
            onMouseLeave={() => setSuppress(false)}
          >
            <button
              className={"dd-btn" + (onFeatures ? " is-on" : "")}
              type="button"
              aria-expanded={open}
              aria-controls="ddMenu"
              onClick={(e) => {
                e.stopPropagation();
                setOpen((v) => !v);
              }}
            >
              Features
            </button>
            <div
              className="dd-menu"
              id="ddMenu"
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("a")) {
                  setOpen(false);
                  setSuppress(true);
                }
              }}
            >
              {FEATURE_GROUPS.map((group) => (
                <div className="nav-col" key={group.id}>
                  <h5>{group.name}</h5>
                  {FEATURES.filter((f) => f.g === group.id).map((f) => (
                    <a key={f.id} href={"#feature-" + f.id}>
                      {f.name}
                    </a>
                  ))}
                </div>
              ))}
              <div className="all">
                <span>16 services across five groups</span>
                <a href="#features">See all features</a>
              </div>
            </div>
          </div>
          <a href="#how">How it works</a>
          <a href="#pricing">Pricing</a>
          <a href="#partners">Partners</a>
        </nav>
        <div className="head-right">
          <a className="btn btn-ghost" href={signedIn ? "#portal" : "#login"}>
            {signedIn ? "My portal" : "Client login"}
          </a>
          <button className="menu-toggle" type="button" aria-expanded={menu} aria-controls="siteNav" onClick={() => setMenu((v) => !v)}>
            Menu
          </button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="cols">
          <div>
            <div className="logo" style={{ display: "inline-block", marginBottom: 12 }}>
              VAULT
            </div>
            <p style={{ margin: 0, maxWidth: "26em" }}>
              The trust platform for generational wealth. Estates and dynasty trusts for families with $20 million or more.
            </p>
          </div>
          <div>
            <h4>Platform</h4>
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#login">Client login</a>
          </div>
          <div>
            <h4>Partners</h4>
            <a href="#partners">Wealth managers</a>
            <a href="#partners">Banks &amp; RIAs</a>
            <a href="#partners">CPA firms</a>
          </div>
          <div>
            <h4>Contact</h4>
            <a href="mailto:hello@vault.example">hello@vault.example</a>
            <a href="#home">[Office address]</a>
          </div>
        </div>
        <div className="legal">
          <span>© 2026 Vault. All rights reserved.</span>
          <span>Vault is not a law firm and does not provide investment advice. Trustee services subject to charter approval.</span>
        </div>
      </div>
    </footer>
  );
}
