import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Package, Utensils } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AccountSettingsModal } from "@/components/account-settings-modal";
import { OrderHistory } from "@/components/order-history";
import { UserRecipes } from "@/components/user-recipes";

export default async function CustomerProfilePage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/login?callbackUrl=/customer');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
          My Profile
        </h1>
        <p className="text-gray-400 mt-2">
          Manage your account, orders, and recipes
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <div className="flex justify-center">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 bg-gray-900/50 border border-gray-800">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" /> My Orders
            </TabsTrigger>
            <TabsTrigger value="recipes" className="flex items-center gap-2">
              <Utensils className="h-4 w-4" /> My Recipes
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-8">
          <TabsContent value="profile">
            <Card className="border-gray-800 bg-gray-900/50">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Personal Information</CardTitle>
                  <AccountSettingsModal />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-24 w-24 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                    {session.user.image ? (
                      <img 
                        src={session.user.image} 
                        alt={`${session.user.firstName} ${session.user.lastName}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-gray-300" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {session.user.firstName} {session.user.lastName}
                    </h3>
                    <p className="text-gray-400">{session.user.email}</p>
                    {session.user.phone && (
                      <p className="text-gray-400">{session.user.phone}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <OrderHistory />
          </TabsContent>

          <TabsContent value="recipes">
            <UserRecipes />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
