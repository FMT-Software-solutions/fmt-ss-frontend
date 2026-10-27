import { Link } from "react-router-dom"
import { Globe, Monitor } from "lucide-react"
import { Badge, Card } from "@repo/ui"
import type { MarketplaceApp } from "@/lib/apps"
import { getPriceDetails } from "@/lib/pricing"

/** The marketplace card, shared by the homepage and the marketplace. */
export function AppCard({ app }: { app: MarketplaceApp }) {
  const { finalPrice, originalPrice, hasActivePromotion, discountPercentage, isFree } = getPriceDetails(app)
  const version = app.releases?.[0]?.version
  const windows = app.platforms?.desktop?.windows?.available
  const web = app.platforms?.web?.available

  return (
    <Link to={`/marketplace/${app.slug}`} className="group h-full">
      <Card className="flex h-full flex-col overflow-hidden border-transparent transition-all duration-300 hover:border-primary/20 hover:shadow-lg">
        <div className="relative aspect-video overflow-hidden bg-muted">
          {app.mainImage ? (
            <img
              src={app.mainImage}
              alt={app.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : null}
          {hasActivePromotion && !isFree && (
            <Badge className="absolute left-2 top-2 border-none bg-green-600 text-white shadow-sm hover:bg-green-700">
              -{discountPercentage}%
            </Badge>
          )}
          {app.sectors?.[0] && (
            <Badge className="absolute right-2 top-2 bg-background/90 text-foreground shadow-sm backdrop-blur-sm hover:bg-background">
              {app.sectors[0].name}
            </Badge>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="space-y-1">
            <h3 className="line-clamp-1 text-lg font-semibold transition-colors group-hover:text-primary">{app.title}</h3>
            <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">{app.tagline || app.shortDescription}</p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {!isFree && app.hasTrialUsage && (
              <Badge variant="secondary" className="font-normal">
                {app.trialDays ? `${app.trialDays}-day free trial` : "Free trial"}
              </Badge>
            )}
            {!isFree && app.paymentPlans?.enabled !== false && (
              <Badge variant="secondary" className="font-normal">Instalments</Badge>
            )}
          </div>

          <div className="mt-auto flex items-end justify-between border-t pt-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {windows && <Monitor className="h-3.5 w-3.5" aria-label="Windows" />}
              {web && <Globe className="h-3.5 w-3.5" aria-label="Web" />}
              {version && <span>v{version}</span>}
            </div>
            {isFree ? (
              <span className="text-lg font-bold text-green-600">Free</span>
            ) : (
              <div className="text-right leading-tight">
                {hasActivePromotion && (
                  <span className="block text-xs text-muted-foreground line-through">GHS {originalPrice}</span>
                )}
                <span className="text-lg font-bold">GHS {finalPrice}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}
