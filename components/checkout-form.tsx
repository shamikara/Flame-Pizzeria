"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSession } from "@/components/session-provider"
import { UserPayload } from "@/lib/session"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LoginForm } from "@/components/login-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/components/cart-provider"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  // Making address fields optional initially, as they might be fetched
  address: z.string().min(5, { message: "Address must be at least 5 characters" }).optional().or(z.literal("")),
  city: z.string().min(2, { message: "City must be at least 2 characters" }).optional().or(z.literal("")),
  state: z.string().min(2, { message: "State must be at least 2 characters" }).optional().or(z.literal("")),
  zipCode: z.string().min(5, { message: "Zip code must be at least 5 characters" }).optional().or(z.literal("")),
  phone: z.string().min(10, { message: "Phone number must be at least 10 characters" }).optional().or(z.literal("")),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CheckoutForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  
  const { user, isLoading } = useSession();
  const isAuthenticated = !isLoading && !!user;

  const { toast } = useToast();
  const router = useRouter();
  const { cart, clearCart } = useCart();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      notes: "",
    },
  });

  useEffect(() => {
    async function populateFormWithUserData() {
      if (isAuthenticated && user) {
        try {
          // Immediately set basic info from session
          form.reset({
            email: user.email || "",
            firstName: user.firstName || "",
            lastName: user.lastName || "",
          });

          // Fetch detailed profile from your API
          const response = await fetch(`/api/users/${user.userId}`);
          if (!response.ok) {
            console.error("Failed to fetch user profile details.");
            return;
          }

          const profileData = await response.json();
          const detailedUser = profileData.user;
          
          // Reset the form again with all available details
          // IMPORTANT: Adjust the property names (e.g., `detailedUser.address.street`)
          // to match the exact structure of your API response.
          form.reset({
            email: detailedUser.email || user.email,
            firstName: detailedUser.firstName || user.firstName,
            lastName: detailedUser.lastName || "",
            address: detailedUser.address || "", // Example: Adjust if address is an object
            city: detailedUser.city || "",       // Example: Adjust as needed
            state: detailedUser.state || "",     // Example: Adjust as needed
            zipCode: detailedUser.zipCode || "", // Example: Adjust as needed
            phone: detailedUser.contact || "",
          });

        } catch (error) {
          console.error("Error populating form with user data:", error);
        }
      }
    }

    populateFormWithUserData();
  }, [isAuthenticated, user, form, toast]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const orderDetails = { ...data, cartItems: cart };

    try {
      if (isAuthenticated && user) {
        const response = await fetch('/api/checkout', { // Assuming one endpoint for simplicity
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.userId, ...orderDetails }),
        });
        if (!response.ok) throw new Error('Failed to create order.');
        toast({ title: "Order Placed Successfully!" });
      } else {
        // Guest checkout with auto-registration
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderDetails), // Send guest data
        });

        if (response.status === 409) { // 409 Conflict: Email already exists
          toast({ variant: "destructive", title: "Account Exists", description: "Please log in to place your order." });
          setIsLoginDialogOpen(true);
          return;
        }
        if (!response.ok) throw new Error('Order processing failed.');
        toast({ title: "Order Placed & Account Created!", description: "Check your email for account details." });
      }

      clearCart();
      router.push("/order-confirmation");
    } catch (error) {
      console.error("Checkout error:", error);
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
        <Card>
            <CardHeader><div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse dark:bg-gray-700"></div><div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse dark:bg-gray-700 mt-2"></div></CardHeader>
            <CardContent className="space-y-6"><div className="h-10 bg-gray-200 rounded w-full animate-pulse dark:bg-gray-700"></div><div className="h-20 bg-gray-200 rounded w-full animate-pulse dark:bg-gray-700"></div><div className="h-10 bg-gray-200 rounded w-full animate-pulse dark:bg-gray-700"></div><div className="h-12 bg-gray-200 rounded w-full animate-pulse dark:bg-gray-700 mt-4"></div></CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isAuthenticated ? `Welcome back,  ${userDetails.firstName || ''}!` : 'Delivery Information'}</CardTitle>
        <CardDescription>{isAuthenticated ? 'Please confirm your delivery details below.' : 'Enter your details. An account will be created for you.'}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="your.email@example.com" {...field} disabled={isAuthenticated} /></FormControl><FormMessage /></FormItem> )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="firstName" render={({ field }) => ( <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="John" {...field} disabled={isAuthenticated} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="lastName" render={({ field }) => ( <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Doe" {...field} disabled={isAuthenticated} /></FormControl><FormMessage /></FormItem> )} />
            </div>
            <FormField control={form.control} name="address" render={({ field }) => ( <FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="123 Main St" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="city" render={({ field }) => ( <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="New York" {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="state" render={({ field }) => ( <FormItem><FormLabel>State</FormLabel><FormControl><Input placeholder="NY" {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="zipCode" render={({ field }) => ( <FormItem><FormLabel>Zip Code</FormLabel><FormControl><Input placeholder="10001" {...field} /></FormControl><FormMessage /></FormItem> )} />
            </div>
            <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="(123) 456-7890" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="notes" render={({ field }) => ( <FormItem><FormLabel>Order Notes (Optional)</FormLabel><FormControl><Textarea placeholder="Special delivery instructions..." className="resize-none" {...field} /></FormControl><FormMessage /></FormItem> )} />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Place Order"}
            </Button>
          </form>
        </Form>
        {!isAuthenticated && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
              <DialogTrigger asChild><Button variant="link" className="p-0 h-auto">Login here</Button></DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader><DialogTitle>Sign In</DialogTitle></DialogHeader>
                <LoginForm searchParams={{ email: form.watch("email") }} onLoginSuccess={() => { setIsLoginDialogOpen(false); router.refresh(); }} />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  )
}