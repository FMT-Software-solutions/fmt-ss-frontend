import { Card, Separator, Badge, Button, Input } from "@repo/ui";
import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { HubtelCheckoutButton } from "./HubtelCheckoutButton";
import { PaystackButton } from "./PaystackButton";
import { quoteStoreOrder, type StoreBillingDetails, type StoreQuote } from "@/lib/store-order";

interface CartItem {
  productId: string;
  quantity: number;
  product?: {
    _id: string;
    title: string;
    price: number;
    originalPrice?: number;
    hasActivePromotion?: boolean;
  };
}

interface OrderSummaryProps {
  items: CartItem[];
  total: number;
  subtotal: number;
  isValid: boolean;
  getBillingDetails: () => Promise<StoreBillingDetails | null>;
  /** Buyer email so per-customer code limits are checked before paying. */
  email?: string;
  /** From ?code= in the link. */
  initialCode?: string;
}

const hubtelAvailable = import.meta.env.VITE_HUBTEL_ENABLED !== "false";

export function OrderSummary({ items, total, subtotal, isValid, getBillingDetails, email, initialCode }: OrderSummaryProps) {
  const [codeInput, setCodeInput] = useState(initialCode ?? "");
  const [quote, setQuote] = useState<StoreQuote | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"primary" | "secondary">(
    hubtelAvailable ? "primary" : "secondary"
  );
  const productIds = items.map((item) => item.productId);
  const discount = quote?.discount ?? null;
  const payable = discount ? quote!.total : total;

  // The server prices the code; this only shows the buyer what it will charge.
  const applyCode = async () => {
    const code = codeInput.trim();
    if (!code) return;
    setChecking(true);
    setCodeError(null);
    try {
      setQuote(await quoteStoreOrder({ productIds, discountCode: code, email: email || undefined }));
    } catch (error) {
      setQuote(null);
      setCodeError((error as Error).message);
    } finally {
      setChecking(false);
    }
  };
  const removeCode = () => {
    setQuote(null);
    setCodeInput("");
    setCodeError(null);
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
                {item.product.hasActivePromotion && item.product.originalPrice && (
                  <p className="text-xs text-muted-foreground line-through">
                    GHS {(item.product.originalPrice * item.quantity).toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        <div className="border-t pt-4 mt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span>Subtotal</span>
            <span>GHS {subtotal.toFixed(2)}</span>
          </div>
          {discount && (
            <div className="flex justify-between items-center text-green-600">
              <span className="flex items-center gap-1">
                {discount.code}
                <button type="button" onClick={removeCode} aria-label="Remove code" className="text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
              <span>− GHS {discount.amount.toFixed(2)}</span>
            </div>
          )}
          {!discount && (
            <div className="space-y-1">
              <div className="flex gap-2">
                <Input
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyCode())}
                  placeholder="Discount code"
                  className="h-9"
                />
                <Button type="button" variant="outline" size="sm" className="h-9" onClick={applyCode} disabled={checking || !codeInput.trim()}>
                  {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                </Button>
              </div>
              {codeError && <p className="text-xs text-destructive">{codeError}</p>}
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>GHS {payable.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <p className="text-sm font-medium">Payment Method</p>
        <div className="space-y-6">
          {hubtelAvailable && (
            <button
              type="button"
              onClick={() => setSelectedMethod("primary")}
              className={`w-full text-left border rounded-lg p-3 transition-colors cursor-pointer ${selectedMethod === "primary"
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border hover:bg-muted/50"
                }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <img src="/momo.png" alt="MOMO payment" className="h-8 object-contain" />
                <img src="/card.png" alt="Card payment" className="h-8 object-contain" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Mobile Money or Card</span>
                {selectedMethod === "primary" && (
                  <Badge variant="secondary" className="text-xs">
                    Selected
                  </Badge>
                )}
              </div>
            </button>
          )}

          <button
            type="button"
            onClick={() => setSelectedMethod("secondary")}
            className={`w-full text-left border rounded-lg p-3 transition-colors ${selectedMethod === "secondary"
              ? "border-primary bg-primary/5 ring-1 ring-primary"
              : "border-border hover:bg-muted/50"
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">Paystack</span>
              {selectedMethod === "secondary" && (
                <Badge variant="secondary" className="text-xs">
                  Selected
                </Badge>
              )}
            </div>
          </button>
        </div>
      </div>

      {selectedMethod === "primary" && hubtelAvailable ? (
        <HubtelCheckoutButton
          amount={payable}
          discountCode={discount?.code}
          productIds={productIds}
          getBillingDetails={getBillingDetails}
          onFailure={() => setSelectedMethod("secondary")}
          isValid={isValid}
        />
      ) : (
        <PaystackButton amount={payable} productIds={productIds} getBillingDetails={getBillingDetails} discountCode={discount?.code} isValid={isValid} />
      )}
    </Card>
  );
}
