/** Iconografia do moodboard REBUILT — "traço grosso": Engrenagem, Tijolos, Martelo, Arco/Ruína. */
type P = { className?: string; size?: number }
const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 48 48',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
})

export const Gear = ({ className, size = 48 }: P) => (
  <svg {...base(size)} className={className}>
    <circle cx="24" cy="24" r="7" />
    <path d="M24 4v7M24 37v7M4 24h7M37 24h7M9.9 9.9l5 5M33.1 33.1l5 5M9.9 38.1l5-5M33.1 14.9l5-5" />
    <circle cx="24" cy="24" r="14" />
  </svg>
)

export const Bricks = ({ className, size = 48 }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="5" y="9" width="38" height="30" />
    <path d="M5 19h38M5 29h38M18 9v10M32 19v10M18 29v10" />
  </svg>
)

export const Hammer = ({ className, size = 48 }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M22 18 8 40l4 3 17-20" />
    <path d="M16 12l10-6 14 10-5 6-8-4-6 5z" />
  </svg>
)

export const Arch = ({ className, size = 48 }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M6 42V22a18 18 0 0 1 36 0v20" />
    <path d="M15 42V24a9 9 0 0 1 18 0v18" />
    <path d="M3 42h42" />
  </svg>
)
