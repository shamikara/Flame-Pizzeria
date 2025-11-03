"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Package, Utensils, Calendar as CalendarIcon, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderHistory } from "@/components/order-history";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/components/session-provider";
import { AccountSettingsModal } from "@/components/account-settings-modal";
import { UserRecipes } from "@/components/user-recipes";
import { UserEvents } from "@/components/user-events";

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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
          My Profile
        </h1>
        <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Manage your account settings, track orders, and view your event bookings
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-8">
        <div className="bg-white dark:bg-gray-900 p-1 rounded-full shadow-sm border border-gray-200 dark:border-gray-800 max-w-2xl mx-auto">
          <TabsList className="grid w-full grid-cols-4 bg-transparent">
            <TabsTrigger 
              value="profile" 
              className="flex items-center gap-2 rounded-full data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-orange-100 dark:data-[state=active]:bg-orange-900/20 dark:data-[state=active]:text-orange-400 dark:data-[state=active]:border-orange-800 transition-all"
            >
              <User className="h-4 w-4" />
              <span className="font-medium">Profile</span>
            </TabsTrigger>
            <TabsTrigger 
              value="orders" 
              className="flex items-center gap-2 rounded-full data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-orange-100 dark:data-[state=active]:bg-orange-900/20 dark:data-[state=active]:text-orange-400 dark:data-[state=active]:border-orange-800 transition-all"
            >
              <Package className="h-4 w-4" />
              <span className="font-medium">My Orders</span>
            </TabsTrigger>
            <TabsTrigger 
              value="events" 
              className="flex items-center gap-2 rounded-full data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-orange-100 dark:data-[state=active]:bg-orange-900/20 dark:data-[state=active]:text-orange-400 dark:data-[state=active]:border-orange-800 transition-all"
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="font-medium">My Events</span>
            </TabsTrigger>
            <TabsTrigger 
              value="recipes" 
              className="flex items-center gap-2 rounded-full data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-orange-100 dark:data-[state=active]:bg-orange-900/20 dark:data-[state=active]:text-orange-400 dark:data-[state=active]:border-orange-800 transition-all"
            >
              <Utensils className="h-4 w-4" />
              <span className="font-medium">My Recipes</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-8">
          <TabsContent value="profile" className="space-y-6">
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
              <CardHeader className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-orange-500" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-900/30 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</p>
                    <p className="text-gray-900 dark:text-white font-medium">{user.firstName} {user.lastName}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-900/30 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email Address</p>
                    <p className="text-gray-900 dark:text-white font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="pt-2">
                  <AccountSettingsModal />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
              <CardHeader className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Package className="h-5 w-5 text-orange-500" />
                  Order History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <OrderHistory />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
              <CardHeader className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-orange-500" />
                  My Events
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <UserEvents />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recipes">
            <UserRecipes />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
