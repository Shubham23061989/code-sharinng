const PATHS = {
  sparkle: (
    <path d="M12 2.5c.4 4.6 2.4 7.5 7.5 9.5-5.1 2-7.1 4.9-7.5 9.5-.4-4.6-2.4-7.5-7.5-9.5 5.1-2 7.1-4.9 7.5-9.5Z" fill="currentColor" stroke="none" />
  ),
  grid: (
    <>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
    </>
  ),
  gauge: (
    <>
      <path d="M4.5 16a8 8 0 1 1 15 0" />
      <path d="M12 13.5 15.5 9" />
      <circle cx="12" cy="14" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  ring: <circle cx="12" cy="12" r="7.5" />,
  bars: (
    <>
      <path d="M5 20v-6" />
      <path d="M10 20V8" />
      <path d="M15 20v-9" />
      <path d="M20 20V4" />
    </>
  ),
  funnel: <path d="M4 5h16l-6 7.5V19l-4-2v-4.5L4 5Z" />,
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3.5 19c.6-3.3 2.8-5 5.5-5s4.9 1.7 5.5 5" />
      <path d="M15.5 5.6a3 3 0 0 1 0 5.8M17.5 14.4c1.6.6 2.6 2.2 3 4.6" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  store: (
    <>
      <path d="M4 9.5 5.5 4.5h13L20 9.5" />
      <path d="M4 9.5h16v1a2.7 2.7 0 0 1-5.3 0 2.7 2.7 0 0 1-5.4 0 2.7 2.7 0 0 1-5.3 0v-1Z" />
      <path d="M5.5 13v6.5h13V13" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2.5" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    </>
  ),
  chevron: <path d="m7 10 5 5 5-5" />,
  refresh: (
    <>
      <path d="M20 12a8 8 0 1 1-2.4-5.7" />
      <path d="M20 4.5v4.5h-4.5" />
    </>
  ),
  alert: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5M12 16.2v.1" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  shield: <path d="M12 3.5 19 6v5.5c0 4.3-3 7.6-7 9-4-1.4-7-4.7-7-9V6l7-2.5Z" />,
  chevronRight: <path d="m10 7 5 5-5 5" />,
  chevronLeft: <path d="m14 7-5 5 5 5" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowUp: <path d="M12 19V5M6 11l6-6 6 6" />,
  arrowDown: <path d="M12 5v14M6 13l6 6 6-6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  bell: (
    <>
      <path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 1.5h-15L6 16.5Z" />
      <path d="M10 20.5a2.2 2.2 0 0 0 4 0" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.8" />
      <path d="M4.5 20c.9-3.9 3.8-6 7.5-6s6.6 2.1 7.5 6" />
    </>
  ),
  trendUp: (
    <>
      <path d="m4 16 5.5-5.5 3.5 3.5L20 7" />
      <path d="M15 7h5v5" />
    </>
  ),
  smile: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 14.2c.9 1.3 2.1 2 3.5 2s2.6-.7 3.5-2M9 9.8v.2M15 9.8v.2" />
    </>
  ),
  devices: (
    <>
      <rect x="3" y="5" width="13" height="10" rx="1.5" />
      <path d="M6.5 19h6M9.5 15v4" />
      <rect x="17.5" y="9" width="4" height="10" rx="1" />
    </>
  ),
  megaphone: (
    <>
      <path d="M4 10v4h3l7 4.5v-13L7 10H4Z" />
      <path d="M17.5 9.5a3.5 3.5 0 0 1 0 5" />
    </>
  ),
  userPlus: (
    <>
      <circle cx="10" cy="8.5" r="3.5" />
      <path d="M3.5 19.5c.8-3.5 3.3-5.5 6.5-5.5 1.5 0 2.8.4 3.9 1.2M18 13v6M15 16h6" />
    </>
  ),
  car: (
    <>
      <path d="M5 16.5V12l2-5h10l2 5v4.5" />
      <path d="M3.5 16.5h17M5 12h14" />
      <circle cx="8" cy="16.5" r="1.8" />
      <circle cx="16" cy="16.5" r="1.8" />
    </>
  ),
  calendarCheck: (
    <>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2.5" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4M9 15l2 2 4-4" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="12" r="4" />
      <path d="M12 12h8.5M17.5 12v3M20.5 12v2.2" />
    </>
  ),
  wrench: <path d="M14.5 5.5a4 4 0 0 0 4.9 4.9L12 17.8 9 20.8 3.2 15l3-3 7.4-7.4a4 4 0 0 0 .9.9Z" />,
};

export default function Icon({ name, size = 16, className = '', strokeWidth = 1.8, ...rest }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`icon ${className}`}
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}