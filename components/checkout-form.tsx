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

export function CheckoutForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

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
      form.reset({ email: user.email, firstName: user.firstName, lastName: user.lastName, address: "", city: "", postalCode: "", phone: "", notes: "" });
    }
  }, [isAuthenticated, user, form]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    const fullAddress = [data.address, data.city, data.postalCode].filter(Boolean).join(", ");

    let orderPayload: any = {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      notes: data.notes,
      address: fullAddress,
      cartItems: cart,
    };

    if (!isAuthenticated) {
      orderPayload.password = data.email; // use email as pw for guest
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Checkout failed");

      if (result?.orderId) {
        localStorage.setItem("last-order-id", result.orderId);
      }

      toast({
        title: "Order Created",
        description: !isAuthenticated
          ? `Account created automatically. Use ${data.email} to login. Please proceed with payment.`
          : "Please proceed with payment to confirm your order.",
        duration: 8000,
      });

    } catch (error: any) {
      toast({ title: "Checkout Failed", description: error.message, variant: "destructive" });
      if (error.message.includes("already exists")) setIsLoginDialogOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Card>Loading...</Card>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isAuthenticated ? `Welcome back, ${user.firstName}!` : "Delivery Information"}</CardTitle>
        <CardDescription>{isAuthenticated ? "Confirm your details." : "Enter details to create an account automatically."}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} disabled={isAuthenticated} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} disabled={isAuthenticated} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} disabled={isAuthenticated} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem><FormLabel>Street Address</FormLabel><FormControl><Input placeholder="123 Galle Road" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Colombo" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="postalCode" render={({ field }) => (
                <FormItem><FormLabel>Postal Code (Optional)</FormLabel><FormControl><Input placeholder="00500" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="0771234567" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem><FormLabel>Order Notes</FormLabel><FormControl><Textarea placeholder="Special instructions" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Processing..." : "Place Order"}</Button>
          </form>
        </Form>
        {!isAuthenticated && (
          <div className="mt-2 text-center text-sm">
            Already have an account? <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
              <DialogTrigger asChild><Button variant="link">Login here</Button></DialogTrigger>
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
