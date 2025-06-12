// "use client"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { z } from "zod"
// import { useForm } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { useToast } from "@/hooks/use-toast"
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

// const formSchema = z.object({
//   email: z.string().email({ message: "Please enter a valid email address" }),
//   password: z.string().min(6, { message: "Password must be at least 6 characters" }),
// })

// type FormValues = z.infer<typeof formSchema>

// export function LoginForm({ defaultEmail = "" }: { defaultEmail?: string }) {
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const { toast } = useToast()
//   const router = useRouter()

//   const form = useForm<FormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       email: defaultEmail,
//       password: "",
//     },
//   })

//   const onSubmit = async (data: FormValues) => {
//     setIsSubmitting(true)
//     try {
//       const res = await fetch("/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data),
//       })
  
//       const result = await res.json()
  
//       if (!res.ok) {
//         throw new Error(result.error || "Login failed")
//       }
  
//       toast({
//         title: "Login Successful",
//         description: "Welcome back!",
//       })
  
//       router.push("/dashboard")
//     } catch (error: any) {
//       console.error("Login error:", error)
//       toast({
//         title: "Login Failed",
//         description: error.message,
//         variant: "destructive",
//       })
//     } finally {
//       setIsSubmitting(false)
//     }
//   }
  


//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//         <FormField
//           control={form.control}
//           name="email"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Email</FormLabel>
//               <FormControl>
//                 <Input placeholder="your.email@example.com" {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <FormField
//           control={form.control}
//           name="password"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Password</FormLabel>
//               <FormControl>
//                 <Input type="password" placeholder="••••••••" {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <Button type="submit" className="w-full" disabled={isSubmitting}>
//           {isSubmitting ? "Logging in..." : "Login"}
//         </Button>

//         <div className="text-center">
//           <Button variant="link" className="text-sm">
//             Forgot password?
//           </Button>
//         </div>
//       </form>
//     </Form>
//   )
// }
// components/login-form.tsx// components/login-form.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

// Define the shape of the component's props
interface LoginFormProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export function LoginForm({ searchParams }: LoginFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Extract the email safely inside the Client Component
  const defaultEmail = typeof searchParams?.email === 'string' ? searchParams.email : '';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: defaultEmail,
      password: '',
    },
  });

  // ... (the rest of your onSubmit function and JSX remains the same)
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const result = await res.json();
      if (!res.ok) {
        toast({ variant: 'destructive', title: 'Login Failed', description: result.error || 'An unknown error occurred.' });
        return;
      }
      toast({ title: 'Login Successful', description: 'Redirecting you to the dashboard...' });
      router.refresh();
      const userRole = result.user.role;
      if (userRole === 'ADMIN') router.push('/dashboard/overview');
      else if (userRole === 'CHEF' || userRole === 'WAITER') router.push('/dashboard/orders');
      else if (userRole === 'STORE_KEEP') router.push('/dashboard/raw-materials');
      else router.push('/shop');
    } catch (error) {
      console.error('An unexpected error occurred:', error);
      toast({ variant: 'destructive', title: 'An Unexpected Error Occurred', description: 'Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="admin@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Sign In
        </Button>
      </form>
    </Form>
  );
}