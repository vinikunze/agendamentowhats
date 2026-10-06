import type { CSSProperties } from 'react'

type IconName =
  | 'chat'
  | 'arrow'
  | 'back'
  | 'send'
  | 'check'
  | 'calendar'
  | 'plus'
  | 'close'
  | 'reset'
  | 'chevron'
  | 'help'
  | 'smile'
  | 'more'
const paths: Record<IconName, React.ReactNode> = {
  chat: (
    <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />
  ),
  arrow: (
    <>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </>
  ),
  back: <path d="M20 12H5m6-6-6 6 6 6" />,
  send: (
    <>
      <path d="m3 3 19 9-19 9 4-9-4-9Z" />
      <path d="M7 12h15" />
    </>
  ),
  check: <path d="m4 12 5 5L20 6" />,
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18M8 15h2m4 0h2M8 18h2" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  reset: (
    <>
      <path d="M3 10a9 9 0 1 1 1.5 7M3 4v6h6" />
    </>
  ),
  chevron: <path d="m6 9 6 6 6-6" />,
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 8.5a2.5 2.5 0 1 1 4.1 2.3c-1.1.7-1.6 1.2-1.6 2.2M12 17h.01" />
    </>
  ),
  smile: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 14s1 3 4 3 4-3 4-3M8 9h.01M16 9h.01" />
    </>
  ),
  more: (
    <>
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="19" r="1" />
    </>
  ),
}

export function Icon({
  name,
  size = 20,
  style,
}: {
  name: IconName
  size?: number
  style?: CSSProperties
}) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {paths[name]}
    </svg>
  )
}
