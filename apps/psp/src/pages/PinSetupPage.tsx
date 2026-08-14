/**
 * /p/:token — set or reset a PIN from an admin-issued link.
 *
 * The link arrives by SMS on the employee's own phone, which is what proves
 * who they are; there is no separate OTP because it would prove the same fact
 * a second time, cost another credit, and add a step for people who find the
 * whole thing unfamiliar already.
 *
 * Single-use and short-lived, so a forwarded old message is worthless.
 */
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { setPin } from '@/lib/api'
import { BigButton, Card, Notice, Shell } from '@/components/Shell'
import { PinInput } from '@/components/PinInput'

export function PinSetupPage() {
  const { token = '' } = useParams<{ token: string }>()

  const [pin, setPinValue] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const submit = async () => {
    if (pin.length < 4) {
      setError('Choose a 4-digit PIN.')
      return
    }
    if (pin !== confirm) {
      setError('The two PINs are different. Enter the same one twice.')
      return
    }
    // Not enforced server-side — a determined person can still pick 1234 — but
    // worth one nudge, since this is the only thing between a lost phone and
    // somebody else's attendance.
    if (/^(\d)\1{3}$/.test(pin) || pin === '1234' || pin === '0000') {
      setError('That PIN is too easy to guess. Choose another.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const result = await setPin(token, pin)
      if (result.state === 'pin_set') {
        setDone(true)
        return
      }
      setError(
        result.state === 'invalid_pin_format'
          ? 'A PIN must be exactly four digits.'
          : 'This link has expired or has already been used. Ask your manager for a new one.'
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your PIN.')
    } finally {
      setSaving(false)
    }
  }

  if (done) {
    return (
      <Shell>
        <Card className="text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
          <h1 className="mt-3 text-xl font-semibold text-slate-900">Your PIN is set</h1>
          <p className="mt-2 text-sm text-slate-600">
            Use it each day with the attendance link you receive. Keep it to yourself — anyone
            who knows it can view your personal details.
          </p>
        </Card>
      </Shell>
    )
  }

  return (
    <Shell>
      <Card>
        <h1 className="text-xl font-semibold text-slate-900">Choose your PIN</h1>
        <p className="mt-1 text-sm text-slate-500">
          Four digits you will remember. You will enter it each time you clock in or out.
        </p>

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
              setPinValue(v)
              setError(null)
            }}
            disabled={saving}
            label="New PIN"
          />
          <PinInput
            value={confirm}
            onChange={(v) => {
              setConfirm(v)
              setError(null)
            }}
            disabled={saving}
            label="Enter it again"
            autoFocus={false}
          />

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <BigButton type="submit" disabled={saving || pin.length < 4 || confirm.length < 4}>
            {saving ? 'Saving…' : 'Save my PIN'}
          </BigButton>
        </form>
      </Card>

      <div className="mt-4">
        <Notice
          tone="neutral"
          title="Keep it private"
          body="Your PIN is stored scrambled — not even your manager can see it. If you forget it, they can send you a new link."
        />
      </div>
    </Shell>
  )
}
