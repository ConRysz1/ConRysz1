import { FEATURES, FEATURE_GROUPS } from "../domain/features";

function FeatureCard({ id }: { id: string }) {
  const feature = FEATURES.find((f) => f.id === id);
  if (!feature) return null;
  return (
    <a className="fcard" href={"#feature-" + feature.id}>
      <h3>{feature.name}</h3>
      <p>{feature.short}</p>
      <span className="fprice">{feature.price}</span>
      <span className="more">Learn more</span>
    </a>
  );
}

export function FeaturesPage() {
  return (
    <div className="view active">
      <section className="page-hero">
        <div className="wrap">
          <p className="crumbs">
            <a href="#home">Vault</a> / Features
          </p>
          <h1>Everything your family’s trusts need, in one place</h1>
          <p>Every Vault plan includes the platform and a dedicated team. Add fiduciary roles and family services as you need them.</p>
        </div>
      </section>
      {FEATURE_GROUPS.map((group, i) => (
        <section key={group.id} className={"fgroup" + (i % 2 ? " alt" : "")} style={{ paddingBottom: 56 }}>
          <div className="wrap">
            <h2>{group.name}</h2>
            <p>{group.blurb}</p>
            <div className="fgrid">
              {FEATURES.filter((f) => f.g === group.id).map((f) => (
                <FeatureCard key={f.id} id={f.id} />
              ))}
            </div>
          </div>
        </section>
      ))}
      <section className="block">
        <div className="wrap">
          <div className="cta-band">
            <h2>Not sure what your family needs?</h2>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
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

export function FeatureDetail({ id }: { id: string }) {
  const index = FEATURES.findIndex((f) => f.id === id);
  const feature = FEATURES[index];
  if (!feature) return null;
  const group = FEATURE_GROUPS.find((g) => g.id === feature.g);
  const related = feature.rel.map((rid) => FEATURES.find((f) => f.id === rid)).filter((f) => !!f);
  const prev = FEATURES[(index - 1 + FEATURES.length) % FEATURES.length];
  const next = FEATURES[(index + 1) % FEATURES.length];
  const cta =
    feature.g === "platform"
      ? "Included in every Vault plan at 4 to 6 basis points a year."
      : feature.g === "partners"
        ? "Billed to the partner firm, never to the family."
        : "Add it to your plan at any time from the client portal.";

  return (
    <div className="view active">
      <section className="page-hero">
        <div className="wrap">
          <p className="crumbs">
            <a href="#home">Vault</a> / <a href="#features">Features</a> / {group?.name}
          </p>
          <h1>{feature.name}</h1>
          <p>{feature.short}</p>
          <div className="hero-meta">
            <span className="price-chip">{feature.price}</span>
            <a className="btn btn-gold" href={"mailto:hello@vault.example?subject=" + encodeURIComponent(feature.name)}>
              Talk to us
            </a>
            <a className="btn btn-ghost" href="#login">
              See it in the demo
            </a>
          </div>
        </div>
      </section>
      <section className="fsec">
        <div className="wrap ov">
          <div>
            <h2>Overview</h2>
            <p className="lead">{feature.over}</p>
            <div className="for">
              <b>Who it’s for:</b> {feature.who}
            </div>
          </div>
          <div className="pv" aria-label="Product preview">
            <div className="pv-bar">
              <i />
              <i />
              <i />
              <span>Vault · {feature.pv.title}</span>
            </div>
            <div className="pv-body">
              {feature.pv.rows.map((row) => (
                <div className="pv-row" key={row[0]}>
                  <span>{row[0]}</span>
                  <b>{row[1]}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="fsec alt">
        <div className="wrap">
          <h2>Why families choose it</h2>
          <div className="ben">
            {feature.ben.map((item) => (
              <div key={item[0]}>
                <h3>{item[0]}</h3>
                <p>{item[1]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="fsec">
        <div className="wrap cols2b">
          <div>
            <h2>What’s included</h2>
            <ul className="inc">
              {feature.inc.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2>How it works</h2>
            <ol className="steps">
              {feature.how.map((item) => (
                <li key={item}>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
            {feature.note ? <p className="note">{feature.note}</p> : null}
          </div>
        </div>
      </section>
      <section className="fsec alt">
        <div className="wrap cols2b">
          <div className="price-card">
            <span className="pk">Pricing</span>
            <div className="big">{feature.price}</div>
            <p>{feature.ex}</p>
            <p className="note" style={{ margin: 0 }}>
              {cta}
            </p>
          </div>
          <div>
            <h2>Questions</h2>
            {feature.faq.map((item) => (
              <details className="faq" key={item[0]}>
                <summary>{item[0]}</summary>
                <p>{item[1]}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section className="fsec">
        <div className="wrap">
          <h2>Related features</h2>
          <div className="related">
            {related.map((item) => (
              <FeatureCard key={item.id} id={item.id} />
            ))}
          </div>
          <div className="pn">
            <a href={"#feature-" + prev.id}>‹ {prev.name}</a>
            <a href="#features">All features</a>
            <a href={"#feature-" + next.id}>{next.name} ›</a>
          </div>
        </div>
      </section>
    </div>
  );
}
