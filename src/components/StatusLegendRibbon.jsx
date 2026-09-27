// The thin white bar above the room grid explaining what the small dot on each
// card means. Purely a legend — nothing here is clickable.
//
// It exists because the dot on a card carries no text (deliberately, to stay
// quieter than the room status), so something has to say what green and brown
// mean.
export default function StatusLegendRibbon() {
  return (
    <div className="hk-ribbon">
      <div className="hk-ribbon__spacer" />
      <div className="hk-ribbon__key">
        <span className="hk-ribbon__label">Status Indicator</span>
        <span className="hk-key">
          <span className="hk-key__dot hk-key__dot--clean" />
          Clean
        </span>
        <span className="hk-key">
          <span className="hk-key__dot hk-key__dot--dirty" />
          Dirty
        </span>
      </div>
    </div>
  );
}