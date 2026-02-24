import { Card, Separator, Badge } from "@repo/ui";
import { useState, useMemo } from "react";
import { HubtelCheckoutButton } from "./HubtelCheckoutButton";
import { PaystackButton } from "./PaystackButton";

interface CartItem {
  productId: string;
  quantity: number;
  product?: {
    _id: string;
    title: string;
    price: number;
  };
}

interface OrderSummaryProps {
  items: CartItem[];
  total: number;
  subtotal: number;
  email: string;
  hubtelCheckoutPayload: any;
  metadata: {
    name: string;
    phone: string;
    custom_fields: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
  };
  isProcessing: boolean;
  isValid: boolean;
  onSuccess: (reference: any) => void;
  onClose: () => void;
}

export function OrderSummary({
  items,
  total,
  subtotal,
  email,
  hubtelCheckoutPayload,
  metadata,
  isProcessing,
  isValid,
  onSuccess,
  onClose,
}: OrderSummaryProps) {
  const hubtelAvailable = true; // Should come from env or config
  const [selectedMethod, setSelectedMethod] = useState<"primary" | "secondary">(
    hubtelAvailable ? "primary" : "secondary"
  );

  const purchaseDescription = useMemo(() => {
    if (items.length === 1 && items[0]?.product?.title) {
      return `Payment for ${items[0].product.title}`;
    }
    return `Payment for ${items.length} items`;
  }, [items]);

  const handlePrimaryFailure = () => {
    setSelectedMethod("secondary");
    onClose();
  };

  return (
    <Card className="p-6 sticky top-24">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
      <div className="space-y-4 mb-4">
        {items.map((item) => {
          if (!item.product) return null;
          return (
            <div key={item.productId} className="flex justify-between">
              <div>
                <p className="font-medium">{item.product.title}</p>
                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">GHS {(item.product.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          );
        })}

        <div className="border-t pt-4 mt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span>Subtotal</span>
            <span>GHS {subtotal.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>GHS {total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <p className="text-sm font-medium">Payment Method</p>
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => hubtelAvailable && setSelectedMethod("primary")}
            className={`w-full text-left border rounded-lg p-3 transition-colors ${selectedMethod === "primary"
              ? "border-primary bg-primary/5 ring-1 ring-primary"
              : "border-border hover:bg-muted/50"
              } ${hubtelAvailable
                ? "cursor-pointer"
                : "cursor-not-allowed opacity-50"
              }`}
            disabled={!hubtelAvailable}
          >
            <div className="flex items-center gap-2 mb-2">
              <img
                src="/momo.png"
                alt="MOMO payment"
                className="h-8 object-contain"
              />
              <img
                src="/card.png"
                alt="Card payment"
                className="h-8 object-contain"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Primary payment method</span>
              {selectedMethod === "primary" && (
                <Badge variant="secondary" className="text-xs">
                  Selected
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Fast and secure checkout with Mobile Money or Card.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMethod("secondary")}
            className={`w-full text-left border rounded-lg p-3 transition-colors ${selectedMethod === "secondary"
              ? "border-primary bg-primary/5 ring-1 ring-primary"
              : "border-border hover:bg-muted/50"
              }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium">Alternative payment method</span>
              {selectedMethod === "secondary" && (
                <Badge variant="secondary" className="text-xs">
                  Selected
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Secured by Paystack.
            </p>
          </button>
        </div>
      </div>

      {selectedMethod === "primary" && hubtelAvailable ? (
        <HubtelCheckoutButton
          amount={total}
          customerPhoneNumber={metadata.phone}
          purchaseDescription={purchaseDescription}
          checkoutPayload={hubtelCheckoutPayload}
          onSuccess={onSuccess}
          onFailure={handlePrimaryFailure}
          onClose={onClose}
          isProcessing={isProcessing}
          isValid={isValid}
          email={email}
          items={items}
        />
      ) : (
        <PaystackButton
          email={email}
          amount={total}
          metadata={metadata}
          onSuccess={onSuccess}
          onClose={onClose}
          isProcessing={isProcessing}
          isValid={isValid}
          items={items}
        />
      )}
    </Card>
  );
}
