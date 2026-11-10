import { logAct } from "../domain/demo";
import { parseAmount, shortMoney } from "../domain/format";
import { updateData, updateSession, useSession, useVault } from "../state/store";
import { DataTable, Tag } from "../ui/bits";
import { closeSheet, openSheet, toast } from "../ui/overlays";
import { distCells } from "./overview";

export function Trusts() {
  const data = useVault();
  const session = useSession();
  const trust = data.trusts.find((t) => t.id === session.trustId);
  if (!trust) {
    const extra = Math.max(0, data.trusts.length - 5);
    return (
      <>
        <h1>Trusts &amp; entities</h1>
        <p className="hint">Every trust and entity Vault administers for your family. Select one for details.</p>
        <div className="titlebar" style={{ margin: "-10px 0 16px" }}>
          <p className="hint" style={{ margin: 0 }}>
            <b>{data.trusts.length} trusts and entities</b> · 5 included{extra ? " · " + extra + " additional at $200 a month each" : ""}
          </p>
          <button className="btn btn-dark sm" type="button" onClick={() => openSheet("Add a trust or entity", <AddEntity />)}>Add a trust or entity</button>
        </div>
        <div className="panel">
          <DataTable
            head={["Name", "Type", "State", "Assets", "Trustee"]}
            onRow={(i) => {
              updateSession((s) => { s.trustId = data.trusts[i].id; });
              window.scrollTo(0, 0);
            }}
            rows={data.trusts.map((t) => [
              <b key={t.id}>{t.name}</b>,
              t.type,
              t.state,
              shortMoney(t.assets),
              t.trustee === "Vault" ? <Tag>Vault</Tag> : t.trustee,
            ])}
          />
        </div>
      </>
    );
  }

  const hist = [0.78, 0.82, 0.86, 0.9, 0.95, 1].map((m) => trust.assets * m);
  const max = Math.max(...hist);
  const beneficiaries = data.heirs.filter((h) => trust.bens.includes(h.name.split(" ")[0]) || (trust.bens.includes("descendants") && h.gen === "Gen 3"));
  const tabs = [
    ["overview", "Overview"],
    ["beneficiaries", "Beneficiaries"],
    ["documents", "Documents"],
    ["activity", "Distributions"],
  ] as const;

  return (
    <>
      <button className="back" type="button" onClick={() => updateSession((s) => { s.trustId = null; })}>‹ All trusts</button>
      <div className="titlebar">
        <div>
          <h1>{trust.name}</h1>
          <p className="hint" style={{ margin: 0 }}>{trust.type} · {trust.state} · established {trust.est}</p>
        </div>
        <button
          className="btn btn-line sm"
          type="button"
          onClick={() => {
            updateSession((s) => {
              s.threadId = "michael";
              s.messageDraft = "I’d like to discuss a change to the " + trust.name + ".";
            });
            location.hash = "messages";
          }}
        >
          Request a change
        </button>
      </div>
      <div className="kv" style={{ margin: "20px 0" }}>
        <div><span>Assets</span><b>{shortMoney(trust.assets)}</b></div>
        <div><span>Trustee</span><b>{trust.trustee}</b></div>
        <div><span>Protector</span><b>{trust.protector}</b></div>
        <div><span>Beneficiaries</span><b style={{ fontSize: 15 }}>{trust.bens}</b></div>
      </div>
      <div className="tabs">
        {tabs.map((tab) => (
          <button key={tab[0]} type="button" className={session.trustTab === tab[0] ? "on" : ""} onClick={() => updateSession((s) => { s.trustTab = tab[0]; })}>{tab[1]}</button>
        ))}
      </div>
      {session.trustTab === "overview" ? (
        <div className="grid2">
          <div className="panel">
            <h2>Value over time</h2>
            <div className="spark">
              {hist.map((v, i) => (
                <div key={2021 + i}><i style={{ height: Math.round((v / max) * 120) + "px" }} /><span>{2021 + i}</span></div>
              ))}
            </div>
            <p className="hint" style={{ margin: "10px 0 0" }}>Year-end values; {shortMoney(trust.assets)} today.</p>
          </div>
          <div className="panel">
            <h2>Key terms</h2>
            <div className="sum"><span>Distribution standard</span><span>Health, education, support</span></div>
            <div className="sum"><span>Trust location</span><span>{trust.state}</span></div>
            <div className="sum"><span>Protector</span><span>{trust.protector}</span></div>
            <div className="sum"><span>Established</span><span>{trust.est}</span></div>
          </div>
        </div>
      ) : null}
      {session.trustTab === "beneficiaries" ? (
        <div className="panel">
          <DataTable
            head={["Name", "Generation", "Role"]}
            empty={trust.bens}
            rows={beneficiaries.map((h) => [
              <div className="person" key={h.name}><span className="avatar">{initials(h.name)}</span><b>{h.name}</b></div>,
              h.gen,
              h.role,
            ])}
          />
        </div>
      ) : null}
      {session.trustTab === "documents" ? (
        <div className="panel">
          <DataTable head={["Document", "Updated"]} empty="No documents for this trust yet." rows={data.docs.filter((d) => d.trust === trust.name).map((d) => [<b key={d.name}>{d.name}</b>, d.date])} />
        </div>
      ) : null}
      {session.trustTab === "activity" ? (
        <div className="panel">
          <DataTable head={["Beneficiary", "Purpose", "Amount", "Status"]} empty="No distributions from this trust." rows={data.dist.filter((d) => d.trust === trust.name).map(distCells)} />
        </div>
      ) : null}
    </>
  );
}

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function AddEntity() {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const name = String(form.get("name") || "").trim();
        const err = e.currentTarget.querySelector<HTMLElement>("#aeErr");
        if (!name) {
          if (err) err.textContent = "Name the trust or entity.";
          return;
        }
        const assets = parseAmount(String(form.get("assets") || "")) || 0;
        let over = false;
        updateData((d) => {
          d.trusts.push({
            id: "t" + Date.now(),
            name,
            type: String(form.get("type") || "Family LLC"),
            state: String(form.get("state") || "").trim() || "—",
            assets,
            trustee: "Manager-managed",
            protector: "—",
            est: "2026",
            bens: "To be confirmed",
          });
          d.tax.push({ trust: name, status: "Collecting data", k1: 0 });
          logAct(d, "You added " + name);
          over = d.trusts.length > 5;
        });
        closeSheet();
        toast(over ? "Added · $200 a month as an additional entity" : "Added");
      }}
    >
      <label htmlFor="aeN">Name</label>
      <input id="aeN" name="name" placeholder="Whitfield Real Estate LLC" />
      <label htmlFor="aeT">Type</label>
      <select id="aeT" name="type">
        {["Family LLC", "Dynasty trust", "Irrevocable trust", "Partnership", "Corporation"].map((t) => <option key={t}>{t}</option>)}
      </select>
      <label htmlFor="aeS">State</label>
      <input id="aeS" name="state" defaultValue="Florida" />
      <label htmlFor="aeA">Approximate value (USD)</label>
      <input id="aeA" name="assets" inputMode="numeric" placeholder="25,000,000" />
      <p className="note">Your plan includes 5 trusts and entities; each additional one is $200 a month.</p>
      <div className="err" id="aeErr" />
      <div className="sgbtns">
        <button className="btn btn-line sm" type="button" onClick={closeSheet}>Cancel</button>
        <button className="btn btn-dark sm" type="submit">Add</button>
      </div>
    </form>
  );
}
