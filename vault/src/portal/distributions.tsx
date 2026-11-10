import { useState, type FormEvent } from "react";
import { logAct } from "../domain/demo";
import { fmtD } from "../domain/calendar";
import { longDate, money, parseAmount, todayLabel } from "../domain/format";
import type { Distribution } from "../domain/types";
import { getData, updateData, updateSession, useSession, useVault } from "../state/store";
import { DataTable, Stat, Tag } from "../ui/bits";
import { closeSheet, confirmBox, openSheet, toast } from "../ui/overlays";
import { distCells } from "./overview";

const FILTERS = ["All", "Pending trustee review", "Approved", "Paid", "Withdrawn"];

export function Distributions() {
  const data = useVault();
  const session = useSession();
  const [who, setWho] = useState(data.heirs.find((h) => h.role.startsWith("Beneficiary"))?.name ?? "");
  const [trust, setTrust] = useState(data.trusts.find((t) => t.type !== "Family LLC")?.name ?? "");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const heirs = data.heirs.filter((h) => h.role.startsWith("Beneficiary"));
  const trusts = data.trusts.filter((t) => t.type !== "Family LLC");
  const selected = trusts.find((t) => t.name === trust) ?? trusts[0];
  const paid = data.dist.filter((d) => d.status === "Paid" || d.status === "Approved").reduce((s, d) => s + d.amount, 0);
  const pending = data.dist.filter((d) => d.status === "Pending trustee review").length;
  const shown = data.dist.map((d, i) => ({ d, i })).filter((x) => session.distFilter === "All" || x.d.status === session.distFilter);
  const decision = fmtD(new Date(Date.now() + 3 * 864e5), { weekday: "short", month: "short", day: "numeric" });

  function review(e: FormEvent) {
    e.preventDefault();
    const amt = parseAmount(amount);
    if (!amt) { setError("Enter an amount greater than zero."); return; }
    if (!purpose.trim()) { setError("Add a purpose so your trustee can review the request."); return; }
    setError("");
    const draft = { who, trust, amount: amt, purpose: purpose.trim(), files: files.map((f) => f.name) };
    openSheet("Review your request", <Review draft={draft} />);
  }

  return (
    <>
      <h1>Distributions</h1>
      <p className="hint">Request a distribution. Your trustee reviews every request and you’ll see the decision here.</p>
      <div className="stats" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <Stat k="Approved or paid this year" v={money(paid)} />
        <Stat k="Pending review" v={String(pending)} />
        <Stat k="Typical review time" v="3 business days" />
      </div>
      <div className="grid2">
        <div className="panel">
          <h2>History</h2>
          <div className="tabs">
            {FILTERS.map((f) => (
              <button key={f} type="button" className={session.distFilter === f ? "on" : ""} onClick={() => updateSession((s) => { s.distFilter = f; })}>
                {f === "Pending trustee review" ? "Pending" : f}
              </button>
            ))}
          </div>
          <DataTable
            head={["Beneficiary", "Purpose", "Amount", "Status", ""]}
            empty="No distributions with this status."
            rows={shown.map(({ d, i }) => [
              ...distCells(d),
              <>
                <button className="btn btn-line sm" type="button" onClick={() => openSheet(d.who + " · " + money(d.amount), <DistDetail d={d} />)}>Details</button>
                {d.status === "Pending trustee review" ? (
                  <>
                    {" "}
                    <button className="btn btn-line sm" type="button" onClick={() => withdraw(i)}>Withdraw</button>
                  </>
                ) : null}
              </>,
            ])}
          />
        </div>
        <form className="panel" noValidate onSubmit={review}>
          <h2>New request</h2>
          <label htmlFor="dWho">Beneficiary</label>
          <select id="dWho" value={who} onChange={(e) => setWho(e.target.value)}>
            {heirs.map((h) => <option key={h.name}>{h.name}</option>)}
          </select>
          <label htmlFor="dTrust">From trust</label>
          <select id="dTrust" value={trust} onChange={(e) => setTrust(e.target.value)}>
            {trusts.map((t) => <option key={t.id}>{t.name}</option>)}
          </select>
          {selected ? (
            <div className="std">
              <b>{selected.name}</b> · trustee: {selected.trustee}
              <br />
              Standard: health, education, maintenance and support · beneficiaries: {selected.bens}
              <br />
              Estimated decision: {decision}
            </div>
          ) : null}
          <label htmlFor="dAmt">Amount (USD)</label>
          <input id="dAmt" inputMode="numeric" placeholder="25,000" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <label htmlFor="dWhy">Purpose</label>
          <input id="dWhy" placeholder="Tuition, home, medical…" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
          <label htmlFor="dFiles">Supporting documents (optional)</label>
          <input id="dFiles" type="file" multiple style={{ padding: 10 }} onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
          <div className="err" role="alert">{error}</div>
          <button className="btn btn-dark" type="submit" style={{ width: "100%" }}>Review request</button>
        </form>
      </div>
    </>
  );
}

function Review({ draft }: { draft: { who: string; trust: string; amount: number; purpose: string; files: string[] } }) {
  return (
    <>
      <div className="sum"><span>Beneficiary</span><span>{draft.who}</span></div>
      <div className="sum"><span>From</span><span>{draft.trust}</span></div>
      <div className="sum"><span>Amount</span><span>{money(draft.amount)}</span></div>
      <div className="sum"><span>Purpose</span><span>{draft.purpose}</span></div>
      <div className="sum"><span>Attachments</span><span>{draft.files.length ? draft.files.join(", ") : "None"}</span></div>
      <p className="hint" style={{ margin: "12px 0 0" }}>The trustee reviews this against the trust’s distribution standard. You’ll get a notification when there’s a decision.</p>
      <div className="sgbtns">
        <button className="btn btn-line sm" type="button" onClick={closeSheet}>Edit</button>
        <button
          className="btn btn-dark sm"
          type="button"
          onClick={() => {
            updateData((d) => {
              const row: Distribution = {
                who: draft.who,
                trust: draft.trust,
                amount: draft.amount,
                purpose: draft.purpose,
                status: "Pending trustee review",
                date: longDate(),
                files: draft.files.length ? draft.files : undefined,
              };
              d.dist.unshift(row);
              d.notifs.unshift({ t: "Distribution request submitted: " + money(draft.amount), at: todayLabel(), read: false });
              logAct(d, "You requested a " + money(draft.amount) + " distribution for " + draft.who);
            });
            closeSheet();
            toast("Request submitted for trustee review");
          }}
        >
          Submit request
        </button>
      </div>
    </>
  );
}

function withdraw(index: number) {
  const d = getData().dist[index];
  if (!d) return;
  confirmBox({
    title: "Withdraw this request?",
    body: d.who + " · " + money(d.amount) + " · " + d.purpose,
    ok: "Withdraw request",
    onOk: () => {
      updateData((s) => {
        if (s.dist[index]) s.dist[index].status = "Withdrawn";
        s.tasks = s.tasks.filter((t) => t.id !== "k1");
      });
      toast("Request withdrawn");
    },
  });
}

function DistDetail({ d }: { d: Distribution }) {
  const steps = d.status === "Withdrawn"
    ? [["Submitted", d.date, true], ["Withdrawn", "Request withdrawn", true]]
    : [
        ["Submitted", d.date, true],
        ["Trustee review", d.status === "Pending trustee review" ? "In progress" : "Complete", d.status !== "Withdrawn"],
        ["Approved", d.status === "Approved" || d.status === "Paid" ? "Approved" : "—", d.status === "Approved" || d.status === "Paid"],
        ["Paid", d.status === "Paid" ? "Funds sent" : "—", d.status === "Paid"],
      ];
  return (
    <>
      <div className="sum"><span>Trust</span><span>{d.trust}</span></div>
      <div className="sum"><span>Purpose</span><span>{d.purpose}</span></div>
      <div className="sum"><span>Status</span><span><Tag>{d.status}</Tag></span></div>
      <h4 style={{ margin: "18px 0 8px" }}>Timeline</h4>
      <ol className="tl">
        {steps.map((s) => (
          <li key={String(s[0])} className={s[2] ? "done" : undefined}><b>{s[0]}</b><span>{s[1]}</span></li>
        ))}
      </ol>
    </>
  );
}
