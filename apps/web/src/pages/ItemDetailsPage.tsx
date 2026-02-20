import { Button, Card, CardContent, Badge, Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@repo/ui"
import { Check, ShoppingCart, Star } from "lucide-react"
import { useParams, Link } from "react-router-dom"

export default function ItemDetailsPage() {
  const { id } = useParams()
  
  // Mock Data (would normally fetch based on ID)
  const item = {
    id,
    title: "Enterprise ERP Solution Pro",
    price: 299,
    rating: 4.8,
    reviews: 124,
    category: "Business",
    description: "A comprehensive Enterprise Resource Planning (ERP) solution designed to streamline your business operations. From inventory management to HR and accounting, this all-in-one platform covers it all.",
    features: [
      "Advanced Inventory Management",
      "HR & Payroll Integration",
      "Automated Accounting Reports",
      "Multi-user Role Management",
      "Cloud Backup & Security",
      "24/7 Priority Support"
    ],
    image: "https://placehold.co/800x500/e2e8f0/1e293b?text=Software+Screenshot"
  }

  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="rounded-lg overflow-hidden border bg-muted aspect-video">
             <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
             {[1, 2, 3, 4].map(i => (
                 <div key={i} className="rounded-md overflow-hidden border bg-muted aspect-video cursor-pointer hover:ring-2 ring-primary">
                     <img 
                        src={`https://placehold.co/200x120/e2e8f0/1e293b?text=Shot+${i}`} 
                        alt="Screenshot" 
                        className="w-full h-full object-cover"
                    />
                 </div>
             ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{item.category}</Badge>
                <div className="flex items-center text-yellow-500 text-sm">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1 text-foreground">{item.rating} ({item.reviews} reviews)</span>
                </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">{item.title}</h1>
            <p className="text-xl font-bold text-primary mb-6">${item.price}</p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {item.description}
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
                <Button size="lg" className="w-full text-lg mb-4" asChild>
                    <Link to={`/checkout/${id}`}>
                        Buy Now <ShoppingCart className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                    Instant digital download. Secure payment. 30-day money-back guarantee.
                </p>
            </CardContent>
          </Card>

          <div>
            <h3 className="text-lg font-semibold mb-4">Key Features</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {item.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

           <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="requirements">
                <AccordionTrigger>System Requirements</AccordionTrigger>
                <AccordionContent>
                Windows 10/11 or macOS 12+, 8GB RAM, 500MB Disk Space.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="license">
                <AccordionTrigger>License Details</AccordionTrigger>
                <AccordionContent>
                Single user license for commercial and personal use. Lifetime updates included.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="support">
                <AccordionTrigger>Support Policy</AccordionTrigger>
                <AccordionContent>
                Includes 6 months of premium support via email and chat.
                </AccordionContent>
            </AccordionItem>
            </Accordion>
        </div>
      </div>
    </div>
  )
}
