import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Badge, Button, Card, CardContent } from "@repo/ui"
import { ArrowLeft, Download, Globe, Loader2 } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { ReleaseNotesBody } from "@/components/marketplace/ReleaseNotes"
import { SEO } from "@/components/seo"
import { useAppDownloads } from "@/hooks/queries/useAppDownloads"
import { formatFileSize, formatReleaseDate } from "@/lib/release"
import type { IAppRelease } from "@/types/premium-app"

const details = (release: IAppRelease, os?: string) =>
  [formatReleaseDate(release.releaseDate), formatFileSize(release.fileSize), os].filter(Boolean).join(" · ")

export default function AppDownloadsPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: app, isLoading } = useAppDownloads(slug)

  if (isLoading) {
    return (
      <div className="container py-24 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const releases = app?.releases ?? []
  if (!app || !releases.length) {
    return (
      <div className="container py-24 text-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">{app ? "No downloads yet" : "App not found"}</h1>
        <Button asChild>
          <Link to={app ? `/marketplace/${app.slug}` : "/marketplace"}>{app ? `Back to ${app.title}` : "Back to Marketplace"}</Link>
        </Button>
      </div>
    )
  }

  const [latest, ...previous] = releases
  const os = app.systemRequirements?.os?.length ? app.systemRequirements.os.join(", ") : "Windows 10 or later"
  const webAppUrl = app.platforms?.web?.available ? app.platforms.web.webAppUrl : undefined

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`Download ${app.title}`}
        description={`Download ${app.title} ${latest.version} for Windows, plus every earlier version with its release notes.`}
        image={app.mainImage}
      />

      <div className="container max-w-3xl py-10 md:py-14 space-y-10">
        <div className="space-y-4">
          <Link
            to={`/marketplace/${app.slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> {app.title}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Download {app.title}</h1>
        </div>

        <Card className="border-2 border-primary/20 shadow-lg shadow-primary/5">
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">Version {latest.version}</h2>
                  <Badge>Recommended</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{details(latest, os)}</p>
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                {latest.downloadUrl && (
                  <Button size="lg" className="gap-2 shadow-lg shadow-primary/20" asChild>
                    <a href={latest.downloadUrl} download>
                      <Download className="h-5 w-5" /> Download for Windows
                    </a>
                  </Button>
                )}
                {webAppUrl && (
                  <Button variant="ghost" size="sm" className="gap-2" asChild>
                    <a href={webAppUrl} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4" /> Open web app
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {latest.notes && (
              <div className="border-t pt-5">
                <ReleaseNotesBody text={latest.notes} />
              </div>
            )}
          </CardContent>
        </Card>

        {previous.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Previous versions</h2>
            <Accordion type="multiple" className="rounded-lg border divide-y">
              {previous.map((release) => (
                <AccordionItem key={release.version} value={release.version} className="border-b-0 px-4">
                  <div className="flex items-center gap-3">
                    <AccordionTrigger className="flex-1 py-4 hover:no-underline" disabled={!release.notes}>
                      <span className="flex flex-wrap items-baseline gap-x-3 text-left">
                        <span className="font-medium">Version {release.version}</span>
                        <span className="text-sm font-normal text-muted-foreground">{details(release)}</span>
                      </span>
                    </AccordionTrigger>
                    {release.downloadUrl && (
                      <Button variant="outline" size="sm" className="gap-2 shrink-0" asChild>
                        <a href={release.downloadUrl} download aria-label={`Download version ${release.version}`}>
                          <Download className="h-4 w-4" /> <span className="hidden sm:inline">Download</span>
                        </a>
                      </Button>
                    )}
                  </div>
                  {release.notes && (
                    <AccordionContent className="pb-5">
                      <ReleaseNotesBody text={release.notes} />
                    </AccordionContent>
                  )}
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        )}
      </div>
    </div>
  )
}
