import { useState } from "react";
import { logAct } from "../domain/demo";
import { money, parseAmount, shortMoney } from "../domain/format";
import {
  PROJECT_STEPS,
  PROJECT_TYPES,
  TAX_STEPS,
  VALUATION_STEPS,
  bpsMonthly,
  type ServiceId,
  vaultTrusts,
} from "../domain/pricing";
import { updateData, useVault, getData } from "../state/store";
import { DataTable, Stat, Steps, Tag } from "../ui/bits";
import { closeSheet, openSheet, toast } from "../ui/overlays";
import { askAddService } from "./plan";

export function PlanPreview({ id, label }: { id: ServiceId; label: string }) {
  const data = useVault();
  if (data.active[id]) return null;
  return (
    <div className="banner">
      Preview: {label} isn’t on your plan yet.{" "}
      <button className="btn btn-dark sm" type="button" style={{ marginLeft: 10 }} onClick={() => askAddService(id)}>Add to my plan</button>
    </div>
  );
}

export function Fiduciary() {
  const data = useVault();
  const serving = vaultTrusts(data);
  const assets = serving.reduce((sum, trust) => sum + trust.assets, 0);
  const pending = data.trusts.filter((trust) => trust.trustee.includes("pending"));
  return (
    <>
      <div className="titlebar">
        <div>
          <h1>Fiduciary roles</h1>
          <p className="hint" style={{ margin: 0 }}>Vault as trustee and trust protector for your family’s trusts.</p>
        </div>
        <button className="btn btn-dark sm" type="button" onClick={appoint}>Appoint Vault on another trust</button>
      </div>
      <PlanPreview id="trustee" label="Serving as trustee" />
      <div className="stats">
        <Stat k="Trusts with Vault as trustee" v={String(serving.length)} />
        <Stat k="Assets under Vault trusteeship" v={shortMoney(assets)} />
        <Stat k="Decisions this year" v={String(data.fid.decisions.length)} />
        <Stat k="Next trustee meeting" v="Dec 15" />
      </div>
      <div className="panel">
        <h2>Trusts where Vault serves</h2>
        <DataTable
          head={["Trust", "Assets", "Role", "Monthly fee"]}
          rows={[
            ...serving.map((trust) => [<b key={trust.id}>{trust.name}</b>, shortMoney(trust.assets), <Tag>Trustee</Tag>, money(bpsMonthly(trust.assets, 2500))]),
            ...pending.map((trust) => [<b key={trust.id}>{trust.name}</b>, shortMoney(trust.assets), <Tag>Pending acceptance</Tag>, "—"]),
          ]}
        />
      </div>
      <div className="grid2">
        <div className="panel">
          <h2>Trustee decision log <a href="#svc-fiduciary" onClick={(e) => { e.preventDefault(); openSheet("2026 trustee report", <TrusteeReport />); }}>2026 trustee report</a></h2>
          <DataTable
            head={["Date", "Decision", "Outcome"]}
            rows={data.fid.decisions.map((row) => [
              <b key={row.date + row.d}>{row.date}</b>,
              <>{row.d}<br /><span style={{ color: "var(--ink-2)", fontSize: 13 }}>{row.trust}</span></>,
              <Tag>{row.o}</Tag>,
            ])}
          />
        </div>
        <div className="panel">
          <h2>Trust protector</h2>
          {data.active.protector ? (
            <>
              <div className="sum"><span>Trust</span><span>Whitfield Dynasty Trust</span></div>
              <div className="sum"><span>Last annual review</span><span>{data.fid.protReview}</span></div>
              <div className="sum"><span>Powers</span><span>Replace trustee · change situs · amend admin terms</span></div>
              {data.fid.protReq.length ? (
                <>
                  <h4 style={{ margin: "14px 0 6px" }}>Requests</h4>
                  {data.fid.protReq.map((req) => (
                    <div className="sum" key={req.what}><span>{req.what}</span><span><Tag>{req.st}</Tag></span></div>
                  ))}
                </>
              ) : null}
              <form
                noValidate
                style={{ marginTop: 14 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  const what = String(new FormData(e.currentTarget).get("what") || "");
                  updateData((d) => {
                    d.fid.protReq.unshift({ what, st: "Pending trustee review" });
                    logAct(d, "You requested a protector review: " + what);
                  });
                  toast("Request sent to the trust protector");
                }}
              >
                <label htmlFor="protWhat">Request a protector review</label>
                <select id="protWhat" name="what">
                  <option>Review trustee performance</option>
                  <option>Consider changing trust location</option>
                  <option>Update administrative terms</option>
                  <option>Annual protector review</option>
                </select>
                <button className="btn btn-dark sm" type="submit">Submit request</button>
              </form>
            </>
          ) : (
            <>
              <p className="hint">An independent safeguard that can replace trustees, move a trust or update terms as laws change. From $5,000 a month.</p>
              <button className="btn btn-dark sm" type="button" onClick={() => askAddService("protector")}>Add trust protector</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function appoint() {
  const others = getData().trusts.filter((trust) => trust.trustee !== "Vault" && !trust.trustee.includes("pending") && trust.type !== "Family LLC");
  if (!others.length) { toast("Vault already serves on every eligible trust"); return; }
  openSheet("Appoint Vault as trustee", <AppointForm />);
}

function AppointForm() {
  const data = useVault();
  const others = data.trusts.filter((trust) => trust.trustee !== "Vault" && !trust.trustee.includes("pending") && trust.type !== "Family LLC");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const name = String(new FormData(e.currentTarget).get("trust") || "");
        updateData((d) => {
          const trust = d.trusts.find((item) => item.name === name);
          if (!trust) return;
          trust.trustee = "Vault (pending acceptance)";
          logAct(d, "You asked Vault to serve as trustee of " + trust.name);
        });
        closeSheet();
        toast("Request sent to trust counsel");
      }}
    >
      <p className="hint" style={{ margin: "0 0 14px" }}>Choose a trust. Our counsel reviews the instrument and accepts the appointment, usually within two weeks.</p>
      <label htmlFor="apT">Trust</label>
      <select id="apT" name="trust">{others.map((trust) => <option key={trust.id}>{trust.name}</option>)}</select>
      <p className="note">Fee: tiered basis points on the trust’s assets, minimum $2,500 a month.</p>
      <div className="sgbtns">
        <button className="btn btn-line sm" type="button" onClick={closeSheet}>Cancel</button>
        <button className="btn btn-dark sm" type="submit">Request appointment</button>
      </div>
    </form>
  );
}

function TrusteeReport() {
  const data = useVault();
  const done = data.fid.decisions.filter((row) => row.o !== "In review").length;
  return (
    <>
      <p className="hint" style={{ margin: "0 0 12px" }}>Whitfield Dynasty Trust, ILIT and Charitable Remainder Trust</p>
      <div className="sum"><span>Distributions reviewed</span><span>{data.fid.decisions.length}</span></div>
      <div className="sum"><span>Approved or paid</span><span>{done}</span></div>
      <div className="sum"><span>Compliance deadlines met</span><span>100%</span></div>
      <div className="sum"><span>Trustee meetings held</span><span>3</span></div>
      <p style={{ marginTop: 14 }}>The trustee administered each trust in line with its terms. No conflicts of interest were identified. Investment oversight was coordinated with Harbor Wealth Partners.</p>
    </>
  );
}

export function TaxCenter() {
  const data = useVault();
  const ready = data.tax.filter((row) => row.status === "Ready for CPA").length;
  return (
    <>
      <div className="titlebar">
        <div>
          <h1>Tax center</h1>
          <p className="hint" style={{ margin: 0 }}>Vault gathers each trust’s tax data and K-1 inputs; your CPA prepares and files.</p>
        </div>
        <button
          className="btn btn-dark sm"
          type="button"
          disabled={!ready}
          onClick={() => {
            let n = 0;
            updateData((d) => {
              d.tax.forEach((row) => {
                if (row.status === "Ready for CPA") { row.status = "Sent to CPA"; n += 1; }
              });
              logAct(d, "You sent " + n + " tax packets to Ortiz & Co.");
            });
            toast(n + " packets sent to your CPA");
          }}
        >
          Send {ready} ready packet{ready === 1 ? "" : "s"} to CPA
        </button>
      </div>
      <PlanPreview id="tax" label="Trust tax coordination" />
      <div className="stats">
        <Stat k="Trusts in scope" v={String(data.tax.length)} d="Tax year 2026" />
        <Stat k="Ready for CPA" v={String(ready)} />
        <Stat k="K-1s to issue" v={String(data.tax.reduce((sum, row) => sum + row.k1, 0))} />
        <Stat k="Packet deadline" v="Mar 15" />
      </div>
      <div className="panel">
        <h2>2026 tax packets <span className="mut" style={{ fontWeight: 400 }}>CPA: Daniel Ortiz, Ortiz &amp; Co.</span></h2>
        <DataTable
          head={["Trust", "Progress", "K-1s", ""]}
          rows={data.tax.map((row, i) => [
            <b key={row.trust}>{row.trust}</b>,
            <Steps list={[...TAX_STEPS]} at={TAX_STEPS.indexOf(row.status)} />,
            String(row.k1),
            row.status === "Ready for CPA" ? (
              <button className="btn btn-dark sm" type="button" onClick={() => sendPacket(i)}>Send to CPA</button>
            ) : row.status === "Collecting data" ? (
              <button className="btn btn-line sm" type="button" onClick={() => nudgePacket(i)}>Upload statements</button>
            ) : (
              <button className="btn btn-line sm" type="button" onClick={() => openSheet("2026 tax packet", <PacketView index={i} />)}>View packet</button>
            ),
          ])}
        />
      </div>
    </>
  );
}

function sendPacket(index: number) {
  updateData((d) => {
    const row = d.tax[index];
    if (!row) return;
    row.status = "Sent to CPA";
    logAct(d, "Tax packet for " + row.trust + " sent to Ortiz & Co.");
  });
  toast("Packet sent to Daniel Ortiz, CPA");
}

function nudgePacket(index: number) {
  updateData((d) => {
    const row = d.tax[index];
    if (!row) return;
    row.status = "Ready for CPA";
    logAct(d, "Statements uploaded for " + row.trust);
  });
  toast("Statements received; packet is ready");
}

function PacketView({ index }: { index: number }) {
  const data = useVault();
  const row = data.tax[index];
  if (!row) return null;
  return (
    <>
      <p className="hint" style={{ margin: "0 0 12px" }}>{row.trust}</p>
      {["Income and expense summary", "Capital gains and losses", "Distributions to beneficiaries", "Beneficiary K-1 inputs (" + row.k1 + ")", "Custodian statements"].map((item) => (
        <div className="sum" key={item}><span>{item}</span><span><Tag>Included</Tag></span></div>
      ))}
      <p className="note" style={{ marginTop: 12 }}>Status: {row.status}. Your CPA prepares and files the return.</p>
    </>
  );
}

export function Valuations() {
  const data = useVault();
  return (
    <>
      <div className="titlebar">
        <div>
          <h1>Valuations</h1>
          <p className="hint" style={{ margin: 0 }}>Annual appraisals for gifting, GRATs and estate planning, managed by Vault.</p>
        </div>
        <button className="btn btn-dark sm" type="button" onClick={() => openSheet("Request a valuation", <NewValuation />)}>Request a valuation</button>
      </div>
      <PlanPreview id="valuation" label="Valuation support" />
      {data.vals.map((item, i) => {
        const got = item.docs.filter((doc) => doc[1]).length;
        return (
          <div className="panel" key={item.asset + i}>
            <h2>{item.asset} <span className="mut" style={{ fontWeight: 400 }}>Due {item.due}</span></h2>
            <p className="hint" style={{ margin: "-6px 0 12px" }}>{item.purpose} · Appraiser: {item.appraiser}</p>
            <Steps list={[...VALUATION_STEPS]} at={item.step} />
            <div className="grid2" style={{ marginTop: 16 }}>
              <div>
                <h4 style={{ margin: "0 0 8px" }}>Documents for the appraiser ({got} of {item.docs.length})</h4>
                {item.docs.map((doc, j) => (
                  <label className="chk" key={doc[0]}>
                    <input
                      type="checkbox"
                      checked={doc[1]}
                      onChange={(e) => updateData((d) => { d.vals[i].docs[j][1] = e.target.checked; })}
                    />{" "}
                    {doc[0]}
                  </label>
                ))}
              </div>
              <div>
                <div className="bar" style={{ margin: "8px 0 6px" }}><i style={{ width: Math.round(got / item.docs.length * 100) + "%" }} /></div>
                <p className="hint" style={{ margin: "0 0 12px" }}>{got === item.docs.length ? "All documents received. The appraiser can move to the next step." : "Vault is collecting the remaining items."}</p>
                {item.step < VALUATION_STEPS.length - 1 ? (
                  <button
                    className="btn btn-line sm"
                    type="button"
                    onClick={() => updateData((d) => {
                      const row = d.vals[i];
                      row.step = Math.min(row.step + 1, VALUATION_STEPS.length - 1);
                      logAct(d, row.asset + " valuation: " + VALUATION_STEPS[row.step]);
                    })}
                  >
                    Advance to {VALUATION_STEPS[item.step + 1]} (demo)
                  </button>
                ) : <Tag>Final report delivered</Tag>}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

function NewValuation() {
  const [error, setError] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const asset = String(form.get("asset") || "").trim();
        if (!asset) { setError("Name the asset."); return; }
        const purpose = String(form.get("purpose") || "Annual gifting");
        updateData((d) => {
          d.vals.push({
            asset,
            purpose,
            appraiser: "To be engaged",
            due: "Within 60 days",
            step: 0,
            docs: [["Ownership documents", false], ["Recent financial statements", false], ["Prior appraisal, if any", false]],
          });
          logAct(d, "You requested a valuation of " + asset);
        });
        closeSheet();
        toast("Valuation requested");
      }}
    >
      <label htmlFor="nvA">Asset</label>
      <input id="nvA" name="asset" placeholder="Florida real estate LLC" />
      <label htmlFor="nvP">Purpose</label>
      <select id="nvP" name="purpose">
        <option>Annual gifting</option>
        <option>GRAT funding</option>
        <option>Estate tax return</option>
        <option>Sale or transfer</option>
      </select>
      <p className="note">$583 a month per appraised asset; the appraiser’s fee is billed separately.</p>
      <div className="err">{error}</div>
      <div className="sgbtns">
        <button className="btn btn-line sm" type="button" onClick={closeSheet}>Cancel</button>
        <button className="btn btn-dark sm" type="submit">Request</button>
      </div>
    </form>
  );
}

export function Governance() {
  const data = useVault();
  const meeting = data.gov.meeting;
  const family = data.heirs.filter((heir) => heir.gen !== "Gen 3" || heir.access === "Full");
  const total = data.gov.poll.votes.reduce((sum, n) => sum + n, 0) || 1;
  const agreed = data.gov.charter.filter((section) => section.st === "Agreed").length;
  return (
    <>
      <h1>Family governance</h1>
      <p className="hint">Your family charter, annual meeting and shared decisions.</p>
      <PlanPreview id="governance" label="Family governance" />
      <div className="grid2">
        <div className="panel">
          <h2>Family charter <span className="mut" style={{ fontWeight: 400 }}>{agreed} of {data.gov.charter.length} sections agreed</span></h2>
          {data.gov.charter.map((section, i) => (
            <div className="task" key={section.t}>
              <p>{i + 1}. {section.t}<span>{section.x.slice(0, 70)}…</span></p>
              <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Tag>{section.st}</Tag>
                <button className="btn btn-line sm" type="button" onClick={() => openSheet((i + 1) + ". " + section.t, <CharterSheet index={i} />)}>Open</button>
              </span>
            </div>
          ))}
        </div>
        <div className="panel">
          <h2>Annual family meeting</h2>
          <div className="sum"><span>When</span><span>{meeting.date}</span></div>
          <div className="sum"><span>Where</span><span>{meeting.place}</span></div>
          <h4 style={{ margin: "14px 0 6px" }}>Agenda</h4>
          <ol style={{ margin: "0 0 12px", paddingLeft: 20 }}>
            {meeting.agenda.map((item) => <li key={item} style={{ margin: "4px 0" }}>{item}</li>)}
          </ol>
          <form
            noValidate
            style={{ display: "flex", gap: 8 }}
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.currentTarget.elements.namedItem("item") as HTMLInputElement;
              const value = input.value.trim();
              if (!value) return;
              updateData((d) => {
                d.gov.meeting.agenda.push(value);
                logAct(d, "You added “" + value + "” to the family meeting agenda");
              });
              toast("Added to the agenda");
            }}
          >
            <input name="item" placeholder="Add an agenda item" style={{ margin: 0 }} />
            <button className="btn btn-dark sm" type="submit">Add</button>
          </form>
          <h4 style={{ margin: "16px 0 6px" }}>Who’s attending</h4>
          {family.map((heir) => {
            const answer = meeting.rsvp[heir.name];
            return (
              <div className="sum" key={heir.name}>
                <span>{heir.name}</span>
                <span>
                  <button className={"btn " + (answer === "Yes" ? "btn-dark" : "btn-line") + " sm"} type="button" onClick={() => rsvp(heir.name, "Yes")}>Yes</button>{" "}
                  <button className={"btn " + (answer === "No" ? "btn-dark" : "btn-line") + " sm"} type="button" onClick={() => rsvp(heir.name, "No")}>No</button>
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="panel">
        <h2>Family vote</h2>
        <p style={{ margin: "0 0 12px" }}><b>{data.gov.poll.q}</b></p>
        {data.gov.poll.opts.map((option, i) => {
          const percent = Math.round(data.gov.poll.votes[i] / total * 100);
          const votes = data.gov.poll.votes[i];
          return (
            <div className="hbar" key={option}>
              <span>{option}</span>
              <div className="bar"><i style={{ width: percent + "%" }} /></div>
              <b>{votes} vote{votes === 1 ? "" : "s"}</b>
            </div>
          );
        })}
        {data.gov.poll.voted ? (
          <p className="hint" style={{ margin: "10px 0 0" }}>You voted. Results are shared at the annual meeting.</p>
        ) : (
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            {data.gov.poll.opts.map((option, i) => (
              <button
                key={option}
                className="btn btn-line sm"
                type="button"
                onClick={() => {
                  updateData((d) => {
                    d.gov.poll.votes[i] += 1;
                    d.gov.poll.voted = true;
                    logAct(d, "You voted in the family poll");
                  });
                  toast("Vote recorded");
                }}
              >
                Vote {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function rsvp(name: string, answer: string) {
  updateData((d) => { d.gov.meeting.rsvp[name] = answer; });
}

function CharterSheet({ index }: { index: number }) {
  const data = useVault();
  const section = data.gov.charter[index];
  if (!section) return null;
  return (
    <>
      <p style={{ margin: "0 0 12px" }}>{section.x}</p>
      <p className="hint">Status: {section.st}</p>
      <div className="sgbtns">
        {section.st !== "Agreed" ? (
          <button
            className="btn btn-dark sm"
            type="button"
            onClick={() => {
              updateData((d) => {
                d.gov.charter[index].st = "Agreed";
                logAct(d, "You approved charter section: " + section.t);
              });
              closeSheet();
              toast("Section approved");
            }}
          >
            Approve this section
          </button>
        ) : null}
        <button className="btn btn-line sm" type="button" onClick={closeSheet}>Close</button>
      </div>
    </>
  );
}

export function Philanthropy() {
  const data = useVault();
  const paid = data.charity.grants.filter((grant) => grant.st === "Paid").reduce((sum, grant) => sum + grant.amt, 0);
  const foundation = data.charity.vehicles.find((vehicle) => vehicle.type === "Private foundation");
  const required = foundation ? foundation.assets * 0.05 : 0;
  const foundationPaid = data.charity.grants
    .filter((grant) => foundation && grant.veh === foundation.name && (grant.st === "Paid" || grant.st === "Approved"))
    .reduce((sum, grant) => sum + grant.amt, 0);
  return (
    <>
      <div className="titlebar">
        <div>
          <h1>Philanthropy</h1>
          <p className="hint" style={{ margin: 0 }}>Your foundation and charitable trust, run by Vault.</p>
        </div>
        <button className="btn btn-dark sm" type="button" onClick={() => openSheet("Propose a grant", <NewGrant />)}>Propose a grant</button>
      </div>
      <PlanPreview id="charitable" label="Charitable vehicles" />
      <div className="stats">
        <Stat k="Charitable vehicles" v={String(data.charity.vehicles.length)} />
        <Stat k="Granted this year" v={money(paid)} />
        <Stat k="Foundation payout" v={foundation ? Math.round(foundationPaid / required * 100) + "%" : "—"} d={"of the 5% annual minimum (" + money(required) + ")"} />
        <Stat k="Grants in progress" v={String(data.charity.grants.filter((grant) => grant.st !== "Paid").length)} />
      </div>
      <div className="grid2">
        <div className="panel">
          <h2>Grants</h2>
          <DataTable
            head={["Organization", "Amount", "Status", ""]}
            rows={data.charity.grants.map((grant, i) => [
              <><b>{grant.org}</b><br /><span style={{ color: "var(--ink-2)", fontSize: 13 }}>{grant.veh} · {grant.date}</span></>,
              money(grant.amt),
              <Tag>{grant.st}</Tag>,
              grant.st === "Proposed" ? <button className="btn btn-line sm" type="button" onClick={() => approveGrant(i)}>Approve</button> : "",
            ])}
          />
        </div>
        <div className="panel">
          <h2>Vehicles</h2>
          {data.charity.vehicles.map((vehicle) => (
            <div className="sum" key={vehicle.name}>
              <span><b>{vehicle.name}</b><br /><span style={{ color: "var(--ink-2)", fontSize: 13 }}>{vehicle.type}</span></span>
              <span>{shortMoney(vehicle.assets)}</span>
            </div>
          ))}
          <p className="note" style={{ marginTop: 12 }}>Private foundations must generally distribute about 5% of assets each year. Vault tracks it and coordinates filings with your CPA.</p>
        </div>
      </div>
    </>
  );
}

function approveGrant(index: number) {
  updateData((d) => {
    const grant = d.charity.grants[index];
    if (!grant) return;
    grant.st = "Approved";
    logAct(d, "Grant to " + grant.org + " approved");
  });
  toast("Grant approved");
}

function NewGrant() {
  const data = useVault();
  const [error, setError] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const org = String(form.get("org") || "").trim();
        const amount = parseAmount(String(form.get("amount") || ""));
        if (!org) { setError("Name the organization."); return; }
        if (!amount) { setError("Enter an amount."); return; }
        const veh = String(form.get("veh") || "");
        updateData((d) => {
          d.charity.grants.push({ org, amt: amount, veh, st: "Proposed", date: "Nov 2026" });
          logAct(d, "You proposed a " + money(amount) + " grant to " + org);
        });
        closeSheet();
        toast("Grant proposed for committee review");
      }}
    >
      <label htmlFor="ngO">Organization</label>
      <input id="ngO" name="org" placeholder="Organization name" />
      <label htmlFor="ngA">Amount (USD)</label>
      <input id="ngA" name="amount" inputMode="numeric" placeholder="50,000" />
      <label htmlFor="ngV">From</label>
      <select id="ngV" name="veh">{data.charity.vehicles.map((vehicle) => <option key={vehicle.name}>{vehicle.name}</option>)}</select>
      <div className="err">{error}</div>
      <div className="sgbtns">
        <button className="btn btn-line sm" type="button" onClick={closeSheet}>Cancel</button>
        <button className="btn btn-dark sm" type="submit">Propose grant</button>
      </div>
    </form>
  );
}

export function NextGen() {
  const data = useVault();
  const seats = data.heirs.filter((heir) => heir.access === "Education");
  const leo = data.learn.prog["Leo Whitfield"] === 0 && data.heirs.some((heir) => heir.name === "Leo Whitfield" && heir.access === "None");
  return (
    <>
      <h1>Next generation</h1>
      <p className="hint">Education and portal access for younger heirs. Two seats are included; more are $150 a month each.</p>
      <PlanPreview id="nextgen" label="Next-generation seats" />
      <div className="stats" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <Stat k="Education seats in use" v={String(seats.length)} d="2 included with your plan" />
        <Stat k="Learning modules" v={String(data.learn.mods.length)} />
        <Stat k="Next live session" v="Dec 3" d="Understanding your family’s trusts" />
      </div>
      <div className="panel">
        <h2>Progress by heir</h2>
        {Object.keys(data.learn.prog).map((name) => {
          const progress = data.learn.prog[name];
          const heir = data.heirs.find((item) => item.name === name);
          return (
            <div className="hbar" key={name} style={{ gridTemplateColumns: "200px 1fr 220px" }}>
              <span><b>{name}</b><br /><span style={{ fontSize: 13, color: "var(--ink-2)" }}>{heir ? heir.role : ""}</span></span>
              <div className="bar"><i style={{ width: Math.round(progress / data.learn.mods.length * 100) + "%" }} /></div>
              <span style={{ textAlign: "right" }}>
                {progress} of {data.learn.mods.length} ·{" "}
                <button
                  className="btn btn-line sm"
                  type="button"
                  disabled={progress >= data.learn.mods.length}
                  onClick={() => updateData((d) => {
                    d.learn.prog[name] = Math.min((d.learn.prog[name] || 0) + 1, d.learn.mods.length);
                    logAct(d, name.split(" ")[0] + " completed a learning module");
                  })}
                >
                  Complete next
                </button>
              </span>
            </div>
          );
        })}
        {leo ? <p className="hint" style={{ margin: "10px 0 0" }}>Leo doesn’t have a seat yet. <a href="#heirs" style={{ color: "var(--gold)" }}>Give him education access</a></p> : null}
      </div>
      <div className="panel">
        <h2>Curriculum</h2>
        {data.learn.mods.map((mod, i) => (
          <div className="sum" key={mod}><span>{i + 1}. {mod}</span><span>{i < 2 ? "Ages 14+" : i < 4 ? "Ages 16+" : "Ages 21+"}</span></div>
        ))}
      </div>
    </>
  );
}

export function Projects() {
  const data = useVault();
  return (
    <>
      <div className="titlebar">
        <div>
          <h1>Projects</h1>
          <p className="hint" style={{ margin: 0 }}>One-time work led by Vault’s team and our affiliated law firm.</p>
        </div>
        <button className="btn btn-dark sm" type="button" onClick={() => openSheet("Start a project", <NewProject />)}>Start a project</button>
      </div>
      {data.projects.length ? data.projects.map((project, i) => (
        <div className="panel" key={project.name + i}>
          <h2>{project.name} <span className="mut" style={{ fontWeight: 400 }}>{project.type} · {project.est}</span></h2>
          <p className="hint" style={{ margin: "-6px 0 12px" }}>{project.trust} · started {project.started}</p>
          <Steps list={[...PROJECT_STEPS]} at={project.step} />
          {project.step < PROJECT_STEPS.length - 1 ? (
            <button
              className="btn btn-line sm"
              type="button"
              style={{ marginTop: 12 }}
              onClick={() => updateData((d) => {
                const row = d.projects[i];
                row.step = Math.min(row.step + 1, PROJECT_STEPS.length - 1);
                logAct(d, row.name + ": " + PROJECT_STEPS[row.step]);
              })}
            >
              Advance (demo)
            </button>
          ) : null}
        </div>
      )) : <p className="empty">No projects yet.</p>}
      <div className="panel">
        <h2>Project types</h2>
        {PROJECT_TYPES.map((row) => (
          <div className="sum" key={row[0]}>
            <span><b>{row[0]}</b><br /><span style={{ color: "var(--ink-2)", fontSize: 13 }}>{row[2]}</span></span>
            <span>{row[1]}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function NewProject() {
  const data = useVault();
  const [error, setError] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const description = String(form.get("name") || "").trim();
        if (!description) { setError("Describe the project."); return; }
        const type = PROJECT_TYPES[Number(form.get("type") || 0)];
        const trust = String(form.get("trust") || "");
        updateData((d) => {
          d.projects.unshift({ type: type[0], name: description, trust, est: type[1], step: 0, started: "Nov 2026" });
          logAct(d, "You started a project: " + description);
        });
        closeSheet();
        toast("Project started. Michael Grant will send an engagement letter.");
      }}
    >
      <label htmlFor="npT">Type</label>
      <select id="npT" name="type">
        {PROJECT_TYPES.map((row, i) => <option key={row[0]} value={i}>{row[0]} · {row[1]}</option>)}
      </select>
      <label htmlFor="npN">Describe the project</label>
      <input id="npN" name="name" placeholder="Create a new trust for our first grandchild" />
      <label htmlFor="npTr">Trust</label>
      <select id="npTr" name="trust">
        {data.trusts.map((trust) => <option key={trust.id}>{trust.name}</option>)}
        <option>New trust</option>
      </select>
      <div className="err">{error}</div>
      <div className="sgbtns">
        <button className="btn btn-line sm" type="button" onClick={closeSheet}>Cancel</button>
        <button className="btn btn-dark sm" type="submit">Start project</button>
      </div>
    </form>
  );
}
