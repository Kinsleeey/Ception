import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar.jsx";
import { ChevronDownIcon, CloseIcon } from "../components/icons.jsx";
import {
  getRoomAvailability, createReservation, addGuest, getAccounts,
} from "../api.js";

const BASE_PAYMENT_METHODS = ["Direct Bank Transfer", "Cash", "Card", "POS"];

function naira(n) {
  return "₦" + Number(n || 0).toLocaleString();
}

// Whole nights between two YYYY-MM-DD dates (0 if missing or backwards).
function nightsBetween(start, end) {
  if (!start || !end) return 0;
  const ms = new Date(`${end}T00:00:00`) - new Date(`${start}T00:00:00`);
  const nights = Math.round(ms / 86400000);
  return nights > 0 ? nights : 0;
}

export default function ReservationCreate() {
  const navigate = useNavigate();

  // Stay dates
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Reserver details — saved as a guest record (a reserver may never stay).
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  // Availability for the chosen dates: [{ category, price, available }]
  const [categories, setCategories] = useState([]);
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [availError, setAvailError] = useState(null);

  // How many rooms of each category, keyed by category name.
  const [quantities, setQuantities] = useState({});

  const [accounts, setAccounts] = useState([]);
  const [payment, setPayment] = useState(BASE_PAYMENT_METHODS[0]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const nights = nightsBetween(startDate, endDate);

  // Only active accounts can be charged.
  useEffect(() => {
    getAccounts()
      .then((rows) => setAccounts(rows.filter((a) => a.status === "Active")))
      .catch(() => setAccounts([]));
  }, []);

  // Availability depends on the dates, so refetch whenever a valid range is set.
  useEffect(() => {
    if (nights <= 0) {
      setCategories([]);
      return;
    }
    let cancelled = false;
    async function load() {
      try {
        setLoadingAvail(true);
        setAvailError(null);
        const rows = await getRoomAvailability(startDate, endDate);
        if (!cancelled) {
          setCategories(rows);
          // Drop any quantity that no longer fits what's free.
          setQuantities((prev) => {
            const next = {};
            for (const row of rows) {
              const q = prev[row.category] || 0;
              if (q > 0) next[row.category] = Math.min(q, row.available);
            }
            return next;
          });
        }
      } catch (err) {
        if (!cancelled) setAvailError(err.message);
      } finally {
        if (!cancelled) setLoadingAvail(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [startDate, endDate, nights]);

  function setQty(category, value) {
    const cat = categories.find((c) => c.category === category);
    if (!cat) return;
    const raw = value === "" ? 0 : Number(value);
    if (Number.isNaN(raw) || raw < 0) return;
    setQuantities((prev) => ({ ...prev, [category]: Math.min(raw, cat.available) }));
  }

  // Only categories with rooms selected reach the summary. Each line's total
  // covers the whole stay (price per night x rooms x nights).
  const summaryLines = useMemo(
    () =>
      categories
        .filter((c) => (quantities[c.category] || 0) > 0)
        .map((c) => {
          const qty = quantities[c.category];
          return {
            category: c.category,
            qty,
            amount: Number(c.price) * qty * nights,
          };
        }),
    [categories, quantities, nights]
  );

  const total = summaryLines.reduce((sum, l) => sum + l.amount, 0);

  const canSave =
    nights > 0 && name.trim().length > 0 && summaryLines.length > 0 && !saving;

  async function handleSave() {
    if (!canSave) return;
    try {
      setSaving(true);
      setError(null);

      // 1. The reserver goes into the guest database. addGuest returns the
      //    existing record if this name+phone is already there.
      const guest = await addGuest({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
      });

      // 2. The reservation itself. Rooms are auto-assigned on the server.
      await createReservation({
        guest_id: guest.id,
        start_date: startDate,
        end_date: endDate,
        payment_method: payment,
        rooms: summaryLines.map((l) => ({
          category: l.category,
          qty: l.qty,
          amount: l.amount,
        })),
      });

      navigate("/reservations");
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  const paymentOptions = [...BASE_PAYMENT_METHODS, ...accounts.map((a) => a.name)];

  return (
    <div className="room-page">
      <TopBar title="Room Dashboard" />

      <div className="reserve-page">
        <div className="reserve-page__head">
          <h2 className="reserve-page__title">Multiple Reservations</h2>
          <button
            className="reserve-page__close"
            onClick={() => navigate("/reception")}
            aria-label="Close"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {/* ---- Stay dates ---- */}
        <section className="reserve-section">
          <div className="section-divider">
            <span className="section-divider__label">Stay Dates</span>
            <span className="section-divider__line" />
          </div>

          <div className="reserve-grid reserve-grid--2">
            <div>
              <label className="field-label-strong" htmlFor="start-date">Check-in Date</label>
              <input id="start-date" type="date" className="pill-input"
                value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="field-label-strong" htmlFor="end-date">Check-out Date</label>
              <input id="end-date" type="date" className="pill-input"
                value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <p className="reserve-nights">
            {nights > 0
              ? `${nights} ${nights === 1 ? "night" : "nights"}`
              : "Pick both dates to see availability."}
          </p>
        </section>

        {/* ---- Reserver details ---- */}
        <section className="reserve-section">
          <div className="section-divider">
            <span className="section-divider__label">Reserver Details</span>
            <span className="section-divider__line" />
          </div>

          <div className="reserve-grid reserve-grid--2">
            <div>
              <label className="field-label-strong">Full Name</label>
              <input className="pill-input" placeholder="John Doe"
                value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="field-label-strong">Phone Number</label>
              <input className="pill-input" placeholder="+234 800 000 0000"
                value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="field-label-strong">Email Address</label>
              <input className="pill-input" placeholder="guest@email.com"
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="field-label-strong">Address</label>
              <input className="pill-input" placeholder="Residential City"
                value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </div>
        </section>

        {/* ---- Rooms ---- */}
        <section className="reserve-section">
          <div className="section-divider">
            <span className="section-divider__label">Rooms</span>
            <span className="section-divider__line" />
          </div>

          {nights <= 0 ? (
            <p className="reserve-nights">Choose your dates first.</p>
          ) : loadingAvail ? (
            <p className="reserve-nights">Checking availability…</p>
          ) : availError ? (
            <p style={{ color: "#c0392b", fontSize: "14px" }}>
              Unable to fetch availability: {availError}
            </p>
          ) : (
            <div className="report-panel">
              <table className="report-table reserve-table">
                <thead>
                  <tr>
                    <th className="is-left">Room Category</th>
                    <th>Qty</th>
                    <th className="is-total">Price</th>
                    <th className="is-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => {
                    const qty = quantities[cat.category] || 0;
                    const soldOut = cat.available === 0;
                    return (
                      <tr key={cat.category}>
                        <td className="is-left reserve-table__name">{cat.category}</td>
                        <td>
                          <input
                            type="number" min="0" max={cat.available}
                            className={`reserve-qty ${qty > 0 ? "reserve-qty--set" : ""}`}
                            value={qty}
                            disabled={soldOut}
                            onChange={(e) => setQty(cat.category, e.target.value)}
                            aria-label={`Number of ${cat.category} rooms`}
                          />
                        </td>
                        <td className="is-total">{naira(cat.price)}</td>
                        <td className="is-left reserve-table__status">
                          {soldOut ? "None free" : `${cat.available} available`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ---- Reservation summary ---- */}
        <section className="reserve-section">
          <div className="section-divider">
            <span className="section-divider__label">Reservation Summary</span>
            <span className="section-divider__line" />
          </div>

          <div className="reserve-summary">
            {summaryLines.length === 0 ? (
              <p className="reserve-summary__empty">No rooms selected yet.</p>
            ) : (
              <>
                {summaryLines.map((line) => (
                  <div className="detail-row" key={line.category}>
                    <span className="detail-row__label">
                      {line.category} <strong>×{line.qty}</strong>
                    </span>
                    <span className="detail-row__value">{naira(line.amount)}</span>
                  </div>
                ))}

                <div className="reserve-summary__rule" />

                <div className="detail-row">
                  <span className="detail-row__label reserve-summary__total-label">
                    Total Amount
                  </span>
                  <span className="reserve-summary__total">{naira(total)}</span>
                </div>
              </>
            )}

            <div className="reserve-summary__payment">
              <label className="field-label-strong">Payment Method</label>
              <div className="select-wrap">
                <select className="pill-input" value={payment}
                  onChange={(e) => setPayment(e.target.value)}>
                  {paymentOptions.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <span className="select-wrap__chevron">
                  <ChevronDownIcon size={18} />
                </span>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <p style={{ color: "#c0392b", fontSize: "14px" }}>{error}</p>
        )}

        <button className="btn-pill-primary reserve-save"
          onClick={handleSave} disabled={!canSave}>
          {saving ? "Saving…" : "Save Reservation"}
        </button>
      </div>
    </div>
  );
}