"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Role } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  firstName: z.string().min(2, "First name is too short."),
  lastName: z.string().min(2, "Last name is too short."),
  email: z.string().email("Invalid email address."),
  role: z.nativeEnum(Role),
  salary: z.coerce.number().min(0, "Salary must be a positive number."),
});

type FormValues = z.infer<typeof formSchema>;

async function createEmployee(data: FormValues) {
  const response = await fetch('/api/employees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorResult = await response.json();
    throw new Error(errorResult.error || 'Failed to create employee');
  }
  return response.json();
}

interface EmployeeFormProps {
  onFormSubmit: () => void;
}

export function EmployeeForm({ onFormSubmit }: EmployeeFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: Role.WAITER, // Default role
      salary: 40000,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await createEmployee(data);
      toast({ title: "Success", description: "New employee has been created." });
      onFormSubmit();
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error creating employee",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const employeeRoles = Object.values(Role).filter(role => role !== Role.CUSTOMER && role !== Role.ADMIN);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="firstName" render={({ field }) => (
            <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="lastName" render={({ field }) => (
            <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="role" render={({ field }) => (
            <FormItem><FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                        {employeeRoles.map(role => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            <FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="salary" render={({ field }) => (
            <FormItem><FormLabel>Salary (Rs.)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating..." : "Create Employee"}
        </Button>
      </form>
    </Form>
  );
}