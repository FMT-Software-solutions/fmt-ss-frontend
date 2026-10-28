import { Button } from "@repo/ui";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createStoreOrder, normalizeGhanaPhone, type StoreBillingDetails } from "@/lib/store-order";

interface HubtelPaymentProps {
  amount: number;
  productIds: string[];
  getBillingDetails: () => Promise<StoreBillingDetails | null>;
  /** Already checked by the summary; the server applies it again. */
  discountCode?: string;
  onFailure?: () => void;
  isValid?: boolean;
}

/**
 * Sends the buyer to Hubtel's hosted checkout for a server-created order.
 * Hubtel returns them to /order-complete, which confirms with Hubtel.
 */
export function HubtelCheckoutButton({ amount, productIds, getBillingDetails, discountCode, onFailure, isValid = true }: HubtelPaymentProps) {
  const [busy, setBusy] = useState(false);

  const handlePayment = async () => {
    const billing = await getBillingDetails();
    if (!billing) return;
    const phone = normalizeGhanaPhone(billing.phoneNumber || "");
    if (!phone) {
      toast.error("Enter a valid Ghana phone number.");
      return;
    }

    setBusy(true);
    try {
      const order = await createStoreOrder({ productIds, billingDetails: billing, provider: "hubtel", discountCode });
      if (order.provider !== "hubtel") throw new Error("Unexpected payment provider");
      window.location.assign(order.checkoutUrl);
    } catch (error) {
      toast.error((error as Error).message);
      setBusy(false);
      onFailure?.();
    }
  };

  return (
    <Button onClick={handlePayment} className="w-full" size="lg" disabled={!isValid || busy}>
      {busy ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Redirecting…
        </>
      ) : (
        `Pay GHS ${amount.toFixed(2)}`
      )}
    </Button>
  );
}
