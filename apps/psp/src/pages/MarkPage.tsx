/**
 * /a/:token — the page the morning SMS link opens.
 *
 * Shows exactly ONE action: clock in if they haven't, clock out if they have,
 * a summary if they're done. Reopening the same link later in the day is what
 * produces the clock-out, which is why the token deliberately isn't single-use.
 */
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { getLinkState, getSelfService, type LinkState, type MarkResult, type SelfService } from '@/lib/api'
import { BigButton, Card, Notice, Shell, Spinner } from '@/components/Shell'
import { MarkForm } from '@/components/MarkForm'
import { markFailureMessage } from '@/lib/markMessages'
import { MyRecord } from '@/components/MyRecord'
import { RecordUnlock } from '@/components/RecordUnlock'
import { formatDate, formatTime, greeting } from '@/lib/format'

export function MarkPage() {
  const { token = '' } = useParams<{ token: string }>()

  const [link, setLink] = useState<LinkState | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [result, setResult] = useState<MarkResult | null>(null)
  const [record, setRecord] = useState<SelfService | null>(null)
  const [loadingRecord, setLoadingRecord] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      setLink(await getLinkState(token))
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not load this link.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void load()
  }, [load])

  /** After a successful mark, fetch their record with the PIN they just proved. */
  const showRecord = async (pin: string) => {
    setLoadingRecord(true)
    try {
      setRecord(await getSelfService({ token, pin }))
    } catch {
      // Their attendance is already marked; failing to also show the summary is
      // an annoyance, not a failure worth alarming them about.
      setRecord(null)
    } finally {
      setLoadingRecord(false)
    }
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

  if (!link || link.state !== 'ok') {
    return (
      <Shell>
        <Notice
          tone="warning"
          title="This link has expired"
          body="Attendance links only work on the day they were sent. Open today’s message, or ask your manager to mark you."
        />
      </Shell>
    )
  }

  if (link.self_marking_enabled === false) {
    return (
      <Shell org={link.organization_name}>
        <Notice
          tone="neutral"
          title="Self-marking is switched off"
          body="Your workplace is not using this yet. Your manager will mark your attendance."
        />
      </Shell>
    )
  }

  // ---- just marked --------------------------------------------------------
  if (result?.state === 'success') {
    const isIn = result.action === 'clock_in'
    return (
      <Shell org={link.organization_name}>
        <div className="space-y-4">
          <Card className="text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
            <h1 className="mt-3 text-xl font-semibold text-slate-900">
              {isIn ? 'You are clocked in' : 'You are clocked out'}
            </h1>
            <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">
              {formatTime(result.marked_at)}
            </p>
            {result.location_name && (
              <p className="mt-1 text-sm text-slate-500">{result.location_name}</p>
            )}
            <p className="mt-3 text-sm text-slate-500">
              {isIn
                ? 'Open this same link again when you finish, to clock out.'
                : 'Have a good evening.'}
            </p>
          </Card>

          {loadingRecord && <Spinner />}
          {record?.state === 'ok' && <MyRecord data={record} />}
        </div>
      </Shell>
    )
  }

  // ---- a mark that didn't go through --------------------------------------
  // The success branch above already returned, so anything still here failed.
  if (result) {
    const { title, body } = markFailureMessage(result.state)
    const canRetry = result.state !== 'self_mark_disabled' && result.state !== 'invalid_link'
    return (
      <Shell org={link.organization_name}>
        <Notice
          tone={result.state === 'already_marked' ? 'neutral' : 'warning'}
          title={result.state === 'already_marked' ? 'Already marked' : title}
          body={
            result.state === 'already_marked'
              ? `Your attendance for today is already recorded${
                  result.clock_in_at ? ` — you clocked in at ${formatTime(result.clock_in_at)}` : ''
                }.`
              : body
          }
        >
          {canRetry && (
            <BigButton
              onClick={() => {
                setResult(null)
                void load()
              }}
            >
              Try again
            </BigButton>
          )}
        </Notice>
      </Shell>
    )
  }

  // ---- nothing left to do today -------------------------------------------
  if (link.next_action === 'done') {
    return (
      <Shell org={link.organization_name}>
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
          <RecordUnlock token={token} />
        </div>
      </Shell>
    )
  }

  // ---- the one action -----------------------------------------------------
  const action = link.next_action === 'clock_out' ? 'clock_out' : 'clock_in'

  return (
    <Shell org={link.organization_name}>
      <MarkForm
        action={action}
        proximityRequired={link.proximity_required !== false}
        token={token}
        heading={
          action === 'clock_in'
            ? `${greeting()}${link.employee_name ? `, ${link.employee_name}` : ''}`
            : `Finishing up${link.employee_name ? `, ${link.employee_name}` : ''}?`
        }
        subheading={
          action === 'clock_in'
            ? formatDate(link.work_date)
            : `You clocked in at ${formatTime(link.clock_in_at)}`
        }
        onResult={(r, pin) => {
          setResult(r)
          if (r.state === 'success') void showRecord(pin)
        }}
      />
    </Shell>
  )
}
