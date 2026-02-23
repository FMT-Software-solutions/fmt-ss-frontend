import { useState } from "react"
import type { IPremiumApp } from "@/types/premium-app"
import { Button, Card } from "@repo/ui"
import { Download, ShoppingCart, ShieldCheck, Monitor, Smartphone, Globe } from "lucide-react"
import { Link } from "react-router-dom"
import { AccessRequestForm } from "./AccessRequestForm"
import { cn } from "@/lib/utils"

interface GetAccessCardProps {
  app: IPremiumApp
  className?: string
}

export function GetAccessCard({ app, className }: GetAccessCardProps) {
  // If app is free and doesn't require account, access is granted by default
  const [accessGranted, setAccessGranted] = useState(
    app.isFree && !app.requiresAccount
  )

  const hasTrial = !app.isFree && app.hasTrialUsage
  const isFreeAccess = app.isFree && app.requiresAccount

  // Check available platforms
  const platforms = app.platforms || {}
  const desktop = platforms.desktop
  const mobile = platforms.mobile
  const web = platforms.web

  const hasWindows = desktop?.windows?.available
  const hasMac = desktop?.macos?.available
  const hasLinux = desktop?.linux?.available
  const hasAndroid = mobile?.android?.available
  const hasIos = mobile?.ios?.available
  const hasWeb = web?.available

  const PlatformBadge = ({ icon: Icon, label }: { icon: any, label: string }) => (
    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full border">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
  )

  return (
    <Card className={cn("p-6 flex flex-col gap-6", className)}>
      <div className="space-y-4">
        {/* Platform Availability */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Available platforms</p>
          <div className="flex flex-wrap gap-2">
            {hasWindows && <PlatformBadge icon={Monitor} label="Windows" />}
            {hasMac && <PlatformBadge icon={Monitor} label="macOS" />}
            {hasLinux && <PlatformBadge icon={Monitor} label="Linux" />}
            {hasAndroid && <PlatformBadge icon={Smartphone} label="Android" />}
            {hasIos && <PlatformBadge icon={Smartphone} label="iOS" />}
            {hasWeb && <PlatformBadge icon={Globe} label="Web" />}
          </div>
        </div>

        {/* Requirements Notice */}
        {!accessGranted && app.isFree && (app.requiresAccount || hasTrial) && (
          <div className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 p-3 rounded-md border border-amber-200 dark:border-amber-900/50">
            <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              {app.requiresAccount
                ? "A Login account is required to use this application."
                : "Start a free trial to test this application."}
            </span>
          </div>
        )}
      </div>

      <div className="mt-auto space-y-3">
        {accessGranted ? (
          <div className="grid gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-sm font-medium text-muted-foreground mb-1">Download / Access Links:</p>

            {hasWindows && desktop?.windows?.downloadUrl && (
              <Button asChild variant="outline" className="w-full justify-start gap-2">
                <a href={desktop.windows.downloadUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" /> Download for Windows
                </a>
              </Button>
            )}

            {hasMac && desktop?.macos?.downloadUrl && (
              <Button asChild variant="outline" className="w-full justify-start gap-2">
                <a href={desktop.macos.downloadUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" /> Download for macOS
                </a>
              </Button>
            )}

            {hasLinux && desktop?.linux?.downloadUrl && (
              <Button asChild variant="outline" className="w-full justify-start gap-2">
                <a href={desktop.linux.downloadUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" /> Download for Linux
                </a>
              </Button>
            )}

            {hasAndroid && mobile?.android?.playStoreUrl && (
              <Button asChild variant="outline" className="w-full justify-start gap-2">
                <a href={mobile.android.playStoreUrl} target="_blank" rel="noopener noreferrer">
                  <Smartphone className="h-4 w-4" /> Get on Play Store
                </a>
              </Button>
            )}

            {hasAndroid && mobile?.android?.apkUrl && (
              <Button asChild variant="outline" className="w-full justify-start gap-2">
                <a href={mobile.android.apkUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" /> Download APK
                </a>
              </Button>
            )}

            {hasIos && mobile?.ios?.appStoreUrl && (
              <Button asChild variant="outline" className="w-full justify-start gap-2">
                <a href={mobile.ios.appStoreUrl} target="_blank" rel="noopener noreferrer">
                  <Smartphone className="h-4 w-4" /> Download on App Store
                </a>
              </Button>
            )}

            {hasWeb && web?.webAppUrl && (
              <Button asChild className="w-full justify-start gap-2">
                <a href={web.webAppUrl} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4" /> Open Web App
                </a>
              </Button>
            )}

            {!app.isFree && (
              <div className="pt-2 border-t mt-2">
                <Button size="lg" className="w-full gap-2 shadow-lg shadow-primary/20" asChild>
                  <Link to={`/checkout/${app._id}`}>
                    Buy Full Version <ShoppingCart className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-3">
            {/* Free Access Button */}
            {isFreeAccess && (
              <AccessRequestForm
                appId={app._id}
                appName={app.title}
                mode="free"
                onSuccess={() => setAccessGranted(true)}
                trigger={
                  <Button size="lg" className="w-full gap-2">
                    <Download className="h-4 w-4" />
                    Get Free Access
                  </Button>
                }
              />
            )}

            {/* Trial Button */}
            {hasTrial && (
              <AccessRequestForm
                appId={app._id}
                appName={app.title}
                mode="trial"
                onSuccess={() => setAccessGranted(true)}
                trigger={
                  <Button variant="outline" size="lg" className="w-full gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary">
                    Start Free Trial
                  </Button>
                }
              />
            )}

            {/* Buy Now Button (Always show if not free) */}
            {!app.isFree && (
              <Button size="lg" className="w-full gap-2 shadow-lg shadow-primary/20" asChild>
                <Link to={`/checkout/${app._id}`}>
                  Buy Now <ShoppingCart className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
