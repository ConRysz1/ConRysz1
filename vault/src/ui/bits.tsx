import type { ReactNode } from "react";
import { tagClass } from "../domain/format";

export function Tag({ children }: { children: string }) {
  return <span className={"tag " + tagClass(children)}>{children}</span>;
}

export function Stat({ k, v, d }: { k: string; v: ReactNode; d?: ReactNode }) {
  return (
    <div className="stat">
      <div className="k">{k}</div>
      <div className="v">{v}</div>
      {d ? <div className="d">{d}</div> : null}
    </div>
  );
}

export function DataTable({
  head,
  rows,
  empty = "Nothing here yet.",
  onRow,
}: {
  head: string[];
  rows: ReactNode[][];
  empty?: string;
  onRow?: (index: number) => void;
}) {
  if (!rows.length) return <p className="empty">{empty}</p>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="list">
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i} className={/Assets|Amount|Monthly/.test(h) ? "num" : undefined}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={onRow ? "click" : undefined}
              tabIndex={onRow ? 0 : undefined}
              onClick={onRow ? () => onRow(i) : undefined}
              onKeyDown={
                onRow
                  ? (e) => {
                      if (e.key === "Enter") onRow(i);
                    }
                  : undefined
              }
            >
              {row.map((cell, j) => (
                <td key={j} className={/Assets|Amount|Monthly/.test(head[j] ?? "") ? "num" : undefined}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Toggle({
  title,
  sub,
  checked,
  onChange,
  id,
}: {
  title: string;
  sub: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}) {
  return (
    <div className="toggle">
      <p>
        {title}
        <span>{sub}</span>
      </p>
      <label className="switch">
        <input id={id} type="checkbox" checked={checked} aria-label={title} onChange={(e) => onChange(e.target.checked)} />
        <span />
      </label>
    </div>
  );
}

export function Steps({ list, at }: { list: string[]; at: number }) {
  return (
    <div className="psteps">
      {list.map((step, i) => (
        <span key={step} className={i < at ? "done" : i === at ? "on" : undefined}>
          {step}
        </span>
      ))}
    </div>
  );
}

export function Avatar({ name, color, large }: { name: string; color?: string; large?: boolean }) {
  const letters = name
    .split(" ")
    .map((p) => p[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
  if (color) {
    return (
      <span className={"tm-av" + (large ? " lg" : "")} style={{ background: color }}>
        {letters}
      </span>
    );
  }
  return <span className="avatar">{letters}</span>;
}
