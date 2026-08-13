/**
 * The frame every page sits in.
 *
 * Built for one situation: someone standing outside a workshop at 7am, on a
 * mid-range Android, in sunlight, possibly with one hand full. So: one column,
 * large type, high contrast, and nothing below the fold that matters.
 */
import type { ReactNode } from 'react'

export function Shell({
  org,
  children,
  footer,
}: {
  org?: string | null
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="min-h-dvh bg-slate-100 flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-md flex-1 flex flex-col">
        {org && (
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
            {org}
          </p>
        )}
        <div className="flex-1">{children}</div>
        <div className="pt-6 text-center text-[11px] text-slate-400">
          {footer ?? 'PrintSuite Pro'}
        </div>
      </div>
    </div>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white shadow-sm border border-slate-200 p-5 ${className}`}>
      {children}
    </div>
  )
}

/** Full-width, thumb-sized. The only control on most of these screens. */
export function BigButton({
  children,
  onClick,
  disabled,
  type = 'button',
  tone = 'primary',
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
  tone?: 'primary' | 'ghost'
}) {
  const tones = {
    primary: 'bg-slate-900 text-white active:bg-slate-800 disabled:bg-slate-300',
    ghost: 'bg-white text-slate-700 border border-slate-300 active:bg-slate-50',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full min-h-14 rounded-xl text-base font-semibold transition-colors disabled:cursor-not-allowed ${tones[tone]}`}
    >
      {children}
    </button>
  )
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      {label && <p className="text-sm text-slate-500">{label}</p>}
    </div>
  )
}

/**
 * Terminal screens: success, or a failure someone has to act on. Deliberately
 * one message and at most one action — a wall of options is the last thing
 * anyone wants when the thing they expected to work didn't.
 */
export function Notice({
  tone,
  title,
  body,
  children,
}: {
  tone: 'success' | 'warning' | 'error' | 'neutral'
  title: string
  body?: ReactNode
  children?: ReactNode
}) {
  const tones = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    error: 'bg-rose-50 border-rose-200 text-rose-900',
    neutral: 'bg-white border-slate-200 text-slate-900',
  }
  return (
    <div className={`rounded-2xl border p-5 ${tones[tone]}`}>
      <h1 className="text-lg font-semibold">{title}</h1>
      {body && <div className="mt-1.5 text-sm opacity-90">{body}</div>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}
