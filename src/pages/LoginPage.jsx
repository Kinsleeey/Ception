import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import { ArrowLeftIcon } from "../components/icons.jsx";

// Copy for each role. useParams() reads the ":role" piece of the URL
// (e.g. "/login/admin" -> role = "admin"), and we look it up here.
const roleContent = {
  receptionist: {
    title: "Receptionist Login",
    subtitle: "Enter your credentials to manage the front desk",
    firstField: { label: "Email Address", placeholder: "you@hotel.com", type: "email" },
  },
  admin: {
    title: "Admin Login",
    subtitle: "Enter your credentials to access the dashboard",
    firstField: { label: "Email Address", placeholder: "admin@hotel.com", type: "email" },
  },
  bartender: {
    title: "Bar Login",
    subtitle: "Enter your credentials to manage drink inventory",
    firstField: { label: "Name", placeholder: "e.g Patrick", type: "text" },
  },
  storekeeper: {
    title: "Store Login",
    subtitle: "Enter your credentials to manage stock in store",
    firstField: { label: "Name", placeholder: "e.g Patrick", type: "text" },
  },
    maintenance: {
    title: "Maintenance Login",
    subtitle: "Enter your credentials to see reported faults",
    firstField: { label: "Name", placeholder: "e.g Danjuma", type: "text" },
  },
};

export default function LoginPage() {
  const { role } = useParams();
  const navigate = useNavigate(); // lets us change pages from code

  // Fall back to the admin layout if someone visits an unknown role.
  const content = roleContent[role] || roleContent.admin;

  // Controlled inputs: React holds the field values in state.
  // This is the standard beginner-friendly React form pattern.
  const [firstValue, setFirstValue] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event) {
    event.preventDefault(); // stop the browser from reloading the page

    // No real authentication here — this is a UI demo. We send each role to
    // its landing page so you can see the flow working. Replace this with a
    // real login check when you add a backend.
    if (role === "admin") {
      navigate("/admin");
    } else if (role === "receptionist") {
      navigate("/reception");
    } else if (role === "bartender") {
      navigate("/bar");
    } else if (role === "storekeeper") {
      navigate("/stock/issue");
    } else if (role === "maintenance") {
      navigate("/maintenance"); 
    } else {
      alert(`The "${role}" area is not built yet — coming in a later batch.`);
    }
  }

  return (
    <div className="login">
      <div className="login__inner">
        {/* Brand — the Ception wordmark replaces the old logo + text pair. */}
        <div className="login__brand">
          <Logo height={28} />
        </div>

        {/* Heading */}
        <h1 className="login__heading">{content.title}</h1>
        <p className="login__subheading">{content.subtitle}</p>

        {/* Form card */}
        <div className="card login__card">
          <form className="login__form" onSubmit={handleSubmit}>
            <div>
              <label className="label" htmlFor="first">
                {content.firstField.label}
              </label>
              <input
                id="first"
                className="input"
                type={content.firstField.type}
                placeholder={content.firstField.placeholder}
                value={firstValue}
                onChange={(e) => setFirstValue(e.target.value)}
              />
            </div>

            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn--large">
              Sign In
            </button>
          </form>
        </div>

        {/* Back link returns to the role selection screen */}
        <Link className="login__back" to="/">
          <ArrowLeftIcon /> Back to Role Selection
        </Link>
      </div>

      <p className="login__footer">© 2026 Ception. All rights reserved.</p>
    </div>
  );
}