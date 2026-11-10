import { money, shortMoney } from "../domain/format";
import { SERVICES, baseFee, planTotal, tierBps } from "../domain/pricing";
import { useVault } from "../state/store";
import { DataTable, Tag } from "../ui/bits";
import { openSheet, toast } from "../ui/overlays";

const INVOICES: [string, number | "current", string][] = [
  ["Nov 1, 2026", "current", "Due Nov 15"],
  ["Oct 1, 2026", 83850, "Paid"],
  ["Sep 1, 2026", 83850, "Paid"],
  ["Aug 1, 2026", 81900, "Paid"],
];

export function Billing() {
  const data = useVault();
  const lines = SERVICES.filter((svc) => data.active[svc.id] && svc.calc(data) > 0);
  const total = planTotal(data);
  return (
    <>
      <h1>Billing</h1>
      <p className="hint">Billed monthly. Your base rate is set by total family assets and reviewed each quarter.</p>
      <div className="grid2">
        <div className="panel">
          <h2>Current plan</h2>
          <div className="sum"><span>Base fee · {tierBps(data.aua)} bps on {shortMoney(data.aua)}</span><span>{money(baseFee(data))}</span></div>
          {lines.map((svc) => (
            <div className="sum" key={svc.id}><span>{svc.name}</span><span>{money(svc.calc(data))}</span></div>
          ))}
          <div className="sum total"><span>Monthly total</span><span>{money(total)}</span></div>
          <p style={{ color: "var(--ink-2)", fontSize: 14, margin: "8px 0 0" }}>
            About {money(total * 12)} a year · <a href="#services" style={{ color: "var(--gold)" }}>Change services</a>
          </p>
        </div>
        <div className="panel">
          <h2>Payment</h2>
          <div className="sum"><span>Method</span><span>ACH · account ending 4417</span></div>
          <div className="sum"><span>Billing contact</span><span>{data.profile.email}</span></div>
          <div className="sum"><span>Statements</span><span>{data.prefs.delivery}</span></div>
          <button className="btn btn-line sm" type="button" style={{ marginTop: 14 }} onClick={() => toast("Payment updates are disabled in the demo")}>Update payment method</button>
        </div>
      </div>
      <div className="panel">
        <h2>Invoices</h2>
        <DataTable
          head={["Date", "Amount", "Status", ""]}
          rows={INVOICES.map((row) => {
            const amount = row[1] === "current" ? total : row[1];
            const status = row[2] === "Paid" ? "Paid" : row[2];
            return [
              <b key={row[0]}>{row[0]}</b>,
              money(amount),
              <Tag>{status}</Tag>,
              <button key={row[0] + "v"} className="btn btn-line sm" type="button" onClick={() => openInvoice(row[0])}>View</button>,
            ];
          })}
        />
      </div>
    </>
  );
}

function openInvoice(date: string) {
  openSheet("Invoice · " + date, <InvoiceBody />);
}

function InvoiceBody() {
  const data = useVault();
  const lines = SERVICES.filter((svc) => data.active[svc.id] && svc.calc(data) > 0);
  return (
    <>
      <div className="sum"><span>Base fee · {tierBps(data.aua)} bps on {shortMoney(data.aua)}</span><span>{money(baseFee(data))}</span></div>
      {lines.map((svc) => (
        <div className="sum" key={svc.id}><span>{svc.name}</span><span>{money(svc.calc(data))}</span></div>
      ))}
      <div className="sum total"><span>Total</span><span>{money(planTotal(data))}</span></div>
      <p className="hint" style={{ margin: "12px 0 0" }}>Paid by ACH from the account ending 4417.</p>
    </>
  );
}
