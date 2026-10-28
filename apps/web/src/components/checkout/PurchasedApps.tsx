import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@repo/ui"
import { Download, Globe } from "lucide-react"
import { client, groq } from "@/lib/sanity"

const appsQuery = groq`
  *[_type == "premiumApp" && _id in $ids]{
    _id, title, "slug": slug.current,
    "windows": platforms.desktop.windows.available,
    "webAppUrl": select(platforms.web.available => platforms.web.webAppUrl, null)
  }
`

interface PurchasedApp {
  _id: string
  title: string
  slug: string
  windows?: boolean
  webAppUrl?: string | null
}

/** "What now": a download and/or web-app link for each app just bought or trialled. */
export function PurchasedApps({ productIds }: { productIds: string[] }) {
  const { data: apps = [] } = useQuery({
    queryKey: ["purchased-apps", productIds],
    queryFn: () => client.fetch<PurchasedApp[]>(appsQuery, { ids: productIds }),
    enabled: productIds.length > 0,
  })

  if (!apps.length) return null
  return (
    <div className="space-y-3 text-left">
      {apps.map((app) => (
        <div key={app._id} className="rounded-lg border p-4">
          <p className="mb-3 font-medium">{app.title}</p>
          <div className="flex flex-wrap gap-2">
            {app.windows && (
              <Button asChild size="sm" className="gap-2">
                <Link to={`/marketplace/${app.slug}/download`}>
                  <Download className="h-4 w-4" /> Download for Windows
                </Link>
              </Button>
            )}
            {app.webAppUrl && (
              <Button asChild size="sm" variant="outline" className="gap-2">
                <a href={app.webAppUrl} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4" /> Open web app
                </a>
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
