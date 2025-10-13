"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { User } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateProfile, changePassword } from "@/app/actions/profile";
import { Separator } from "@/components/ui/separator";
import { User as UserIcon, Lock, Mail, Phone, MapPin, Loader2 } from "lucide-react";

const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  contact: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters").optional().or(z.literal("")),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

interface ProfileFormProps {
  user: Pick<User, 'firstName' | 'lastName' | 'contact' | 'address' | 'email'>;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      contact: user.contact || "",
      address: user.address || "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onProfileSubmit = async (data: ProfileFormValues) => {
    const result = await updateProfile(data);
    if (result.success) {
      toast({ title: "Success", description: result.success });
      router.refresh();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };
  
  const onPasswordSubmit = async (data: PasswordFormValues) => {
    const result = await changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
    if (result.success) {
      toast({ title: "Success", description: result.success });
      passwordForm.reset();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Personal Information Card */}
      <Card className="border-gray-800 bg-gradient-to-b from-gray-950 to-gray-900">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-blue-400" />
            <CardTitle className="text-gray-200">Personal Information</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Update your contact details and address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5">
              {/* Email (Read-only) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  Email Address
                </label>
                <Input 
                  value={user.email} 
                  disabled 
                  className="bg-gray-800/50 border-gray-700 text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>

              <Separator className="bg-gray-800" />

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <FormField 
                  control={profileForm.control} 
                  name="firstName" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">First Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-gray-800 border-gray-700 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
                <FormField 
                  control={profileForm.control} 
                  name="lastName" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-gray-800 border-gray-700 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
              </div>

              {/* Phone */}
              <FormField 
                control={profileForm.control} 
                name="contact" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="0771234567"
                        className="bg-gray-800 border-gray-700 text-white" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} 
              />

              {/* Address */}
              <FormField 
                control={profileForm.control} 
                name="address" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      Delivery Address
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="123 Main Street, Colombo"
                        rows={3}
                        className="bg-gray-800 border-gray-700 text-white resize-none" 
                      />
                    </FormControl>
                    <FormDescription className="text-gray-500">
                      Your default delivery address
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )} 
              />

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                disabled={profileForm.formState.isSubmitting}
              >
                {profileForm.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Profile"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card className="border-gray-800 bg-gradient-to-b from-gray-950 to-gray-900">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-purple-400" />
            <CardTitle className="text-gray-200">Security</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Change your account password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5">
              <FormField 
                control={passwordForm.control} 
                name="currentPassword" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Current Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        {...field} 
                        placeholder="Enter current password"
                        className="bg-gray-800 border-gray-700 text-white" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} 
              />

              <Separator className="bg-gray-800" />

              <FormField 
                control={passwordForm.control} 
                name="newPassword" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">New Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        {...field} 
                        placeholder="Enter new password"
                        className="bg-gray-800 border-gray-700 text-white" 
                      />
                    </FormControl>
                    <FormDescription className="text-gray-500">
                      Must be at least 6 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )} 
              />

              <FormField 
                control={passwordForm.control} 
                name="confirmPassword" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Confirm New Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        {...field} 
                        placeholder="Confirm new password"
                        className="bg-gray-800 border-gray-700 text-white" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} 
              />

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                disabled={passwordForm.formState.isSubmitting}
              >
                {passwordForm.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}