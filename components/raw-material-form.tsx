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
  quantity: z.coerce.number().min(0),
  unit: z.nativeEnum(MeasurementUnit),
  restockThreshold: z.coerce.number().min(0),
  supplierId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

async function createRawMaterial(data: FormValues) {
  const response = await fetch('/api/raw-materials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorResult = await response.json();
    throw new Error(errorResult.error || 'Failed to create raw material');
  }
  return response.json();
}

interface RawMaterialFormProps {
  suppliers: Supplier[];
  onFormSubmit: () => void;
}

export function RawMaterialForm({ suppliers, onFormSubmit }: RawMaterialFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      quantity: 0,
      unit: MeasurementUnit.KG,
      restockThreshold: 5,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await createRawMaterial(data);
      toast({ title: "Success", description: "New raw material has been added." });
      onFormSubmit();
      router.refresh();
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
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Material Name</FormLabel><FormControl><Input placeholder="e.g., All-Purpose Flour" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="quantity" render={({ field }) => (
            <FormItem><FormLabel>Initial Quantity</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="unit" render={({ field }) => (
            <FormItem><FormLabel>Unit</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                        {Object.values(MeasurementUnit).map(unit => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            <FormMessage /></FormItem>
          )} />
        </div>
         <FormField control={form.control} name="restockThreshold" render={({ field }) => (
            <FormItem><FormLabel>Restock Threshold</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormDescription>Receive alert when quantity falls below this.</FormDescription><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="supplierId" render={({ field }) => (
            <FormItem><FormLabel>Supplier (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a supplier"/></SelectTrigger></FormControl>
                    <SelectContent>
                        {suppliers.map(supplier => (
                            <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            <FormMessage /></FormItem>
          )} />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Adding..." : "Add Material"}
        </Button>
      </form>
    </Form>
  );
}