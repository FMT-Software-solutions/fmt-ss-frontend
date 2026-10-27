import { Link } from "react-router-dom"
import { Button, Card } from "@repo/ui"
import { ArrowRight } from "lucide-react"
import { useAllApps } from "@/hooks/queries/useAllApps"
import { AppCard } from "@/components/marketplace/AppCard"
import { sortRecommended } from "@/lib/apps"

/** Every published app, in the marketplace's recommended order. */
export function AppsShowcase() {
  const { data: apps = [], isLoading, error } = useAllApps()

  return (
    <section id="apps" className="bg-muted/30 py-20">
      <div className="container px-4 md:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">Our apps</h2>
          <Button asChild variant="ghost" className="gap-1">
            <Link to="/marketplace">
              Marketplace <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {error ? (
          <p className="rounded-md bg-destructive/10 py-4 text-center text-destructive">Couldn't load the apps. Try again later.</p>
        ) : isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Card key={i} className="h-96 animate-pulse bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sortRecommended(apps).map((app) => (
              <AppCard key={app._id} app={app} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
