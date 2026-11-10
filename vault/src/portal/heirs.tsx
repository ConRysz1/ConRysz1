import { useState } from "react";
import { logAct } from "../domain/demo";
import { initials } from "../domain/format";
import { eduSeats } from "../domain/pricing";
import { getData, updateData, useVault } from "../state/store";
import { DataTable, Tag } from "../ui/bits";
import { confirmBox, toast } from "../ui/overlays";

export function Heirs() {
  const data = useVault();
  const [error, setError] = useState("");

  return (
    <>
      <h1>Heirs &amp; access</h1>
      <p className="hint">Choose what each family member can see. Education access uses a next-generation seat ($150/mo).</p>
      <div className="panel">
        <DataTable
          head={["Name", "Generation", "Role", "Portal access"]}
          rows={data.heirs.map((heir, i) => [
            <div className="person" key={heir.name}><span className="avatar">{initials(heir.name)}</span><b>{heir.name}</b></div>,
            heir.gen,
            heir.role,
            i === 0 ? (
              <Tag>Full</Tag>
            ) : (
              <>
                <select
                  aria-label={"Access for " + heir.name}
                  style={{ margin: 0, padding: "8px 10px", width: "auto" }}
                  value={heir.access}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateData((d) => {
                      d.heirs[i].access = value;
                    });
                    toast("Access updated · next-generation seats: " + eduSeats(getData()));
                  }}
                >
                  {["Full", "Education", "None"].map((option) => <option key={option}>{option}</option>)}
                </select>{" "}
                <button
                  className="btn btn-line sm"
                  type="button"
                  aria-label="Remove"
                  onClick={() => {
                    confirmBox({
                      title: "Remove " + heir.name + "?",
                      body: "They’ll lose access to the portal. You can invite them again later.",
                      ok: "Remove access",
                      onOk: () => {
                        updateData((d) => {
                          const removed = d.heirs[i];
                          d.heirs.splice(i, 1);
                          if (removed) logAct(d, "You removed portal access for " + removed.name);
                        });
                        toast("Access removed");
                      },
                    });
                  }}
                >
                  Remove
                </button>
              </>
            ),
          ])}
        />
      </div>
      <form
        className="panel"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          const name = String(form.get("name") || "").trim();
          const email = String(form.get("email") || "").trim();
          if (!name) { setError("Enter their full name."); return; }
          if (email.indexOf("@") < 1) { setError("Enter a valid email address."); return; }
          const gen = String(form.get("gen") || "Gen 2");
          const access = String(form.get("access") || "Education");
          updateData((d) => {
            d.heirs.push({ name, gen, role: "Invited · beneficiary", access });
            logAct(d, "You invited " + name + " to Vault");
          });
          e.currentTarget.reset();
          setError("");
          toast("Invitation sent to " + email);
        }}
      >
        <h2>Invite a family member</h2>
        <div className="form3">
          <div>
            <label htmlFor="ivName">Full name</label>
            <input id="ivName" name="name" placeholder="Grace Whitfield" />
          </div>
          <div>
            <label htmlFor="ivEmail">Email</label>
            <input id="ivEmail" name="email" type="email" placeholder="grace@email.com" />
          </div>
          <div>
            <label htmlFor="ivGen">Relationship</label>
            <select id="ivGen" name="gen" defaultValue="Gen 2">
              <option value="Gen 2">Child or spouse (Gen 2)</option>
              <option value="Gen 3">Grandchild (Gen 3)</option>
              <option value="Gen 4">Great-grandchild (Gen 4)</option>
            </select>
          </div>
        </div>
        <label htmlFor="ivAccess">Access</label>
        <select id="ivAccess" name="access" defaultValue="Education">
          <option>Education</option>
          <option>Full</option>
        </select>
        <div className="err" role="alert">{error}</div>
        <button className="btn btn-dark sm" type="submit">Send invitation</button>
      </form>
    </>
  );
}
