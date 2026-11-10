import { useEffect, useRef, useState, type PointerEvent } from "react";
import { DEMO_CODE } from "../domain/catalog";
import { logAct } from "../domain/demo";
import { longDate, phoneLast4, sigId, signedStamp } from "../domain/format";
import type { VaultDoc } from "../domain/types";
import { getData, updateData, useVault } from "../state/store";
import { closeSheet, openSheet, toast } from "../ui/overlays";

const STEPS = ["Review", "Signature", "Verify"];

function docBody(doc: VaultDoc) {
  if (/minutes/i.test(doc.name)) {
    return (
      <>
        <h4>Minutes of the Third-Quarter Meeting of the Trustees</h4>
        <p className="mut">Whitfield Dynasty Trust · October 15, 2026 · held by video conference</p>
        <p>
          <b>Present:</b> Vault (corporate trustee), James Whitfield (successor trustee), Eleanor Whitfield (grantor), Michael Grant, J.D. (trust counsel).
        </p>
        <p>
          <b>1. Review of distributions.</b> The trustees reviewed and ratified the distribution of $250,000 to Claire Whitfield for a home purchase, consistent with the trust’s standard of health, education and support.
        </p>
        <p>
          <b>2. Investment report.</b> Morgan Lee of Harbor Wealth Partners presented third-quarter performance. No changes to the investment policy were adopted.
        </p>
        <p>
          <b>3. Annual meeting.</b> The trustees scheduled the annual family meeting and trustee review for December 15, 2026.
        </p>
        <p>There being no further business, the meeting was adjourned.</p>
      </>
    );
  }
  return (
    <>
      <h4>{doc.name}</h4>
      <p className="mut">
        {doc.trust} · prepared {doc.date}
      </p>
      <p>
        I, the undersigned grantor, acknowledge that the gifts listed in Schedule A were made to the trust during the 2026 calendar year and that I have been advised by counsel regarding the annual gift tax exclusion and any gift tax return filing requirements.
      </p>
      <p>
        <b>Schedule A.</b> Annual exclusion gifts to the Whitfield Dynasty Trust for the benefit of Claire, James and Olivia Whitfield and their descendants.
      </p>
      <p>I understand that this acknowledgment will be kept with the trust’s records and shared with the family’s CPA for tax reporting.</p>
    </>
  );
}

export function startSign(index: number) {
  const doc = getData().docs[index];
  if (!doc || doc.signed !== false) return;
  openSheet("Sign: " + doc.name, <SignFlow index={index} />, true);
}

export function SignatureBlock({ doc }: { doc: VaultDoc }) {
  if (!doc.sig) return null;
  return (
    <div className="sigbox">
      <div className="sigline">
        {doc.sig.img ? <img src={doc.sig.img} alt={"Signature of " + doc.sig.by} style={{ maxHeight: 70, maxWidth: "100%" }} /> : <span className="script">{doc.sig.typed}</span>}
      </div>
      <p>
        <b>{doc.sig.by}</b> · signed {doc.sig.at}
      </p>
      <p className="mut">Signature ID {doc.sig.id} · verified by text message</p>
    </div>
  );
}

export function SignFlow({ index }: { index: number }) {
  const data = useVault();
  const doc = data.docs[index];
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<"type" | "draw">("type");
  const [typed, setTyped] = useState(data.profile.name);
  const [img, setImg] = useState<string | null>(null);
  const [reviewed, setReviewed] = useState(false);
  const [consent, setConsent] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  if (!doc) return null;

  if (step === 4 && doc.sig) {
    return (
      <>
        <div className="signed-ok">
          <div className="okmark" aria-hidden="true">✓</div>
          <h3>Document signed</h3>
          <p className="mut">A signed copy is saved to your documents and shared with your trustee.</p>
        </div>
        <SignatureBlock doc={doc} />
        <div className="sum"><span>Document</span><span>{doc.name}</span></div>
        <div className="sum"><span>Signer</span><span>{doc.sig.by}</span></div>
        <div className="sum"><span>Signed</span><span>{doc.sig.at}</span></div>
        <div className="sum"><span>Method</span><span>{doc.sig.img ? "Drawn signature" : "Typed signature"} · text message verification</span></div>
        <div className="sum"><span>Signature ID</span><span>{doc.sig.id}</span></div>
        <div className="sgbtns">
          <button className="btn btn-line sm" type="button" onClick={() => { closeSheet(); location.hash = "documents"; }}>Go to documents</button>
          <button className="btn btn-dark sm" type="button" onClick={() => { closeSheet(); toast("Signed and saved"); }}>Done</button>
        </div>
      </>
    );
  }

  return (
    <>
      <ol className="stepper">
        {STEPS.map((label, i) => (
          <li key={label} className={step > i + 1 ? "done" : step === i + 1 ? "on" : undefined}>
            <span>{i + 1}</span>
            {label}
          </li>
        ))}
      </ol>
      {step === 1 ? (
        <>
          <div className="paper">
            {docBody(doc)}
            <div className="sigline empty"><span>Signature</span></div>
            <p className="mut">{data.profile.name}, {data.profile.role}</p>
          </div>
          <label className="chk">
            <input type="checkbox" checked={reviewed} onChange={(e) => setReviewed(e.target.checked)} /> I have read and reviewed this document
          </label>
          <div className="sgbtns">
            <button className="btn btn-line sm" type="button" onClick={closeSheet}>Cancel</button>
            <button className="btn btn-dark sm" type="button" disabled={!reviewed} onClick={() => setStep(2)}>Continue to signature</button>
          </div>
        </>
      ) : null}
      {step === 2 ? (
        <>
          <p className="hint" style={{ margin: "0 0 14px" }}>Adopt the signature that will appear on this document.</p>
          <div className="seg" style={{ marginBottom: 14 }}>
            <button type="button" className={mode === "type" ? "on" : ""} onClick={() => setMode("type")}>Type</button>
            <button type="button" className={mode === "draw" ? "on" : ""} onClick={() => setMode("draw")}>Draw</button>
          </div>
          {mode === "type" ? (
            <>
              <label htmlFor="sgName">Full legal name</label>
              <input id="sgName" value={typed} onChange={(e) => setTyped(e.target.value)} />
              <div className="sigprev"><span className="script">{typed || " "}</span></div>
            </>
          ) : (
            <DrawPad img={img} onChange={setImg} />
          )}
          <div className="err" role="alert">{error}</div>
          <div className="sgbtns">
            <button className="btn btn-line sm" type="button" onClick={() => setStep(1)}>Back</button>
            <button
              className="btn btn-dark sm"
              type="button"
              onClick={() => {
                if (mode === "type" && !typed.trim()) { setError("Type your full legal name."); return; }
                if (mode === "draw" && !img) { setError("Draw your signature in the box."); return; }
                setError("");
                setStep(3);
              }}
            >
              Adopt and continue
            </button>
          </div>
        </>
      ) : null}
      {step === 3 ? (
        <>
          <div className="sigprev small">
            {mode === "draw" && img ? <img src={img} alt="Your signature" style={{ maxHeight: 70 }} /> : <span className="script">{typed}</span>}
          </div>
          <label className="chk" style={{ alignItems: "flex-start" }}>
            <input type="checkbox" checked={consent} style={{ marginTop: 4 }} onChange={(e) => setConsent(e.target.checked)} /> I agree to sign electronically. My electronic signature is the legal equivalent of my handwritten signature on this document.
          </label>
          <label htmlFor="sgCode" style={{ marginTop: 12 }}>Verification code</label>
          <p className="mut" style={{ margin: "0 0 8px" }}>
            We sent a 6-digit code to the phone ending {phoneLast4(data.profile.phone)}. <b>Demo code: {DEMO_CODE}</b>
          </p>
          <input
            id="sgCode"
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            placeholder="••••••"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          />
          <button className="linkbtn" type="button" onClick={() => toast("New code sent. Demo code: " + DEMO_CODE)}>Resend code</button>
          <div className="err" role="alert">{error}</div>
          <div className="sgbtns">
            <button className="btn btn-line sm" type="button" onClick={() => setStep(2)}>Back</button>
            <button
              className="btn sm act-sign"
              type="button"
              onClick={() => {
                if (!consent) { setError("Agree to sign electronically to continue."); return; }
                if (code !== DEMO_CODE) { setError("That code doesn’t match. Enter the 6-digit code we sent."); return; }
                const now = new Date();
                updateData((d) => {
                  const target = d.docs[index];
                  if (!target) return;
                  target.signed = true;
                  target.sig = {
                    by: d.profile.name,
                    at: signedStamp(now),
                    typed: mode === "type" ? typed.trim() : "",
                    img: mode === "draw" ? img : null,
                    id: sigId(),
                  };
                  target.date = longDate(now);
                  d.tasks = d.tasks.filter((t) => t.doc !== target.name);
                  logAct(d, "You signed " + target.name);
                });
                setStep(4);
              }}
            >
              Sign document
            </button>
          </div>
        </>
      ) : null}
    </>
  );
}

function DrawPad({ img, onChange }: { img: string | null; onChange: (value: string | null) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const pad = ref.current;
    if (!pad) return;
    pad.width = pad.clientWidth || 440;
    const ctx = pad.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#14241f";
    if (img) {
      const image = new Image();
      image.onload = () => ctx.drawImage(image, 0, 0, pad.width, pad.height);
      image.src = img;
      wrap.current?.classList.add("inked");
    }
  }, [img]);

  function point(e: PointerEvent<HTMLCanvasElement>) {
    const pad = ref.current!;
    const rect = pad.getBoundingClientRect();
    return [(e.clientX - rect.left) * pad.width / rect.width, (e.clientY - rect.top) * pad.height / rect.height];
  }

  return (
    <>
      <div className={"padwrap" + (img ? " inked" : "")} ref={wrap}>
        <canvas
          ref={ref}
          height={170}
          aria-label="Draw your signature with a mouse or finger"
          onPointerDown={(e) => {
            const pad = ref.current;
            const ctx = pad?.getContext("2d");
            if (!pad || !ctx) return;
            drawing.current = true;
            pad.setPointerCapture(e.pointerId);
            const p = point(e);
            ctx.beginPath();
            ctx.moveTo(p[0], p[1]);
            wrap.current?.classList.add("inked");
            e.preventDefault();
          }}
          onPointerMove={(e) => {
            if (!drawing.current) return;
            const ctx = ref.current?.getContext("2d");
            if (!ctx) return;
            const p = point(e);
            ctx.lineTo(p[0], p[1]);
            ctx.stroke();
          }}
          onPointerUp={() => {
            if (!drawing.current) return;
            drawing.current = false;
            onChange(ref.current?.toDataURL("image/png") ?? null);
          }}
          onPointerCancel={() => {
            if (drawing.current) {
              drawing.current = false;
              onChange(ref.current?.toDataURL("image/png") ?? null);
            }
          }}
        />
        <span className="padhint">Sign here with your mouse or finger</span>
      </div>
      <button
        className="btn btn-line sm"
        type="button"
        style={{ marginTop: 10 }}
        onClick={() => {
          const pad = ref.current;
          const ctx = pad?.getContext("2d");
          if (pad && ctx) ctx.clearRect(0, 0, pad.width, pad.height);
          wrap.current?.classList.remove("inked");
          onChange(null);
        }}
      >
        Clear
      </button>
    </>
  );
}
