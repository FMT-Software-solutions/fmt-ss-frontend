import {
  Form
} from "@/components/ui/form";
import { Lock } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { client, groq } from "@/lib/sanity";
import { checkoutSchema, type CheckoutFormData } from "@/lib/checkout-schema";
import { OrganizationDetailsForm } from "@/components/checkout/OrganizationDetailsForm";
import { BillingAddressForm } from "@/components/checkout/BillingAddressForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/endpoints";

const appByIdQuery = groq`
  *[_type == "premiumApp" && _id == $id][0] {
    _id,
    title,
    price,
    isFree,
    "mainImage": mainImage.asset->url,
    "slug": slug.current,
    appProvisioning
  }
`;

export default function CheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

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
    defaultValues: {
      organizationDetails: {
        firstName: "",
        lastName: "",
        organizationName: "",
        organizationEmail: "",
        phoneNumber: "",
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

  useEffect(() => {
    if (app) {
      console.log("App Data Loaded:", app);
      console.log("App Provisioning Config:", app.appProvisioning);
    }
  }, [app]);

  const handlePaymentSuccess = async (paymentDetails: any) => {
    // If it's Hubtel, the purchase is already recorded by the HubtelCheckoutButton/Backend flow
    if (paymentDetails.method === 'hubtel') {
      navigate(`/success?reference=${paymentDetails.reference}&type=payment`);
      return;
    }

    // For Paystack or others, we need to record it manually
    setIsProcessing(true);
    try {
      const formData = form.getValues();
      const purchasePayload = {
        organizationDetails: {
          ...formData.organizationDetails,
          address: formData.billingAddress
        },
        items: [
          {
            productId: app?._id,
            quantity: 1,
            price: app?.price,
            title: app?.title
          }
        ],
        total: app?.price || 0,
        payment_reference: paymentDetails.reference,
        status: 'completed',
        paymentProvider: paymentDetails.method,
        paymentMethod: paymentDetails.method,
        paymentDetails: paymentDetails
      };

      const response = await fetch(`${API_BASE_URL}/purchases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(purchasePayload)
      });

      if (!response.ok) {
        throw new Error('Failed to record purchase');
      }

      const purchaseData = await response.json();

      // Trigger provisioning
      await fetch(`${API_BASE_URL}/app-provisioning`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          organizationId: purchaseData.organization_id,
          billingDetails: {
            ...formData.organizationDetails,
            address: formData.billingAddress
          },
          appProvisioningDetails: {
            [app?._id]: {
              productId: app?._id,
              name: app?.title,
              useSameEmailAsAdmin: true,
              userEmail: formData.organizationDetails.organizationEmail,
              supabaseUrl: app?.appProvisioning?.supabaseUrl,
              supabaseAnonKey: app?.appProvisioning?.supabaseAnonKey,
              edgeFunctionName: app?.appProvisioning?.edgeFunctionName
            }
          },
          mode: 'buy'
        })
      });

      toast.success("Purchase successful! Check your email for details.");
      navigate(`/success?reference=${paymentDetails.reference}&type=payment`);
    } catch (error) {
      console.error("Purchase recording error:", error);
      toast.error("Payment successful but failed to record purchase. Please contact support.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentClose = () => {
    setIsProcessing(false);
  };

  if (isLoading) {
    return <div className="container py-12">Loading...</div>;
  }

  if (!app) {
    return <div className="container py-12">App not found</div>;
  }

  // Calculate totals
  const total = app.price || 0;
  const subtotal = total; // Add tax logic if needed

  // Prepare Hubtel payload
  const hubtelCheckoutPayload = {
    billingDetails: {
      ...form.getValues().organizationDetails,
      address: form.getValues().billingAddress,
    },
    items: [
      {
        productId: app._id,
        quantity: 1,
        product: {
          title: app.title,
          price: app.price,
          slug: app.slug
        }
      },
    ],
    total,
    isExistingOrg: false, // Logic to detect existing org can be added
    appProvisioningDetails: {
      [app._id]: {
        useSameEmailAsAdmin: true,
        userEmail: form.getValues().organizationDetails.organizationEmail,
        name: app.title,
        supabaseUrl: app.appProvisioning?.supabaseUrl,
        supabaseAnonKey: app.appProvisioning?.supabaseAnonKey,
        edgeFunctionName: app.appProvisioning?.edgeFunctionName
      },
    },
  };

  // Update payload when form changes
  const currentValues = form.watch();
  const metadata = {
    name: `${currentValues.organizationDetails.firstName} ${currentValues.organizationDetails.lastName}`,
    phone: currentValues.organizationDetails.phoneNumber,
    custom_fields: []
  };

  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Checkout</h1>
            <p className="text-muted-foreground">Complete your purchase securely.</p>
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
                  price: app.price || 0
                }
              },
            ]}
            total={total}
            subtotal={subtotal}
            email={currentValues.organizationDetails.organizationEmail}
            hubtelCheckoutPayload={hubtelCheckoutPayload}
            metadata={metadata}
            isProcessing={isProcessing}
            isValid={form.formState.isValid}
            onSuccess={handlePaymentSuccess}
            onClose={handlePaymentClose}
          />
        </div>
      </div>
    </div>
  );
}
