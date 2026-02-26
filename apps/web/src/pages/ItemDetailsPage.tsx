import { GetAccessCard } from "@/components/marketplace/GetAccessCard"
import { ImageGallery } from "@/components/marketplace/ImageGallery"
import { RelatedApps } from "@/components/marketplace/RelatedApps"
import { VideoPlayer } from "@/components/marketplace/VideoPlayer"
import { PortableText } from "@/components/portable-text"
import { ReviewForm } from "@/components/reviews/ReviewForm"
import { useAppBySlug } from "@/hooks/queries/useAppBySlug"
import { useAppReviews } from "@/hooks/queries/useReviews"
import { Badge, Button, Card, CardContent, Dialog, DialogContent, DialogTrigger, Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui"
import { Check, Info, Laptop, Loader2, MessageSquare, ShieldCheck, ShoppingCart, Star, Maximize2 } from "lucide-react"
import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { SEO } from "@/components/seo"
import { urlFor } from "@/lib/sanity"

export default function ItemDetailsPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: app, isLoading } = useAppBySlug(slug)
  const { data: reviews = [], isLoading: isLoadingReviews } = useAppReviews(app?._id)
  const [isReviewOpen, setIsReviewOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="container py-24 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!app) {
    return (
      <div className="container py-24 text-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">App not found</h1>
        <Button asChild>
          <Link to="/marketplace">Back to Marketplace</Link>
        </Button>
      </div>
    )
  }

  const hasActivePromotion = app.promotion?.hasPromotion && app.promotion?.isActive
  const displayPrice = hasActivePromotion ? app.promotion?.discountPrice : app.price

  // Use first sector for related apps
  const sectors = app?.sectors || []
  const firstSector = sectors[0] as any
  const sectorId = firstSector?._id

  const mainImage = app?.mainImage
  const imageUrl = mainImage ? urlFor(mainImage)?.width(1200).height(630).url() : undefined

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={app.title}
        description={app.shortDescription}
        image={imageUrl}
        type="product"
        schema={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": app.title,
          "description": app.shortDescription,
          "image": imageUrl,
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "All",
          "offers": {
            "@type": "Offer",
            "price": app.isFree ? "0" : (app.promotion?.hasPromotion && app.promotion?.isActive ? app.promotion.discountPrice : app.price),
            "priceCurrency": "USD",
          }
        }}
      />
      {/* Hero Section */}
      <div className="relative bg-muted/30 border-b">
        <div className="container py-12 md:py-16">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                {app.sectors?.map((sector: any) => (
                  <Badge key={sector._id} variant="secondary" className="hover:bg-secondary/80">
                    {sector.name}
                  </Badge>
                ))}
                {hasActivePromotion && (
                  <Badge variant="destructive" className="animate-pulse">Sale</Badge>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{app.title}</h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
                {app.shortDescription}
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                {!app.isFree &&
                  <>
                    <Button size="lg" className="gap-2 px-6" asChild>
                      <Link to={`/checkout/${app._id}`}>
                        Buy Now <ShoppingCart className="h-5 w-5" />
                      </Link>
                    </Button>
                  </>
                }
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground pt-2">
                {app.isFree ? null : (
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Secure Payment</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Laptop className="h-4 w-4" />
                  <span>Instant Access</span>
                </div>

              </div>
            </div>

            <div className="w-full md:w-100 shrink-0">
              <Card className="overflow-hidden border-2 border-primary/10 shadow-lg">
                <div className="aspect-video bg-muted relative">
                  {app.mainImage ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="relative w-full h-full group cursor-pointer">
                          <img
                            src={app.mainImage}
                            alt={app.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors">
                            <Maximize2 className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-[90vw] h-[90vh] p-0 border-none bg-black/95 flex items-center justify-center">
                        <div className="w-full h-full flex items-center justify-center">
                          <img
                            src={app.mainImage}
                            alt={app.title}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No Image
                    </div>
                  )}
                </div>
                <CardContent className="px-4 py-4 space-y-4">
                  <div className="flex items-baseline justify-end">
                    <div className="text-right">
                      {app.isFree ? (
                        <span className="text-2xl font-bold text-green-600">Free</span>
                      ) : (
                        <div className="flex flex-col items-end">
                          <span className="text-2xl font-bold text-primary">
                            GHS{displayPrice}
                          </span>
                          {hasActivePromotion && (
                            <span className="text-sm text-muted-foreground line-through decoration-destructive/50">
                              GHS{app.price}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-12 space-y-16">
        {/* Gallery & Video Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-12">
            {((app.screenshots && app.screenshots.length > 0) || (app.video && app.video.url)) && (
              <Tabs defaultValue={app.screenshots && app.screenshots.length > 0 ? "gallery" : "video"} className="w-full">
                <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 overflow-x-auto flex-nowrap">
                  {app.screenshots && app.screenshots.length > 0 && <TabsTrigger value="gallery" className="px-6 py-2.5">Gallery</TabsTrigger>}
                  {app.video && app.video.url && <TabsTrigger value="video" className="px-6 py-2.5">Watch Video</TabsTrigger>}
                </TabsList>

                {app.screenshots && app.screenshots.length > 0 && (
                  <TabsContent value="gallery" className="space-y-6">
                    <section className="space-y-4">
                      <ImageGallery images={app.screenshots} altPrefix={app.title} />
                    </section>
                  </TabsContent>
                )}

                {app.video && app.video.url && (
                  <TabsContent value="video" className="space-y-6">
                    <section className="space-y-4">
                      <VideoPlayer url={app.video.url} type={app.video.type as any} />
                    </section>
                  </TabsContent>
                )}
              </Tabs>
            )}
          </div>


          <div className="mx-8">
            <GetAccessCard app={app} className="w-full" />
          </div>

        </div>


        {/* Description & Details Tabs */}
        <section>
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 overflow-x-auto flex-nowrap">
              <TabsTrigger value="description" className="px-6 py-2.5">Description</TabsTrigger>
              <TabsTrigger value="features" className="px-6 py-2.5">Key Features</TabsTrigger>
              <TabsTrigger value="requirements" className="px-6 py-2.5">System Requirements</TabsTrigger>
              <TabsTrigger value="reviews" className="px-6 py-2.5">Reviews</TabsTrigger>
            </TabsList>

            <div className="mt-6 min-h-75">
              <TabsContent value="description" className="space-y-6">
                <div className="max-w-none">
                  {Array.isArray(app.description) ? (
                    <PortableText value={app.description} />
                  ) : (
                    <p className="mb-4 leading-relaxed">{app.description}</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="features" className="space-y-6">
                {app.features && app.features.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    {app.features.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-card border shadow-sm">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="requirements" className="space-y-6">
                {app.systemRequirements ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="p-6 space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Laptop className="h-5 w-5" /> Minimum Requirements
                        </h3>
                        <div className="space-y-3 text-sm">
                          <div className="grid grid-cols-3 gap-2">
                            <span className="text-muted-foreground">OS:</span>
                            <span className="col-span-2 font-medium">{app.systemRequirements.os?.join(", ") || "Windows 10+"}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <span className="text-muted-foreground">Processor:</span>
                            <span className="col-span-2 font-medium">{app.systemRequirements.processor || "Dual Core 2GHz"}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <span className="text-muted-foreground">Memory:</span>
                            <span className="col-span-2 font-medium">{app.systemRequirements.memory || "4GB RAM"}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <span className="text-muted-foreground">Storage:</span>
                            <span className="col-span-2 font-medium">{app.systemRequirements.storage || "500MB available space"}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground p-8 bg-muted/20 rounded-lg">
                    <Info className="h-5 w-5" />
                    <span>No specific system requirements listed.</span>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reviews">
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">User Reviews ({reviews.length})</h3>
                    <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                      <DialogTrigger asChild>
                        <Button className="gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Write a Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <h2 className="text-xl font-bold mb-4">Write a Review</h2>
                        <ReviewForm
                          appId={app._id}
                          appName={app.title}
                          isPopup
                          onSuccess={() => setIsReviewOpen(false)}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>

                  {isLoadingReviews ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 bg-muted/10 rounded-lg border border-dashed">
                      <Star className="h-12 w-12 text-muted-foreground/20" />
                      <div>
                        <h3 className="text-lg font-medium">No reviews yet</h3>
                        <p className="text-muted-foreground">Be the first to review this app!</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review: any) => (
                        <Card key={review.id}>
                          <CardContent className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-semibold">{review.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {review.company} {review.position && `- ${review.position}`}
                                </div>
                              </div>
                              <div className="flex text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < review.rating ? "fill-current" : "text-muted-foreground/30"}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-muted-foreground">{review.content}</p>
                            <div className="text-xs text-muted-foreground/50">
                              {new Date(review.created_at).toLocaleDateString()}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </section>

        <RelatedApps currentAppId={app._id} currentSectorId={sectorId} />
      </div>
    </div>
  )
}
