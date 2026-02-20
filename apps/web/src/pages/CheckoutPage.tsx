import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Input,
    Label,
    Separator
} from "@repo/ui"
import { CreditCard, Lock } from "lucide-react"
import { Link } from "react-router-dom"

export default function CheckoutPage() {

    return (
        <div className="container py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Checkout Form */}
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Checkout</h1>
                        <p className="text-muted-foreground">Complete your purchase securely.</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input id="firstName" placeholder="John" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" placeholder="Doe" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" placeholder="john@example.com" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Method</CardTitle>
                            <CardDescription>All transactions are secure and encrypted.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Mock Payment Fields */}
                            <div className="space-y-2">
                                <Label htmlFor="cardNumber">Card Number</Label>
                                <div className="relative">
                                    <Input id="cardNumber" placeholder="0000 0000 0000 0000" />
                                    <CreditCard className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="expiry">Expiry Date</Label>
                                    <Input id="expiry" placeholder="MM/YY" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cvc">CVC</Label>
                                    <Input id="cvc" placeholder="123" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/50 px-6 py-4">
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Lock className="h-4 w-4 mr-2" />
                                Your payment information is encrypted and secure.
                            </div>
                        </CardFooter>
                    </Card>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-24">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Product</span>
                                <span className="font-medium truncate max-w-37.5">Enterprise ERP Solution</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Price</span>
                                <span>$299.00</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tax (Estimated)</span>
                                <span>$29.90</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span>$328.90</span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col space-y-4">
                            <Button className="w-full" size="lg">
                                Complete Purchase
                            </Button>
                            <p className="text-xs text-center text-muted-foreground">
                                By clicking "Complete Purchase", you agree to our <Link to="/terms" className="underline">Terms of Service</Link>.
                            </p>
                        </CardFooter>
                    </Card>
                </div>

            </div>
        </div>
    )
}
