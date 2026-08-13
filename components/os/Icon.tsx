import type { ReactNode } from 'react';
import type { IconName } from '@/types/egonux';

interface IconProps {
  name: IconName;
  size?: number;
  title?: string;
  className?: string;
}

const paths: Record<IconName, ReactNode> = {
  home: (
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10M9 20v-6h6v6" />
    </>
  ),
  identity: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <circle cx="9" cy="10" r="2.5" />
      <path d="M5.8 16c.8-1.8 2-2.7 3.2-2.7s2.4.9 3.2 2.7M15 9h3M15 13h3M15 17h2" />
    </>
  ),
  wallet: (
    <>
      <path d="M4 6.5h13.5A2.5 2.5 0 0 1 20 9v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11" />
      <path d="M15 11h6v5h-6a2.5 2.5 0 0 1 0-5Z" />
      <circle cx="16" cy="13.5" r=".6" fill="currentColor" stroke="none" />
    </>
  ),
  marketplace: (
    <>
      <path d="M4 9h16l-1-5H5L4 9Z" />
      <path d="M5 9v11h14V9M9 20v-6h6v6" />
      <path d="M4 9c0 1.5 1 2.5 2.3 2.5S8.6 10.5 8.6 9c0 1.5 1 2.5 2.3 2.5s2.3-1 2.3-2.5c0 1.5 1 2.5 2.3 2.5s2.3-1 2.3-2.5c0 1.5 1 2.5 2.2 2.5" />
    </>
  ),
  learn: (
    <>
      <path d="M3 5.5C6 4.5 9 5 12 7v13c-3-2-6-2.5-9-1.5v-13Z" />
      <path d="M21 5.5c-3-1-6-.5-9 1.5v13c3-2 6-2.5 9-1.5v-13Z" />
    </>
  ),
  community: (
    <>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3.5 20v-2a5.5 5.5 0 0 1 11 0v2M14 14.5a4.5 4.5 0 0 1 6.5 4V20" />
    </>
  ),
  affiliate: (
    <>
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="18" cy="18" r="3" />
      <path d="m8.7 10.6 6.6-3.2M8.7 13.4l6.6 3.2" />
    </>
  ),
  ai: (
    <>
      <rect x="5" y="5" width="14" height="14" rx="4" />
      <path d="M9 10v4M15 10v4M9 12h6M12 2v3M12 19v3M2 12h3M19 12h3" />
    </>
  ),
  security: (
    <>
      <path d="M12 2.8 20 6v5.8c0 4.6-3 8-8 9.4-5-1.4-8-4.8-8-9.4V6l8-3.2Z" />
      <path d="m8.5 12 2.2 2.2 4.8-5" />
    </>
  ),
  developer: (
    <>
      <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 4l-4 16" />
    </>
  ),
  admin: (
    <>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      <path d="m3 7 6-4 6 7 6-5" />
    </>
  ),
  bell: (
    <>
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" />
      <path d="M10 21h4" />
    </>
  ),
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  'arrow-up': <><path d="M12 20V5M6 11l6-6 6 6" /></>,
  'arrow-down': <><path d="M12 4v15M6 13l6 6 6-6" /></>,
  send: <><path d="m3 11 18-8-8 18-2-8-8-2Z" /><path d="m11 13 5-5" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  qr: (
    <>
      <rect x="3" y="3" width="6" height="6" rx="1" /><rect x="15" y="3" width="6" height="6" rx="1" />
      <rect x="3" y="15" width="6" height="6" rx="1" /><path d="M15 15h2v2h-2zM19 15h2v6h-2M15 19h2v2h-2" />
    </>
  ),
  'chevron-right': <path d="m9 18 6-6-6-6" />,
  check: <path d="m5 12 4 4L19 6" />,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  sparkles: <><path d="m12 3 1.3 4.2L17 9l-3.7 1.8L12 15l-1.3-4.2L7 9l3.7-1.8L12 3ZM5 15l.7 2.3L8 18l-2.3.7L5 21l-.7-2.3L2 18l2.3-.7L5 15ZM19 13l.6 1.9 1.9.6-1.9.6L19 18l-.6-1.9-1.9-.6 1.9-.6L19 13Z" /></>,
  cart: <><path d="M3 4h2l2.2 10.5h10.5L21 7H6" /><circle cx="9" cy="19" r="1.5" /><circle cx="18" cy="19" r="1.5" /></>,
  play: <path d="m9 7 8 5-8 5V7Z" />,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
  external: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" /></>,
  activity: <path d="M3 12h4l2-7 4 14 2-7h6" />,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 3.7 5.5 3.7 9S14.5 18.5 12 21c-2.5-2.5-3.7-5.5-3.7-9S9.5 5.5 12 3Z" /></>,
  logout: <><path d="M10 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h5M14 8l4 4-4 4M8 12h10" /></>,
};

export default function Icon({ name, size = 20, title, className }: IconProps) {
  return (
    <svg
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={className}
      fill="none"
      height={size}
      role={title ? 'img' : undefined}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
      width={size}
    >
      {title ? <title>{title}</title> : null}
      {paths[name]}
    </svg>
  );
}
