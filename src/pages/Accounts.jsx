import { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/Sidebar.jsx";
import AccountSummaryModal from "../components/AccountSummaryModal.jsx";
import AccountCreateModal from "./AccountCreateModal.jsx";
import AccountEditModal from "./AccountEditModal.jsx";
import AccountTopUpModal from "./AccountTopUpModal.jsx";
import { GridIcon, SearchIcon, PlusIcon, ChartIcon } from "../components/icons.jsx";
import { getAccounts, getAccountStats } from "../api.js";

function naira(n) {
  return "₦" + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Accounts is the admin screen for corporate accounts. Each account is a
// company with a running balance (Way A: one stored number), a credit limit
// (how far into the red it may go), and an Active/Suspended status.
//
// Cards show View + Top-up. The popups (summary, create, edit, top-up) open
// over this page and live in this page's state, like the other admin screens.
export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  // Which popup is open, and for which account.
  const [modal, setModal] = useState(null);       // "create" | "summary" | "edit" | "topup" | null
  const [activeId, setActiveId] = useState(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const [rows, s] = await Promise.all([getAccounts(), getAccountStats()]);
      setAccounts(rows);
      setStats(s);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter((a) => a.name.toLowerCase().includes(q));
  }, [accounts, query]);

  function openSummary(id) { setActiveId(id); setModal("summary"); }
  function openEdit(id)    { setActiveId(id); setModal("edit"); }
  function openTopUp(id)   { setActiveId(id); setModal("topup"); }
  function closeModal()    { setModal(null); setActiveId(null); }

  async function refreshAndClose() {
    closeModal();
    await load();
  }

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <header className="topbar">
          <GridIcon size={22} />
          <span className="topbar__title">Account</span>
        </header>

        <div className="content">
          {/* Header row */}
          <div className="acct-header-row">
            <span className="acct-header-row__title">Accounts Management</span>
            <button className="btn-pill-primary acct-create-btn" onClick={() => setModal("create")}>
              <PlusIcon size={12} /> Create New Account
            </button>
          </div>

          {/* Search */}
          <div className="search search--wide">
            <span className="search__icon"><SearchIcon size={18} /></span>
            <input
              className="search__input"
              type="text"
              placeholder="Search accounts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Card grid */}
          {loading ? (
            <p style={{ padding: "24px", color: "#7b7487" }}>Loading accounts…</p>
          ) : error ? (
            <p style={{ padding: "24px", color: "#c0392b" }}>Unable to fetch data: {error}</p>
          ) : visible.length === 0 ? (
            <p style={{ padding: "24px", color: "#7b7487" }}>
              {query ? "No accounts match that search." : "No accounts yet. Create one to get started."}
            </p>
          ) : (
            <div className="acct-grid">
              {visible.map((a) => {
                const suspended = a.status === "Suspended";
                const negative = Number(a.balance) < 0;
                return (
                  <div className={`acct-card ${suspended ? "acct-card--suspended" : ""}`} key={a.id}>
                    <div className="acct-card__head">
                      <span className="acct-card__name">{a.name}</span>
                      <span className={suspended ? "acct-badge acct-badge--suspended" : "acct-badge acct-badge--active"}>
                        <span className="acct-badge__dot" />
                        {a.status}
                      </span>
                    </div>

                    <div className="acct-card__rows">
                      <div className="acct-card__row">
                        <span className="acct-card__label">Balance</span>
                        <span className={`acct-card__value ${negative ? "acct-card__value--negative" : ""}`}>
                          {naira(a.balance)}
                        </span>
                      </div>
                      <div className="acct-card__row">
                        <span className="acct-card__label">Credit Limit</span>
                        <span className="acct-card__value">{naira(a.credit_limit)}</span>
                      </div>
                    </div>

                    <div className="acct-card__actions">
                      <button className="acct-card__link" onClick={() => openTopUp(a.id)}>Top-up</button>
                      <button className="acct-card__link" onClick={() => openSummary(a.id)}>View</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bento tiles */}
          {!loading && !error && stats && (
            <div className="acct-bento">
              <div className="acct-bento__tile">
                <div className="acct-bento__heading">Total Managed Capital</div>
                <div className="acct-bento__figure">{"₦" + Number(stats.total_capital || 0).toLocaleString()}</div>
                <div className="acct-bento__note">
                  Aggregate balance across all active organizational accounts.
                </div>
              </div>

              <div className="acct-bento__tile acct-bento__tile--health">
                <div className="acct-bento__health-info">
                  <div className="acct-bento__heading">Account Health Status</div>
                  <div className="acct-bento__counts">
                    <div className="acct-bento__count">
                      <div className="acct-bento__count-num">{stats.active_count}</div>
                      <div className="acct-bento__count-label">ACTIVE</div>
                    </div>
                    <div className="acct-bento__count">
                      <div className="acct-bento__count-num">{stats.suspended_count}</div>
                      <div className="acct-bento__count-label">SUSPENDED</div>
                    </div>
                  </div>
                </div>
                <div className="acct-bento__chart">
                  <ChartIcon size={22} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Popups */}
      {modal === "create" && (
        <AccountCreateModal onClose={closeModal} onSaved={refreshAndClose} />
      )}
      {modal === "summary" && (
        <AccountSummaryModal
          accountId={activeId}
          onClose={closeModal}
          onEdit={() => openEdit(activeId)}
          onChanged={refreshAndClose}
        />
      )}
      {modal === "edit" && (
        <AccountEditModal accountId={activeId} onClose={closeModal} onSaved={refreshAndClose} />
      )}
      {modal === "topup" && (
        <AccountTopUpModal accountId={activeId} onClose={closeModal} onSaved={refreshAndClose} />
      )}
    </div>
  );
}
