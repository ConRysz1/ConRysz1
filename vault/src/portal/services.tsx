import { money, shortMoney } from "../domain/format";
import { SERVICE_CATS, SERVICES, addOnTotal, baseFee, planTotal, tierBps } from "../domain/pricing";
import { useVault } from "../state/store";
import { Stat, Tag } from "../ui/bits";
import { askAddService, askRemoveService } from "./plan";

export function Services() {
  const data = useVault();
  const activeCount = SERVICES.filter((svc) => data.active[svc.id]).length;
  return (
    <>
      <h1>Services</h1>
      <p className="hint">Your base fee covers administration on Vault. Add services as your family needs them; changes show up on your next bill.</p>
      <div className="stats" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <Stat k="Base fee" v={money(baseFee(data))} d={tierBps(data.aua) + " bps on " + shortMoney(data.aua)} />
        <Stat k="Active services" v={money(addOnTotal(data))} d={activeCount + " of " + SERVICES.length + " services"} />
        <Stat k="Monthly total" v={money(planTotal(data))} />
      </div>
      {SERVICE_CATS.map((cat) => (
        <div key={cat}>
          <h2 className="cat">{cat}</h2>
          <div className="grid3">
            {SERVICES.filter((svc) => svc.cat === cat).map((svc) => {
              const on = data.active[svc.id];
              const amount = money(svc.calc(data));
              return (
                <div className={"svc" + (on ? " active" : "")} key={svc.id}>
                  <div className="top"><h3>{svc.name}</h3>{on ? <Tag>Active</Tag> : <Tag>Available</Tag>}</div>
                  <p>{svc.desc}</p>
                  <div className="price">{svc.price}</div>
                  <div className="use">
                    {svc.use(data)}
                    <br />
                    <b>{on ? amount + " / month" : "Would add " + amount + " / month"}</b>
                  </div>
                  <div className="act">
                    {on ? (
                      <>
                        <a className="btn btn-dark sm" href={"#" + svc.module}>Open</a>
                        <button className="btn btn-line sm" type="button" onClick={() => askRemoveService(svc.id)}>Remove</button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-dark sm" type="button" onClick={() => askAddService(svc.id)}>Add service</button>
                        <a className="btn btn-line sm" href={"#" + svc.module}>Preview</a>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <h2 className="cat">For your advisors and one-time work</h2>
      <div className="grid3">
        <div className="svc">
          <div className="top"><h3>Partner seats</h3><Tag>Billed to firm</Tag></div>
          <p>Logins for your advisor and CPA, at $650 and $450 a month per seat, paid by their firms.</p>
          <div className="use">{data.advisors.length} advisors connected</div>
          <div className="act"><a className="btn btn-dark sm" href="#team">Manage seats</a></div>
        </div>
        <div className="svc">
          <div className="top"><h3>Projects</h3><Tag>{data.projects.length + " active"}</Tag></div>
          <p>Onboarding, restructuring, estate settlement and drafting, priced per project.</p>
          <div className="use">{data.projects[0] ? data.projects[0].name : "No projects yet"}</div>
          <div className="act"><a className="btn btn-dark sm" href="#projects">Open</a></div>
        </div>
      </div>
    </>
  );
}
