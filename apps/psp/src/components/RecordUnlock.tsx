/**
 * "See my record" when the employee hasn't just proved who they are.
 *
 * Right after marking we already hold a verified PIN, so the record appears
 * without asking again. But someone reopening the link at 6pm — already clocked
 * out — has authenticated nothing this session, and their record is personal.
 * So it asks once, through the same PIN check and the same lockout as marking.
 */
import { useState } from 'react'
import { getSelfService, type SelfService } from '@/lib/api'
import { BigButton, Card, Spinner } from './Shell'
import { PinInput } from './PinInput'
import { MyRecord } from './MyRecord'

export function RecordUnlock({
  token,
  phone,
  orgId,
}: {
  token?: string | null
  phone?: string | null
  orgId?: string | null
}) {
  const [asking, setAsking] = useState(false)
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<SelfService | null>(null)

  if (data?.state === 'ok') return <MyRecord data={data} />

  if (!asking) {
    return (
      <BigButton tone="ghost" onClick={() => setAsking(true)}>
        See my record
      </BigButton>
    )
  }

  const submit = async () => {
    if (pin.length < 4) return
    setLoading(true)
    setError(null)
    try {
      const result = await getSelfService({ token, phone, orgId, pin })
      if (result.state === 'ok') {
        setData(result)
        return
      }
      setError(
        result.state === 'pin_locked'
          ? 'Too many wrong tries. This is locked for 15 minutes.'
          : 'That PIN was not right.'
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your record.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <form
        className="space-y-4"
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
          disabled={loading}
          label="Enter your PIN to see your record"
        />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        {loading ? (
          <Spinner />
        ) : (
          <BigButton type="submit" disabled={pin.length < 4}>
            Show my record
          </BigButton>
        )}
      </form>
    </Card>
  )
}
