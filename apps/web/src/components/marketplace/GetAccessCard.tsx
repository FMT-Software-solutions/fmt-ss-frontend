import { useState } from "react"
import type { IPremiumApp } from "@/types/premium-app"
import { Button, Card } from "@repo/ui"
import { CalendarClock, Check, Download, MessageCircle, PlayCircle, ShoppingCart, ShieldCheck, Monitor, Smartphone, Globe } from "lucide-react"
import { formatFileSize } from "@/lib/release"
import { Link } from "react-router-dom"
import { AccessRequestForm } from "./AccessRequestForm"
import { PaymentPlanRequestForm } from "./PaymentPlanRequestForm"
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
  const latest = app.releases?.[0]
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

        {app.whatsIncluded?.length ? (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">What's included</p>
            <ul className="space-y-1.5 text-sm">
              {app.whatsIncluded.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-green-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {app.addOns?.length ? (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Add-ons</p>
            <ul className="space-y-1.5 text-sm">
              {app.addOns.map((addOn) => (
                <li key={addOn.name} className="flex justify-between gap-3">
                  <span>{addOn.name}</span>
                  {addOn.price != null && (
                    <span className="shrink-0 text-muted-foreground">
                      GHS {addOn.price}{addOn.unit ? ` / ${addOn.unit}` : ""}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

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
        {(app.contact?.whatsappNumber || app.contact?.demoUrl || app.contact?.bookingUrl) && (
          <div className="flex flex-wrap gap-2">
            {app.contact?.whatsappNumber && (
              <Button asChild variant="outline" size="sm" className="flex-1 gap-2">
                <a
                  href={`https://wa.me/${app.contact.whatsappNumber}?text=${encodeURIComponent(`Hi, I'd like to know more about ${app.title}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              </Button>
            )}
            {(app.contact?.bookingUrl || app.contact?.demoUrl) && (
              <Button asChild variant="outline" size="sm" className="flex-1 gap-2">
                <a href={app.contact.bookingUrl || app.contact.demoUrl} target="_blank" rel="noopener noreferrer">
                  <PlayCircle className="h-4 w-4" /> {app.contact.bookingUrl ? "Book a demo" : "Live demo"}
                </a>
              </Button>
            )}
          </div>
        )}
        {accessGranted ? (
          <div className="grid gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-sm font-medium text-muted-foreground mb-1">Download / Access Links:</p>

            {hasWindows && desktop?.windows?.downloadUrl && (
              <Button asChild variant="outline" className="w-full justify-start gap-2">
                <a href={desktop.windows.downloadUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" /> Download for Windows
                  {latest && (
                    <span className="ml-auto text-xs font-normal text-muted-foreground">
                      v{latest.version}{formatFileSize(latest.fileSize) ? ` · ${formatFileSize(latest.fileSize)}` : ""}
                    </span>
                  )}
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

            {!app.isFree && app.paymentPlans?.enabled !== false && (
              <PaymentPlanRequestForm
                appId={app._id}
                appName={app.title}
                trigger={
                  <Button variant="ghost" className="w-full gap-2 text-muted-foreground hover:text-foreground">
                    <CalendarClock className="h-4 w-4" /> Pay in instalments
                  </Button>
                }
              />
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
