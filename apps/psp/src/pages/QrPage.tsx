/**
 * /qr/:code — the printed poster route.
 *
 * No token, so the employee identifies with their phone number instead, then
 * the same PIN and the same server-side checks. Costs no SMS credits at all,
 * which makes it the cheapest way for a single-site workplace to run this.
 *
 * The code in the URL is a public organization slug, not a secret: it only
 * reaches this form. Everything that matters is still the PIN and the geofence.
 *
 * ONE ACTION AT A TIME, same as the SMS route. This page used to ask "clock in
 * or clock out?" on the first screen, before it knew who was standing there —
 * which offered a choice that isn't one (the server refuses a clock-out on a
 * day with no clock-in) and then showed the verb a second time on the next
 * screen. It now asks for the phone number alone, and the moment the PIN lands
 * `get_attendance_state_by_phone` says which single action to offer. The PIN is
 * what makes that safe to ask: a phone number on its own must never reveal who
 * is on the roster or who is at work today.
 */
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import {
  getOrgByCode,
  getStateByPhone,
  type LinkState,
  type MarkResult,
  type OrgLookup,
} from '@/lib/api'
import { BigButton, Card, Notice, Shell, Spinner } from '@/components/Shell'
import { MarkForm } from '@/components/MarkForm'
import { markFailureMessage } from '@/lib/markMessages'
import { RecordUnlock } from '@/components/RecordUnlock'
import { formatTime, greeting } from '@/lib/format'

export function QrPage() {
  const { code = '' } = useParams<{ code: string }>()

  const [org, setOrg] = useState<OrgLookup | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [phone, setPhone] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [result, setResult] = useState<MarkResult | null>(null)

  // What the server says to offer, once the PIN has identified them.
  const [link, setLink] = useState<LinkState | null>(null)
  const [resolving, setResolving] = useState(false)
  const [pinError, setPinError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      setOrg(await getOrgByCode(code))
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not load this page.')
    } finally {
      setLoading(false)
    }
  }, [code])

  useEffect(() => {
    void load()
  }, [load])

  /**
   * Runs on the fourth digit. A refusal is reported in the PIN field rather
   * than as a whole new screen: they are one keystroke from fixing it, and
   * throwing them back to the phone number would mean retyping that too.
   */
  const resolveAction = async (pin: string) => {
    if (!org || org.state !== 'ok') return
    setResolving(true)
    setPinError(null)
    setLink(null)
    try {
      const state = await getStateByPhone({ orgId: org.organization_id!, phone, pin })
      if (state.state === 'ok') {
        setLink(state)
      } else if (state.state === 'invalid_credentials') {
        // Deliberately vague, matching the server: naming which half was wrong
        // would turn this box into a roster lookup.
        setPinError('That number and PIN don’t match. Check both and try again.')
      } else {
        const { body } = markFailureMessage(state.state)
        setPinError(body)
      }
    } catch (err) {
      setPinError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
    } finally {
      setResolving(false)
    }
  }

  /** Back to the phone screen, with nothing carried over. */
  const startOver = () => {
    setConfirmed(false)
    setLink(null)
    setPinError(null)
    setResult(null)
  }

  if (loading) {
    return (
      <Shell>
        <Spinner label="Loading…" />
      </Shell>
    )
  }

  if (loadError) {
    return (
      <Shell>
        <Notice tone="error" title="Could not connect" body={loadError}>
          <BigButton onClick={() => void load()}>Try again</BigButton>
        </Notice>
      </Shell>
    )
  }

  if (!org || org.state !== 'ok') {
    return (
      <Shell>
        <Notice
          tone="warning"
          title="We don't recognise this code"
          body="Check the poster and try again, or ask your manager."
        />
      </Shell>
    )
  }

  if (!org.self_marking_enabled) {
    return (
      <Shell org={org.organization_name}>
        <Notice
          tone="neutral"
          title="Self-marking is switched off"
          body="Your workplace is not using this yet. Your manager will mark your attendance."
        />
      </Shell>
    )
  }

  // ---- marked -------------------------------------------------------------
  if (result?.state === 'success') {
    return (
      <Shell org={org.organization_name}>
        <div className="space-y-4">
          <Card className="text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
            <h1 className="mt-3 text-xl font-semibold text-slate-900">
              {result.action === 'clock_in' ? 'You are clocked in' : 'You are clocked out'}
            </h1>
            {result.employee_name && (
              <p className="mt-0.5 text-sm text-slate-500">{result.employee_name}</p>
            )}
            <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">
              {formatTime(result.marked_at)}
            </p>
            {result.location_name && (
              <p className="mt-1 text-sm text-slate-500">{result.location_name}</p>
            )}
          </Card>
          <RecordUnlock phone={phone} orgId={org.organization_id} />
        </div>
      </Shell>
    )
  }

  // The success branch above already returned, so anything still here failed.
  if (result) {
    const { title, body } = markFailureMessage(result.state)
    return (
      <Shell org={org.organization_name}>
        <Notice
          tone={result.state === 'already_marked' ? 'neutral' : 'warning'}
          title={result.state === 'already_marked' ? 'Already marked' : title}
          body={
            result.state === 'already_marked'
              ? 'Your attendance for today is already recorded.'
              : body
          }
        >
          <BigButton onClick={() => setResult(null)}>Try again</BigButton>
        </Notice>
      </Shell>
    )
  }

  // ---- who are you? -------------------------------------------------------
  // Phone number only. No clock in / clock out here: at this point the page has
  // no idea who is holding it, so it cannot know which one to offer, and asking
  // is how somebody ends up tapping the wrong one.
  if (!confirmed) {
    return (
      <Shell org={org.organization_name}>
        <Card>
          <h1 className="text-xl font-semibold text-slate-900">{greeting()}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Enter your phone number to mark your attendance.
          </p>

          <form
            className="mt-5 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              if (phone.replace(/\D/g, '').length >= 9) setConfirmed(true)
            }}
          >
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                Phone number
              </label>
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0241234567"
                className="w-full h-14 rounded-xl border border-slate-300 bg-white px-4 text-lg text-slate-900"
              />
            </div>

            <BigButton type="submit" disabled={phone.replace(/\D/g, '').length < 9}>
              Continue
            </BigButton>
          </form>
        </Card>
      </Shell>
    )
  }

  // ---- nothing left to do today -------------------------------------------
  if (link?.next_action === 'done') {
    return (
      <Shell org={org.organization_name}>
        <div className="space-y-4">
          <Notice
            tone="success"
            title="You're all done today"
            body={
              <>
                In at <strong>{formatTime(link.clock_in_at)}</strong>, out at{' '}
                <strong>{formatTime(link.clock_out_at)}</strong>.
              </>
            }
          />
          <RecordUnlock phone={phone} orgId={org.organization_id} />
        </div>
      </Shell>
    )
  }

  // ---- PIN, then the one action -------------------------------------------
  const action = link?.next_action === 'clock_out' ? 'clock_out' : link ? 'clock_in' : null

  return (
    <Shell org={org.organization_name}>
      <MarkForm
        action={action}
        // Assume proximity is needed until told otherwise, so the GPS fix is
        // already being acquired while they type rather than starting after.
        proximityRequired={link ? link.proximity_required !== false : true}
        phone={phone}
        orgId={org.organization_id}
        heading={
          action === 'clock_out'
            ? `Finishing up${link?.employee_name ? `, ${link.employee_name}` : ''}?`
            : action === 'clock_in'
              ? `${greeting()}${link?.employee_name ? `, ${link.employee_name}` : ''}`
              : 'Enter your PIN'
        }
        subheading={
          action === 'clock_out' && link?.clock_in_at
            ? `You clocked in at ${formatTime(link.clock_in_at)}`
            : phone
        }
        onPinComplete={(pin) => void resolveAction(pin)}
        resolving={resolving}
        pinError={pinError}
        onResult={(r) => setResult(r)}
      />
      <button
        type="button"
        onClick={startOver}
        className="mt-4 w-full text-center text-sm text-slate-500 underline underline-offset-2"
      >
        Use a different number
      </button>
    </Shell>
  )
}
