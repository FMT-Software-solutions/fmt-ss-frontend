/**
 * Four digits, one box.
 *
 * Deliberately NOT four separate boxes: on Android those fight the keyboard,
 * break paste, and confuse autofill, and the fiddliness lands on exactly the
 * people least able to absorb it. One input with a numeric keypad and wide
 * letter-spacing reads the same and behaves properly.
 */
import { useEffect, useRef } from 'react'

export function PinInput({
  value,
  onChange,
  onComplete,
  disabled,
  label = 'Your 4-digit PIN',
  autoFocus = true,
}: {
  value: string
  onChange: (value: string) => void
  onComplete?: () => void
  disabled?: boolean
  label?: string
  autoFocus?: boolean
}) {
  const ref = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (autoFocus) ref.current?.focus()
  }, [autoFocus])

  return (
    <div className="space-y-2">
      <label htmlFor="pin" className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        ref={ref}
        id="pin"
        // `tel` rather than `number`: gives the numeric keypad without the
        // spinner, the scroll-to-change behaviour, or the leading-zero loss.
        type="tel"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={4}
        value={value}
        disabled={disabled}
        onChange={(e) => {
          const next = e.target.value.replace(/\D/g, '').slice(0, 4)
          onChange(next)
          if (next.length === 4) onComplete?.()
        }}
        className="w-full h-16 rounded-xl border border-slate-300 bg-white text-center text-3xl font-semibold tracking-[0.5em] indent-[0.5em] text-slate-900 disabled:bg-slate-100"
        placeholder="••••"
      />
    </div>
  )
}
