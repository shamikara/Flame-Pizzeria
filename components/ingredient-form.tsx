"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { MeasurementUnit, Supplier } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(2, "Name is too short."),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
  unit: z.nativeEnum(MeasurementUnit),
  restockThreshold: z.coerce.number().min(0, "Threshold cannot be negative"),
  supplierId: z.string().optional(),
  expiryDate: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

async function createIngredient(data: FormValues) {
  const response = await fetch('/api/ingredients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorResult = await response.json();
    throw new Error(errorResult.error || 'Failed to create ingredient');
  }
  return response.json();
}

interface IngredientFormProps {
  suppliers: Supplier[];
  onFormSubmit: () => void;
}

export function IngredientForm({ suppliers, onFormSubmit }: IngredientFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      stock: 0,
      unit: MeasurementUnit.KG,
      restockThreshold: 5,
      supplierId: undefined,
      expiryDate: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await createIngredient(data);
      toast({ title: "Success", description: "New ingredient added!" });
      onFormSubmit();
      router.refresh();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">Ingredient Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., All-Purpose Flour" {...field} className="bg-gray-800 border-gray-700 text-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-200">Initial Stock</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} className="bg-gray-800 border-gray-700 text-white" />
                </FormControl>
                <FormDescription className="text-gray-400">Current stock quantity</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-200">Unit</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {Object.values(MeasurementUnit).map(unit => (
                        <SelectItem key={unit} value={unit} className="text-white hover:bg-gray-700">{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="restockThreshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">Restock Threshold</FormLabel>
              <FormControl>
                <Input type="number" min="0" step="0.01" {...field} className="bg-gray-800 border-gray-700 text-white" />
              </FormControl>
              <FormDescription className="text-gray-400">Receive alert when stock falls below this level.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expiryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">Expiry Date (Optional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} className="bg-gray-800 border-gray-700 text-white" />
              </FormControl>
              <FormDescription className="text-gray-400">Set expiry date to receive alerts</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="supplierId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">Supplier (Optional)</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select a supplier" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {suppliers.map(supplier => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()} className="text-white hover:bg-gray-700">{supplier.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Adding..." : "Add Ingredient"}
        </Button>
      </form>
    </Form>
  );
}