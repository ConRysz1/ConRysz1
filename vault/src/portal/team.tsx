import { useState } from "react";
import { ACCESS_FIELDS, ADVISOR_COLORS, TEAM } from "../domain/catalog";
import { fmtD, nextWeekdays, todayDate } from "../domain/calendar";
import { logAct } from "../domain/demo";
import { todayLabel } from "../domain/format";
import type { AdvisorAccess } from "../domain/types";
import { updateData, updateSession, useVault } from "../state/store";
import { Avatar, Toggle } from "../ui/bits";
import { closeSheet, confirmBox, openSheet, toast } from "../ui/overlays";

export function Team() {
  const data = useVault();
  const lead = TEAM[0];
  const rest = TEAM.slice(1);
  const next = data.cal
    .filter((event) => event.cat === "meeting" && !event.done && new Date(event.date) >= todayDate())
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))[0];

  return (
    <>
      <div className="titlebar">
        <div>
          <h1>Your team</h1>
          <p className="hint" style={{ margin: 0 }}>The people who look after your family at Vault, and the advisors you’ve connected.</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-line sm" type="button" onClick={() => openSheet("Connect an advisor", <ConnectAdvisor />)}>Connect an advisor</button>
          <a className="btn btn-dark sm" href="#messages">Open messages</a>
        </div>
      </div>
      <div className="tm-grid">
        <div>
          <div className="lead-card">
            <Avatar name={lead.name} color={lead.color} large />
            <div className="lead-main">
              <span className="lead-k">Your relationship lead</span>
              <h2>{lead.name}</h2>
              <p>Your first call for anything. Sarah coordinates your whole Vault team and knows your family’s plan end to end.</p>
              <div className="lead-meta">
                <span><i className="st on" />{lead.status}</span>
                <span>Replies {lead.reply}</span>
                <span>{lead.phone}</span>
              </div>
              <div className="lead-btns">
                <button className="btn btn-gold sm" type="button" onClick={() => message(lead.id)}>Message Sarah</button>
                <button className="btn btn-ghost sm" type="button" onClick={() => book(lead.id)}>Schedule a call</button>
              </div>
            </div>
          </div>
          <div className="panel">
            <h2>Specialists</h2>
            {rest.map((person) => (
              <div className="tm-row" key={person.id}>
                <Avatar name={person.name} color={person.color} />
                <div className="tm-info">
                  <b>{person.name}</b>
                  <span>{person.role} · <i className={"st" + (person.status === "Available" ? " on" : "")} />{person.status}</span>
                  <div className="tm-chips">{person.about.map((item) => <em key={item}>{item}</em>)}</div>
                </div>
                <div className="tm-act">
                  <button className="btn btn-line sm" type="button" onClick={() => book(person.id)}>Schedule</button>
                  <button className="btn btn-dark sm" type="button" onClick={() => message(person.id)}>Message</button>
                </div>
              </div>
            ))}
          </div>
          <div className="panel">
            <h2>Connected advisors <span className="mut" style={{ fontWeight: 400 }}>Billed to their firms, not your family</span></h2>
            {data.advisors.length ? data.advisors.map((advisor, i) => {
              const on = ACCESS_FIELDS.filter((field) => advisor.access[field.key]).map((field) => field.label);
              return (
                <div className="tm-row" key={advisor.id}>
                  <Avatar name={advisor.name} color={ADVISOR_COLORS[i % 4]} />
                  <div className="tm-info">
                    <b>{advisor.name}</b>
                    <span>{advisor.type} · {advisor.firm}</span>
                    <div className="tm-chips">{on.length ? on.map((label) => <em className="acc" key={label}>{label}</em>) : <em>No access</em>}</div>
                  </div>
                  <div className="tm-act">
                    <button className="btn btn-line sm" type="button" onClick={() => openSheet(advisor.name, <AdvisorAccessSheet id={advisor.id} />)}>Manage access</button>
                  </div>
                </div>
              );
            }) : <p className="empty">No advisors connected yet.</p>}
          </div>
        </div>
        <aside>
          <div className="panel">
            <h2>How to reach us</h2>
            <div className="sum"><span>Messages</span><span>Within 4 business hours</span></div>
            <div className="sum"><span>Phone</span><span>Weekdays, 8 AM – 6 PM ET</span></div>
            <div className="sum"><span>Urgent matters</span><span>(561) 555-0100, any time</span></div>
            <div className="sum"><span>Office</span><span>[Office address]</span></div>
          </div>
          <div className="panel">
            <h2>If something isn’t right</h2>
            <ol className="tl">
              <li className="done"><b>Your relationship lead</b><span>Sarah resolves most issues the same day.</span></li>
              <li className="done"><b>Head of client service</b><span>Steps in if a matter needs more attention.</span></li>
              <li className="done"><b>Chief Trust Officer</b><span>Reviews any concern about a trustee decision.</span></li>
            </ol>
          </div>
          <div className="panel">
            <h2>Next meeting</h2>
            {next ? (
              <>
                <p style={{ margin: 0 }}><b>{next.item}</b><br /><span className="mut">{next.date}{next.time ? " · " + next.time : ""}</span></p>
                <a href="#calendar" className="btn btn-line sm" style={{ marginTop: 12 }}>Open calendar</a>
              </>
            ) : <p className="empty">No meetings scheduled.</p>}
          </div>
        </aside>
      </div>
    </>
  );
}

function message(id: string) {
  updateSession((s) => { s.threadId = id; });
  location.hash = "messages";
}

function book(id: string) {
  const person = TEAM.find((item) => item.id === id);
  if (!person) return;
  openSheet("Schedule a call with " + person.name.split(",")[0], <BookCall id={person.id} />);
}

function BookCall({ id }: { id: string }) {
  const person = TEAM.find((item) => item.id === id)!;
  const days = nextWeekdays(5);
  const slots = ["9:30 AM", "11:00 AM", "1:00 PM", "3:30 PM"];
  const [pick, setPick] = useState("");
  const [error, setError] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!pick) { setError("Choose a time."); return; }
        const form = new FormData(e.currentTarget);
        const [stamp, time] = pick.split("|");
        const date = new Date(Number(stamp));
        const mode = String(form.get("mode") || "Video call");
        const topic = String(form.get("topic") || "").trim();
        const who = person.name.split(",")[0];
        updateData((d) => {
          d.cal.push({
            id: "b" + Date.now(),
            date: fmtD(date),
            time,
            item: mode + " with " + who,
            trust: "All trusts",
            owner: "You",
            cat: "meeting",
            notes: topic,
            repeat: "none",
            done: false,
            user: true,
          });
          const thread = d.threads.find((item) => item.id === person.id);
          thread?.msgs.push({
            from: "them",
            text: "Looking forward to our call on " + fmtD(date, { weekday: "long", month: "short", day: "numeric" }) + " at " + time + ". I’ll send a calendar invite.",
            at: todayLabel(),
          });
          logAct(d, "You booked a call with " + who + " for " + fmtD(date, { month: "short", day: "numeric" }));
        });
        closeSheet();
        toast("Call booked for " + fmtD(date, { month: "short", day: "numeric" }) + " at " + time);
      }}
    >
      <p className="hint" style={{ margin: "0 0 14px" }}>{person.role} · 30-minute video or phone call</p>
      {days.map((day, di) => (
        <div className="slotday" key={day.getTime()}>
          <b>{fmtD(day, { weekday: "long", month: "short", day: "numeric" })}</b>
          <div className="slots">
            {slots.map((slot, si) => {
              const busy = (di + si) % 5 === 3;
              const value = day.getTime() + "|" + slot;
              return (
                <button key={slot} className={"slot" + (pick === value ? " on" : "")} type="button" disabled={busy} onClick={() => setPick(value)}>
                  {slot}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <label htmlFor="bkTopic" style={{ marginTop: 14 }}>What would you like to discuss?</label>
      <input id="bkTopic" name="topic" placeholder="Optional" />
      <label htmlFor="bkMode">How</label>
      <select id="bkMode" name="mode">
        <option>Video call</option>
        <option>Phone call</option>
        <option>In person</option>
      </select>
      <div className="err" role="alert">{error}</div>
      <div className="sgbtns">
        <button className="btn btn-line sm" type="button" onClick={closeSheet}>Cancel</button>
        <button className="btn btn-dark sm" type="submit">Book call</button>
      </div>
    </form>
  );
}

function AdvisorAccessSheet({ id }: { id: string }) {
  const data = useVault();
  const advisor = data.advisors.find((item) => item.id === id);
  if (!advisor) return null;
  return (
    <>
      <p className="hint" style={{ margin: "0 0 6px" }}>{advisor.type} · {advisor.firm}</p>
      <p className="mut" style={{ margin: "0 0 16px" }}>{advisor.email} · {advisor.seat}, billed to {advisor.firm}</p>
      <h4 style={{ margin: "0 0 4px" }}>What they can see</h4>
      {ACCESS_FIELDS.map((field) => (
        <Toggle
          key={field.key}
          title={field.label}
          sub={field.hint}
          checked={advisor.access[field.key]}
          onChange={(checked) => updateData((d) => {
            const current = d.advisors.find((item) => item.id === id);
            if (current) current.access[field.key] = checked;
          })}
        />
      ))}
      <div className="sgbtns" style={{ justifyContent: "space-between" }}>
        <button
          className="btn btn-line sm"
          type="button"
          onClick={() => {
            closeSheet();
            confirmBox({
              title: "Disconnect " + advisor.name + "?",
              body: "They’ll lose access to your family’s information on Vault. Their firm’s seat is unaffected.",
              ok: "Disconnect",
              onOk: () => {
                updateData((d) => {
                  d.advisors = d.advisors.filter((item) => item.id !== id);
                  logAct(d, "You disconnected " + advisor.name);
                });
                toast("Advisor disconnected");
              },
            });
          }}
        >
          Disconnect
        </button>
        <button
          className="btn btn-dark sm"
          type="button"
          onClick={() => {
            updateData((d) => logAct(d, "You updated access for " + advisor.name));
            closeSheet();
            toast("Access updated");
          }}
        >
          Save access
        </button>
      </div>
    </>
  );
}

function ConnectAdvisor() {
  const [error, setError] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const name = String(form.get("name") || "").trim();
        const firm = String(form.get("firm") || "").trim();
        const email = String(form.get("email") || "").trim();
        const type = String(form.get("type") || "Investment advisor");
        if (!name) { setError("Enter their full name."); return; }
        if (!firm) { setError("Enter their firm."); return; }
        if (email.indexOf("@") < 1) { setError("Enter a valid email address."); return; }
        const access: AdvisorAccess = { documents: true, calendar: true, distributions: false, tax: type === "CPA" };
        updateData((d) => {
          d.advisors.push({
            id: "a" + Date.now(),
            name,
            firm,
            type,
            seat: type === "CPA" ? "CPA seat" : "Advisor seat",
            email,
            access,
          });
          logAct(d, "You invited " + name + " (" + firm + ")");
        });
        closeSheet();
        toast("Invitation sent to " + email);
      }}
    >
      <p className="hint" style={{ margin: "0 0 14px" }}>Invite an investment advisor, CPA or attorney. Their firm pays for their seat; you choose what they can see.</p>
      <label htmlFor="cnName">Full name</label>
      <input id="cnName" name="name" />
      <label htmlFor="cnFirm">Firm</label>
      <input id="cnFirm" name="firm" />
      <label htmlFor="cnEmail">Email</label>
      <input id="cnEmail" name="email" type="email" />
      <label htmlFor="cnType">Role</label>
      <select id="cnType" name="type">
        <option>Investment advisor</option>
        <option>CPA</option>
        <option>Estate attorney</option>
        <option>Insurance advisor</option>
      </select>
      <div className="err" role="alert">{error}</div>
      <div className="sgbtns">
        <button className="btn btn-line sm" type="button" onClick={closeSheet}>Cancel</button>
        <button className="btn btn-dark sm" type="submit">Send invitation</button>
      </div>
    </form>
  );
}
