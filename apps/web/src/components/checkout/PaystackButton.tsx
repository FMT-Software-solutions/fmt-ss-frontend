import { Button } from "@repo/ui";
import { Loader2 } from "lucide-react";
import { usePaystackPayment } from "react-paystack";
import type { PaystackProps } from "react-paystack/dist/types";
import { toast } from "sonner";
import { API_BASE_URL } from "../../lib/endpoints";
import { useState } from "react";
import { PaymentVerificationDialog } from "./PaymentVerificationDialog";

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
  checkoutPayload: any;
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
  items,
  checkoutPayload
}: PaystackPaymentProps) {
  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "";
  const [verificationState, setVerificationState] = useState<{
    isOpen: boolean;
    status: "processing" | "success" | "error";
    message?: string;
    reference?: any;
  }>({
    isOpen: false,
    status: "processing"
  });

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

  const verifyPayment = async (reference: any) => {
    setVerificationState({
      isOpen: true,
      status: "processing",
      reference
    });

    try {
      const checkoutResponse = await fetch(`${API_BASE_URL}/payments/paystack/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reference: reference.reference,
          checkoutPayload,
          paymentResponse: reference,
        }),
      });

      const checkoutResult = await checkoutResponse.json();

      if (!checkoutResponse.ok) {
        console.error("Checkout recording failed:", checkoutResult);
        setVerificationState(prev => ({
          ...prev,
          status: "error",
          message: checkoutResult.message || "Payment verification failed. Please try again."
        }));
        return;
      }

      setVerificationState(prev => ({
        ...prev,
        status: "success"
      }));

      // Wait a moment before redirecting
      setTimeout(() => {
        setVerificationState(prev => ({ ...prev, isOpen: false }));
        onSuccess({
          method: "paystack",
          reference: reference.reference,
          ...checkoutResult,
        });
      }, 2000);

    } catch (error) {
      console.error("Error recording checkout:", error);
      setVerificationState(prev => ({
        ...prev,
        status: "error",
        message: "An error occurred while verifying your payment."
      }));
    }
  };

  const handlePayment = async () => {
    if (!publicKey) {
      console.error("Paystack public key not initialized");
      return;
    }

    const normalizedPhone = normalizePhoneNumber(metadata.phone || "");
    if (!normalizedPhone) {
      toast.error("Enter a valid Ghana phone number to continue.");
      return;
    }

    // Check access first
    if (items.length > 0) {
      const productId = items[0].productId;
      try {
        const checkResponse = await fetch(`${API_BASE_URL}/purchases/check-access?email=${email}&productId=${productId}&mode=buy`);
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

    try {
      // @ts-ignore - types mismatch slightly but works
      return initializePayment({
        onSuccess: (reference: any) => {
          verifyPayment(reference);
        },
        onClose: () => {
          onClose();
        },
      });
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast.error("Failed to initialize payment system.");
      onClose();
    }
  };

  return (
    <>
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

      <PaymentVerificationDialog
        isOpen={verificationState.isOpen}
        onOpenChange={(open) => {
          // Only allow closing if not processing or if explicitly closed by user after error/success
          if (!open && verificationState.status !== "processing") {
            setVerificationState(prev => ({ ...prev, isOpen: false }));
          }
        }}
        status={verificationState.status}
        message={verificationState.message}
        onRetry={() => verificationState.reference && verifyPayment(verificationState.reference)}
      />
    </>
  );
}
