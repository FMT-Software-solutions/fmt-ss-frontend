import { CheckCircle2 } from "lucide-react"
import type { IPremiumApp } from "@/types/premium-app"

/** "Why <app>": the problems it solves. Renders nothing until benefits are added in Sanity. */
export function AppBenefits({ app }: { app: IPremiumApp }) {
  if (!app.benefits?.length) return null
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Why {app.title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {app.benefits.map((benefit) => (
          <div key={benefit.title} className="rounded-lg border bg-card p-5">
            <CheckCircle2 className="mb-3 h-5 w-5 text-primary" />
            <p className="font-semibold">{benefit.title}</p>
            {benefit.description && <p className="mt-1 text-sm text-muted-foreground">{benefit.description}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}

export function AppFaqs({ faqs }: { faqs: NonNullable<IPremiumApp["faqs"]> }) {
  return (
    <div className="max-w-3xl divide-y rounded-lg border">
      {faqs.map((faq) => (
        <details key={faq.question} className="group p-5">
          <summary className="cursor-pointer list-none font-medium marker:hidden">
            <span className="flex items-center justify-between gap-4">
              {faq.question}
              <span className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
            </span>
          </summary>
          <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{faq.answer}</p>
        </details>
      ))}
    </div>
  )
}
