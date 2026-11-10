import { useMemo, useState } from "react";
import { money } from "../domain/format";
import { ComparisonTable } from "./comparison";

const LO = 20e6;
const HI = 5e9;
const BOUNDS = [100e6, 250e6, 500e6, 2.5e9];
const TIER_NAMES = ["Under $100M", "$100M – $250M", "$250M – $500M", "$500M – $2.5B", "$2.5B and above"];
const BPS = [6, 5.5, 5, 4.5, 4];

function toAssets(value: number): number {
  const a = LO * Math.pow(HI / LO, value / 1000);
  if (a < 100e6) return Math.round(a / 1e6) * 1e6;
  if (a < 1e9) return Math.round(a / 5e6) * 5e6;
  return Math.round(a / 5e7) * 5e7;
}

function assetLabel(a: number): string {
  return a >= 1e9 ? "$" + (a / 1e9).toFixed(2).replace(/\.?0+$/, "") + "B" : "$" + Math.round(a / 1e6) + "M";
}

function FeeCalculator() {
  const [value, setValue] = useState(365);
  const quote = useMemo(() => {
    const assets = toAssets(value);
    const tier = assets < BOUNDS[0] ? 0 : assets < BOUNDS[1] ? 1 : assets < BOUNDS[2] ? 2 : assets < BOUNDS[3] ? 3 : 4;
    const bps = BPS[tier];
    const raw = (assets * bps) / 10000 / 12;
    const monthly = Math.max(raw, 3000);
    return { assets, tier, monthly, raw };
  }, [value]);

  return (
    <div className="calc">
      <div className="calc-l">
        <label htmlFor="aumSlide" className="calc-k">
          Your family’s assets
        </label>
        <div className="calc-v">{assetLabel(quote.assets)}</div>
        <input
          type="range"
          id="aumSlide"
          min={0}
          max={1000}
          step={1}
          value={value}
          aria-valuetext={assetLabel(quote.assets) + ", " + money(quote.monthly) + " a month"}
          aria-describedby="aumV"
          onChange={(e) => setValue(Number(e.target.value))}
        />
        <div className="track" aria-hidden="true">
          <div className="tseg s0" style={{ width: "29.15%" }} />
          <div className="tseg s1" style={{ width: "16.60%" }} />
          <div className="tseg s2" style={{ width: "12.55%" }} />
          <div className="tseg s3" style={{ width: "29.15%" }} />
          <div className="tseg s4" style={{ width: "12.55%" }} />
          <b className="marker" style={{ left: value / 10 + "%" }} />
        </div>
        <div className="ticks" aria-hidden="true">
          <span style={{ left: "0.00%" }}>$20M</span>
          <span style={{ left: "29.15%" }}>$100M</span>
          <span style={{ left: "45.74%" }}>$250M</span>
          <span style={{ left: "58.30%" }}>$500M</span>
          <span style={{ left: "87.45%" }}>$2.5B</span>
          <span style={{ left: "100.00%" }}>$5B</span>
        </div>
      </div>
      <div className="calc-r" aria-live="polite">
        <span className="calc-k" style={{ color: "var(--gold-soft)" }}>
          Your Essential fee
        </span>
        <div className="calc-fee">
          <span>{money(quote.monthly)}</span>
          <small> /month</small>
        </div>
        <p className="calc-y">{money(quote.monthly * 12)} a year</p>
        <div className="calc-rows">
          <div>
            <span>Tier</span>
            <b>{TIER_NAMES[quote.tier]}</b>
          </div>
          <div>
            <span>Billing</span>
            <b>Monthly</b>
          </div>
          <div>
            <span>Includes</span>
            <b>Platform and your Vault team</b>
          </div>
        </div>
        <p className="calc-note">
          {quote.raw < 3000
            ? "The $3,000 monthly minimum applies below about $60M in family assets."
            : "One fee on all family assets, billed monthly. Add services anytime with a Custom plan."}
        </p>
        <a className="btn btn-gold" href="#get-started">
          Get started
        </a>
      </div>
    </div>
  );
}

function Check({ children }: { children: string }) {
  return (
    <li>
      <i className="ti-c" aria-hidden="true">
        ✓
      </i>
      <span>{children}</span>
    </li>
  );
}

export function Home() {
  return (
    <div className="view active" id="v-home">
      <section className="hero" id="home">
        <div className="wrap">
          <div>
            <h1>Every trust. Every heir. Every generation.</h1>
            <p className="lede">
              Vault administers estates and dynasty trusts for families with $20 million or more. Trust attorneys, software and a dedicated service team, in one subscription billed monthly.
            </p>
            <div className="ctas">
              <a className="btn btn-gold" href="mailto:hello@vault.example?subject=Consultation">
                Book a consultation
              </a>
              <a className="btn btn-ghost" href="#login">
                Client login
              </a>
            </div>
            <p className="fine">From 4 to 6 basis points a year, tiered by family size.</p>
          </div>
          <div className="structure" aria-label="Example family structure in Vault">
            <div className="cap">
              <span>Family structure</span>
              <span>$1.24B administered</span>
            </div>
            <div className="tree">
              <div className="node root">
                <b>Family office</b>
                <span>3 generations · 7 heirs</span>
              </div>
              <div className="links" aria-hidden="true" />
              <div className="row">
                <div className="node">
                  <b>Dynasty Trust</b>
                  <span>$640M · Vault trustee</span>
                </div>
                <div className="node">
                  <b>GRAT 2026</b>
                  <span>$180M · 2-year term</span>
                </div>
                <div className="node">
                  <b>ILIT</b>
                  <span>$40M policy</span>
                </div>
              </div>
              <div className="heirs">
                <span className="chip">Gen 2 · 3 heirs</span>
                <span className="chip">Gen 3 · 4 heirs</span>
                <span className="chip">Charitable trust</span>
              </div>
            </div>
            <div className="deadline">
              <span>Next deadline</span>
              <strong>Crummey notices · Nov 15</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="block" id="how">
        <div className="wrap">
          <p className="kicker">How it works</p>
          <h2 className="title">One platform, three disciplines under one roof</h2>
          <p className="sub">
            Most families coordinate a trustee, an estate attorney, a CPA and a bank, each holding one piece. Vault brings the structure, the legal judgment and the day-to-day service into a single place.
          </p>
          <div className="three">
            <div>
              <h3>Trust attorneys</h3>
              <p>In-house counsel reviews every instrument and advises trustees on distributions, decanting and compliance.</p>
            </div>
            <div>
              <h3>Software</h3>
              <p>One system of record for every trust, entity, asset and heir, with deadlines and approvals tracked automatically.</p>
            </div>
            <div>
              <h3>Dedicated service</h3>
              <p>A named team for every family, available to trustees and beneficiaries across generations.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="block alt" id="pricing">
        <div className="wrap">
          <p className="kicker">Pricing</p>
          <h2 className="title">Start with Essential. Build the rest around your family.</h2>
          <p className="sub">
            Both plans use the same annual rate on assets, billed monthly. Essential covers everything a family needs to run its trusts; Custom adds the services your structure calls for.
          </p>
          <div className="plans">
            <div className="plan">
              <span className="plan-k">Essential</span>
              <div className="plan-p">
                6 → 4 bps<span> a year, billed monthly</span>
              </div>
              <p className="plan-min">Minimum $3,000 a month</p>
              <ul className="plan-l">
                <Check>Trust and entity map</Check>
                <Check>Document vault with e-signature</Check>
                <Check>Compliance calendar and reminders</Check>
                <Check>Distribution workflows</Check>
                <Check>Beneficiary portal</Check>
                <Check>Your dedicated Vault team</Check>
              </ul>
              <p className="plan-h">Also included</p>
              <ul className="plan-l light">
                <Check>2 next-generation seats included</Check>
                <Check>Annual trust review with our counsel</Check>
              </ul>
              <a className="btn btn-dark" href="#get-started">
                Get started
              </a>
            </div>
            <div className="plan feat">
              <span className="plan-k">Custom</span>
              <div className="plan-p">
                Essential +<span> the services you choose</span>
              </div>
              <p className="plan-min">Priced per service, listed below</p>
              <p style={{ margin: "0 0 12px", color: "var(--ink-2)" }}>
                For families with fiduciary needs, complex structures, foundations or several generations to bring along. Your relationship lead builds the plan with you, and it’s billed as one monthly invoice.
              </p>
              <ul className="plan-l">
                <Check>Everything in Essential</Check>
                <Check>Fiduciary roles: trustee or trust protector</Check>
                <Check>Tax coordination with your CPA</Check>
                <Check>Family governance and charitable vehicles</Check>
                <Check>Seats for your advisors and accountant</Check>
              </ul>
              <a className="btn btn-gold" href="#build-plan">
                Build my plan
              </a>
            </div>
          </div>
          <h3 className="ph">See your annual rate</h3>
          <FeeCalculator />
          <h3 className="ph">What’s included, and what you can add</h3>
          <div className="legend-row">
            <span>
              <span className="mk yes" aria-label="Included">
                ✓
              </span>{" "}
              Included in the plan
            </span>
            <span>
              <span className="mk add" aria-label="Available as an add-on">
                +
              </span>{" "}
              Available as an add-on
            </span>
            <span>
              <span className="mk no" aria-label="Not included">
                –
              </span>{" "}
              Not available
            </span>
          </div>
          <ComparisonTable />
          <p className="note" style={{ marginTop: 14 }}>
            Prices are monthly unless noted. Fiduciary roles are billed in basis points on the trust’s assets, with the monthly minimums shown.
          </p>
        </div>
      </section>

      <section className="block" id="partners">
        <div className="wrap">
          <p className="kicker">For partners</p>
          <h2 className="title">Built to work alongside the advisors families already trust</h2>
          <p className="sub">
            Vault administers trusts. We don’t manage investments, hold custody or prepare tax returns, so partners keep their relationships and their revenue.
          </p>
          <div className="partners">
            <div className="partner">
              <h3>Wealth managers</h3>
              <p>Offer institutional trust administration without building it.</p>
            </div>
            <div className="partner">
              <h3>Private banks</h3>
              <p>Keep custody and lending; refer trust work to Vault.</p>
            </div>
            <div className="partner">
              <h3>RIAs</h3>
              <p>Give clients a trust platform that rivals the largest firms.</p>
            </div>
            <div className="partner">
              <h3>CPA firms</h3>
              <p>Secure access to the trust data you need for returns.</p>
            </div>
          </div>
          <div style={{ height: 64 }} />
          <div className="cta-band">
            <h2>See your family’s structure in one place.</h2>
            <div className="ctas" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a className="btn btn-gold" href="mailto:hello@vault.example?subject=Consultation">
                Book a consultation
              </a>
              <a className="btn btn-ghost" href="#login">
                Try the demo portal
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
