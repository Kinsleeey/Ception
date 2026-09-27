// Mock cash data — frontend only. Once the accounting backend exists this
// reads from the unified money-log table.
//
// Every row is one movement of money. `direction` decides the sign, the colour
// and which Type options apply.

export const CASH_TYPES = {
  in: ["Sales Paid", "Debt Collected", "Deposits", "Add-on"],
  out: ["Expenses Paid", "Expenses Settled", "Prepaid Expenses", "Out-going", "Refund"],
};

export const METHODS = ["Cash", "Transfer", "POS"];

// Movement rows now come from GET /api/accounting/cash. CASH_TYPES stays
// because the Type dropdown's options depend on the chosen Direction.