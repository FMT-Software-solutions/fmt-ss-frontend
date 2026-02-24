import type { UseFormReturn } from "react-hook-form";
import type { CheckoutFormData } from "../../lib/checkout-schema";
import { Card, CardContent, CardHeader, CardTitle, Input, Label } from "@repo/ui";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";

interface BillingAddressFormProps {
  form: UseFormReturn<CheckoutFormData>;
}

export function BillingAddressForm({ form }: BillingAddressFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing Address</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="billingAddress.street"
          render={({ field }) => (
            <FormItem>
              <Label>Street Address</Label>
              <FormControl>
                <Input placeholder="123 Main St" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="billingAddress.city"
            render={({ field }) => (
              <FormItem>
                <Label>City</Label>
                <FormControl>
                  <Input placeholder="Accra" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="billingAddress.state"
            render={({ field }) => (
              <FormItem>
                <Label>State / Region</Label>
                <FormControl>
                  <Input placeholder="Greater Accra" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="billingAddress.country"
            render={({ field }) => (
              <FormItem>
                <Label>Country</Label>
                <FormControl>
                  <Input placeholder="Ghana" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="billingAddress.postalCode"
            render={({ field }) => (
              <FormItem>
                <Label>Postal Code (Optional)</Label>
                <FormControl>
                  <Input placeholder="00233" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
