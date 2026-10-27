import { Link } from "react-router-dom"
import { Button } from "@repo/ui"
import { Globe, Monitor, Smartphone } from "lucide-react"

const KINDS = [
  { icon: Globe, title: "Web apps", text: "Portals, dashboards and online systems" },
  { icon: Monitor, title: "Desktop apps", text: "Windows software for your office or shop" },
  { icon: Smartphone, title: "Mobile apps", text: "Android and iOS apps for your customers or staff" },
]

/** The agency side of the business, kept to one section. */
export function CustomSoftwareSection() {
  return (
    <section className="py-20">
      <div className="container px-4 md:px-6">
        <div className="grid items-center gap-10 rounded-2xl border bg-card p-8 md:p-12 lg:grid-cols-2">
          <div className="space-y-5">
            <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">Need something custom?</h2>
            <p className="text-muted-foreground">We build software around how your business works.</p>
            <Button asChild size="lg">
              <Link to="/request-quote">Request a quote</Link>
            </Button>
          </div>
          <div className="grid gap-3">
            {KINDS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-start gap-4 rounded-lg bg-muted/40 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
