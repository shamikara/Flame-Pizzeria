import { redirect } from "next/navigation";
import db from "@/lib/db";
import { ProfileForm } from "@/components/profile-form";
import { getServerSession } from "@/lib/session";
import { user_role } from "@prisma/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default async function ProfilePage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/login'); 
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      email: true,
      firstName: true,
      lastName: true,
      contact: true,
      address: true,
      role: true,
    }
  });

  if (!user) {
    redirect('/login');
  }

  // Only customers and admins can edit their profiles
  // Employees cannot edit their own profiles
  const isEmployee = user.role !== user_role.CUSTOMER && user.role !== user_role.ADMIN && user.role !== user_role.MANAGER;

  if (isEmployee) {
    return (
      <div className="p-6 md:p-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Profile Settings
          </h2>
        </div>
        
        <Alert className="border-yellow-500/50 bg-yellow-500/10 max-w-2xl">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <AlertTitle className="text-yellow-500 text-lg">Access Restricted</AlertTitle>
          <AlertDescription className="text-yellow-400 mt-2">
            Employee profiles can only be managed by administrators. 
            Please contact your manager if you need to update your information.
          </AlertDescription>
        </Alert>

        <div className="mt-6 p-6 rounded-xl border border-gray-800 bg-gradient-to-b from-gray-950 to-gray-900 max-w-2xl">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Your Information</h3>
          <div className="space-y-3 text-gray-300">
            <div className="flex justify-between">
              <span className="text-gray-400">Name:</span>
              <span className="font-medium">{user.firstName} {user.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Email:</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Role:</span>
              <span className="font-medium">{user.role}</span>
            </div>
            {user.contact && (
              <div className="flex justify-between">
                <span className="text-gray-400">Phone:</span>
                <span className="font-medium">{user.contact}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Profile Settings
        </h2>
        <p className="text-gray-400 mt-2">
          Manage your account settings for <span className="font-semibold text-blue-400">{user.email}</span>
        </p>
      </div>
      <ProfileForm user={user} />
    </div>
  );
}