import { ACTIVITY_FILTERS, activityType } from "../domain/attention";
import { updateSession, useSession, useVault } from "../state/store";

export function Activity() {
  const data = useVault();
  const session = useSession();
  const query = session.activityQuery.toLowerCase();
  const list = data.activity.filter((item) => (session.activityFilter === "All" || activityType(item.t) === session.activityFilter) && (!query || item.t.toLowerCase().includes(query)));
  return (
    <>
      <h1>Activity</h1>
      <p className="hint">Everything that has happened across your family’s account.</p>
      <div className="toolbar">
        <input type="search" placeholder="Search activity" value={session.activityQuery} aria-label="Search activity" onChange={(e) => updateSession((s) => { s.activityQuery = e.target.value; })} />
      </div>
      <div className="tabs">
        {ACTIVITY_FILTERS.map((filter) => (
          <button key={filter} type="button" className={filter === session.activityFilter ? "on" : ""} onClick={() => updateSession((s) => { s.activityFilter = filter; })}>{filter}</button>
        ))}
      </div>
      <div className="panel">
        {list.length ? list.map((item, i) => (
          <div className="act" key={item.t + item.at + i}><i /><p>{item.t}<span>{item.at} · {activityType(item.t)}</span></p></div>
        )) : <p className="empty">No activity matches.</p>}
      </div>
    </>
  );
}
