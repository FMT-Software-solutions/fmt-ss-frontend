/**
 * /qr/:code — the printed poster route.
 *
 * No token, so the employee identifies with their phone number instead, then
 * the same PIN and the same server-side checks. Costs no SMS credits at all,
 * which makes it the cheapest way for a single-site workplace to run this.
 *
 * The code in the URL is a public organization slug, not a secret: it only
 * reaches this form. Everything that matters is still the PIN and the geofence.
 */
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { getOrgByCode, type MarkResult, type OrgLookup } from '@/lib/api'
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
  const [action, setAction] = useState<'clock_in' | 'clock_out'>('clock_in')
  const [result, setResult] = useState<MarkResult | null>(null)

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

            <div className="grid grid-cols-2 gap-2">
              {(['clock_in', 'clock_out'] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAction(a)}
                  className={`min-h-12 rounded-xl border text-sm font-semibold ${
                    action === a
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  {a === 'clock_in' ? 'Clock in' : 'Clock out'}
                </button>
              ))}
            </div>
            {/* The poster route can't know their state before they identify
                themselves, so unlike the SMS link it has to ask. The server
                still refuses a nonsensical pair. */}

            <BigButton type="submit" disabled={phone.replace(/\D/g, '').length < 9}>
              Continue
            </BigButton>
          </form>
        </Card>
      </Shell>
    )
  }

  return (
    <Shell org={org.organization_name}>
      <MarkForm
        action={action}
        proximityRequired
        phone={phone}
        orgId={org.organization_id}
        heading={action === 'clock_in' ? 'Clock in' : 'Clock out'}
        subheading={phone}
        onResult={(r) => setResult(r)}
      />
      <button
        type="button"
        onClick={() => setConfirmed(false)}
        className="mt-4 w-full text-center text-sm text-slate-500 underline underline-offset-2"
      >
        Use a different number
      </button>
    </Shell>
  )
}
