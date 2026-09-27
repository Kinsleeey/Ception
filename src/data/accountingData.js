// Shared accounting maths and copy.
//
// The monthly FIGURES come from the API (GET /api/accounting/overview), which
// returns raw values only. The derived ones — totals, profit, cash in/out, net
// — are computed here, in one place, so the table, the YTD row and the prose
// summary can never show contradictory numbers.


// A month's derived figures. Kept here so the table, the YTD row and the
// summary all read the same numbers.
export function derive(m) {
  const totalSales = m.rooms + m.bar;
  const profit = totalSales - m.expenses;
  const totalCashIn = m.salesPaid + m.oldDebt + m.futDep + m.addOnsIn;
  const totalCashOut = m.expPaid + m.pastExpSet + m.expPre + m.addOnsOut + m.refunds;
  return {
    ...m,
    totalSales,
    profit,
    totalCashIn,
    totalCashOut,
    net: totalCashIn - totalCashOut,
  };
}

// Apply derive() to whatever the API returned.
export function toRows(months) {
  return (months || []).map(derive);
}

// Year-to-date. Only the columns that sum directly are totalled — balance
// columns (cash balance, debt balance) are a position at a point in time, not a
// sum, so the footer leaves them blank.
export function toYTD(rows) {
  return (rows || []).reduce((acc, r) => {
    for (const k of [
      "rooms", "bar", "salesOwed", "expenses",
      "salesPaid", "oldDebt", "futDep", "addOnsIn",
      "expPaid", "pastExpSet", "expPre", "addOnsOut", "refunds",
      "totalSales", "profit", "totalCashIn", "totalCashOut", "net",
    ]) {
      acc[k] = (acc[k] || 0) + (r[k] || 0);
    }
    return acc;
  }, {});
}

// Explanations shown by the info icon on each column header.
export const COLUMN_INFO = {
  rooms: "Revenue from room bookings — every stay that started this month.",
  bar: "Revenue from bar orders across all bar locations.",
  totalSales: "Rooms + Bar. Everything earned this month, paid or not.",
  salesOwed: "Sales made this month that haven't been paid for yet — mostly corporate accounts.",
  expenses: "Every cost incurred this month, whether or not it has been paid. An expense put on the Expenses Card counts here immediately — the cost is real even though the cash hasn't left yet. That's why this figure and Expenses Paid differ.",
  profit: "Total Sales minus Expenses. What the month earned on paper — it counts sales that haven't been paid for and costs that haven't been settled, so it is not the same as cash in the bank.",
  salesPaid: "Cash actually received from this month's sales.",
  oldDebt: "Money collected this month against sales from earlier months.",
  futDep: "Deposits taken now for stays that happen later.",
  addOnsIn: "Money put into the business from outside — owner capital, loans.",
  totalCashIn: "Everything that came into the till this month.",
  expPaid: "This month's expenses that were paid this month.",
  pastExpSet: "Older unpaid expenses settled this month.",
  expPre: "Cash paid out ahead of when the cost is due. If you settle an expense before its spend date, the money is logged on the day it actually left and counted here rather than under Expenses Paid — so the cash column never claims money left on a day that hasn't happened.",
  addOnsOut: "Money taken out of the business that is not an expense — owner drawings, loan repayments. Shown as Out-going.",
  refunds: "Money returned to guests.",
  totalCashOut: "Everything that left the till this month.",
  net: "Total Cash In minus Total Cash Out. Whether the till grew or shrank this month — not what the hotel earned, just what the cash did.",
  cashBal: "Cash on hand at the end of the month. It carries on from the previous month, then adds Total Cash In and takes off Total Cash Out.",
  debtBal: "Total still owed to the hotel on corporate accounts — the sum of every account that has spent past what it deposited.",
};