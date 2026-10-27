import { useAllApps } from "@/hooks/queries/useAllApps"
import { Loader2 } from "lucide-react"
import { AppCard } from "./AppCard"
import { sortRecommended } from "@/lib/apps"

interface RelatedAppsProps {
  currentAppId: string
  currentSectorId?: string
}

export function RelatedApps({ currentAppId, currentSectorId }: RelatedAppsProps) {
  const { data: apps = [], isLoading } = useAllApps()

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Same-sector apps first, then the rest, in the marketplace's recommended order.
  const others = sortRecommended(apps.filter((app) => app._id !== currentAppId))
  const inSector = (app: (typeof others)[number]) => !!currentSectorId && !!app.sectors?.some((s) => s._id === currentSectorId)
  const displayedApps = [...others.filter(inSector), ...others.filter((app) => !inSector(app))].slice(0, 3)

  if (displayedApps.length === 0) return null

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">You may also like</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayedApps.map((app) => (
          <AppCard key={app._id} app={app} />
        ))}
      </div>
    </div>
  )
}
