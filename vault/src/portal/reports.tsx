import { logAct } from "../domain/demo";
import { money, shortMoney } from "../domain/format";
import { COST_COLORS, SERVICES, baseFee, planTotal } from "../domain/pricing";
import { updateData, useVault } from "../state/store";
import { Stat } from "../ui/bits";
import { toast } from "../ui/overlays";

export function Reports() {
  const data = useVault();
  const maxAssets = Math.max(...data.trusts.map((trust) => trust.assets));
  const paid: Record<string, number> = {};
  data.dist.forEach((row) => {
    if (row.status === "Paid" || row.status === "Approved") paid[row.who] = (paid[row.who] || 0) + row.amount;
  });
  const people = Object.keys(paid);
  const maxPaid = Math.max(1, ...people.map((name) => paid[name]));
  const lines = SERVICES.filter((svc) => data.active[svc.id] && svc.calc(data) > 0);
  const total = planTotal(data);
  const year = people.reduce((sum, name) => sum + paid[name], 0);

  return (
    <>
      <h1>Reports</h1>
      <p className="hint">A consolidated view of your family’s structure, distributions and costs.</p>
      <div className="stats">
        <Stat k="Assets administered" v={shortMoney(data.aua)} />
        <Stat k="Distributions this year" v={money(year)} />
        <Stat k="Annual plan cost" v={money(total * 12)} />
        <Stat k="Cost as share of assets" v={(total * 12 / data.aua * 10000).toFixed(1) + " bps"} />
      </div>
      <div className="grid2">
        <div className="panel">
          <h2>Assets by trust</h2>
          {data.trusts.map((trust) => (
            <div className="hbar" key={trust.id}>
              <span>{trust.name.replace("Whitfield ", "")}</span>
              <div className="bar"><i style={{ width: Math.round(trust.assets / maxAssets * 100) + "%" }} /></div>
              <b>{shortMoney(trust.assets)}</b>
            </div>
          ))}
        </div>
        <div className="panel">
          <h2>Distributions by beneficiary</h2>
          {people.length ? people.map((name) => (
            <div className="hbar" key={name}>
              <span>{name.split(" ")[0]}</span>
              <div className="bar"><i style={{ width: Math.round(paid[name] / maxPaid * 100) + "%", background: "var(--gold)" }} /></div>
              <b>{money(paid[name])}</b>
            </div>
          )) : <p className="empty">No distributions yet.</p>}
        </div>
      </div>
      <div className="panel">
        <h2>Where your plan cost goes</h2>
        <div className="stack">
          <i style={{ width: (baseFee(data) / total * 100).toFixed(1) + "%", background: "var(--forest)" }} title="Base fee" />
          {lines.map((svc, i) => (
            <i key={svc.id} style={{ width: (svc.calc(data) / total * 100).toFixed(1) + "%", background: COST_COLORS[i % 6] }} title={svc.name} />
          ))}
        </div>
        <div className="legend">
          <span><i style={{ background: "var(--forest)" }} />Base fee {money(baseFee(data))}</span>
          {lines.map((svc, i) => (
            <span key={svc.id}><i style={{ background: COST_COLORS[i % 6] }} />{svc.name} {money(svc.calc(data))}</span>
          ))}
        </div>
      </div>
      <div className="panel">
        <h2>Export</h2>
        <p className="hint" style={{ margin: "0 0 12px" }}>Request a quarterly report package for your advisors.</p>
        <button
          className="btn btn-dark sm"
          type="button"
          onClick={() => {
            updateData((d) => logAct(d, "You requested the Q4 report package"));
            toast("Report package requested. Sarah will send it within 2 business days.");
          }}
        >
          Request Q4 report package
        </button>
      </div>
    </>
  );
}
