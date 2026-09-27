/** Fixed lantern-style scene label. Updates from React state as slides enter the viewport. */
export function Lantern({ index, total, name }: { index: number; total: number; name: string }) {
  return (
    <div className="c15-lantern" aria-live="polite" aria-atomic="true">
      <svg className="c15-lantern__icon" viewBox="0 0 24 34" width="26" height="36" aria-hidden="true" focusable="false">
        <path d="M12 0v4" stroke="currentColor" strokeWidth="2" />
        <path d="M7 4h10v3H7z" fill="currentColor" />
        <path d="M6 7h12l2 20H4z" fill="#1a1512" stroke="currentColor" strokeWidth="1" />
        <rect x="8.5" y="10" width="7" height="14" rx="2" className="c15-lantern__glass" />
        <path d="M5 27h14v4H5z" fill="currentColor" />
      </svg>
      <p className="c15-lantern__text">
        <span className="c15-lantern__eyebrow">
          Stop {index + 1} of {total}
        </span>
        <span className="c15-lantern__name">{name}</span>
      </p>
    </div>
  );
}
