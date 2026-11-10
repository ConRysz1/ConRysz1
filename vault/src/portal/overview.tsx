import { attentionItems, gettingStarted } from "../domain/attention";
import { logAct } from "../domain/demo";
import { money, shortMoney } from "../domain/format";
import { SERVICES, addOnTotal, baseFee, planTotal, tierBps } from "../domain/pricing";
import { updateData, useVault } from "../state/store";
import { DataTable, Stat, Tag } from "../ui/bits";
import { closeSheet, openSheet, toast } from "../ui/overlays";
import { startSign } from "./sign";

export function Overview() {
  const data = useVault();
  const pending = data.dist.filter((d) => d.status === "Pending trustee review").length;
  const first = data.profile.name.split(" ")[0];
  const activePaid = SERVICES.filter((v) => data.active[v.id] && v.calc(data) > 0);
  const items = attentionItems(data);
  const steps = gettingStarted(data);
  const done = steps.filter((s) => s.done).length;
  const unread = data.threads.reduce((s, t) => s + t.unread, 0);

  function runTask(id: string) {
    const task = data.tasks.find((t) => t.id === id);
    if (!task) return;
    if (task.action === "Review") {
      location.hash = task.go || "distributions";
      return;
    }
    if (task.action === "Sign") {
      const index = data.docs.findIndex((d) => d.name === task.doc);
      if (index >= 0) startSign(index);
      return;
    }
    if (task.action === "Confirm") openCrummey();
  }

  return (
    <>
      <h1>Good afternoon, {first}</h1>
      <p className="hint">Here’s where your family’s trusts stand today.</p>
      <div className="quick">
        <a className="btn btn-dark sm" href="#distributions">Request a distribution</a>
        <a className="btn btn-line sm" href="#documents">Upload a document</a>
        <a className="btn btn-line sm" href="#messages">Message your team{unread ? " (" + unread + ")" : ""}</a>
        <a className="btn btn-line sm" href="#reports">View reports</a>
      </div>
      {!data.onbHidden && done < steps.length ? (
        <div className="panel gs">
          <h2>
            Getting started <span className="mut" style={{ fontWeight: 400 }}>{done} of {steps.length} done</span>
            <button className="linkbtn" type="button" style={{ margin: 0 }} onClick={() => updateData((d) => { d.onbHidden = true; })}>Hide</button>
          </h2>
          <div className="bar" style={{ marginBottom: 14 }}><i style={{ width: Math.round((done / steps.length) * 100) + "%" }} /></div>
          <div className="gs-grid">
            {steps.map((step) => (
              <button key={step.label} className={"gs-i" + (step.done ? " ok" : "")} type="button" onClick={() => { location.hash = step.hash; }}>
                <span>{step.done ? "✓" : ""}</span>
                {step.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div className="stats">
        <Stat k="Assets administered" v={shortMoney(data.aua)} d={"Across " + data.trusts.length + " trusts and entities"} />
        <Stat k="Pending distributions" v={String(pending)} d="Awaiting trustee review" />
        <Stat k="Next deadline" v="Nov 10" d="Confirm Crummey recipients" />
        <Stat k="Monthly plan" v={money(planTotal(data))} d={"Base fee plus " + activePaid.length + " services"} />
      </div>
      <div className="grid2">
        <div className="panel">
          <h2>Needs your attention <span className="count-pill">{items.length}</span></h2>
          {items.length ? (
            <>
              {items.slice(0, 7).map((item) => (
                <div className="task" key={item.text}>
                  <p>{item.text}<span>{item.sub}</span></p>
                  {item.kind === "link" ? (
                    <a className={"btn sm act-" + item.tone} href={"#" + item.hash}>{item.label}</a>
                  ) : (
                    <button className={"btn sm act-" + item.tone} type="button" onClick={() => item.kind === "sign" && item.docIndex !== undefined ? startSign(item.docIndex) : runTask(item.taskId || "")}>{item.label}</button>
                  )}
                </div>
              ))}
              {items.length > 7 ? <p className="hint" style={{ margin: "8px 0 0" }}>+{items.length - 7} more</p> : null}
            </>
          ) : <p className="empty">You’re all caught up.</p>}
        </div>
        <div className="panel">
          <h2>Coming up <a href="#calendar">Full calendar</a></h2>
          <DataTable head={["Date", "Item"]} rows={data.cal.slice(0, 4).map((c) => [<b key={c.id}>{c.date}</b>, c.item])} />
        </div>
      </div>
      <div className="grid2">
        <div className="panel mini-tree">
          <h2>Family structure <a href="#trusts">All trusts</a></h2>
          <div className="tree">
            <div className="node root"><b>Whitfield Family</b><span>{shortMoney(data.aua)} · {data.heirs.length} family members</span></div>
            <div className="links" aria-hidden="true" />
            <div className="row">
              {data.trusts.slice(0, 3).map((t) => (
                <div className="node" key={t.id}><b>{t.name.replace("Whitfield ", "")}</b><span>{shortMoney(t.assets)}</span></div>
              ))}
            </div>
          </div>
        </div>
        <div className="panel">
          <h2>Your plan <a href="#billing">Billing</a></h2>
          <div className="sum"><span>Base fee · {tierBps(data.aua)} bps on {shortMoney(data.aua)}</span><span>{money(baseFee(data))}</span></div>
          <div className="sum"><span>Services</span><span>{money(addOnTotal(data))}</span></div>
          <div className="sum total"><span>Monthly total</span><span>{money(planTotal(data))}</span></div>
        </div>
      </div>
      <div className="panel">
        <h2>Recent distributions <a href="#distributions">All distributions</a></h2>
        <DataTable head={["Beneficiary", "Purpose", "Amount", "Status"]} rows={data.dist.slice(0, 3).map(distCells)} />
      </div>
      <div className="panel">
        <h2>Recent activity <a href="#activity">View all</a></h2>
        {data.activity.slice(0, 6).map((a, i) => (
          <div className="act" key={a.t + i}><i /><p>{a.t}<span>{a.at}</span></p></div>
        ))}
      </div>
    </>
  );
}

export function distCells(d: { who: string; trust: string; date: string; purpose: string; amount: number; status: string }) {
  return [
    <>
      <b>{d.who}</b>
      <br />
      <span style={{ color: "var(--ink-2)", fontSize: 13 }}>{d.trust} · {d.date}</span>
    </>,
    d.purpose,
    money(d.amount),
    <Tag>{d.status}</Tag>,
  ];
}

function openCrummey() {
  openSheet("Confirm Crummey notice recipients", <CrummeySheet />);
}

function CrummeySheet() {
  const data = useVault();
  const recipients = data.heirs.filter((h) => h.gen === "Gen 2");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const n = form.querySelectorAll<HTMLInputElement>("[data-rc]:checked").length;
        const err = form.querySelector<HTMLElement>("#rcErr");
        if (!n) {
          if (err) err.textContent = "Choose at least one recipient.";
          return;
        }
        updateData((d) => {
          d.tasks = d.tasks.filter((t) => t.id !== "k3");
          d.cal.forEach((c) => {
            if (c.item === "Confirm Crummey notice recipients") c.done = true;
          });
          logAct(d, "You confirmed " + n + " Crummey notice recipients");
        });
        closeSheet();
        toast(n + " recipients confirmed");
      }}
    >
      <p className="hint" style={{ margin: "0 0 14px" }}>
        These beneficiaries will receive withdrawal notices for the Whitfield ILIT on Nov 15. Uncheck anyone who should not, and confirm their delivery address.
      </p>
      {recipients.map((h, i) => (
        <div className="rcp" key={h.name}>
          <label className="chk" style={{ margin: 0 }}>
            <input type="checkbox" defaultChecked data-rc={i} /> <b>{h.name}</b>
          </label>
          <input defaultValue={h.name.split(" ")[0].toLowerCase() + "@whitfield.family"} aria-label={"Email for " + h.name} />
        </div>
      ))}
      <div className="err" id="rcErr" role="alert" />
      <div className="sgbtns">
        <button className="btn btn-line sm" type="button" onClick={closeSheet}>Cancel</button>
        <button className="btn sm act-confirm" type="submit">Confirm recipients</button>
      </div>
    </form>
  );
}
