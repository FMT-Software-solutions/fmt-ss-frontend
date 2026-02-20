import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Badge, Separator } from "@repo/ui"
import { Search, Filter } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

// Mock Data
const softwareItems = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  title: `Software Product ${i + 1}`,
  description: "A powerful tool for managing your business operations efficiently.",
  price: 99 + i * 10,
  category: i % 3 === 0 ? "Business" : i % 3 === 1 ? "Utility" : "Design",
  rating: 4.5,
  image: "https://placehold.co/600x400/e2e8f0/1e293b?text=Software+Preview"
}))

const categories = ["All", "Business", "Utility", "Design", "Development", "Marketing"]

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredItems = softwareItems.filter(item => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Software Marketplace</h1>
          <p className="text-muted-foreground">Discover premium tools to accelerate your workflow.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search software..." 
              className="pl-8" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="md:hidden">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="hidden md:block space-y-6">
          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold mb-4">Price Range</h3>
             {/* Mock Price Filter */}
             <div className="space-y-2 text-sm text-muted-foreground">
                <p>Coming soon...</p>
             </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="md:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
                <div className="aspect-video bg-muted relative">
                    <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                    <Badge className="absolute top-2 right-2 bg-background/80 text-foreground backdrop-blur-sm hover:bg-background/80">
                        {item.category}
                    </Badge>
                </div>
                <CardHeader className="p-4">
                  <CardTitle className="text-lg line-clamp-1">{item.title}</CardTitle>
                  <CardDescription className="line-clamp-2 text-sm mt-1">{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 mt-auto">
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xl font-bold">${item.price}</span>
                    <Button size="sm" asChild>
                      <Link to={`/item/${item.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">No software found matching your criteria.</p>
                <Button variant="link" onClick={() => {setSelectedCategory("All"); setSearchQuery("")}}>
                    Clear Filters
                </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
