import { CloseIcon } from "./icons.jsx";

// The little explainer opened by the info icon on an accounting column header.
// `title` is the column key; `body` is the sentence explaining it.
const LABELS = {
  rooms: "Rooms", bar: "Bar", store: "Store",
  totalSales: "Total Sales", salesOwed: "Sales Owed",
  expenses: "Expenses", profit: "Profit",
  salesPaid: "Sales Paid", oldDebt: "Old Debt Collected",
  futDep: "Future Deposits", addOnsIn: "Add-ons In",
  totalCashIn: "Total Cash In",
  expPaid: "Expenses Paid", pastExpSet: "Past Expenses Settled",
  expPre: "Expenses Prepaid", addOnsOut: "Add-ons Out", refunds: "Refunds",
  totalCashOut: "Total Cash Out",
  net: "Net", cashBal: "Cash Balance", debtBal: "Debt Balance",
};

export default function ColumnInfoModal({ title, body, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card--sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{LABELS[title] || title}</h2>
          <div className="modal-subtitle"><span>Accounting</span></div>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon size={14} />
        </button>

        <div className="form-modal-body">
          <div className="form-modal-body__rule" />
          <p className="acct-info__body">{body}</p>
        </div>

        <div className="form-modal-actions">
          <button className="btn-pill-primary" onClick={onClose}>Got it</button>
        </div>
      </div>
    </div>
  );
}