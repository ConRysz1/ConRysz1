import { useState } from "react";
import { initials } from "../domain/format";
import type { NotifyPrefs, SecurityPrefs, ThemePref } from "../domain/types";
import { resetDemo, updateData, updateSession, useSession, useVault } from "../state/store";
import { DataTable, Toggle } from "../ui/bits";
import { confirmBox, toast } from "../ui/overlays";

const TABS = [
  ["profile", "Profile"],
  ["notifications", "Notifications"],
  ["security", "Security"],
  ["preferences", "Preferences"],
] as const;

const NOTIFY: { key: keyof NotifyPrefs; title: string; sub: string }[] = [
  { key: "dist", title: "Distribution updates", sub: "When a request is approved, paid or needs information" },
  { key: "deadlines", title: "Deadline reminders", sub: "Seven days before notices, filings and payments" },
  { key: "statement", title: "Monthly statement", sub: "When your statement and invoice are ready" },
  { key: "docs", title: "New documents", sub: "When your team uploads a document" },
  { key: "sms", title: "Text alerts", sub: "Urgent items by text message" },
];

const SECURITY: { key: keyof SecurityPrefs; title: string; sub: string }[] = [
  { key: "twofa", title: "Two-step verification", sub: "Require a code from your phone at every sign-in" },
  { key: "alerts", title: "Sign-in alerts", sub: "Email me when my account is used on a new device" },
];

export function Settings() {
  const data = useVault();
  const session = useSession();
  return (
    <>
      <h1>Settings</h1>
      <p className="hint">Manage your profile, notifications and security.</p>
      <div className="tabs" role="tablist">
        {TABS.map((tab) => (
          <button key={tab[0]} type="button" role="tab" aria-selected={session.settingsTab === tab[0]} className={session.settingsTab === tab[0] ? "on" : ""} onClick={() => updateSession((s) => { s.settingsTab = tab[0]; })}>
            {tab[1]}
          </button>
        ))}
      </div>
      {session.settingsTab === "profile" ? <ProfileForm /> : null}
      {session.settingsTab === "notifications" ? (
        <div className="panel">
          {NOTIFY.map((item) => (
            <Toggle
              key={item.key}
              title={item.title}
              sub={item.sub}
              checked={data.notify[item.key]}
              onChange={(checked) => {
                updateData((d) => { d.notify[item.key] = checked; });
                toast("Saved");
              }}
            />
          ))}
        </div>
      ) : null}
      {session.settingsTab === "security" ? (
        <>
          <div className="panel">
            {SECURITY.map((item) => (
              <Toggle
                key={item.key}
                title={item.title}
                sub={item.sub}
                checked={data.security[item.key]}
                onChange={(checked) => {
                  updateData((d) => { d.security[item.key] = checked; });
                  toast("Saved");
                }}
              />
            ))}
          </div>
          <div className="panel">
            <h2>Active sessions</h2>
            <DataTable
              head={["Device", "Location", "Last active"]}
              rows={[
                [<b key="b">This browser</b>, "Palm Beach, FL", "Now"],
                [<b key="p">iPhone · Vault app</b>, "Palm Beach, FL", "Yesterday"],
              ]}
            />
            <button className="btn btn-line sm" type="button" style={{ marginTop: 12 }} onClick={() => toast("Signed out of other sessions")}>Sign out of other sessions</button>
          </div>
          <div className="panel">
            <h2>Password</h2>
            <p style={{ color: "var(--ink-2)", margin: "0 0 12px" }}>Last changed 3 months ago.</p>
            <button className="btn btn-line sm" type="button" onClick={() => toast("Password changes are disabled in the demo")}>Change password</button>
          </div>
        </>
      ) : null}
      {session.settingsTab === "preferences" ? (
        <div className="panel">
          <div className="form2">
            <div>
              <label htmlFor="pTheme">Appearance</label>
              <select
                id="pTheme"
                value={data.prefs.theme}
                onChange={(e) => {
                  const theme = e.target.value as ThemePref;
                  updateData((d) => {
                    d.prefs.theme = theme;
                    d.prefs.themeSet = true;
                  });
                  toast("Appearance updated");
                }}
              >
                <option value="system">Match my device</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div>
              <label htmlFor="pDel">Statement delivery</label>
              <select
                id="pDel"
                value={data.prefs.delivery}
                onChange={(e) => {
                  const delivery = e.target.value;
                  updateData((d) => { d.prefs.delivery = delivery; });
                  toast("Statement delivery updated");
                }}
              >
                {["Portal and email", "Portal only", "Mailed paper copy"].map((option) => <option key={option}>{option}</option>)}
              </select>
            </div>
          </div>
          <button
            className="btn btn-line sm"
            type="button"
            onClick={() => confirmBox({
              title: "Reset the demo?",
              body: "This restores the original demo family, services and requests.",
              ok: "Reset demo",
              onOk: () => {
                resetDemo();
                toast("Demo reset");
              },
            })}
          >
            Reset demo data
          </button>
        </div>
      ) : null}
    </>
  );
}

function ProfileForm() {
  const data = useVault();
  const [error, setError] = useState("");
  return (
    <form
      className="panel"
      noValidate
      key={data.profile.name + data.profile.email + data.profile.phone + data.profile.address}
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const name = String(form.get("name") || "").trim();
        const email = String(form.get("email") || "").trim();
        if (!name) { setError("Enter your full name."); return; }
        if (email.indexOf("@") < 1) { setError("Enter a valid email address."); return; }
        updateData((d) => {
          d.profile.name = name;
          d.profile.email = email;
          d.profile.phone = String(form.get("phone") || "").trim();
          d.profile.address = String(form.get("address") || "").trim();
        });
        setError("");
        toast("Changes saved");
      }}
    >
      <div className="person" style={{ marginBottom: 20 }}>
        <span className="avatar lg">{initials(data.profile.name)}</span>
        <p><b style={{ fontSize: 20 }}>{data.profile.name}</b><br /><span>{data.profile.role} · Whitfield Family</span></p>
      </div>
      <div className="form2">
        <div>
          <label htmlFor="fName">Full name</label>
          <input id="fName" name="name" defaultValue={data.profile.name} />
        </div>
        <div>
          <label htmlFor="fEmail">Email</label>
          <input id="fEmail" name="email" type="email" defaultValue={data.profile.email} />
        </div>
        <div>
          <label htmlFor="fPhone">Phone</label>
          <input id="fPhone" name="phone" defaultValue={data.profile.phone} />
        </div>
        <div>
          <label htmlFor="fAddr">Mailing address</label>
          <input id="fAddr" name="address" defaultValue={data.profile.address} />
        </div>
      </div>
      <div className="err" role="alert">{error}</div>
      <button className="btn btn-dark" type="submit">Save changes</button>
    </form>
  );
}
