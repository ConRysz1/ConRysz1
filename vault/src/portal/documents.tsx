import { logAct } from "../domain/demo";
import { fileSizeLabel, longDate } from "../domain/format";
import { updateData, updateSession, useSession, useVault } from "../state/store";
import { DataTable, Tag } from "../ui/bits";
import { closeSheet, openSheet, toast } from "../ui/overlays";
import { SignatureBlock, startSign } from "./sign";

export function Documents() {
  const data = useVault();
  const session = useSession();
  const kinds = ["All", ...data.docs.map((d) => d.kind).filter((k, i, a) => a.indexOf(k) === i)];
  const q = session.docQuery.toLowerCase();
  const list = data.docs
    .map((d, i) => ({ d, i }))
    .filter((x) => (session.docFilter === "All" || x.d.kind === session.docFilter) && (!q || (x.d.name + " " + x.d.trust).toLowerCase().includes(q)))
    .sort((a, b) => (session.docSort === "name" ? a.d.name.localeCompare(b.d.name) : +new Date(b.d.date) - +new Date(a.d.date)));
  const toSign = data.docs.filter((d) => d.signed === false).length;

  return (
    <>
      <div className="titlebar">
        <div>
          <h1>Documents</h1>
          <p className="hint" style={{ margin: 0 }}>Instruments, minutes, tax packets and appraisals, shared with the people who need them.</p>
        </div>
        <label className="btn btn-dark sm" htmlFor="fileUp" style={{ margin: 0 }}>Upload documents</label>
        <input
          id="fileUp"
          type="file"
          multiple
          hidden
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            if (!files.length) return;
            updateData((d) => {
              files.forEach((f) => {
                d.docs.unshift({
                  name: f.name,
                  trust: "Unassigned",
                  date: longDate(),
                  kind: "Uploaded",
                  signed: null,
                  shared: [d.profile.name],
                  size: fileSizeLabel(f.size),
                });
              });
              logAct(d, "You uploaded " + files.length + " document" + (files.length > 1 ? "s" : ""));
            });
            toast(files.length + " document" + (files.length > 1 ? "s" : "") + " uploaded");
          }}
        />
      </div>
      {toSign ? <div className="banner">{toSign} document{toSign > 1 ? "s need" : " needs"} your signature.</div> : null}
      <div className="toolbar">
        <input type="search" placeholder="Search documents" aria-label="Search documents" value={session.docQuery} onChange={(e) => updateSession((s) => { s.docQuery = e.target.value; })} />
        <select aria-label="Sort documents" value={session.docSort} onChange={(e) => updateSession((s) => { s.docSort = e.target.value as "new" | "name"; })}>
          <option value="new">Newest first</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>
      <div className="tabs" role="tablist">
        {kinds.map((k) => (
          <button key={k} type="button" className={k === session.docFilter ? "on" : ""} onClick={() => updateSession((s) => { s.docFilter = k; })}>{k}</button>
        ))}
      </div>
      <div className="panel">
        <DataTable
          head={["Document", "Trust", "Type", "Updated", "Status", ""]}
          empty="No documents match your search."
          rows={list.map(({ d, i }) => [
            <><b>{d.name}</b><br /><span style={{ color: "var(--ink-2)", fontSize: 13 }}>{d.size}</span></>,
            d.trust,
            <Tag>{d.kind}</Tag>,
            d.date,
            d.signed === false ? <Tag>Pending signature</Tag> : d.signed === true ? <Tag>Signed</Tag> : "—",
            <>
              {d.signed === false ? <button className="btn sm act-sign" type="button" onClick={() => startSign(i)}>Sign</button> : null}{" "}
              <button className="btn btn-line sm" type="button" onClick={() => openSheet(d.name, <DocSheet index={i} />)}>Open</button>
            </>,
          ])}
        />
      </div>
    </>
  );
}

function DocSheet({ index }: { index: number }) {
  const data = useVault();
  const doc = data.docs[index];
  if (!doc) return null;
  const people = data.heirs.filter((h) => h.access === "Full").map((h) => h.name).concat(["Morgan Lee (advisor)", "Daniel Ortiz, CPA"]);
  const trusts = data.trusts.map((t) => t.name).concat(["All trusts", "Family governance", "Unassigned"]);
  return (
    <>
      <div className="docprev"><div className="pg"><i /><i /><i style={{ width: "70%" }} /><i /><i style={{ width: "55%" }} /></div></div>
      <div className="sum"><span>Type</span><span><Tag>{doc.kind}</Tag></span></div>
      <div className="sum"><span>Updated</span><span>{doc.date}</span></div>
      <div className="sum"><span>Size</span><span>{doc.size}</span></div>
      <SignatureBlock doc={doc} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const trust = (form.elements.namedItem("trust") as HTMLSelectElement).value;
          const shared = Array.from(form.querySelectorAll<HTMLInputElement>("[data-share]:checked")).map((c) => c.value);
          updateData((d) => {
            const target = d.docs[index];
            if (!target) return;
            target.trust = trust;
            target.shared = shared;
          });
          closeSheet();
          toast("Document updated");
        }}
      >
        <label htmlFor="dTrustSel" style={{ marginTop: 14 }}>Trust</label>
        <select id="dTrustSel" name="trust" defaultValue={doc.trust}>
          {trusts.map((t) => <option key={t}>{t}</option>)}
        </select>
        <h4 style={{ margin: "4px 0 8px" }}>Shared with</h4>
        {people.map((person) => (
          <label className="chk" key={person}>
            <input type="checkbox" data-share value={person} defaultChecked={doc.shared.includes(person)} /> {person}
          </label>
        ))}
        <div className="row-b" style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
          {doc.signed === false ? <button className="btn sm act-sign" type="button" onClick={() => { closeSheet(); startSign(index); }}>Sign document</button> : null}
          <button className="btn btn-dark sm" type="submit">Save</button>
          <button className="btn btn-line sm" type="button" onClick={() => toast("Downloads are disabled in the demo")}>Download</button>
        </div>
      </form>
    </>
  );
}
