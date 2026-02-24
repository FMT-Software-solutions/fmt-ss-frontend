import type { UseFormReturn } from "react-hook-form";
import type { CheckoutFormData } from "../../lib/checkout-schema";
import { Card, CardContent, CardHeader, CardTitle, Input, Label } from "@repo/ui";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";

interface OrganizationDetailsFormProps {
  form: UseFormReturn<CheckoutFormData>;
}

export function OrganizationDetailsForm({ form }: OrganizationDetailsFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="organizationDetails.firstName"
            render={({ field }) => (
              <FormItem>
                <Label>First Name</Label>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="organizationDetails.lastName"
            render={({ field }) => (
              <FormItem>
                <Label>Last Name</Label>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="organizationDetails.organizationName"
          render={({ field }) => (
            <FormItem>
              <Label>Organization Name</Label>
              <FormControl>
                <Input placeholder="Acme Inc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="organizationDetails.organizationEmail"
            render={({ field }) => (
              <FormItem>
                <Label>Owner Email</Label>
                <FormControl>
                  <Input placeholder="admin@acme.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="organizationDetails.phoneNumber"
            render={({ field }) => (
              <FormItem>
                <Label>Phone Number</Label>
                <FormControl>
                  <Input placeholder="0200000000" {...field} />
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
