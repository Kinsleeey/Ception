import { roomColumns } from "../data/dashboardData.js";

// A reusable "data card": a titled grey panel containing a table of
// room-type figures plus a monthly-target progress bar underneath.
// Both the Revenue and Occupancy sections use this same component —
// that's the benefit of building one flexible piece and reusing it.
//
// Props (the inputs this component accepts):
//   title    -> heading shown above the card ("Revenue")
//   rows     -> array of row objects from dashboardData.js
//   percent  -> how full the progress bar is (0–100)
export default function DataCard({ title, rows, percent }) {
  return (
    <section>
      <h3 className="section-title">{title}</h3>
      <div className="data-card">
        <table className="table">
          <thead>
            <tr>
              {/* empty top-left corner cell above the period names */}
              <th></th>
              {roomColumns.map((col) => (
                <th key={col} className={col === "Total" ? "is-total" : ""}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.period}>
                <td>{row.period}</td>
                <td>{row.executive}</td>
                <td>{row.premium}</td>
                <td>{row.standard}</td>
                <td className="is-total">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </section>
  );
}
