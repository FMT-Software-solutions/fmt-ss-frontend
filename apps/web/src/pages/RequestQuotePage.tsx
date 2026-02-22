import { useState } from "react"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui"
import { Send } from "lucide-react"
import { useCreateQuote } from "@/hooks/queries/useQuotes"
import { toast } from "sonner"

export default function RequestQuotePage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber1: "",
    contactNumber2: "",
    company: "",
    serviceType: "",
    budget: "",
    customBudget: "",
    description: "",
  })

  const { mutate: createQuote, isPending } = useCreateQuote()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.contactNumber1 || !formData.serviceType || !formData.budget || !formData.description) {
      toast.error("Please fill in all required fields")
      return
    }

    if (formData.budget === "custom" && !formData.customBudget) {
      toast.error("Please enter your custom budget range")
      return
    }

    const finalBudget = formData.budget === "custom" ? `Custom: ${formData.customBudget}` : formData.budget

    createQuote(
      {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        contactNumber1: formData.contactNumber1,
        contactNumber2: formData.contactNumber2 || undefined,
        company: formData.company || undefined,
        serviceType: formData.serviceType,
        budget: finalBudget,
        description: formData.description,
      },
      {
        onSuccess: () => {
          toast.success("Quote request submitted successfully!")
          // Reset form
          setFormData({
            firstName: "",
            lastName: "",
            email: "",
            contactNumber1: "",
            contactNumber2: "",
            company: "",
            serviceType: "",
            budget: "",
            customBudget: "",
            description: "",
          })
        },
        onError: (error) => {
          toast.error(error.message || "Failed to submit quote request")
        },
      }
    )
  }

  return (
    <div className="container py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Request a Quote</h1>
        <p className="text-sm text-muted-foreground">
          Tell us about your project and we'll get back to you with a customized proposal.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription className="text-sm">
            Please provide as much detail as possible so we can accurately estimate your project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="John" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Doe" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company (Optional)</Label>
                <Input id="company" value={formData.company} onChange={handleInputChange} placeholder="Acme Inc." />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contactNumber1">Contact Number 1 *</Label>
                <Input id="contactNumber1" value={formData.contactNumber1} onChange={handleInputChange} placeholder="+233 XX XXX XXXX" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactNumber2">Contact Number 2 (Optional)</Label>
                <Input id="contactNumber2" value={formData.contactNumber2} onChange={handleInputChange} placeholder="+233 XX XXX XXXX" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceType">Service Type *</Label>
              <Select value={formData.serviceType} onValueChange={(value) => handleSelectChange("serviceType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Website Design & Development">Website Design & Development</SelectItem>
                  <SelectItem value="Custom Software Development">Custom Software Development</SelectItem>
                  <SelectItem value="Maintenance & Support">Maintenance & Support</SelectItem>
                  <SelectItem value="Website Revamp/Fixing">Website Revamp/Fixing</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Estimated Budget (GHS) *</Label>
              <Select value={formData.budget} onValueChange={(value) => handleSelectChange("budget", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="500-1500">GHS 500 - GHS 1,500</SelectItem>
                  <SelectItem value="1500-3000">GHS 1,500 - GHS 3,000</SelectItem>
                  <SelectItem value="3000-5000">GHS 3,000 - GHS 5,000</SelectItem>
                  <SelectItem value="5000-10000">GHS 5,000 - GHS 10,000</SelectItem>
                  <SelectItem value="10000+">GHS 10,000+</SelectItem>
                  <SelectItem value="custom">Custom (Enter range)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.budget === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="customBudget">Custom Budget Range *</Label>
                <Input
                  id="customBudget"
                  value={formData.customBudget}
                  onChange={handleInputChange}
                  placeholder="e.g. GHS 20,000 - GHS 30,000"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Project Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tell us about your goals, requirements, and any specific features you need..."
                className="min-h-37.5"
                required
              />
            </div>

            <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isPending}>
              {isPending ? "Submitting..." : "Submit Request"} <Send className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
