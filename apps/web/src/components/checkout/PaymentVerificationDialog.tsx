import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
} from "@repo/ui";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface PaymentVerificationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  status: "processing" | "success" | "error";
  message?: string;
  onRetry?: () => void;
  onClose?: () => void;
}

export function PaymentVerificationDialog({
  isOpen,
  onOpenChange,
  status,
  message,
  onRetry,
}: PaymentVerificationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Verification</DialogTitle>
          <DialogDescription>
            Please wait while we verify your payment status.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          {status === "processing" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Verifying transaction...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <div className="text-center space-y-1">
                <p className="font-medium">Payment Verified!</p>
                <p className="text-sm text-muted-foreground">
                  Your transaction has been confirmed successfully.
                </p>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-12 w-12 text-destructive" />
              <div className="text-center space-y-1">
                <p className="font-medium">Verification Failed</p>
                <p className="text-sm text-muted-foreground">
                  {message || "We couldn't verify your payment. Please try again."}
                </p>
              </div>
              {onRetry && (
                <Button onClick={onRetry} variant="outline" className="mt-4">
                  Retry Verification
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
