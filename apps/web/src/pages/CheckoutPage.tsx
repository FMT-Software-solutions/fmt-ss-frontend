import {
  Form
} from "@/components/ui/form";
import { Lock } from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { client, groq } from "@/lib/sanity";
import { checkoutSchema, type CheckoutFormData } from "@/lib/checkout-schema";
import { OrganizationDetailsForm } from "@/components/checkout/OrganizationDetailsForm";
import { BillingAddressForm } from "@/components/checkout/BillingAddressForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { toast } from "sonner";
import type { StoreBillingDetails } from "@/lib/store-order";
import { getPriceDetails } from "@/lib/pricing";

const appByIdQuery = groq`
  *[_type == "premiumApp" && _id == $id][0] {
    _id,
    title,
    price,
    isFree,
    promotion {
      hasPromotion,
      discountPrice,
      startDate,
      endDate,
      isActive
    },
    "mainImage": mainImage.asset->url,
    "slug": slug.current
  }
`;

export default function CheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("cancelled")) toast.info("Payment cancelled.");
  }, [searchParams]);

  const { data: app, isLoading } = useQuery({
    queryKey: ["app", id],
    queryFn: async () => {
      if (!id) return null;
      return await client.fetch(appByIdQuery, { id });
    },
    enabled: !!id,
  });

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    // Apps link here with ?email=&org=&phone=&name= so upgrading from a trial
    // starts with the organization's details filled in.
    defaultValues: {
      organizationDetails: {
        firstName: (searchParams.get("name") ?? "").split(" ")[0],
        lastName: (searchParams.get("name") ?? "").split(" ").slice(1).join(" "),
        organizationName: searchParams.get("org") ?? "",
        organizationEmail: searchParams.get("email") ?? "",
        phoneNumber: searchParams.get("phone") ?? "",
      },
      billingAddress: {
        street: "",
        city: "",
        state: "",
        country: "Ghana",
        postalCode: "",
      },
      paymentMethod: "hubtel",
    },
    mode: "onChange",
  });
  const buyerEmail = useWatch({ control: form.control, name: "organizationDetails.organizationEmail" });

  /** Validates the form; the buyer details sent with the order, or null. */
  const getBillingDetails = async (): Promise<StoreBillingDetails | null> => {
    const ok = await form.trigger();
    if (!ok) {
      toast.error("Complete the required details.");
      return null;
    }
    const values = form.getValues();
    return { ...values.organizationDetails, address: values.billingAddress };
  };

  if (isLoading) {
    return <div className="container py-12">Loading...</div>;
  }

  if (!app) {
    return <div className="container py-12">App not found</div>;
  }

  // Calculate totals
  const { finalPrice: total, originalPrice } = getPriceDetails(app);
  const subtotal = total; // Add tax logic if needed

  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Checkout</h1>
          </div>

          <Form {...form}>
            <form className="space-y-8">
              <OrganizationDetailsForm form={form} />
              <BillingAddressForm form={form} />
            </form>
          </Form>

          <div className="bg-muted/50 px-6 py-4 rounded-lg border">
            <div className="flex items-center text-sm text-muted-foreground">
              <Lock className="h-4 w-4 mr-2" />
              Your payment information is encrypted and secure.
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <OrderSummary
            items={[
              {
                productId: app._id,
                quantity: 1,
                product: {
                  _id: app._id,
                  title: app.title,
                  price: total,
                  originalPrice: originalPrice,
                  hasActivePromotion: getPriceDetails(app).hasActivePromotion,
                }
              },
            ]}
            total={total}
            subtotal={subtotal}
            isValid={form.formState.isValid}
            getBillingDetails={getBillingDetails}
            email={buyerEmail}
            initialCode={searchParams.get("code") ?? undefined}
          />
        </div>
      </div>
    </div>
  );
}
