/** The Crow's avatar: a code-drawn crow head on a dark disc. */
export function CrowAvatar({ size = 40, label = "The Crow" }: { size?: number; label?: string }) {
  return (
    <svg className="c16-avatar" width={size} height={size} viewBox="0 0 48 48" role="img" aria-label={label}>
      <circle cx="24" cy="24" r="24" fill="#1f1f25" />
      <circle cx="24" cy="24" r="23" fill="none" stroke="#ff6a00" strokeOpacity=".5" />
      {/* head + neck */}
      <path d="M14 34c-1-9 2-17 10-19 6-1 10 3 11 8l9 3-9 1c-1 6-5 9-10 9-4 0-7-1-11-2z" fill="#0a0a0c" />
      {/* beak highlight */}
      <path d="M35 23l9 3-9 1z" fill="#2b2b33" />
      {/* eye */}
      <circle cx="28" cy="22" r="2.2" fill="#ff6a00" />
      <circle cx="28.7" cy="21.4" r=".7" fill="#fff" />
    </svg>
  );
}

/** Small crow silhouette for the brand mark. */
export function CrowMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path
        d="M4 20c4-1 7-3 9-7 1-3 4-5 7-5 3 0 5 2 6 4l4 1-4 1c0 4-3 7-7 8l-1 5h-2l0-5H9l-2 5H5l2-6c-2 0-3-1-3-1z"
        fill="currentColor"
      />
    </svg>
  );
}
