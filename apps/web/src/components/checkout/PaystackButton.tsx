import { Button } from "@repo/ui";
import { Loader2 } from "lucide-react";
import { usePaystackPayment } from "react-paystack";
import type { PaystackProps } from "react-paystack/dist/types";
import { toast } from "sonner";
import { API_BASE_URL } from "../../lib/endpoints";

type HookConfig = Omit<PaystackProps, 'text' | 'onSuccess' | 'onClose'>;

interface PaystackPaymentProps {
  email: string;
  amount: number;
  metadata: {
    name: string;
    phone: string;
    custom_fields: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
  };
  onSuccess: (reference: any) => void;
  onClose: () => void;
  isProcessing?: boolean;
  isValid?: boolean;
  items: Array<{ productId: string }>;
}

const getOrderId = () => {
  return `FMT_${new Date().getTime()}`;
};

export function PaystackButton({
  email,
  amount,
  metadata,
  onSuccess,
  onClose,
  isProcessing = false,
  isValid = true,
  items
}: PaystackPaymentProps) {
  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "";

  const config: HookConfig = {
    reference: getOrderId(),
    email,
    amount: amount * 100, // Convert to GHS to pesewas
    publicKey,
    currency: "GHS",
    label: metadata.name,
    phone: metadata.phone,
    firstname: metadata.name.split(" ")[0] || "",
    lastname: metadata.name.split(" ")[1] || "",
    metadata: {
      ...metadata,
      custom_fields: [
        {
          display_name: "Name",
          variable_name: "name",
          value: metadata.name,
        },
        {
          display_name: "Phone",
          variable_name: "phone",
          value: metadata.phone,
        },
      ],
    },
    channels: ["mobile_money", "card"], // Allow both mobile money and card payments
  };

  const initializePayment = usePaystackPayment(config);

  const handlePayment = async () => {
    if (!publicKey) {
      console.error("Paystack public key not initialized");
      return;
    }

    // Check access first
    if (items.length > 0) {
      const productId = items[0].productId;
      try {
        const checkResponse = await fetch(`${API_BASE_URL}/purchases/check-access?email=${email}&productId=${productId}`);
        const checkResult = await checkResponse.json();

        if (checkResult.hasAccess) {
          toast.error("You already have access to this app with this email.");
          return;
        }
      } catch (error) {
        console.error("Error checking access:", error);
        toast.error("Unable to verify account status. Please try again.");
        return;
      }
    }

    // @ts-ignore - types mismatch slightly but works
    return initializePayment({
      onSuccess: (reference: any) => {
        onSuccess(reference);
      },
      onClose: () => {
        onClose();
      },
    });
  };

  return (
    <Button
      onClick={handlePayment}
      className="w-full"
      size="lg"
      disabled={!isValid || isProcessing || !publicKey}
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing Payment...
        </>
      ) : (
        `Pay GHS ${amount.toFixed(2)}`
      )}
    </Button>
  );
}
