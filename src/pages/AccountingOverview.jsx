import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import ColumnInfoModal from "../components/ColumnInfoModal.jsx";
import AddExpenseModal from "../components/AddExpenseModal.jsx";
import AddCategoryModal from "../components/AddCategoryModal.jsx";
import MoneyMovementModal from "../components/MoneyMovementModal.jsx";
import { GridIcon, PlusIcon, InfoIcon } from "../components/icons.jsx";
import { toRows, toYTD, COLUMN_INFO } from "../data/accountingData.js";
import { getAccountingOverview, getAccountingOverviewDaily } from "../api.js";

// The table is wide (22 columns) and scrolls horizontally inside its card. The
// Month column is sticky so you never lose your place while scrolling right.
//
// Column groups are tinted: Sales blue-ish, Cash In green-ish, Cash Out
// red-ish, everything else lilac — so the eye can find a group without reading.

function naira(n) {
  if (n === null || n === undefined) return "—";
  return "₦" + Number(n).toLocaleString();
}
// Net is signed and coloured: green when the till grew, red when it shrank.
function signedNaira(n) {
  const v = Number(n || 0);
  const sign = v > 0 ? "+" : v < 0 ? "−" : "";
  return "₦" + sign + Math.abs(v).toLocaleString();
}

// Month name to its number, for the daily fetch.
const MONTH_INDEX = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
};

export default function AccountingOverview() {
  const navigate = useNavigate();

  // The year on show. The figures come from the API; the derived columns
  // (totals, profit, net) are computed by derive() so this page, its YTD row
  // and its summary always agree.
  const [year, setYear] = useState(new Date().getFullYear());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await getAccountingOverview(year);
      setRows(toRows(data.months));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [year]);

  // Which column's info popup is open (a key of COLUMN_INFO), or null.
  const [info, setInfo] = useState(null);

  // Which action popup is open: "expense" | "addon" | "outgoing" | "category".
  const [action, setAction] = useState(null);

  // When a month is open, the table shows THAT MONTH'S DAYS instead of the
  // year — a replacing view, not a nested one. `null` means we're on the year.
  const [openMonth, setOpenMonth] = useState(null);
  const [dayRows, setDayRows] = useState([]);
  const [daysLoading, setDaysLoading] = useState(false);

  const ROWS = rows;
  // The footer sums whatever is on screen: the year, or one month's days.
  const TOTALS = toYTD(openMonth ? dayRows : rows);
  const totalsLabel = openMonth ? `${openMonth} Total` : "Year to Date";
  const VIEW_ROWS = openMonth ? dayRows : rows;


  async function openMonthView(monthName) {
    const index = MONTH_INDEX[monthName];
    setOpenMonth(monthName);
    setDayRows([]);
    try {
      setDaysLoading(true);
      const data = await getAccountingOverviewDaily(year, index);
      // Same derive() as the monthly rows, so a day and its month agree.
      setDayRows(toRows(data.days));
    } catch (err) {
      alert(`Couldn't load that month: ${err.message}`);
      setOpenMonth(null);
    } finally {
      setDaysLoading(false);
    }
  }

  function backToYear() {
    setOpenMonth(null);
    setDayRows([]);
  }

  // Turn a row's month into the date range it covers, for the drill-through
  // links. The year comes from the page's own state, so it follows whichever
  // year is on show.
  function monthRange(monthName) {
    const idx = MONTH_INDEX[monthName] - 1;
    const start = new Date(Date.UTC(year, idx, 1));
    const end = new Date(Date.UTC(year, idx + 1, 0));   // day 0 of next = last of this
    return {
      from: start.toISOString().slice(0, 10),
      to: end.toISOString().slice(0, 10),
    };
  }

  // One row of figures. Months and days render through the SAME component, so
  // a day row and the month above it can never disagree about how a column is
  // built. `isDay` only changes the styling and drops the View link.
  function FigureRow({ r, isDay }) {
    const { from, to } = isDay ? { from: r.date, to: r.date } : monthRange(r.month);
    const range = `from=${from}&to=${to}`;
    const sales = (extra) => `/accounting/sales?${range}${extra ? "&" + extra : ""}`;
    const cash = (dir, kind) =>
      `/accounting/cash?${range}&direction=${dir}` +
      (kind ? `&kind=${encodeURIComponent(kind)}` : "");

    return (
      <tr>
        {/* On the year view the month name IS the link into that month's days.
            On the day view it's just a date label. */}
        <td className={`acct-td acct-sticky ${isDay ? "acct-td--day" : "acct-td--month"}`}>
          {isDay ? (
            String(r.month).padStart(2, "0")
          ) : (
            <button className="acct-monthlink" onClick={() => openMonthView(r.month)}>
              {r.month}
            </button>
          )}
        </td>

        <td className="acct-td"><Drill value={r.rooms} to={sales("department=Rooms")} /></td>
        <td className="acct-td"><Drill value={r.bar} to={sales("department=Bar")} /></td>
        <td className="acct-td acct-td--total">{naira(r.totalSales)}</td>
        <td className="acct-td acct-col--groupend">
          <Drill value={r.salesOwed} to={sales("status=Unpaid")} className="acct-drill--muted" />
        </td>

        <td className="acct-td acct-col--groupend">
          <Drill value={r.expenses} to={`/accounting/expenses?${range}`} />
        </td>
        {/* Profit is derived — nothing to list, so not clickable. */}
        <td className="acct-td acct-td--profit acct-col--groupend">{naira(r.profit)}</td>

        <td className="acct-td"><Drill value={r.salesPaid} to={cash("in", "Sales Paid")} /></td>
        <td className="acct-td"><Drill value={r.oldDebt} to={cash("in", "Debt Collected")} /></td>
        <td className="acct-td"><Drill value={r.futDep} to={cash("in", "Deposits")} /></td>
        <td className="acct-td">
          {r.addOnsIn ? <Drill value={r.addOnsIn} to={cash("in", "Add-on")} />
                      : <span className="acct-dash">—</span>}
        </td>
        {/* The totals open the whole direction — every kind, not one. */}
        <td className="acct-td acct-td--total">
          <Drill value={r.totalCashIn} to={cash("in")} className="acct-drill--total" />
        </td>

        <td className="acct-td"><Drill value={r.expPaid} to={cash("out", "Expenses Paid")} /></td>
        <td className="acct-td">
          {r.pastExpSet ? <Drill value={r.pastExpSet} to={cash("out", "Expenses Settled")} />
                        : <span className="acct-dash">—</span>}
        </td>
        <td className="acct-td">
          {r.expPre ? <Drill value={r.expPre} to={cash("out", "Prepaid Expenses")} />
                    : <span className="acct-dash">—</span>}
        </td>
        <td className="acct-td"><Drill value={r.addOnsOut} to={cash("out", "Out-going")} /></td>
        <td className="acct-td"><Drill value={r.refunds} to={cash("out", "Refund")} /></td>
        <td className="acct-td acct-td--total">
          <Drill value={r.totalCashOut} to={cash("out")} className="acct-drill--total" />
        </td>

        {/* Net and Cash Balance are derived — not clickable. */}
        <td className={`acct-td acct-col--groupend ${r.net >= 0 ? "acct-td--pos" : "acct-td--neg"}`}>
          {signedNaira(r.net)}
        </td>
        <td className="acct-td acct-td--balance acct-col--groupend">{naira(r.cashBal)}</td>
        {/* Debt lives in Corporate Accounts. */}
        <td className="acct-td acct-td--balance acct-col--groupend">
          <Drill value={r.debtBal} to="/account" />
        </td>
      </tr>
    );
  }

  // A drillable figure: dashed underline, and clicking it opens the page that
  // lists what makes up the number — with the month and the right filter
  // already applied.
  function Drill({ value, to, className = "" }) {
    return (
      <button
        className={`acct-drill ${className}`}
        onClick={() => to && navigate(to)}
        title={to ? "See what makes up this figure" : undefined}
      >
        {naira(value)}
      </button>
    );
  }

  // A column header with its info icon.
  function Th({ label, k, bold = false, className = "" }) {
    return (
      <th className={`acct-th ${bold ? "acct-th--bold" : ""} ${className}`}>
        <span className="acct-th__inner">
          <span>{label}</span>
          {k && (
            <button
              className="acct-info"
              onClick={() => setInfo(k)}
              aria-label={`About ${label}`}
            >
              <InfoIcon size={10} />
            </button>
          )}
        </span>
      </th>
    );
  }

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <header className="topbar">
          <GridIcon size={22} />
          <span className="topbar__title">Accounting</span>
        </header>

        <div className="content">
          {/* Action bar — each opens its form as a popup (not built yet). */}
          <div className="acct-actions">
            <button className="acct-action acct-action--primary" onClick={() => setAction("expense")}>
              <PlusIcon size={10} /> Add Expense
            </button>
            <button className="acct-action" onClick={() => setAction("addon")}>
              <PlusIcon size={10} /> Add-ons
            </button>
            <button className="acct-action" onClick={() => setAction("outgoing")}>
              <PlusIcon size={10} /> Out-goings
            </button>
            <span className="acct-actions__divider" />
            <button className="acct-action acct-action--link" onClick={() => setAction("category")}>
              <PlusIcon size={10} /> Add Category
            </button>
          </div>

          {loading ? (
            <p style={{ padding: "24px", color: "#7b7487" }}>Loading accounts…</p>
          ) : error ? (
            <p style={{ padding: "24px", color: "#c0392b" }}>Unable to fetch data: {error}</p>
          ) : (
          <>
          {/* Which view we're on, and the way back out of a month. */}
          {openMonth && (
            <div className="acct-viewbar">
              <button className="acct-back" onClick={backToYear}>
                ← All months
              </button>
              <span className="acct-viewbar__title">
                {openMonth} {year} — day by day
              </span>
            </div>
          )}

          {/* The table scrolls sideways inside this card. */}
          <div className="acct-table-wrap">
            <table className="acct-table">
              <thead>
                {/* Row 1 — the column groups */}
                <tr className="acct-grouprow">
                  <th className="acct-th acct-sticky acct-group--plain" />
                  <th className="acct-th acct-group--sales" colSpan={4}>SALES</th>
                  <th className="acct-th acct-group--plain">EXPENSES</th>
                  <th className="acct-th acct-group--profit">PROFIT</th>
                  <th className="acct-th acct-group--in" colSpan={5}>CASH IN</th>
                  <th className="acct-th acct-group--out" colSpan={6}>CASH OUT</th>
                  <th className="acct-th acct-group--plain">NET</th>
                  <th className="acct-th acct-group--plain" colSpan={2}>BALANCE</th>
                </tr>

                {/* Row 2 — the individual columns */}
                <tr className="acct-colrow">
                  <th className="acct-th acct-th--bold acct-sticky acct-th--left">
                    {openMonth ? "DAY" : "MONTH"}
                  </th>

                  <Th label="ROOMS" k="rooms" className="acct-col--sales" />
                  <Th label="BAR" k="bar" className="acct-col--sales" />
                  <Th label="TOTAL SALES" k="totalSales" bold className="acct-col--salestotal" />
                  <Th label="SALES OWED" k="salesOwed" className="acct-col--sales acct-col--groupend" />

                  <Th label="EXPENSES" k="expenses" className="acct-col--groupend" />
                  <Th label="PROFIT" k="profit" className="acct-col--groupend" />

                  <Th label="SALES PAID" k="salesPaid" className="acct-col--in" />
                  <Th label="OLD DEBT COL" k="oldDebt" className="acct-col--in" />
                  <Th label="FUT DEP" k="futDep" className="acct-col--in" />
                  <Th label="ADD-ONS IN" k="addOnsIn" className="acct-col--in" />
                  <Th label="TOTAL CASH IN" k="totalCashIn" bold className="acct-col--intotal" />

                  <Th label="EXP PAID" k="expPaid" className="acct-col--out" />
                  <Th label="PAST EXP SET" k="pastExpSet" className="acct-col--out" />
                  <Th label="EXP PRE" k="expPre" className="acct-col--out" />
                  <Th label="OUT-GOING" k="addOnsOut" className="acct-col--out" />
                  <Th label="REFUNDS" k="refunds" className="acct-col--out" />
                  <Th label="TOTAL CASH OUT" k="totalCashOut" bold className="acct-col--outtotal" />

                  <Th label="NET" k="net" className="acct-col--groupend" />
                  <Th label="CASH BAL" k="cashBal" className="acct-col--groupend" />
                  <Th label="DEBT BAL" k="debtBal" className="acct-col--groupend" />
                </tr>
              </thead>

              <tbody>
                {openMonth
                  ? (daysLoading
                      ? <tr><td className="acct-td acct-sticky" colSpan={22}>Loading days…</td></tr>
                      : dayRows.map((d) => (
                          <FigureRow key={`${openMonth}-${d.month}`} r={d} isDay />
                        )))
                  : ROWS.map((r) => <FigureRow key={r.month} r={r} />)}

                {/* Totals for whatever is on screen — the year, or one month.
                    Balance columns are a position, not a sum, so they stay
                    blank. */}
                <tr className="acct-ytd">
                  <td className="acct-td acct-sticky acct-td--ytdlabel">{totalsLabel}</td>
                  <td className="acct-td">{naira(TOTALS.rooms)}</td>
                  <td className="acct-td">{naira(TOTALS.bar)}</td>
                  <td className="acct-td">{naira(TOTALS.totalSales)}</td>
                  <td className="acct-td acct-col--groupend">{naira(TOTALS.salesOwed)}</td>
                  <td className="acct-td acct-col--groupend">{naira(TOTALS.expenses)}</td>
                  <td className="acct-td acct-td--profit acct-col--groupend">{naira(TOTALS.profit)}</td>
                  <td className="acct-td">{naira(TOTALS.salesPaid)}</td>
                  <td className="acct-td">{naira(TOTALS.oldDebt)}</td>
                  <td className="acct-td">{naira(TOTALS.futDep)}</td>
                  <td className="acct-td">{naira(TOTALS.addOnsIn)}</td>
                  <td className="acct-td">{naira(TOTALS.totalCashIn)}</td>
                  <td className="acct-td">{naira(TOTALS.expPaid)}</td>
                  <td className="acct-td">{naira(TOTALS.pastExpSet)}</td>
                  <td className="acct-td">{naira(TOTALS.expPre)}</td>
                  <td className="acct-td">{naira(TOTALS.addOnsOut)}</td>
                  <td className="acct-td">{naira(TOTALS.refunds)}</td>
                  <td className="acct-td">{naira(TOTALS.totalCashOut)}</td>
                  <td className={`acct-td acct-col--groupend ${TOTALS.net >= 0 ? "acct-td--pos" : "acct-td--neg"}`}>
                    {signedNaira(TOTALS.net)}
                  </td>
                  <td className="acct-td acct-dash acct-col--groupend">—</td>
                  <td className="acct-td acct-dash acct-col--groupend">—</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Prose summary beneath the table */}
          <div className="acct-summary">
            <h3 className="acct-summary__title">
              {openMonth ? `${openMonth} ${year} in Summary` : "Year in Summary"}
            </h3>
            <ul className="acct-summary__list">
              <li>
                Total sales came to <strong>{naira(TOTALS.totalSales)}</strong>,
                across rooms and the bar.
              </li>
              <li>
                Running the hotel cost <strong>{naira(TOTALS.expenses)}</strong>,
                leaving a paper profit of <strong>{naira(TOTALS.profit)}</strong>.
              </li>
              <li>
                <strong>{naira(TOTALS.totalCashIn)}</strong> came into the till and{" "}
                <strong>{naira(TOTALS.totalCashOut)}</strong> went out.
              </li>
              <li>
                It ended with{" "}
                <strong>{naira(VIEW_ROWS.length ? VIEW_ROWS[VIEW_ROWS.length - 1].cashBal : 0)}</strong> in
                cash and{" "}
                <strong>{naira(VIEW_ROWS.length ? VIEW_ROWS[VIEW_ROWS.length - 1].debtBal : 0)}</strong>{" "}
                still owed to the hotel.
              </li>
              <li>
                Cash position moved by <strong>{signedNaira(TOTALS.net)}</strong> over the period.
              </li>
            </ul>
          </div>
          </>
          )}
        </div>
      </div>

      {info && (
        <ColumnInfoModal
          title={info}
          body={COLUMN_INFO[info]}
          onClose={() => setInfo(null)}
        />
      )}

      {/* The four entry forms. Frontend only — saving logs and closes. */}
      {action === "expense" && (
        <AddExpenseModal onClose={() => setAction(null)}
          onSaved={async () => { setAction(null); await load(); }} />
      )}
      {action === "addon" && (
        <MoneyMovementModal direction="in" onClose={() => setAction(null)}
          onSaved={async () => { setAction(null); await load(); }} />
      )}
      {action === "outgoing" && (
        <MoneyMovementModal direction="out" onClose={() => setAction(null)}
          onSaved={async () => { setAction(null); await load(); }} />
      )}
      {action === "category" && (
        <AddCategoryModal onClose={() => setAction(null)}
          onSaved={() => setAction(null)} />
      )}
    </div>
  );
}