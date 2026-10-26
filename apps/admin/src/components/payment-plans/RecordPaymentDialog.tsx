import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';
import { useRecordPlanPayment } from '@/hooks/queries/use-payment-plans';
import { formatCurrency } from '@/lib/format';

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  balance: number;
  suggested: number;
  /** First payment from a customer who never accepted online. */
  needsBillingDetails: boolean;
  defaults: { organizationName: string; contact: string; contactType: 'email' | 'phone'; name: string };
}

export function RecordPaymentDialog(props: RecordPaymentDialogProps) {
  const record = useRecordPlanPayment(props.planId);
  return (
    <Dialog open={props.open} onOpenChange={(next) => !record.isPending && props.onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
        </DialogHeader>
        {props.open && <PaymentForm {...props} record={record} />}
      </DialogContent>
    </Dialog>
  );
}

function PaymentForm({
  onOpenChange,
  balance,
  suggested,
  needsBillingDetails,
  defaults,
  record,
}: RecordPaymentDialogProps & { record: ReturnType<typeof useRecordPlanPayment> }) {
  const [amount, setAmount] = useState(String(Math.min(suggested, balance) || ''));
  const [method, setMethod] = useState('cash');
  const [note, setNote] = useState('');
  const [orgName, setOrgName] = useState(defaults.organizationName);
  const [email, setEmail] = useState(defaults.contactType === 'email' ? defaults.contact : '');
  const [phone, setPhone] = useState(defaults.contactType === 'phone' ? `0${defaults.contact.slice(3)}` : '');
  const [firstName, lastName] = [defaults.name.split(' ')[0] ?? '', defaults.name.split(' ').slice(1).join(' ')];

  const value = Number(amount);
  const billingValid = !needsBillingDetails || (orgName.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()));
  const valid = value > 0 && value <= balance + 0.009 && billingValid;

  const submit = () =>
    record.mutate(
      {
        amount: Math.round(value * 100) / 100,
        method,
        note: note.trim() || undefined,
        billingDetails: needsBillingDetails
          ? {
            organizationName: orgName.trim(),
            organizationEmail: email.trim(),
            phoneNumber: phone.trim() || undefined,
            firstName: firstName || undefined,
            lastName: lastName || undefined,
          }
          : undefined,
      },
      { onSuccess: () => onOpenChange(false) },
    );

  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="pay-amount">Amount (GHS)</Label>
            <Input id="pay-amount" type="number" step="any" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <p className="text-xs text-muted-foreground">Balance {formatCurrency(balance)}</p>
          </div>
          <div className="space-y-2">
            <Label>Method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="momo">Mobile Money</SelectItem>
                <SelectItem value="bank">Bank transfer</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pay-note">Note</Label>
          <Input id="pay-note" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        {needsBillingDetails && (
          <div className="space-y-3 rounded-md border p-3">
            <p className="text-sm font-medium">Organization</p>
            <Input placeholder="Organization name" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
            <Input placeholder="Login email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        )}
      </div>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={record.isPending}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={!valid || record.isPending}>
          {record.isPending && <Loader2 className="size-4 animate-spin" />}
          Record {value > 0 ? formatCurrency(value) : ''}
        </Button>
      </DialogFooter>
    </>
  );
}
