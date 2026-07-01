// A guest's details shown as a tinted card inside the booking/reservation
// modals: a "Guest N" tag, then a 2-column grid of labelled fields.
//
// Props:
//   tag    -> small label like "Guest 1"
//   fields -> array of { label, value }
export default function GuestInfoCard({ tag, fields }) {
  return (
    <div className="guest-info">
      <span className="guest-info__tag">{tag}</span>
      <div className="guest-info__grid">
        {fields.map((field) => (
          <div key={field.label}>
            <div className="guest-info__field-label">{field.label}</div>
            <div className="guest-info__field-value">{field.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
