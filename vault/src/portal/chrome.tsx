import { Fragment, useEffect, useMemo, useState } from "react";
import { notifRoute } from "../domain/attention";
import { dateOnly } from "../domain/calendar";
import { PORTAL_PAGES, TEAM } from "../domain/catalog";
import { shortMoney } from "../domain/format";
import { SERVICES } from "../domain/pricing";
import { signOut, updateData, updateSession, useVault } from "../state/store";
import { toast } from "../ui/overlays";

type Item = { group: string; title: string; sub: string; go: () => void };

export function openPaletteBus(query = "") {
  window.dispatchEvent(new CustomEvent("vault-palette", { detail: query }));
}

export function CommandPalette() {
  const data = useVault();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);

  useEffect(() => {
    const onOpen = (e: Event) => {
      setQuery(String((e as CustomEvent).detail ?? ""));
      setSel(0);
      setOpen(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => {
          if (!v) setQuery("");
          return !v;
        });
        setSel(0);
      }
    };
    window.addEventListener("vault-palette", onOpen);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("vault-palette", onOpen);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const items = useMemo(() => {
    const all: Item[] = [];
    PORTAL_PAGES.forEach((page) => {
      all.push({ group: "Pages", title: page.label, sub: "Go to page", go: () => { location.hash = page.id; } });
    });
    data.trusts.forEach((trust) => {
      all.push({
        group: "Trusts",
        title: trust.name,
        sub: trust.type + " · " + shortMoney(trust.assets),
        go: () => {
          updateSession((s) => { s.trustId = trust.id; });
          location.hash = "trusts";
        },
      });
    });
    data.docs.forEach((doc) => {
      all.push({
        group: "Documents",
        title: doc.name,
        sub: doc.trust,
        go: () => {
          updateSession((s) => { s.docQuery = doc.name; });
          location.hash = "documents";
        },
      });
    });
    data.heirs.forEach((heir) => {
      all.push({ group: "People", title: heir.name, sub: heir.role, go: () => { location.hash = "heirs"; } });
    });
    TEAM.forEach((person) => {
      all.push({
        group: "People",
        title: person.name,
        sub: "Vault · " + person.role,
        go: () => {
          updateSession((s) => { s.threadId = person.id; });
          location.hash = "messages";
        },
      });
    });
    SERVICES.forEach((svc) => {
      all.push({
        group: "Services",
        title: svc.name,
        sub: data.active[svc.id] ? "On your plan" : "Available",
        go: () => { location.hash = svc.module; },
      });
    });
    data.cal.forEach((event) => {
      all.push({
        group: "Calendar",
        title: event.item,
        sub: event.date,
        go: () => {
          const d = new Date(event.date);
          updateSession((s) => {
            s.calRef = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
            s.calSel = dateOnly(d).getTime();
          });
          location.hash = "calendar";
        },
      });
    });
    const q = query.trim().toLowerCase();
    const list = q
      ? all.filter((item) => (item.title + " " + item.sub).toLowerCase().includes(q)).slice(0, 30)
      : all.filter((item) => item.group === "Pages").slice(0, 10);
    return list;
  }, [data, query]);

  const active = Math.min(sel, Math.max(0, items.length - 1));

  function choose(index: number) {
    const item = items[index];
    setOpen(false);
    item?.go();
  }

  if (!open) return null;
  let group = "";
  return (
    <div className="pal-bg open" role="dialog" aria-modal="true" aria-label="Search" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div className="pal">
        <input
          autoFocus
          placeholder="Search pages, trusts, documents, people, services…"
          autoComplete="off"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSel(0); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setSel((n) => Math.min(n + 1, items.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setSel((n) => Math.max(n - 1, 0)); }
            else if (e.key === "Enter") { e.preventDefault(); choose(active); }
            else if (e.key === "Escape") setOpen(false);
          }}
        />
        <div id="palR" role="listbox">
          {items.length ? items.map((item, i) => {
            const showGroup = item.group !== group;
            group = item.group;
            return (
              <Fragment key={item.group + item.title + i}>
                {showGroup ? <div className="pal-g">{item.group}</div> : null}
                <button className={"pal-i" + (i === active ? " on" : "")} role="option" aria-selected={i === active} onClick={() => choose(i)}>
                  <b>{item.title}</b>
                  <span>{item.sub}</span>
                </button>
              </Fragment>
            );
          }) : <p className="empty" style={{ padding: 16 }}>No results for “{query}”.</p>}
        </div>
        <div className="pal-f">
          <span>↑↓ to move · Enter to open · Esc to close</span>
          <span>Ctrl K</span>
        </div>
      </div>
    </div>
  );
}

export function BellMenu() {
  const data = useVault();
  const [open, setOpen] = useState(false);
  const unread = data.notifs.filter((n) => !n.read).length;
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".bell")) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);
  return (
    <div className="bell profile-like">
      <button className="bell-btn" type="button" aria-haspopup="true" aria-expanded={open} aria-label="Notifications" onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unread ? <em>{unread}</em> : <em style={{ display: "none" }} />}
      </button>
      <div className={"menu" + (open ? " open" : "")}>
        <div className="head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <b>Notifications</b>
          <button
            type="button"
            style={{ width: "auto", padding: "4px 8px", fontSize: 13, color: "var(--gold)" }}
            onClick={(e) => {
              e.stopPropagation();
              updateData((d) => d.notifs.forEach((n) => { n.read = true; }));
            }}
          >
            Mark all read
          </button>
        </div>
        {data.notifs.slice(0, 8).map((note, i) => (
          <a
            key={note.t + i}
            className={"nt" + (note.read ? "" : " unread")}
            href={"#" + notifRoute(note.t)}
            onClick={() => updateData((d) => { if (d.notifs[i]) d.notifs[i].read = true; })}
          >
            <p>{note.t}</p>
            <span>{note.at}</span>
          </a>
        ))}
        <a className="nt-all" href="#activity">View all activity</a>
      </div>
    </div>
  );
}

export function ProfileMenu() {
  const data = useVault();
  const [open, setOpen] = useState(false);
  const letters = data.profile.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".profile")) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);
  return (
    <div className="profile">
      <button className="profile-btn" type="button" aria-haspopup="true" aria-expanded={open} aria-controls="profileMenu" onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}>
        <span className="avatar">{letters}</span>
        <span className="who">
          <b>{data.profile.name}</b>
          <span>{data.profile.role}</span>
        </span>
      </button>
      <div className={"menu" + (open ? " open" : "")} id="profileMenu" role="menu">
        <div className="head">
          <b>{data.profile.name}</b>
          <span>{data.profile.email}</span>
        </div>
        <a href="#account" role="menuitem">Profile &amp; settings</a>
        <a href="#billing" role="menuitem">Billing</a>
        <a href="#team" role="menuitem">Contact your team</a>
        <a href="#home" role="menuitem">Vault website</a>
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            location.hash = "home";
            signOut();
            toast("Signed out");
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
