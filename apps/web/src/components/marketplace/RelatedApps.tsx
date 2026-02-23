import { useAllApps } from "@/hooks/queries/useAllApps"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Button } from "@repo/ui"
import { Link } from "react-router-dom"
import { Loader2 } from "lucide-react"

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

  // Filter out current app and optionally filter by sector if available
  // If not enough apps in same sector, fall back to all apps
  let relatedApps = apps.filter(app => app._id !== currentAppId)
  
  const sameSectorApps = currentSectorId 
    ? relatedApps.filter(app => app.sectors?.some((s: any) => s._id === currentSectorId))
    : []

  // Prioritize same sector apps, but ensure we have at least 3 if possible
  if (sameSectorApps.length > 0) {
    // If we have enough same sector apps, use them. Otherwise mix them with others.
    if (sameSectorApps.length >= 3) {
      relatedApps = sameSectorApps
    } else {
      const otherApps = relatedApps.filter(app => !sameSectorApps.includes(app))
      relatedApps = [...sameSectorApps, ...otherApps]
    }
  }

  // Shuffle and take 3
  const displayedApps = relatedApps
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)

  if (displayedApps.length === 0) return null

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">You may also like</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayedApps.map((app) => (
          <Link key={app._id} to={`/marketplace/${app.slug}`} className="group h-full">
            <Card className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-all duration-300 border-transparent hover:border-primary/20">
              <div className="aspect-video bg-muted relative overflow-hidden">
                {app.mainImage ? (
                  <img
                    src={app.mainImage}
                    alt={app.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary text-secondary-foreground">
                    <span className="text-sm font-medium">No Image</span>
                  </div>
                )}
                {app.isFree && (
                  <Badge className="absolute top-2 right-2 bg-green-600">Free</Badge>
                )}
              </div>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                  {app.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-sm mt-1 min-h-10">
                  {app.shortDescription}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 mt-auto">
                 <div className="flex items-center justify-between pt-4 border-t mt-2">
                    <span className="font-bold text-lg">
                      {app.isFree ? "Free" : `GHS${app.price}`}
                    </span>
                    <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform">
                      View
                    </Button>
                 </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
