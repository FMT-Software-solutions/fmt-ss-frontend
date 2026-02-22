import { Button, Input, Slider, Label } from "@repo/ui"
import { Search } from "lucide-react"
import type { Sector } from "@/hooks/queries/useSectors"

interface FilterSidebarProps {
  sectors: Sector[];
  selectedSector: string | null;
  onSectorChange: (sectorSlug: string | null) => void;
  priceRange: [number, number];
  onPriceChange: (value: [number, number]) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  className?: string;
  maxPrice?: number;
}

export function FilterSidebar({
  sectors,
  selectedSector,
  onSectorChange,
  priceRange,
  onPriceChange,
  searchQuery,
  onSearchChange,
  className = "",
  maxPrice = 20000
}: FilterSidebarProps) {
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Search - Mobile only (Desktop uses header search) */}
      <div className="block md:hidden">
        <Label className="mb-2 block">Search</Label>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search apps..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Sectors */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Categories</h3>
          {selectedSector && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-muted-foreground hover:text-primary"
              onClick={() => onSectorChange(null)}
            >
              Reset
            </Button>
          )}
        </div>
        <div className="space-y-2 max-h-75 overflow-auto px-0.5">
          <Button
            variant={selectedSector === null ? "secondary" : "ghost"}
            className="w-full justify-start font-normal"
            onClick={() => onSectorChange(null)}
          >
            All Categories
          </Button>
          {sectors.map((sector) => (
            <Button
              key={sector._id}
              variant={selectedSector === sector.slug.current ? "secondary" : "ghost"}
              className="w-full justify-start font-normal"
              onClick={() => onSectorChange(sector.slug.current)}
            >
              {sector.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Price Range</h3>
          {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-muted-foreground hover:text-primary"
              onClick={() => onPriceChange([0, maxPrice])}
            >
              Reset
            </Button>
          )}
        </div>
        <div className="px-2">
          <Slider
            defaultValue={[0, maxPrice]}
            value={priceRange}
            max={maxPrice}
            step={10}
            minStepsBetweenThumbs={1}
            onValueChange={(value) => onPriceChange(value as [number, number])}
            className="mb-6"
          />
          <div className="flex items-center justify-between text-sm">
            <div className="border rounded px-3 py-1 min-w-20 text-center">
              GHS{priceRange[0]}
            </div>
            <span className="text-muted-foreground">-</span>
            <div className="border rounded px-3 py-1 min-w-20 text-center">
              GHS{priceRange[1] === maxPrice ? `${maxPrice}+` : priceRange[1]}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
