/**
 * / — what someone sees if they type the domain instead of following a link.
 *
 * Exists so a stray visit is a sentence rather than a blank page or a 404.
 * Deliberately gives nothing away: no organization list, no way to look anyone
 * up, no form. If you don't have a link, there is nothing here for you.
 */
import { Clock } from 'lucide-react'
import { Card, Shell } from '@/components/Shell'

export function LandingPage() {
  return (
    <Shell>
      <Card className="text-center">
        <Clock className="mx-auto h-12 w-12 text-slate-400" />
        <h1 className="mt-3 text-xl font-semibold text-slate-900">Attendance</h1>
        <p className="mt-2 text-sm text-slate-600">
          This is where staff mark that they have arrived at work.
        </p>
        <p className="mt-4 text-sm text-slate-600">
          Open the link your workplace sent you, or scan the QR code where you work. If you
          don&apos;t have either, ask your manager.
        </p>
      </Card>
    </Shell>
  )
}

/** Anything that isn't a real route. Same reasoning: say one true thing. */
export function NotFoundPage() {
  return (
    <Shell>
      <Card className="text-center">
        <h1 className="text-xl font-semibold text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          Check the link your workplace sent you, or scan the QR code where you work.
        </p>
      </Card>
    </Shell>
  )
}
