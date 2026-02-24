import { z } from "zod";

export const billingAddressSchema = z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State/Region is required"),
    country: z.string().min(1, "Country is required"),
    postalCode: z.string().optional(),
});

export const organizationDetailsSchema = z.object({
    firstName: z.string().min(1, "First Name is required"),
    lastName: z.string().min(1, "Last Name is required"),
    organizationName: z.string().min(1, "Organization Name is required"),
    organizationEmail: z.email("Invalid email address"),
    phoneNumber: z.string().min(1, "Phone Number is required"),
});

export const checkoutSchema = z.object({
    organizationDetails: organizationDetailsSchema,
    billingAddress: billingAddressSchema,
    paymentMethod: z.enum(["hubtel", "paystack"]),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
