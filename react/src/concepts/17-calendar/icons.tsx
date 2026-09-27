/** Small inline SVG icons for concept 17. Decorative unless a `label` is passed. */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { label?: string };

function Svg({ label, children, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const CrowIcon = (p: IconProps) => (
  <Svg {...p}>
    <path
      d="M2 12c2.5-.5 4.5-2.5 7-3.5 1.6-.6 3.4-.6 5 .2L22 7l-4.6 3.4c.4 2.6-1.4 5-4 5.8L12 22h-1.6l.9-5.4c-1.6.2-3.2-.3-4.3-1.4C5.6 14 3.8 13.4 2 12Z"
      fill="currentColor"
      stroke="none"
    />
    <circle cx="15" cy="9.6" r=".8" fill="var(--c17-paper)" stroke="none" />
  </Svg>
);

export const SunIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
  </Svg>
);

export const LockIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none" />
  </Svg>
);

export const FireworkIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 4v4M12 16v4M4 12h4M16 12h4M6.3 6.3l2.9 2.9M14.8 14.8l2.9 2.9M6.3 17.7l2.9-2.9M14.8 9.2l2.9-2.9" />
    <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    <circle cx="12" cy="3" r=".9" fill="currentColor" stroke="none" />
    <circle cx="21" cy="12" r=".9" fill="currentColor" stroke="none" />
    <circle cx="12" cy="21" r=".9" fill="currentColor" stroke="none" />
    <circle cx="3" cy="12" r=".9" fill="currentColor" stroke="none" />
  </Svg>
);

export const PumpkinIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 6V3.5c0-.6.6-1 1.2-.8L15 3.3" />
    <path d="M12 6.5c-1.6-.9-3.2-.9-4.2 0C5.4 6 3.5 8.6 3.5 12.6S6 20 8.2 20c1.3 0 2.6-.5 3.8-1.3 1.2.8 2.5 1.3 3.8 1.3 2.2 0 4.7-3.4 4.7-7.4S18.6 6 16.2 6.5c-1-.9-2.6-.9-4.2 0Z" />
    <path d="M9 8.2c-1 2.5-1 7.5 0 10M15 8.2c1 2.5 1 7.5 0 10" opacity=".6" />
    <path d="M8 12.5l1.5-2 1.5 2ZM13 12.5l1.5-2 1.5 2ZM8.5 15.5h7l-1 1.5-1-1-1.5 1-1.5-1-1 1Z" fill="currentColor" stroke="none" />
  </Svg>
);

export const GiftIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 9h18v4H3zM5 13v8h14v-8M12 9v12" />
    <path d="M12 9c-1.5-.2-4-1-4-3s2.5-2 4 3c1.5-5 4-5 4-3s-2.5 2.8-4 3Z" />
  </Svg>
);

export const MaskIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 6c2.5-1.5 13.5-1.5 16 0v6c0 5-4 9-8 9s-8-4-8-9V6Z" />
    <path d="M8 11c1-1 2-1 3 0M13 11c1-1 2-1 3 0M9 15.5c2 1 4 1 6 0" />
  </Svg>
);

export const BootIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 3h6v8l6 2.5V19H4v-5c2 0 3-1 3-3V3Z" />
    <path d="M7 10h6M4 16h16" />
  </Svg>
);

export const TruckIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2 6h12v10H2zM14 9h4l4 4v3h-8z" />
    <circle cx="6" cy="18" r="2" />
    <circle cx="17" cy="18" r="2" />
  </Svg>
);

export const ClockIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
);

export const PinIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z" />
    <circle cx="12" cy="9" r="2.5" />
  </Svg>
);

export const ArrowIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);
