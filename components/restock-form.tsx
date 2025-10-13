"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, PackagePlus } from "lucide-react";
import { Ingredient } from "@prisma/client";

const formSchema = z.object({
  quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0"),
  expiryDate: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RestockFormProps {
  ingredient: Ingredient;
  onSuccess: () => void;
}

export function RestockForm({ ingredient, onSuccess }: RestockFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: ingredient.restockThreshold * 2,
      expiryDate: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await fetch(`/api/ingredients/${ingredient.id}/restock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to restock');
      }

      toast({ 
        title: "Success", 
        description: `${ingredient.name} restocked successfully!` 
      });
      
      form.reset();
      onSuccess();
      router.refresh();
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const newStock = form.watch('quantity') + ingredient.stock;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="p-4 bg-gray-800/50 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Current Stock:</span>
            <span className="text-gray-200 font-semibold">{ingredient.stock} {ingredient.unit}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Restock Threshold:</span>
            <span className="text-gray-200">{ingredient.restockThreshold} {ingredient.unit}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-gray-700 pt-2">
            <span className="text-gray-400">New Stock:</span>
            <span className="text-green-400 font-bold">{newStock.toFixed(2)} {ingredient.unit}</span>
          </div>
        </div>

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">Restock Quantity</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0.01" 
                  step="0.01" 
                  {...field} 
                  className="bg-gray-800 border-gray-700 text-white" 
                />
              </FormControl>
              <FormDescription className="text-gray-400">
                Amount to add to current stock
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expiryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">New Expiry Date (Optional)</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  {...field} 
                  className="bg-gray-800 border-gray-700 text-white" 
                />
              </FormControl>
              <FormDescription className="text-gray-400">
                Update expiry date for this batch
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Restocking...
            </>
          ) : (
            <>
              <PackagePlus className="mr-2 h-4 w-4" />
              Restock Ingredient
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}