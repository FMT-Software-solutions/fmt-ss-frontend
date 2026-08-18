import { useState } from 'react';
import { Loader2, Minus, Plus } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  cn,
} from '@repo/ui';
import { useAdjustSmsCredits } from '@/hooks/queries/use-organizations';
import { formatNumber } from '@/lib/format';

interface AdjustCreditsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appId: string | undefined;
  orgId: string | undefined;
  organizationName?: string | null;
  currentBalance: number;
}

const QUICK_AMOUNTS = [50, 100, 500, 1000];

export function AdjustCreditsDialog({
  open,
  onOpenChange,
  appId,
  orgId,
  organizationName,
  currentBalance,
}: AdjustCreditsDialogProps) {
  const [direction, setDirection] = useState<'grant' | 'deduct'>('grant');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const adjust = useAdjustSmsCredits(appId, orgId);

  const parsedAmount = Number(amount);
  const valid =
    Number.isFinite(parsedAmount) && parsedAmount > 0 && reason.trim().length > 0;
  const delta = direction === 'grant' ? parsedAmount : -parsedAmount;
  const projected = Math.max(currentBalance + (Number.isFinite(delta) ? delta : 0), 0);

  const reset = () => {
    setDirection('grant');
    setAmount('');
    setReason('');
  };

  const submit = () => {
    if (!valid) return;
    adjust.mutate(
      { delta, reason: reason.trim() },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!adjust.isPending) {
          if (!next) reset();
          onOpenChange(next);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust SMS credits</DialogTitle>
          <DialogDescription>
            {organizationName ?? 'This organization'} currently has{' '}
            {formatNumber(currentBalance)} credits. The adjustment is recorded in the
            organization's SMS ledger and the admin audit log.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={direction === 'grant' ? 'default' : 'outline'}
              onClick={() => setDirection('grant')}
            >
              <Plus className="size-4" />
              Grant
            </Button>
            <Button
              type="button"
              variant={direction === 'deduct' ? 'destructive' : 'outline'}
              onClick={() => setDirection('deduct')}
            >
              <Minus className="size-4" />
              Remove
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="credit-amount">Credits</Label>
            <Input
              id="credit-amount"
              inputMode="numeric"
              placeholder="100"
              value={amount}
              onChange={(event) => setAmount(event.target.value.replace(/[^0-9]/g, ''))}
            />
            <div className="flex flex-wrap gap-1.5">
              {QUICK_AMOUNTS.map((quick) => (
                <Button
                  key={quick}
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setAmount(String(quick))}
                >
                  {quick}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="credit-reason">Reason</Label>
            <Input
              id="credit-reason"
              placeholder="Failed Paystack top-up, goodwill credit…"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Shown in the organization's transaction history, so write it for them.
            </p>
          </div>

          {valid && (
            <p className="rounded-md bg-muted px-3 py-2 text-sm">
              New balance:{' '}
              <span
                className={cn(
                  'font-medium tabular-nums',
                  direction === 'grant' ? 'text-emerald-600' : 'text-destructive',
                )}
              >
                {formatNumber(projected)}
              </span>
              {direction === 'deduct' && currentBalance + delta < 0 && (
                <span className="text-muted-foreground"> (floors at zero)</span>
              )}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={adjust.isPending}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={!valid || adjust.isPending}
            variant={direction === 'deduct' ? 'destructive' : 'default'}
          >
            {adjust.isPending && <Loader2 className="size-4 animate-spin" />}
            {direction === 'grant' ? 'Grant credits' : 'Remove credits'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
