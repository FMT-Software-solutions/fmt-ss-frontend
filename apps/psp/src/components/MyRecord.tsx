/**
 * "Did that register, and how am I doing this month?"
 *
 * Shown after marking, where the employee has just proved who they are, so it
 * costs them no extra step. Everything here is their own record only — the
 * server scopes it to the authenticated employee and returns nothing else.
 */
import { Card } from './Shell'
import { formatDuration, formatShortDate, formatTime } from '@/lib/format'
import type { SelfService } from '@/lib/api'

export function MyRecord({ data }: { data: SelfService }) {
  if (data.state !== 'ok' || !data.employee || !data.month) return null

  const { employee, month, days = [] } = data
  // Only days that have already happened are worth listing; a workday later
  // this month showing "Absent" would be alarming and wrong.
  const past = days.filter((d) => d.clock_in_at || new Date(`${d.work_date}T23:59:59`) < new Date())

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold text-slate-900">{employee.full_name}</h2>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {employee.position && (
            <Detail label="Position" value={employee.position} />
          )}
          {employee.employee_code && (
            <Detail label="Staff number" value={employee.employee_code} />
          )}
          {employee.branch_name && <Detail label="Branch" value={employee.branch_name} />}
          {employee.department_name && (
            <Detail label="Department" value={employee.department_name} />
          )}
          {employee.phone && <Detail label="Phone" value={employee.phone} />}
        </dl>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-slate-900">This month</h3>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Stat label="On time" value={month.present_days - month.late_days} tone="good" />
          <Stat label="Late" value={month.late_days} tone={month.late_days > 0 ? 'warn' : 'plain'} />
          <Stat label="Missed" value={month.absent_days} tone={month.absent_days > 0 ? 'bad' : 'plain'} />
        </div>
        <p className="mt-3 text-center text-xs text-slate-500">
          {month.present_days} of {month.expected_days} working days ·{' '}
          {formatDuration(month.worked_minutes)} worked
        </p>
      </Card>

      {past.length > 0 && (
        <Card className="!p-0 overflow-hidden">
          <h3 className="px-5 pt-5 pb-3 text-sm font-semibold text-slate-900">Your days</h3>
          <ul className="divide-y divide-slate-100">
            {past.map((day) => (
              <li key={day.work_date} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800">
                    {formatShortDate(day.work_date)}
                  </p>
                  <p className="text-xs text-slate-500 tabular-nums">
                    {day.clock_in_at
                      ? `${formatTime(day.clock_in_at)} → ${
                          day.clock_out_at ? formatTime(day.clock_out_at) : 'still in'
                        }`
                      : 'No mark'}
                  </p>
                  {day.location && (
                    <p className="text-xs text-slate-400 truncate">{day.location}</p>
                  )}
                </div>
                <StatusPill
                  status={day.clock_in_at ? (day.status ?? 'on_time') : 'absent'}
                />
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-slate-800">{value}</dd>
    </div>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'good' | 'warn' | 'bad' | 'plain'
}) {
  const tones = {
    good: 'text-emerald-700',
    warn: 'text-amber-700',
    bad: 'text-rose-700',
    plain: 'text-slate-800',
  }
  return (
    <div className="rounded-xl bg-slate-50 py-3">
      <p className={`text-2xl font-bold tabular-nums ${tones[tone]}`}>{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  )
}

function StatusPill({ status }: { status: 'on_time' | 'late' | 'absent' }) {
  const map = {
    on_time: { label: 'On time', className: 'bg-emerald-100 text-emerald-800' },
    late: { label: 'Late', className: 'bg-amber-100 text-amber-800' },
    absent: { label: 'Missed', className: 'bg-slate-100 text-slate-600' },
  }
  const { label, className } = map[status]
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
