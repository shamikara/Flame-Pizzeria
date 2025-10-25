import { redirect } from "next/navigation";
import db from "@/lib/db";
import { ProfileForm } from "@/components/profile-form";
import { OrderHistory } from "@/components/order-history";
import { getServerSession } from "@/lib/session";
import { user_role } from "@prisma/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, User, Package, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <div className="p-4 md:p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          My Account
        </h1>
        <p className="text-gray-400 mt-2">
          Welcome back, <span className="font-semibold text-blue-400">{user.firstName}</span>
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-8 bg-gray-900/50 border border-gray-800">
          <TabsTrigger 
            value="profile" 
            className="flex items-center gap-2 data-[state=active]:bg-gray-800 data-[state=active]:text-white"
          >
            <User className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger 
            value="orders" 
            className="flex items-center gap-2 data-[state=active]:bg-gray-800 data-[state=active]:text-white"
          >
            <Package className="h-4 w-4" /> My Orders
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="flex items-center gap-2 data-[state=active]:bg-gray-800 data-[state=active]:text-white"
          >
            <Settings className="h-4 w-4" /> Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="border-gray-800 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="text-xl">Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileForm user={user} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <OrderHistory />
        </TabsContent>

        <TabsContent value="settings">
          <Card className="border-gray-800 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="text-xl">Account Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Email Address</h3>
                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div>
                      <p className="font-medium">{user.email}</p>
                      <p className="text-sm text-gray-400">Primary email address</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Change Email
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Password</h3>
                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div>
                      <p className="font-medium">•••••••••••</p>
                      <p className="text-sm text-gray-400">Last changed 3 months ago</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Change Password
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <h3 className="text-lg font-medium mb-2 text-red-400">Danger Zone</h3>
                  <div className="p-4 bg-red-900/10 border border-red-900/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Delete Account</p>
                        <p className="text-sm text-red-400/70">
                          Permanently delete your account and all associated data
                        </p>
                      </div>
                      <Button variant="destructive" size="sm">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}