"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "@/components/session-provider";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LoginForm } from "@/components/login-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/components/cart-provider";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Loader2, CheckCircle2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  address: z.string().min(5),
  city: z.string().min(2),
  postalCode: z.string().optional().or(z.literal("")),
  phone: z.string().min(10),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CheckoutFormProps {
  onOrderCreated?: (orderId: number) => void;
}

export function CheckoutForm({ onOrderCreated }: CheckoutFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);

  const { user, isLoading } = useSession();
  const isAuthenticated = !isLoading && !!user;

  const { toast } = useToast();
  const router = useRouter();
  const { cart } = useCart();

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

  useEffect(() => {
    if (isAuthenticated && user) {
      form.reset({ 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        address: user.address || "", 
        city: "", 
        postalCode: "", 
        phone: user.phone || "", 
        notes: "" 
      });
    }
  }, [isAuthenticated, user, form]);

   // Check if order already exists
   useEffect(() => {
    const storedOrderId = localStorage.getItem("last-order-id");
    
    // If guest user, clear any old order IDs
    if (!isAuthenticated) {
      localStorage.removeItem("last-order-id");
      return;
    }
    
    // For authenticated users, check if they have a pending order
    if (storedOrderId) {
      setOrderCreated(true);
      if (onOrderCreated) {
        onOrderCreated(parseInt(storedOrderId));
      }
    }
  }, [onOrderCreated, isAuthenticated]);
  
  const onSubmit = async (data: FormValues) => {
    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before placing an order.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const fullAddress = [data.address, data.city, data.postalCode].filter(Boolean).join(", ");

    const orderPayload = {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      notes: data.notes,
      address: fullAddress,
      cartItems: cart,
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const result = await res.json();
      
      if (!res.ok) {
        if (result.requiresLogin) {
          setIsLoginDialogOpen(true);
        }
        throw new Error(result.error || "Checkout failed");
      }

      if (result?.orderId) {
        localStorage.setItem("last-order-id", result.orderId);
        setOrderCreated(true);
        
        if (onOrderCreated) {
          onOrderCreated(result.orderId);
        }
      }

      toast({
        title: result.isNewUser ? "Account Created!" : "Order Created!",
        description: result.message || "Please proceed with payment to confirm your order.",
        duration: 5000,
      });

    } catch (error: any) {
      toast({ 
        title: "Checkout Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isAuthenticated ? `Welcome back, ${user.firstName}!` : "Delivery Information"}
        </CardTitle>
        <CardDescription>
          {isAuthenticated 
            ? "Confirm your details." 
            : "Enter details to create an account automatically."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {orderCreated && (
          <Alert className="mb-4 border-green-500 bg-green-500/10">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-600">
              <strong>Order Created!</strong> Please complete payment below to confirm your order.
            </AlertDescription>
          </Alert>
        )}

        {!isAuthenticated && !orderCreated && (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>First-time customers:</strong> Your password will be set to your email address. 
              Please change it after your first login for security.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isAuthenticated || orderCreated} type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isAuthenticated || orderCreated} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isAuthenticated || orderCreated} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main Street" {...field} disabled={orderCreated} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Colombo" {...field} disabled={orderCreated} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="postalCode" render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input placeholder="00500" {...field} disabled={orderCreated} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="0771234567" {...field} disabled={orderCreated} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>Order Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Special instructions" {...field} disabled={orderCreated} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {!orderCreated && (
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Order...
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>
            )}
          </form>
        </Form>

        {!isAuthenticated && !orderCreated && (
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="link" className="p-0">Login here</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Sign In</DialogTitle>
                </DialogHeader>
                <LoginForm 
                  searchParams={{ email: form.watch("email") }} 
                  onLoginSuccess={() => { 
                    setIsLoginDialogOpen(false); 
                    router.refresh(); 
                  }} 
                />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}