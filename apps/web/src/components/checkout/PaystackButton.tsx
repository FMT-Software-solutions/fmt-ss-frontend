import { Button } from "@repo/ui";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePaystackPayment } from "react-paystack";
import { toast } from "sonner";
import { createStoreOrder, normalizeGhanaPhone, type StoreBillingDetails } from "@/lib/store-order";

interface PaystackPaymentProps {
  amount: number;
  productIds: string[];
  getBillingDetails: () => Promise<StoreBillingDetails | null>;
  /** Already checked by the summary; the server applies it again. */
  discountCode?: string;
  isValid?: boolean;
}

const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "";

/**
 * Pays a server-created order in the Paystack popup. The reference and amount
 * come from the server; on success the order page confirms with Paystack.
 */
export function PaystackButton({ amount, productIds, getBillingDetails, discountCode, isValid = true }: PaystackPaymentProps) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const initializePayment = usePaystackPayment({ publicKey });

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
      const order = await createStoreOrder({ productIds, billingDetails: billing, provider: "paystack", discountCode });
      if (order.provider !== "paystack") throw new Error("Unexpected payment provider");
      const name = [billing.firstName, billing.lastName].filter(Boolean).join(" ");
      initializePayment({
        config: {
          reference: order.reference,
          email: order.email,
          amount: Math.round(order.amount * 100),
          currency: "GHS",
          phone,
          firstname: billing.firstName,
          lastname: billing.lastName,
          label: name || billing.organizationName,
          channels: ["mobile_money", "card"],
          metadata: {
            custom_fields: [
              { display_name: "Organization", variable_name: "organization", value: billing.organizationName },
              { display_name: "Phone", variable_name: "phone", value: phone },
            ],
          },
        },
        onSuccess: () => navigate(`/order-complete?reference=${order.reference}`),
        onClose: () => setBusy(false),
      });
    } catch (error) {
      toast.error((error as Error).message);
      setBusy(false);
    }
  };

  return (
    <Button onClick={handlePayment} className="w-full" size="lg" disabled={!isValid || busy || !publicKey}>
      {busy ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing…
        </>
      ) : (
        `Pay GHS ${amount.toFixed(2)}`
      )}
    </Button>
  );
}
