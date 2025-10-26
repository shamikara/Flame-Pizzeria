"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { order_status, order_type } from "@prisma/client";

// --- Form Schema for Validation ---
const formSchema = z.object({
  userId: z.string().min(1, "Customer is required."),
  total: z.coerce.number().min(0, "Total must be a positive number."),
  status: z.nativeEnum(order_status),
  type: z.nativeEnum(order_type),
  // Optional fields
  tableNumber: z.string().optional(),
  deliveryAddress: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// --- Server Action to Create the Order ---
async function createOrder(data: FormValues) {
  // This function would be in a separate actions file in a real app
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorResult = await response.json();
    throw new Error(errorResult.error || "Failed to create order");
  }
  return response.json();
}

// --- The Form Component ---
type MinimalUser = { id: string; firstName: string; lastName: string };
interface OrderFormProps {
  users: MinimalUser[];
  onFormSubmit: () => void;
}

export function OrderForm({ users, onFormSubmit }: OrderFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
      total: 0,
      status: order_status.PENDING,
      type: order_type.DINE_IN,
      tableNumber: "",
      deliveryAddress: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await createOrder(data);
      toast({ title: "Success", description: "New order has been created." });
      onFormSubmit(); // Close the dialog and refresh data
      router.refresh(); // Re-fetches data on the page
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="total"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Amount (Rs.)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 1250.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(v as order_status)}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(Object.values(order_status) as order_status[]).map(
                      (status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order Type</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(v as order_type)}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(Object.values(order_type) as order_type[]).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Creating...
            </>
          ) : (
            "Create Order"
          )}
        </Button>
      </form>
    </Form>
  );
}