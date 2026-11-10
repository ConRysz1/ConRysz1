import rows from "./comparison.html?raw";

export function ComparisonTable() {
  return (
    <div className="table-scroll cmp-wrap">
      <table className="cmp">
        <colgroup>
          <col style={{ width: "56%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "20%" }} />
        </colgroup>
        <thead>
          <tr>
            <th>Service</th>
            <th className="c">Essential</th>
            <th className="c">Custom</th>
            <th className="num">Price</th>
          </tr>
        </thead>
        <tbody dangerouslySetInnerHTML={{ __html: rows }} />
      </table>
    </div>
  );
}
