import { Button, Input, Badge, Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@repo/ui"
import { Search, Filter, Loader2 } from "lucide-react"
import { useState, useMemo } from "react"
import { useAllApps } from "@/hooks/queries/useAllApps"
import { useSectors } from "@/hooks/queries/useSectors"
import { FilterSidebar } from "@/components/marketplace/FilterSidebar"
import { SortSelect } from "@/components/marketplace/SortSelect"
import { SEO } from "@/components/seo"
import { getPriceDetails } from "@/lib/pricing"
import { sortRecommended } from "@/lib/apps"
import { AppCard } from "@/components/marketplace/AppCard"

export default function MarketplacePage() {
  const { data: apps = [], isLoading: isLoadingApps } = useAllApps()
  const { data: sectors = [], isLoading: isLoadingSectors } = useSectors()

  // Filter State
  const [selectedSector, setSelectedSector] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState("recommended")

  // Memoized Filter Logic
  const filteredApps = useMemo(() => {
    const filtered = apps.filter(app => {
      // 1. Search Filter
      const matchesSearch = app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase())

      // 2. Sector Filter
      const matchesSector = selectedSector
        ? app.sectors?.some((s) => s.slug === selectedSector)
        : true

      // 3. Price Filter
      // Handle free apps and promotion prices
      const { finalPrice: effectivePrice } = getPriceDetails(app)

      const matchesPrice = effectivePrice >= priceRange[0] && effectivePrice <= priceRange[1]

      return matchesSearch && matchesSector && matchesPrice
    })

    // Sorting Logic
    if (sortBy === "recommended") return sortRecommended(filtered)
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
        case "date-asc":
          return new Date(a.publishedAt || 0).getTime() - new Date(b.publishedAt || 0).getTime()
        case "price-desc": {
          const { finalPrice: priceA } = getPriceDetails(a)
          const { finalPrice: priceB } = getPriceDetails(b)
          return priceB - priceA
        }
        case "price-asc": {
          const { finalPrice: priceA } = getPriceDetails(a)
          const { finalPrice: priceB } = getPriceDetails(b)
          return priceA - priceB
        }
        case "name-asc":
          return a.title.localeCompare(b.title)
        case "name-desc":
          return b.title.localeCompare(a.title)
        default:
          return 0
      }
    })
  }, [apps, searchQuery, selectedSector, priceRange, sortBy])

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
      <SEO
        title="Marketplace"
        description="Business software for Ghana: inventory, sales, printing and church management. Pay with Mobile Money or in instalments."
        keywords={['marketplace', 'software', 'apps', 'templates', 'tools', 'download']}
      />
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Software Marketplace</h1>
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

          <div className="w-full md:w-48 hidden md:block">
            <SortSelect value={sortBy} onValueChange={setSortBy} />
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
                sortBy={sortBy}
                onSortChange={setSortBy}
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
              {filteredApps.map((app) => (
                <AppCard key={app._id} app={app} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
