/**
 * The marking form itself, shared by the SMS-link and QR routes.
 *
 * Identity differs between them — a token, or a phone number plus org — but
 * everything after that is identical, so it lives here once.
 *
 * Location is requested on mount rather than on submit. Getting a GPS fix takes
 * several seconds; doing it while somebody types their PIN means the tap is
 * instant instead of hanging on a spinner they can't explain.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { MapPin, ShieldCheck } from 'lucide-react'
import {
  LOCATION_MESSAGE,
  getPosition,
  markAttendance,
  type Fix,
  type LocationFailure,
  type MarkAction,
  type MarkResult,
} from '@/lib/api'
import { BigButton, Card } from './Shell'
import { PinInput } from './PinInput'

interface MarkFormProps {
  action: MarkAction
  proximityRequired: boolean
  token?: string | null
  phone?: string | null
  orgId?: string | null
  /** Shown above the action, e.g. "Good morning, Kofi". */
  heading: string
  subheading?: string
  onResult: (result: MarkResult, pin: string) => void
}

export function MarkForm({
  action,
  proximityRequired,
  token,
  phone,
  orgId,
  heading,
  subheading,
  onResult,
}: MarkFormProps) {
  const [pin, setPin] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [fix, setFix] = useState<Fix | null>(null)
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState<LocationFailure | null>(null)

  const acquire = useCallback(async () => {
    if (!proximityRequired) return
    setLocating(true)
    setLocationError(null)
    try {
      setFix(await getPosition())
    } catch (failure) {
      setFix(null)
      setLocationError(failure as LocationFailure)
    } finally {
      setLocating(false)
    }
  }, [proximityRequired])

  // Start looking for the phone straight away, once.
  const started = useRef(false)
  useEffect(() => {
    if (started.current) return
    started.current = true
    void acquire()
  }, [acquire])

  const submit = async () => {
    if (pin.length < 4) {
      setError('Enter your 4-digit PIN.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      // If the background attempt failed or hasn't landed yet, try once more
      // now — they may have granted permission in the meantime.
      let current = fix
      if (proximityRequired && !current) {
        try {
          current = await getPosition()
          setFix(current)
          setLocationError(null)
        } catch (failure) {
          setLocationError(failure as LocationFailure)
          setSubmitting(false)
          return
        }
      }

      const result = await markAttendance({
        action,
        token,
        phone,
        orgId,
        pin,
        lat: current?.lat ?? null,
        lng: current?.lng ?? null,
        accuracy: current?.accuracy ?? null,
      })
      onResult(result, pin)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const verb = action === 'clock_in' ? 'Clock in' : 'Clock out'

  return (
    <Card>
      <h1 className="text-xl font-semibold text-slate-900">{heading}</h1>
      {subheading && <p className="mt-0.5 text-sm text-slate-500">{subheading}</p>}

      <form
        className="mt-5 space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
      >
        <PinInput
          value={pin}
          onChange={(v) => {
            setPin(v)
            setError(null)
          }}
          disabled={submitting}
        />

        {error && <p className="text-sm text-rose-600">{error}</p>}

        {proximityRequired && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm">
            {locating ? (
              <span className="flex items-center gap-2 text-slate-600">
                <MapPin className="h-4 w-4 shrink-0 animate-pulse" />
                Finding your location…
              </span>
            ) : fix ? (
              <span className="flex items-center gap-2 text-emerald-700">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                Location ready
              </span>
            ) : (
              <div className="space-y-2">
                <p className="text-amber-800">
                  {locationError ? LOCATION_MESSAGE[locationError] : 'Location is needed to mark attendance.'}
                </p>
                <button
                  type="button"
                  onClick={() => void acquire()}
                  className="text-sm font-semibold text-slate-900 underline underline-offset-2"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        )}

        <BigButton type="submit" disabled={submitting || pin.length < 4}>
          {submitting ? 'Checking…' : verb}
        </BigButton>
      </form>
    </Card>
  )
}
