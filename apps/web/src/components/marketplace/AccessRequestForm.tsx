import { useState } from "react"
import { z } from "zod"
import { toast } from "sonner"
import { Button, Input, Label, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Checkbox } from "@repo/ui"
import { API_ENDPOINTS } from "@/lib/endpoints"
import { Link } from "react-router-dom"

const accessSchema = z.object({
  organizationName: z.string().min(2, "Organization name must be at least 2 characters"),
  organizationEmail: z.email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
})

interface AccessRequestFormProps {
  appId: string
  appName: string
  mode: 'trial' | 'free'
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function AccessRequestForm({ appId, mode, trigger, onSuccess }: AccessRequestFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const [formData, setFormData] = useState({
    organizationName: "",
    organizationEmail: "",
    phoneNumber: ""
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[id]
        return newErrors
      })
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!agreedToTerms) {
      toast.error("You must agree to the Terms of Use and Privacy Policy")
      return
    }

    const result = accessSchema.safeParse(formData)
    if (!result.success) {
      const formattedErrors: Record<string, string> = {}
      result.error.issues.forEach(issue => {
        formattedErrors[issue.path[0] as string] = issue.message
      })
      setErrors(formattedErrors)
      return
    }

    setIsSubmitting(true)
    try {
      const endpoint = mode === 'trial'
        ? `${API_ENDPOINTS.base || ''}/purchases/trial`
        : `${API_ENDPOINTS.base || ''}/purchases/free-access`

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: appId,
          organizationDetails: {
            organizationName: formData.organizationName,
            organizationEmail: formData.organizationEmail,
            phoneNumber: formData.phoneNumber,
            // Address is optional for trial/free access
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to submit request")
      }

      toast.success(mode === 'trial' ? "Trial request submitted successfully!" : "Access granted successfully!")
      setFormData({
        organizationName: "",
        organizationEmail: "",
        phoneNumber: ""
      })
      setAgreedToTerms(false)
      setIsOpen(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Request error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to submit request")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{mode === 'trial' ? 'Start Free Trial' : 'Get Free Access'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="organizationName">Organization Name</Label>
            <Input
              id="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              placeholder="Enter your organization name"
              disabled={isSubmitting}
            />
            {errors.organizationName && <p className="text-sm text-destructive">{errors.organizationName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizationEmail">Email Address</Label>
            <Input
              id="organizationEmail"
              type="email"
              value={formData.organizationEmail}
              onChange={handleChange}
              placeholder="name@company.com"
              disabled={isSubmitting}
            />
            {errors.organizationEmail && <p className="text-sm text-destructive">{errors.organizationEmail}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="0200000000"
              disabled={isSubmitting}
            />
            {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber}</p>}
          </div>

          <div className="flex items-start space-x-2 pt-2">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              disabled={isSubmitting}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the <Link to="/terms" className="text-primary hover:underline" target="_blank">Terms of Use</Link> and <Link to="/privacy" className="text-primary hover:underline" target="_blank">Privacy Policy</Link>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting || !agreedToTerms}>
              {isSubmitting ? "Submitting..." : (mode === 'trial' ? "Start Trial" : "Get Access")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
