import { useState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Input, Label, Textarea } from "@repo/ui"
import { planApi } from "@/lib/payment-plan"

interface PaymentPlanRequestFormProps {
  appId: string
  appName: string
  trigger: React.ReactNode
}

/** "Pay in instalments": collects a contact so we can send a custom plan. */
export function PaymentPlanRequestForm({ appId, appName, trigger }: PaymentPlanRequestFormProps) {
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [name, setName] = useState("")
  const [contact, setContact] = useState("")
  const [organizationName, setOrganizationName] = useState("")
  const [message, setMessage] = useState("")

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      await planApi.request({
        appId,
        contact: contact.trim(),
        name: name.trim() || undefined,
        organizationName: organizationName.trim() || undefined,
        message: message.trim() || undefined,
      })
      setSent(true)
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setSent(false)
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pay for {appName} in instalments</DialogTitle>
        </DialogHeader>

        {sent ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <p className="font-medium">Request received</p>
            <p className="text-sm text-muted-foreground">We'll send your plan to {contact.trim()}.</p>
            <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plan-name">Name</Label>
              <Input id="plan-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-contact">Email or phone number</Label>
              <Input
                id="plan-contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="you@company.com or 024 000 0000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-org">Business name</Label>
              <Input id="plan-org" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-message">Anything we should know?</Label>
              <Textarea
                id="plan-message"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. how many months you'd like"
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy || contact.trim().length < 5 || !name.trim()}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Request a plan
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
