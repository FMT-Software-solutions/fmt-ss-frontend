import { CalendarClock, MessageCircle, RefreshCw, Smartphone, Timer } from "lucide-react"

const ITEMS = [
  { icon: Smartphone, title: "Mobile Money or card" },
  { icon: CalendarClock, title: "Pay in instalments" },
  { icon: Timer, title: "Free trials" },
  { icon: RefreshCw, title: "Regular updates" },
  { icon: MessageCircle, title: "Support on WhatsApp" },
]

/** Why buy here, in five words or fewer each. */
export function ValueStrip() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {ITEMS.map(({ icon: Icon, title }) => (
        <div key={title} className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-medium">{title}</span>
        </div>
      ))}
    </div>
  )
}
