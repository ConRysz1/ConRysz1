import type { FormEvent, ReactNode } from "react";
import { fmtD, nextWeekdays } from "../domain/calendar";
import { money, refId } from "../domain/format";
import {
  AUA_STEPS,
  HEARD_FROM,
  MEET_MODES,
  RESIDENCE_STATES,
  fmtAua,
  lineTotal,
  newOnboarding,
  onboardingLines,
} from "../domain/onboarding";
import type { Onboarding } from "../domain/types";
import { toast } from "../ui/overlays";
import { updateSession, useSession } from "../state/store";

const STEPS = {
  start: ["About you", "Your family", "Intro call"],
  build: ["About you", "Your family", "Services", "Meet our team"],
} as const;

export function OnboardingFlow({ kind }: { kind: "start" | "build" }) {
  const session = useSession();
  const o = session.ob[kind];
  const steps = STEPS[kind];
  const lines = onboardingLines(kind, o);
  const total = lineTotal(lines);
  const assets = AUA_STEPS[o.aIdx] ?? AUA_STEPS[6];

  function patch(recipe: (draft: Onboarding) => void) {
    updateSession((s) => recipe(s.ob[kind]));
  }

  if (o.ref && o.slot) {
    const whenDate = new Date(Number(o.slot.split("|")[0]));
    const when = fmtD(whenDate, { weekday: "long", month: "long", day: "numeric" }) + " at " + o.slot.split("|")[1];
    const process =
      kind === "start"
        ? [
            ["Intro call", "30 minutes with your relationship lead · " + when],
            ["Secure document upload", "We send a link for your trust instruments and entity documents"],
            ["Attorney review", "Our counsel builds your structure map, usually within 2 weeks"],
            ["Agreement and billing", "One-page Essential agreement, billed monthly"],
            ["Portal live", "Your family gets access, typically 4–6 weeks from today"],
          ]
        : [
            ["Planning session", "45 minutes with a relationship lead and trust counsel · " + when],
            ["Structure review", "We review your documents and confirm which services fit, 1–2 weeks"],
            ["Proposal and fee letter", "A written Custom plan with your exact monthly fee, within 5 business days of review"],
            ["Onboarding", "Documents migrated, fiduciary appointments prepared, 4–6 weeks"],
            ["Portal live", "Your family and advisors get access"],
          ];
    return (
      <div className="view active">
        <section className="page-hero">
          <div className="wrap">
            <p className="crumbs">
              <a href="#home">Vault</a> / <a href="#pricing">Pricing</a> / {kind === "start" ? "Get started with Essential" : "Build your Custom plan"}
            </p>
            <h1>{kind === "start" ? "You’re on your way" : "We’ll build it together"}</h1>
          </div>
        </section>
        <section className="fsec">
          <div className="wrap" style={{ maxWidth: 820 }}>
            <div className="ob-card ok">
              <div className="okmark" aria-hidden="true">
                ✓
              </div>
              <h2>{kind === "start" ? "Your intro call is booked" : "Your planning session is booked"}</h2>
              <p className="hint">
                Confirmation {o.ref} was sent to {o.email}.{" "}
                {kind === "build" ? "Sarah Kim and Michael Grant, J.D. will join." : "Sarah Kim, your relationship lead, will call you."}
              </p>
              <div className="sum">
                <span>When</span>
                <span>{when}</span>
              </div>
              <div className="sum">
                <span>How</span>
                <span>{o.mode}</span>
              </div>
              <div className="sum">
                <span>Estimated monthly fee</span>
                <span>{money(total)}</span>
              </div>
              <h3 style={{ margin: "24px 0 10px" }}>What happens next</h3>
              <ol className="tl">
                {process.map((step, i) => (
                  <li key={step[0]} className={i === 0 ? "done" : undefined}>
                    <b>{step[0]}</b>
                    <span>{step[1]}</span>
                  </li>
                ))}
              </ol>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
                <button className="btn btn-dark" type="button" onClick={() => toast("Added to your calendar (demo)")}>
                  Add to my calendar
                </button>
                <a className="btn btn-line" href="#home">
                  Back to home
                </a>
                <button
                  className="btn btn-line"
                  type="button"
                  onClick={() => {
                    updateSession((s) => {
                      s.ob[kind] = newOnboarding();
                    });
                    window.scrollTo(0, 0);
                  }}
                >
                  Start over
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (o.step === 1) {
      if (!o.name.trim()) return setError("Enter your full name.");
      if (o.email.trim().indexOf("@") < 1) return setError("Enter a valid email address.");
    }
    if (o.step === steps.length) {
      if (!o.slot) return setError("Choose a time.");
      if (!o.agree) return setError("Check the box so we can contact you.");
      patch((draft) => {
        draft.ref = refId();
      });
      window.scrollTo(0, 0);
      return;
    }
    patch((draft) => {
      draft.step += 1;
    });
    window.scrollTo(0, 0);
  }

  return (
    <OnboardingForm kind={kind} errorHolder={submit} assets={assets} lines={lines} total={total} />
  );
}

function setError(message: string) {
  const el = document.getElementById("obErr");
  if (el) el.textContent = message;
}

function OnboardingForm({
  kind,
  errorHolder,
  assets,
  lines,
  total,
}: {
  kind: "start" | "build";
  errorHolder: (e: FormEvent) => void;
  assets: number;
  lines: [string, number][];
  total: number;
}) {
  const o = useSession().ob[kind];
  const steps = STEPS[kind];
  const days = nextWeekdays(5);
  const slots = kind === "start" ? ["9:30 AM", "11:00 AM", "1:00 PM", "3:30 PM"] : ["10:00 AM", "1:30 PM", "4:00 PM"];

  function patch(recipe: (draft: Onboarding) => void) {
    updateSession((s) => recipe(s.ob[kind]));
  }

  let body = null;
  if (o.step === 1) {
    body = (
      <>
        <h2>Tell us about you</h2>
        <p className="hint">We use this only to reach you about Vault.</p>
        <div className="form2">
          <div>
            <label htmlFor="obName">Full name</label>
            <input id="obName" value={o.name} placeholder="Eleanor Whitfield" onChange={(e) => patch((d) => { d.name = e.target.value; })} />
          </div>
          <div>
            <label htmlFor="obEmail">Email</label>
            <input id="obEmail" type="email" value={o.email} placeholder="you@family.com" onChange={(e) => patch((d) => { d.email = e.target.value; })} />
          </div>
          <div>
            <label htmlFor="obPhone">Phone</label>
            <input id="obPhone" type="tel" value={o.phone} placeholder="(561) 555-0100" onChange={(e) => patch((d) => { d.phone = e.target.value; })} />
          </div>
          <div>
            <label htmlFor="obState">State of residence</label>
            <select id="obState" value={o.state} onChange={(e) => patch((d) => { d.state = e.target.value; })}>
              {RESIDENCE_STATES.map((state) => (
                <option key={state}>{state}</option>
              ))}
            </select>
          </div>
        </div>
        <label htmlFor="obSrc">How did you hear about us?</label>
        <select id="obSrc" value={o.source} onChange={(e) => patch((d) => { d.source = e.target.value; })}>
          {HEARD_FROM.map((source) => (
            <option key={source}>{source}</option>
          ))}
        </select>
      </>
    );
  } else if (o.step === 2) {
    const counts: [keyof Pick<Onboarding, "trusts" | "entities" | "heirs">, string, string, number][] = [
      ["trusts", "Trusts", "Dynasty trusts, GRATs, ILITs", 1],
      ["entities", "Trusts and LLCs", "All entities, in total", 1],
      ["heirs", "Heirs", "Children, grandchildren, beneficiaries", 0],
    ];
    body = (
      <>
        <h2>Your family’s structure</h2>
        <p className="hint">Estimates are fine. Your fee is confirmed after our review.</p>
        <div className="ob-assets">
          <div className="ob-row">
            <label htmlFor="obAua">Total family assets</label>
            <span className="ob-big">{fmtAua(assets)}</span>
          </div>
          <input
            type="range"
            className="ob-range"
            id="obAua"
            min={0}
            max={AUA_STEPS.length - 1}
            step={1}
            value={o.aIdx}
            style={{ ["--p" as string]: (o.aIdx / (AUA_STEPS.length - 1)) * 100 + "%" }}
            onChange={(e) => patch((d) => { d.aIdx = Number(e.target.value); })}
          />
          <div className="ob-ticks" aria-hidden="true">
            {[
              [0, "$20M"],
              [5, "$100M"],
              [10, "$500M"],
              [12, "$1B"],
              [17, "$5B"],
            ].map((tick) => (
              <span key={String(tick[1])} style={{ left: (Number(tick[0]) / (AUA_STEPS.length - 1)) * 100 + "%" }}>
                {tick[1]}
              </span>
            ))}
          </div>
        </div>
        <div className="ob-counts">
          {counts.map((c) => (
            <div className="ob-count" key={c[0]}>
              <label htmlFor={"ob-" + c[0]}>{c[1]}</label>
              <span className="ob-sub">{c[2]}</span>
              <div className="stepper-in">
                <button
                  type="button"
                  aria-label={"Fewer " + c[1].toLowerCase()}
                  onClick={() =>
                    patch((d) => {
                      d[c[0]] = Math.max(c[3], d[c[0]] - 1);
                      if (d.entities < d.trusts) d.entities = d.trusts;
                    })
                  }
                >
                  −
                </button>
                <input
                  id={"ob-" + c[0]}
                  type="number"
                  min={c[3]}
                  value={o[c[0]]}
                  onChange={(e) =>
                    patch((d) => {
                      d[c[0]] = Math.max(c[3], Number(e.target.value) || c[3]);
                      if (c[0] === "trusts") d.entities = Math.max(d.trusts, d.entities);
                      if (c[0] === "entities") d.entities = Math.max(d.trusts, d.entities);
                    })
                  }
                />
                <button
                  type="button"
                  aria-label={"More " + c[1].toLowerCase()}
                  onClick={() =>
                    patch((d) => {
                      d[c[0]] = d[c[0]] + 1;
                      if (c[0] === "trusts") d.entities = Math.max(d.trusts, d.entities);
                    })
                  }
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  } else if (kind === "build" && o.step === 3) {
    const assetSelect = (id: string) => (
      <select
        id={id}
        style={{ margin: "8px 0 0", width: "auto" }}
        value={o.svc.trusteeAssets}
        onChange={(e) => patch((d) => { d.svc.trusteeAssets = Number(e.target.value); })}
        onClick={(e) => e.stopPropagation()}
      >
        {AUA_STEPS.map((value, i) => (
          <option key={value} value={i}>
            {fmtAua(value)}
          </option>
        ))}
      </select>
    );
    const option = (key: keyof Onboarding["svc"], title: string, desc: string, price: string, extra?: ReactNode) => (
      <label className={"svc-opt" + (o.svc[key] ? " on" : "")}>
        <input
          type="checkbox"
          checked={Boolean(o.svc[key])}
          onChange={(e) => patch((d) => { (d.svc[key] as boolean) = e.target.checked; })}
        />
        <span>
          <b>{title}</b>
          <em>{desc}</em>
          {extra && o.svc[key] ? <span className="svc-x">{extra}</span> : null}
        </span>
        <i>{price}</i>
      </label>
    );
    body = (
      <>
        <h2>Choose your services</h2>
        <p className="hint">Everything in Essential is included. Add what your family needs; your total updates as you go.</p>
        <h4 className="svc-h">Fiduciary roles</h4>
        {option("trustee", "Serving as trustee", "Vault acts as legal trustee", "from $2,500/mo", o.svc.trustee || o.svc.protector ? <>Assets in trust {assetSelect("obTA")}</> : null)}
        {option("protector", "Trust protector", "Independent oversight", "from $5,000/mo", !o.svc.trustee && o.svc.protector ? <>Assets in trust {assetSelect("obTA2")}</> : null)}
        <h4 className="svc-h">Compliance and administration</h4>
        {option("tax", "Trust tax coordination", "For your " + o.trusts + " trusts, delivered to your CPA", "$350/trust")}
        {option(
          "valuation",
          "Valuation support",
          "Annual appraisals",
          "$583/asset",
          <>
            Assets to appraise{" "}
            <input
              type="number"
              min={1}
              value={o.svc.valN}
              style={{ width: 90, margin: "8px 0 0" }}
              onClick={(e) => e.preventDefault()}
              onChange={(e) => patch((d) => { d.svc.valN = Math.max(1, Number(e.target.value) || 1); })}
            />
          </>,
        )}
        <h4 className="svc-h">Family services</h4>
        {option("governance", "Family governance", "Annual meeting and family charter", "$3,500/mo")}
        {option(
          "charitable",
          "Charitable vehicles",
          "Foundations, donor-advised funds, charitable trusts",
          "$1,000 each",
          <>
            Vehicles{" "}
            <input
              type="number"
              min={1}
              value={o.svc.charN}
              style={{ width: 90, margin: "8px 0 0" }}
              onClick={(e) => e.preventDefault()}
              onChange={(e) => patch((d) => { d.svc.charN = Math.max(1, Number(e.target.value) || 1); })}
            />
          </>,
        )}
        {option("nextgen", "More next-generation seats", "Seats for " + Math.max(0, o.heirs - 2) + " heirs beyond the 2 included", "$150/heir")}
        <h4 className="svc-h">For your advisors</h4>
        {option("advisor", "Invite my advisor and CPA", "Seats are billed to their firms, not your family", "No cost to you")}
        {o.entities > 5 ? (
          <p className="note">Your {o.entities} entities include {o.entities - 5} beyond the 5 in Essential, at $200 a month each.</p>
        ) : null}
      </>
    );
  } else {
    body = (
      <>
        <h2>{kind === "start" ? "Pick a time for your intro call" : "Meet our team"}</h2>
        <p className="hint">
          {kind === "start"
            ? "A 30-minute call with your relationship lead. No preparation needed."
            : "A 45-minute planning session with a relationship lead and trust counsel to shape your plan."}
        </p>
        {days.map((day, di) => (
          <div className="slotday" key={day.getTime()}>
            <b>{fmtD(day, { weekday: "long", month: "short", day: "numeric" })}</b>
            <div className="slots">
              {slots.map((slot, si) => {
                const value = day.getTime() + "|" + slot;
                const busy = (di * 3 + si) % 5 === 2;
                return (
                  <button
                    key={value}
                    type="button"
                    className={"slot" + (o.slot === value ? " on" : "")}
                    disabled={busy}
                    onClick={() => patch((d) => { d.slot = value; })}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <div className="form2" style={{ marginTop: 16 }}>
          <div>
            <label htmlFor="obMode">How would you like to meet?</label>
            <select id="obMode" value={o.mode} onChange={(e) => patch((d) => { d.mode = e.target.value; })}>
              {MEET_MODES.map((mode) => (
                <option key={mode}>{mode}</option>
              ))}
            </select>
          </div>
          {kind === "build" ? (
            <div>
              <label>Who will join?</label>
              {(
                [
                  ["me", "Me"],
                  ["spouse", "My spouse"],
                  ["advisor", "My advisor"],
                  ["attorney", "My attorney"],
                ] as const
              ).map((item) => (
                <label className="chk" key={item[0]}>
                  <input
                    type="checkbox"
                    checked={o.attend[item[0]]}
                    onChange={(e) => patch((d) => { d.attend[item[0]] = e.target.checked; })}
                  />{" "}
                  {item[1]}
                </label>
              ))}
            </div>
          ) : (
            <div />
          )}
        </div>
        <label htmlFor="obNotes">Anything we should know?</label>
        <input
          id="obNotes"
          value={o.notes}
          placeholder="A dynasty trust in South Dakota and two family LLCs"
          onChange={(e) => patch((d) => { d.notes = e.target.value; })}
        />
        <label className="chk" style={{ marginTop: 6 }}>
          <input type="checkbox" checked={o.agree} onChange={(e) => patch((d) => { d.agree = e.target.checked; })} /> Vault may contact me about my plan. My information is kept confidential.
        </label>
      </>
    );
  }

  return (
    <div className="view active">
      <section className="page-hero">
        <div className="wrap">
          <p className="crumbs">
            <a href="#home">Vault</a> / <a href="#pricing">Pricing</a> / {kind === "start" ? "Get started with Essential" : "Build your Custom plan"}
          </p>
          <h1>{kind === "start" ? "Get started with Essential" : "Build your Custom plan"}</h1>
          <p>
            {kind === "start"
              ? "Four quick steps. You’ll talk with your relationship lead before anything is signed."
              : "Pick the services your family needs, see your estimated fee, and meet with our team to finalize it."}
          </p>
        </div>
      </section>
      <section className="fsec">
        <div className="wrap ob-grid">
          <div className="ob-card">
            <ol className="stepper">
              {steps.map((step, i) => (
                <li key={step} className={o.step > i + 1 ? "done" : o.step === i + 1 ? "on" : undefined}>
                  <span>{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
            <form
              noValidate
              onSubmit={(e) => {
                const err = document.getElementById("obErr");
                if (err) err.textContent = "";
                errorHolder(e);
              }}
            >
              {body}
              <div className="err" id="obErr" role="alert" />
              <div className="sgbtns" style={{ justifyContent: "space-between" }}>
                {o.step > 1 ? (
                  <button
                    type="button"
                    className="btn btn-line"
                    onClick={() => {
                      patch((d) => { d.step -= 1; });
                      window.scrollTo(0, 0);
                    }}
                  >
                    Back
                  </button>
                ) : (
                  <a className="btn btn-line" href="#pricing">
                    Back to pricing
                  </a>
                )}
                <button type="submit" className={"btn " + (o.step === steps.length ? "btn-gold" : "btn-dark")}>
                  {o.step === steps.length ? (kind === "start" ? "Book my intro call" : "Book my planning session") : "Continue"}
                </button>
              </div>
            </form>
          </div>
          <aside className="ob-sum">
            <p className="plan-h" style={{ margin: "0 0 4px" }}>
              {kind === "start" ? "Essential plan" : "Your Custom plan"}
            </p>
            <div className="plan-p" style={{ margin: 0 }}>
              {money(total)}
              <span> /month est.</span>
            </div>
            <p className="hint" style={{ margin: "4px 0 14px" }}>
              About {money(total * 12)} a year
            </p>
            {lines.map((line) => (
              <div className="sum" key={line[0]}>
                <span>{line[0]}</span>
                <span>{money(line[1])}</span>
              </div>
            ))}
            <p className="note" style={{ marginTop: 14 }}>
              Included: entity map, document vault and e-signature, calendar, distributions, beneficiary portal, your Vault team, an annual trust review, 5 entities and 2 next-generation seats.
            </p>
            <h4 style={{ margin: "18px 0 8px" }}>The process</h4>
            <ol className="tl">
              {(kind === "start"
                ? ["Intro call", "Document upload", "Attorney review", "Portal live in 4–6 weeks"]
                : ["Planning session", "Structure review", "Proposal and fee letter", "Onboarding, 4–6 weeks"]
              ).map((step, i) => (
                <li key={step} className={i < 1 ? "done" : undefined}>
                  <b>{step}</b>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>
    </div>
  );
}
