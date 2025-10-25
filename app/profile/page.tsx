"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Package, Utensils, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderHistory } from "@/components/order-history";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/components/session-provider";
import { AccountSettingsModal } from "@/components/account-settings-modal";
import { UserRecipes } from "@/components/user-recipes";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: isSessionLoading } = useSession();
  
  useEffect(() => {
    if (!isSessionLoading && !user) {
      router.push('/login?callbackUrl=/profile');
    }
  }, [user, isSessionLoading, router]);

  if (isSessionLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <p>Checking your session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
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
              value="recipes" 
              className="flex items-center gap-2 data-[state=active]:bg-gray-800 data-[state=active]:text-white"
            >
              <Utensils className="h-4 w-4" /> My Recipes
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-8">
          <TabsContent value="profile">
            <Card className="border-gray-800 bg-gray-900/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <p className="text-sm text-gray-400 mt-1">
                    View and manage your personal information
                  </p>
                </div>
                <AccountSettingsModal />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="h-24 w-24 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                    {user.image ? (
                      <img 
                        src={user.image} 
                        alt={`${user.firstName} ${user.lastName}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-gray-400">{user.email}</p>
                    {user.phone && (
                      <p className="text-gray-400">{user.phone}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400">Account Created</h4>
                    <p>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400">Last Updated</h4>
                    <p>{user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : '—'}</p>
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
