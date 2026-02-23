import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui"

interface SortSelectProps {
  value: string
  onValueChange: (value: string) => void
}

export function SortSelect({ value, onValueChange }: SortSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="date-desc">Newest First</SelectItem>
        <SelectItem value="date-asc">Oldest First</SelectItem>
        <SelectItem value="price-desc">Price: High to Low</SelectItem>
        <SelectItem value="price-asc">Price: Low to High</SelectItem>
        <SelectItem value="name-asc">Name: A-Z</SelectItem>
        <SelectItem value="name-desc">Name: Z-A</SelectItem>
      </SelectContent>
    </Select>
  )
}
