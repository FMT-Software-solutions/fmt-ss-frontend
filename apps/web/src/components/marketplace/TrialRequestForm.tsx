import { useState } from "react"
import { z } from "zod"
import { Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Button, Input, Label, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@repo/ui"
import { API_ENDPOINTS } from "@/lib/endpoints"

const trialSchema = z.object({
  organizationName: z.string().min(2, "Organization name is required"),
  organizationEmail: z.email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
})

interface TrialRequestFormProps {
  appId: string
  appName: string
  trigger?: React.ReactNode
}

export function TrialRequestForm({ appId, appName, trigger }: TrialRequestFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const [formData, setFormData] = useState({
    organizationName: "",
    organizationEmail: "",
    phoneNumber: ""
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
    // Clear error when user types
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

    // Validate
    const result = trialSchema.safeParse(formData)
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
      const response = await fetch(`${API_ENDPOINTS.base || ''}/purchases/trial`, {
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
            // Address is optional for trial
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to submit trial request")
      }

      setIsSuccess(true)
      toast.success("Trial request submitted successfully!")
      setFormData({
        organizationName: "",
        organizationEmail: "",
        phoneNumber: ""
      })
    } catch (error) {
      console.error("Trial request error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to submit trial request")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open && isSuccess) {
      setTimeout(() => setIsSuccess(false), 500)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || <Button>Start Free Trial</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Start Free Trial - {appName}</DialogTitle>
          <DialogDescription>
            Enter your details to get instant access to the trial version.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-4 text-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Request Successful!</h3>
              <p className="text-muted-foreground text-sm">
                Check your email for login credentials. A temporary password has been sent to you.
              </p>
            </div>
            <Button onClick={() => setIsOpen(false)} className="w-full">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization / Business Name</Label>
              <Input
                id="organizationName"
                placeholder="Acme Corp"
                value={formData.organizationName}
                onChange={handleChange}
              />
              {errors.organizationName && (
                <p className="text-sm text-red-500">{errors.organizationName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationEmail">Owner Email</Label>
              <Input
                id="organizationEmail"
                type="email"
                placeholder="admin@acme.com"
                value={formData.organizationEmail}
                onChange={handleChange}
              />
              {errors.organizationEmail && (
                <p className="text-sm text-red-500">{errors.organizationEmail}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+233 20 000 0000"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-500">{errors.phoneNumber}</p>
              )}
            </div>

            <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
              <p>
                <strong>Notice:</strong> A temporary password will be sent to your email address.
                You will be required to reset it when you first login.
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Get Access Now"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
