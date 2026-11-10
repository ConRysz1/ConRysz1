import { useRef, useState } from "react";
import { CATS, dateOnly, fmtD, occurrences, relLabel, sameDay, todayDate, type Occurrence } from "../domain/calendar";
import type { CalCat, CalEvent } from "../domain/types";
import { logAct } from "../domain/demo";
import { formatTimeInput, inputDate } from "../domain/format";
import { getData, updateData, updateSession, useSession, useVault } from "../state/store";
import { Stat, Tag } from "../ui/bits";
import { closeSheet, openSheet, toast } from "../ui/overlays";

export function CalendarPage() {
  const data = useVault();
  const session = useSession();
  const titleRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ title: "", date: "", time: "", cat: "personal" as CalCat, trust: data.trusts[0]?.name ?? "All trusts", repeat: "none", notes: "", error: "" });
  const today = todayDate();
  const ref = new Date(session.calRef);
  const sel = session.calSel ? new Date(session.calSel) : null;
  const monthStart = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const monthEnd = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
  const monthEvents = occurrences(data.cal, monthStart, monthEnd, session.calFilters);
  const yours = data.cal.filter((e) => e.owner === "You" && !e.done);
  const overdue = yours.filter((e) => dateOnly(new Date(e.date)) < today).length;
  const upcoming = occurrences(data.cal, today, new Date(today.getFullYear(), today.getMonth(), today.getDate() + 45), session.calFilters).filter((o) => !o.event.done).slice(0, 7);

  function focusForm(dt: Date) {
    setForm((f) => ({ ...f, date: inputDate(dt), error: "" }));
    queueMicrotask(() => {
      titleRef.current?.focus();
      titleRef.current?.scrollIntoView({ block: "center" });
    });
  }

  let head = "";
  let body = null;
  if (session.calView === "month") {
    const start = new Date(monthStart);
    start.setDate(1 - monthStart.getDay());
    const end = new Date(monthEnd);
    end.setDate(monthEnd.getDate() + (6 - monthEnd.getDay()));
    const list = occurrences(data.cal, start, end, session.calFilters);
    head = fmtD(monthStart, { month: "long", year: "numeric" });
    const cells = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      const day = new Date(cursor);
      const ev = list.filter((o) => sameDay(o.date, day));
      const cls = (day.getMonth() !== ref.getMonth() ? " out" : "") + (sameDay(day, today) ? " today" : "") + (sel && sameDay(day, sel) ? " sel" : "");
      cells.push(
        <div
          key={day.getTime()}
          className={"mc" + cls}
          tabIndex={0}
          role="button"
          aria-label={fmtD(day, { weekday: "long", month: "long", day: "numeric" }) + ", " + ev.length + " events"}
          onClick={() => updateSession((s) => { s.calSel = day.getTime(); })}
          onKeyDown={(e) => { if (e.key === "Enter") updateSession((s) => { s.calSel = day.getTime(); }); }}
        >
          <span className="dn">{day.getDate()}</span>
          {ev.slice(0, 3).map((o) => <EventChip key={o.event.id + o.date.getTime()} o={o} />)}
          {ev.length > 3 ? <em className="more">+{ev.length - 3} more</em> : null}
        </div>,
      );
      cursor.setDate(cursor.getDate() + 1);
    }
    body = (
      <div className="mgrid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => <div className="mw" key={w}>{w}</div>)}
        {cells}
      </div>
    );
  } else if (session.calView === "week") {
    const ws = new Date(ref);
    ws.setDate(ref.getDate() - ref.getDay());
    const we = new Date(ws);
    we.setDate(ws.getDate() + 6);
    const list = occurrences(data.cal, ws, we, session.calFilters);
    head = fmtD(ws, { month: "short", day: "numeric" }) + " – " + fmtD(we, { month: "short", day: "numeric", year: "numeric" });
    body = (
      <div className="wgrid">
        {Array.from({ length: 7 }, (_, i) => {
          const day = new Date(ws);
          day.setDate(ws.getDate() + i);
          const ev = list.filter((o) => sameDay(o.date, day));
          return (
            <div key={day.getTime()} className={"wc" + (sameDay(day, today) ? " today" : "")}>
              <div className="wh"><span>{fmtD(day, { weekday: "short" })}</span><b>{day.getDate()}</b></div>
              {ev.length ? ev.map((o) => <EventChip key={o.event.id + o.date.getTime()} o={o} full />) : <p className="wempty">—</p>}
            </div>
          );
        })}
      </div>
    );
  } else {
    const end = new Date(ref);
    end.setDate(end.getDate() + 120);
    const list = occurrences(data.cal, ref, end, session.calFilters);
    head = "Next 120 days from " + fmtD(ref, { month: "short", day: "numeric" });
    const groups = new Map<string, Occurrence[]>();
    list.forEach((o) => {
      const key = fmtD(o.date, { month: "long", year: "numeric" });
      groups.set(key, [...(groups.get(key) ?? []), o]);
    });
    body = groups.size ? (
      Array.from(groups.entries()).map(([key, rows]) => (
        <div key={key}>
          <h3 className="agh">{key}</h3>
          {rows.map((o) => <AgendaRow key={o.event.id + o.date.getTime()} o={o} />)}
        </div>
      ))
    ) : <p className="empty">Nothing scheduled in this range.</p>;
  }

  const trustOptions = data.trusts.map((t) => t.name).concat(["All trusts", "Family governance"]);

  return (
    <>
      <div className="titlebar">
        <div>
          <h1>Calendar</h1>
          <p className="hint" style={{ margin: 0 }}>Every notice, payment, filing and meeting across your family’s trusts.</p>
        </div>
        <button className="btn btn-dark sm" type="button" onClick={() => focusForm(sel ?? today)}>New event</button>
      </div>
      <div className="calstats">
        <Stat k="This month" v={String(monthEvents.length)} d="events across all trusts" />
        <Stat k="Needs your action" v={String(yours.length)} d={overdue ? overdue + " overdue" : "Nothing overdue"} />
        <Stat k="Next up" v={upcoming[0] ? fmtD(upcoming[0].date, { month: "short", day: "numeric" }) : "—"} d={upcoming[0]?.event.item ?? ""} />
      </div>
      <div className="calwrap">
        <div>
          <div className="calbar">
            <div className="navs">
              <button className="btn btn-line sm" type="button" aria-label="Previous" onClick={() => shift(-1)}>‹</button>
              <button className="btn btn-line sm" type="button" onClick={() => updateSession((s) => { s.calRef = today.getTime(); s.calSel = today.getTime(); })}>Today</button>
              <button className="btn btn-line sm" type="button" aria-label="Next" onClick={() => shift(1)}>›</button>
              <b>{head}</b>
            </div>
            <div className="seg">
              {([["month", "Month"], ["week", "Week"], ["agenda", "Agenda"]] as const).map((view) => (
                <button key={view[0]} type="button" className={session.calView === view[0] ? "on" : ""} onClick={() => updateSession((s) => { s.calView = view[0]; })}>{view[1]}</button>
              ))}
            </div>
          </div>
          <div className="panel calpanel">{body}</div>
          {sel ? (
            <div className="panel">
              <h2>
                {fmtD(sel, { weekday: "long", month: "long", day: "numeric" })}
                <a href="#calendar" onClick={(e) => { e.preventDefault(); focusForm(sel); }}>Add event</a>
              </h2>
              {occurrences(data.cal, sel, sel, session.calFilters).length ? (
                occurrences(data.cal, sel, sel, session.calFilters).map((o) => <AgendaRow key={o.event.id + o.date.getTime()} o={o} compact />)
              ) : (
                <p className="empty">Nothing scheduled. <a href="#calendar" style={{ color: "var(--gold)" }} onClick={(e) => { e.preventDefault(); focusForm(sel); }}>Add an event</a></p>
              )}
            </div>
          ) : null}
        </div>
        <aside>
          <div className="panel">
            <h2>Upcoming</h2>
            {upcoming.length ? upcoming.map((o) => (
              <button key={o.event.id + o.date.getTime()} className="upi" type="button" onClick={() => openEvent(o)}>
                <span className="upd" style={{ borderColor: CATS[o.event.cat].c }}><b>{o.date.getDate()}</b>{fmtD(o.date, { month: "short" })}</span>
                <span className="agi"><b>{o.event.item}</b><span>{relLabel(o.date)}{o.event.owner === "You" ? " · your action" : ""}</span></span>
              </button>
            )) : <p className="empty">Nothing in the next 45 days.</p>}
          </div>
          <div className="panel">
            <h2>Show</h2>
            {(Object.keys(CATS) as CalCat[]).map((k) => (
              <label className="chk" key={k}>
                <input type="checkbox" checked={session.calFilters[k]} onChange={(e) => updateSession((s) => { s.calFilters[k] = e.target.checked; })} />
                <i className="sw" style={{ background: CATS[k].c }} />
                {CATS[k].n}
              </label>
            ))}
          </div>
          <form
            className="panel"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.title.trim()) { setForm((f) => ({ ...f, error: "Describe the event." })); return; }
              if (!form.date) { setForm((f) => ({ ...f, error: "Choose a date." })); return; }
              const [y, m, d] = form.date.split("-").map(Number);
              const date = new Date(y, m - 1, d);
              const title = form.title.trim();
              updateData((s) => {
                s.cal.push({
                  id: "u" + Date.now(),
                  date: fmtD(date),
                  time: formatTimeInput(form.time),
                  item: title,
                  trust: form.trust,
                  owner: "You",
                  cat: form.cat,
                  notes: form.notes.trim(),
                  repeat: form.repeat as CalEvent["repeat"],
                  done: false,
                  user: true,
                });
                logAct(s, "You added “" + title + "” to the calendar");
              });
              updateSession((s) => {
                s.calRef = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
                s.calSel = date.getTime();
              });
              setForm({ title: "", date: "", time: "", cat: "personal", trust: form.trust, repeat: "none", notes: "", error: "" });
              toast("Event added");
            }}
          >
            <h2>New event</h2>
            <label htmlFor="ceTitle">What</label>
            <input id="ceTitle" ref={titleRef} placeholder="Call with Morgan Lee" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            <div className="form2">
              <div>
                <label htmlFor="ceDate">Date</label>
                <input id="ceDate" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label htmlFor="ceTime">Time</label>
                <input id="ceTime" type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
              </div>
            </div>
            <label htmlFor="ceCat">Type</label>
            <select id="ceCat" value={form.cat} onChange={(e) => setForm((f) => ({ ...f, cat: e.target.value as CalCat }))}>
              {(Object.keys(CATS) as CalCat[]).map((k) => <option key={k} value={k}>{CATS[k].n}</option>)}
            </select>
            <label htmlFor="ceTrust">Trust</label>
            <select id="ceTrust" value={form.trust} onChange={(e) => setForm((f) => ({ ...f, trust: e.target.value }))}>
              {trustOptions.map((t) => <option key={t}>{t}</option>)}
            </select>
            <label htmlFor="ceRep">Repeats</label>
            <select id="ceRep" value={form.repeat} onChange={(e) => setForm((f) => ({ ...f, repeat: e.target.value }))}>
              <option value="none">Does not repeat</option>
              <option value="monthly">Monthly</option>
              <option value="annual">Every year</option>
            </select>
            <label htmlFor="ceNotes">Notes</label>
            <input id="ceNotes" placeholder="Optional" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            <div className="err" role="alert">{form.error}</div>
            <button className="btn btn-dark sm" type="submit" style={{ width: "100%" }}>Add to calendar</button>
          </form>
        </aside>
      </div>
    </>
  );

  function shift(n: number) {
    updateSession((s) => {
      const r = new Date(s.calRef);
      if (s.calView === "month") r.setMonth(r.getMonth() + n, 1);
      else if (s.calView === "week") r.setDate(r.getDate() + 7 * n);
      else r.setDate(r.getDate() + 30 * n);
      s.calRef = r.getTime();
    });
  }
}

function EventChip({ o, full }: { o: Occurrence; full?: boolean }) {
  const cat = CATS[o.event.cat];
  return (
    <button
      type="button"
      className={"evc" + (o.event.done ? " done" : "") + (o.event.owner === "You" && !o.event.done ? " you" : "")}
      style={{ ["--c" as string]: cat.c }}
      onClick={(e) => { e.stopPropagation(); openEvent(o); }}
    >
      {full && o.event.time ? <b>{o.event.time}</b> : null}{full && o.event.time ? " " : ""}{o.event.item}
    </button>
  );
}

function AgendaRow({ o, compact }: { o: Occurrence; compact?: boolean }) {
  const cat = CATS[o.event.cat];
  if (compact) {
    return (
      <button type="button" className={"agr" + (o.event.done ? " done" : "")} onClick={() => openEvent(o)}>
        <span className="bar-c" style={{ background: cat.c }} />
        <span className="agi"><b>{o.event.item}</b><span>{o.event.time ? o.event.time + " · " : ""}{o.event.trust}</span></span>
        <span className="agrel">{o.event.owner}</span>
      </button>
    );
  }
  return (
    <button type="button" className={"agr" + (o.event.done ? " done" : "")} onClick={() => openEvent(o)}>
      <span className="agd"><b>{o.date.getDate()}</b>{fmtD(o.date, { weekday: "short" })}</span>
      <span className="bar-c" style={{ background: cat.c }} />
      <span className="agi"><b>{o.event.item}</b><span>{o.event.time ? o.event.time + " · " : ""}{o.event.trust} · {o.event.owner}</span></span>
      <span className="agrel">{relLabel(o.date)}</span>
    </button>
  );
}

function openEvent(o: Occurrence) {
  const event = getData().cal.find((e) => e.id === o.event.id);
  if (!event) return;
  openSheet(event.item, <EventSheet id={event.id} when={o.date.getTime()} />);
}

function EventSheet({ id, when }: { id: string; when: number }) {
  const data = useVault();
  const event = data.cal.find((e) => e.id === id);
  if (!event) return null;
  const cat = CATS[event.cat];
  const date = new Date(when);
  return (
    <>
      <p style={{ margin: "-8px 0 16px" }}>
        <span className="tag" style={{ background: cat.c + "22", color: cat.c }}>{cat.n}</span>{" "}
        {event.done ? <Tag>Done</Tag> : event.owner === "You" ? <Tag>You</Tag> : null}
      </p>
      <div className="sum"><span>Date</span><span>{fmtD(date, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span></div>
      <div className="sum"><span>Time</span><span>{event.time || "All day"}</span></div>
      <div className="sum"><span>Trust</span><span>{event.trust}</span></div>
      <div className="sum"><span>Responsible</span><span>{event.owner}</span></div>
      <div className="sum"><span>Repeats</span><span>{event.repeat === "monthly" ? "Monthly" : event.repeat === "annual" ? "Every year" : "No"}</span></div>
      <div className="sum"><span>When</span><span>{relLabel(date)}</span></div>
      {event.notes ? <><h4 style={{ margin: "18px 0 6px" }}>Notes</h4><p style={{ margin: 0, color: "var(--ink-2)" }}>{event.notes}</p></> : null}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 }}>
        {event.owner === "You" && !event.done ? (
          <button
            className="btn btn-dark sm"
            type="button"
            onClick={() => {
              updateData((d) => {
                const ev = d.cal.find((e) => e.id === id);
                if (!ev) return;
                ev.done = true;
                if (ev.item === "Confirm Crummey notice recipients") d.tasks = d.tasks.filter((t) => t.id !== "k3");
                logAct(d, "You completed: " + ev.item);
              });
              closeSheet();
              toast("Marked done");
            }}
          >
            Mark done
          </button>
        ) : null}
        <button className="btn btn-line sm" type="button" onClick={() => toast("Added to your calendar (demo)")}>Add to my calendar</button>
        <button
          className="btn btn-line sm"
          type="button"
          onClick={() => {
            closeSheet();
            updateSession((s) => {
              s.threadId = "sarah";
              s.messageDraft = "Question about “" + event.item + "” on " + fmtD(date, { month: "short", day: "numeric" }) + ": ";
            });
            location.hash = "messages";
          }}
        >
          Ask my team
        </button>
        {event.user ? (
          <button
            className="btn btn-line sm"
            type="button"
            onClick={() => {
              updateData((d) => {
                const ev = d.cal.find((e) => e.id === id);
                d.cal = d.cal.filter((e) => e.id !== id);
                if (ev) logAct(d, "You deleted “" + ev.item + "”");
              });
              closeSheet();
              toast("Event deleted");
            }}
          >
            Delete
          </button>
        ) : null}
      </div>
    </>
  );
}
