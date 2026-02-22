import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Badge, Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@repo/ui"
import { Search, Filter, Loader2 } from "lucide-react"
import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { useAllApps } from "@/hooks/queries/useAllApps"
import { useSectors } from "@/hooks/queries/useSectors"
import { FilterSidebar } from "@/components/marketplace/FilterSidebar"

export default function MarketplacePage() {
  const { data: apps = [], isLoading: isLoadingApps } = useAllApps()
  const { data: sectors = [], isLoading: isLoadingSectors } = useSectors()

  // Filter State
  const [selectedSector, setSelectedSector] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Memoized Filter Logic
  const filteredApps = useMemo(() => {
    return apps.filter(app => {
      // 1. Search Filter
      const matchesSearch = app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase())

      // 2. Sector Filter
      const matchesSector = selectedSector
        ? app.sectors?.some((s: any) => s.slug === selectedSector)
        : true

      // 3. Price Filter
      // Handle free apps and promotion prices
      const effectivePrice = app.isFree ? 0 : (
        (app.promotion?.hasPromotion && app.promotion?.isActive)
          ? (app.promotion.discountPrice ?? app.price)
          : app.price
      )

      const matchesPrice = effectivePrice >= priceRange[0] && effectivePrice <= priceRange[1]

      return matchesSearch && matchesSector && matchesPrice
    })
  }, [apps, searchQuery, selectedSector, priceRange])

  // Reset all filters
  const clearFilters = () => {
    setSelectedSector(null)
    setSearchQuery("")
    setPriceRange([0, 10000])
  }

  const activeFiltersCount = (selectedSector ? 1 : 0) + (searchQuery ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 10000 ? 1 : 0)

  if (isLoadingApps || isLoadingSectors) {
    return (
      <div className="container py-24 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container py-12 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Software Marketplace</h1>
          <p className="text-sm text-muted-foreground">Discover premium tools to accelerate your workflow.</p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-72 hidden md:block">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search software..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Mobile Filter Sheet */}
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden w-full flex gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-75 sm:w-100 overflow-y-auto">
              <SheetHeader className="mb-6">
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <FilterSidebar
                sectors={sectors}
                selectedSector={selectedSector}
                onSectorChange={setSelectedSector}
                priceRange={priceRange}
                onPriceChange={setPriceRange}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
              <div className="mt-8 pt-4 border-t sticky bottom-0 bg-background pb-4">
                <Button className="w-full" onClick={() => setIsFilterOpen(false)}>
                  Show {filteredApps.length} Results
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block sticky top-24 h-fit">
          <FilterSidebar
            sectors={sectors}
            selectedSector={selectedSector}
            onSectorChange={setSelectedSector}
            priceRange={priceRange}
            onPriceChange={setPriceRange}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </aside>

        {/* Product Grid */}
        <div className="md:col-span-3">
          {filteredApps.length === 0 ? (
            <div className="text-center py-16 border rounded-lg bg-muted/20">
              <h3 className="text-lg font-semibold mb-2">No apps found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your search or filters to find what you're looking for.</p>
              <Button onClick={clearFilters} variant="outline">
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApps.map((app) => {
                const hasActivePromotion = app.promotion?.hasPromotion && app.promotion?.isActive;
                const displayPrice = hasActivePromotion ? app.promotion?.discountPrice : app.price;

                return (
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

                        {/* Badges */}
                        <div className="absolute top-2 right-2 flex flex-col gap-2 items-end">
                          {app.sectors?.slice(0, 1).map((sector: any) => (
                            <Badge key={sector._id} className="bg-background/90 text-foreground backdrop-blur-sm shadow-sm hover:bg-background">
                              {sector.name}
                            </Badge>
                          ))}
                        </div>

                        {hasActivePromotion && (
                          <div className="absolute top-2 left-2">
                            <Badge variant="destructive" className="animate-pulse">
                              Sale
                            </Badge>
                          </div>
                        )}
                      </div>

                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start gap-2">
                          <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                            {app.title}
                          </CardTitle>
                        </div>
                        <CardDescription className="line-clamp-2 text-sm mt-1 min-h-10">
                          {app.shortDescription}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="p-4 pt-0 mt-auto">
                        <div className="flex items-center justify-between pt-4 border-t mt-2">
                          <div className="flex flex-col">
                            {app.isFree ? (
                              <span className="font-bold text-lg text-green-600">Free</span>
                            ) : (
                              <div className="flex items-baseline gap-2">
                                <span className="font-bold text-lg">
                                  GHS{displayPrice}
                                </span>
                                {hasActivePromotion && (
                                  <span className="text-sm text-muted-foreground line-through">
                                    GHS{app.price}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <Button size="sm" variant="secondary" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
