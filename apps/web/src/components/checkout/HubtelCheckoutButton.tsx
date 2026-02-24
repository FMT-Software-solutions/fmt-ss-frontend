import { Button } from "@repo/ui";
import CheckoutSdk, { type AllowedChannelsType } from "@hubteljs/checkout";
import { Loader2 } from "lucide-react";
import { useMemo, useRef } from "react";
import { toast } from "sonner";
import { API_BASE_URL } from "../../lib/endpoints";

interface HubtelPaymentProps {
  amount: number;
  customerPhoneNumber: string;
  purchaseDescription: string;
  clientReference?: string;
  checkoutPayload: any; // Using any for simplicity, but should be typed
  onSuccess: (reference: any) => void;
  onFailure?: (reference: any) => void;
  onClose: () => void;
  isProcessing?: boolean;
  isValid?: boolean;
  email: string;
  items: Array<{ productId: string }>;
}

const getOrderId = (seed?: string) => {
  const base = seed ? seed.replace(/\s+/g, "") : "FMT";
  return `${base}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

export function HubtelCheckoutButton({
  amount,
  customerPhoneNumber,
  purchaseDescription,
  clientReference,
  checkoutPayload,
  onSuccess,
  onFailure,
  onClose,
  isProcessing = false,
  isValid = true,
  email,
  items
}: HubtelPaymentProps) {
  const isReady = useMemo(() => typeof window !== "undefined", []);
  const checkoutRef = useRef<CheckoutSdk | null>(null);

  const normalizePhoneNumber = (input: string) => {
    const digitsOnly = input.replace(/\D/g, "");
    if (digitsOnly.length === 9) {
      return `+233${digitsOnly}`;
    }
    if (digitsOnly.length === 10 && digitsOnly.startsWith("0")) {
      return `+233${digitsOnly.slice(1)}`;
    }
    if (digitsOnly.length === 12 && digitsOnly.startsWith("233")) {
      return `+${digitsOnly}`;
    }
    return null;
  };

  const handlePayment = async () => {
    if (!isReady) {
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

    const reference = getOrderId(clientReference);
    const normalizedPhone = normalizePhoneNumber(customerPhoneNumber || "");

    if (!normalizedPhone) {
      toast.error("Enter a valid Ghana phone number to continue.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/payments/hubtel/config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          purchaseDescription,
          customerPhoneNumber: normalizedPhone,
          clientReference: reference,
          checkoutPayload,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result?.config) {
        onFailure?.(result);
        toast.error("Failed to initialize payment.");
        return;
      }

      const resolvedReference = result.clientReference || reference;

      const allowedChannels: AllowedChannelsType[] = [
        "mobileMoney",
        "bankCard",
        "wallets",
      ];

      checkoutRef.current?.destroy();
      checkoutRef.current = new CheckoutSdk();
      checkoutRef.current.openModal({
        purchaseInfo: {
          amount,
          purchaseDescription,
          customerPhoneNumber: normalizedPhone,
          clientReference: resolvedReference,
        },
        config: {
          ...result.config,
          branding: "enabled" as const,
          allowedChannels,
        },
        callBacks: {
          onPaymentSuccess: async (data: any) => {
            console.log("Payment success:", data);
            try {
              const checkoutResponse = await fetch(
                `${API_BASE_URL}/payments/hubtel/checkout`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    clientReference: resolvedReference,
                    checkoutPayload,
                    paymentResponse: data,
                  }),
                }
              );

              const checkoutResult = await checkoutResponse.json();

              if (!checkoutResponse.ok) {
                console.error("Checkout recording failed:", checkoutResult);
                // Still consider it success as payment went through, but warn
                toast.warning("Payment successful but recording failed. Please contact support.");
              }

              onSuccess({
                method: "hubtel",
                reference: resolvedReference,
                data,
                ...checkoutResult,
              });
            } catch (error) {
              console.error("Error recording checkout:", error);
              toast.error("Payment successful but error recording transaction.");
              onSuccess({
                method: "hubtel",
                reference: resolvedReference,
                data,
              });
            }
          },
          // @ts-ignore
          onPaymentFailed: (data: any) => {
            console.error("Payment failed:", data);
            toast.error("Payment failed. Please try again.");
            onFailure?.(data);
          },
          onModalClose: () => {
            console.log("Modal closed");
            onClose();
          },
        },
      });
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast.error("Failed to initialize payment system.");
      onClose();
    }
  };

  return (
    <Button
      onClick={handlePayment}
      className="w-full"
      size="lg"
      disabled={!isValid || isProcessing}
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
