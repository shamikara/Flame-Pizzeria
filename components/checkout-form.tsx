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

// Updated schema for Sri Lankan addresses
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  address: z.string().min(5, { message: "Street address must be at least 5 characters" }),
  city: z.string().min(2, { message: "City must be at least 2 characters" }),
  postalCode: z.string().min(4, { message: "Postal code must be at least 4 digits" }).optional().or(z.literal("")),
  phone: z.string().min(10, { message: "Phone number must be at least 10 characters" }),
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
      postalCode: "",
      phone: "",
      notes: "",
    },
  });

  // useEffect to populate form with logged-in user data
  useEffect(() => {
    async function populateFormWithUserData() {
      if (isAuthenticated && user) {
        try {
          const response = await fetch(`/api/users/${user.userId}`);
          if (!response.ok) throw new Error("Failed to fetch profile");

          const profileData = await response.json();
          const detailedUser = profileData.user;
          
          form.reset({
            email: detailedUser.email || user.email,
            firstName: detailedUser.firstName || user.firstName,
            lastName: detailedUser.lastName || "",
            // Note: You would need to parse the address back into its parts here
            // This is a simplified example. For now, we leave them blank for user to fill.
            address: "", 
            city: "",
            postalCode: "",
            phone: detailedUser.contact || "",
          });

        } catch (error) {
          console.error("Error populating form:", error);
          // Still reset with session data if API fails
           form.reset({ email: user.email, firstName: user.firstName, lastName: user.lastName });
        }
      }
    }
    populateFormWithUserData();
  }, [isAuthenticated, user, form]);

  // --- THIS IS THE UPDATED ONSUBMIT FUNCTION ---
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    // Combine address fields into a single string
    const fullAddress = [data.address, data.city, data.postalCode]
      .filter(Boolean)
      .join(", ");

    // Prepare the initial payload
    let orderPayload: any = {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      notes: data.notes,
      address: fullAddress,
      cartItems: cart,
    };

    // If the user is a guest, add the password to the payload
    if (!isAuthenticated) {
      orderPayload.password = data.email; // Set password as email
      console.log("Guest checkout: Adding password to payload.");
    }

    try {
      // Send the complete payload to the backend
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "An unknown error occurred.");
      }

      // Show a different toast message depending on whether the user was a guest
      if (!isAuthenticated) {
        toast({
          title: "Order Placed & Account Created!",
          description: "Your password is your email address. You can log in anytime to see your order history.",
          duration: 10000,
        });
      } else {
        toast({ title: "Order Placed Successfully!" });
      }

      clearCart();
      router.push("/order-confirmation");

    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Failed",
        description: error.message,
        variant: "destructive",
      });
      // If the error was because the user exists, open the login dialog
      if (error.message.includes("already exists")) {
        setIsLoginDialogOpen(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Card>...Loading Skeleton...</Card>; // Your loading skeleton
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isAuthenticated ? `Welcome back, ${user.firstName || ''}!` : 'Delivery Information'}</CardTitle>
        <CardDescription>{isAuthenticated ? 'Please confirm your delivery details below.' : 'Enter your details. An account will be created for you.'}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} disabled={isAuthenticated} /></FormControl><FormMessage /></FormItem> )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="firstName" render={({ field }) => ( <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} disabled={isAuthenticated} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="lastName" render={({ field }) => ( <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} disabled={isAuthenticated} /></FormControl><FormMessage /></FormItem> )} />
            </div>
            <FormField control={form.control} name="address" render={({ field }) => ( <FormItem><FormLabel>Street Address</FormLabel><FormControl><Input placeholder="e.g., 123 Galle Road" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="city" render={({ field }) => ( <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="e.g., Colombo" {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="postalCode" render={({ field }) => ( <FormItem><FormLabel>Postal Code (Optional)</FormLabel><FormControl><Input placeholder="e.g., 00500" {...field} /></FormControl><FormMessage /></FormItem> )} />
            </div>
            <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="0771234567" {...field} /></FormControl><FormMessage /></FormItem> )} />
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
  );
}