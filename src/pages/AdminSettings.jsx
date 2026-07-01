import Sidebar from "../components/Sidebar.jsx";
import PasswordInput from "../components/PasswordInput.jsx";
import { GridIcon, BellNotifyIcon, ShieldIcon } from "../components/icons.jsx";

// Admin Settings has three password-change cards. Each card has the same
// shape, so we describe them as data and render with a small helper component.
function SettingsCard({ sectionLabel, Icon, title, desc, fields, button }) {
  return (
    <section className="settings-section">
      <div className="settings-section__head">
        <span className="settings-section__head-label">{sectionLabel}</span>
        <span className="settings-section__head-line" />
      </div>

      <div className="settings-card">
        <div className="settings-card__intro">
          <div className="settings-card__icon">
            <Icon size={22} />
          </div>
          <div>
            <div className="settings-card__title">{title}</div>
            <div className="settings-card__desc">{desc}</div>
          </div>
        </div>

        <div className="settings-fields">
          {/* fields come in rows of one or two */}
          {fields.map((row, i) => (
            <div className="settings-fields__row" key={i}>
              {row.map((label) => (
                <PasswordInput key={label} label={label} />
              ))}
            </div>
          ))}
        </div>

        <button
          className="settings-card__submit"
          onClick={() => alert("Password updated! (Demo — nothing is saved yet.)")}
        >
          {button}
        </button>
      </div>
    </section>
  );
}

export default function AdminSettings() {
  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <header className="topbar">
          <GridIcon size={22} />
          <span className="topbar__title">Settings</span>
        </header>

        <div className="content">
          <div className="settings-sections">
            <SettingsCard
              sectionLabel="Reception Password"
              Icon={BellNotifyIcon}
              title="Receptionist"
              desc="Update the shared reception login password"
              fields={[["New Password", "Confirm Password"]]}
              button="Update Reception Password"
            />
            <SettingsCard
              sectionLabel="Bar Password"
              Icon={BellNotifyIcon}
              title="Bar"
              desc="Update the shared bar login password"
              fields={[["New Password", "Confirm Password"]]}
              button="Update Bar Password"
            />
            <SettingsCard
              sectionLabel="Admin Password"
              Icon={ShieldIcon}
              title="Administrator"
              desc="Update your personal admin login password"
              fields={[["Current Password", "New Password"], ["Confirm New Password"]]}
              button="Update Admin Password"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
