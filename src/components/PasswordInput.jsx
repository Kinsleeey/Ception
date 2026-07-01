import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "./icons.jsx";

// A password field with a show/hide toggle. Each field manages its own
// "is the password visible?" state, so multiple fields on a page are independent.
//
// Props:
//   label    -> the label above the field
//   value, onChange -> standard controlled-input props (optional)
export default function PasswordInput({ label, value, onChange }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-field">
      <label className="password-field__label">{label}</label>
      <div className="password-input">
        <input
          type={visible ? "text" : "password"}
          placeholder="••••••••"
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        />
        <button
          type="button"
          className="password-input__toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
        </button>
      </div>
    </div>
  );
}
