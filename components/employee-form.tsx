"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { user_role } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  firstName: z.string().min(2, "First name is too short."),
  lastName: z.string().min(2, "Last name is too short."),
  email: z.string().email("Invalid email address."),
  role: z.nativeEnum(user_role),
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
      role: user_role.WAITER,
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

  const employeeRoles = Object.values(user_role).filter(role => role !== user_role.CUSTOMER && role !== user_role.ADMIN && role !== user_role.MANAGER);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="firstName" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">First Name</FormLabel>
              <FormControl>
                <Input {...field} className="bg-gray-800 border-gray-700 text-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="lastName" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">Last Name</FormLabel>
              <FormControl>
                <Input {...field} className="bg-gray-800 border-gray-700 text-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-200">Email</FormLabel>
            <FormControl>
              <Input type="email" {...field} className="bg-gray-800 border-gray-700 text-white" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="role" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {employeeRoles.map(role => (
                    <SelectItem key={role} value={role} className="text-white hover:bg-gray-700">{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="salary" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">Salary (Rs.)</FormLabel>
              <FormControl>
                <Input type="number" min="0" step="0.01" {...field} className="bg-gray-800 border-gray-700 text-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Creating..." : "Create Employee"}
        </Button>
      </form>
    </Form>
  );
}