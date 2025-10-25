import { Suspense } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/components/login-form';
import { RegisterForm } from '@/components/register-form';

// Define the search params type
type SearchParams = {
  tab?: string | string[];
  email?: string | string[];
  [key: string]: string | string[] | undefined;
};

// The page now receives searchParams and passes them down
export default function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Safely extract search params
  const tabParam = Array.isArray(searchParams.tab) ? searchParams.tab[0] : searchParams.tab;
  const emailParam = Array.isArray(searchParams.email) ? searchParams.email[0] : searchParams.email;
  
  const defaultTab = tabParam === 'register' ? 'register' : 'login';
  const defaultEmail = emailParam || '';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Image src="/img/logo.png" alt="Flames Pizzeria" width={60} height={60} />
          </div>
          <CardTitle className="text-2xl">Welcome Back!</CardTitle>
          <CardDescription>Sign in or create an account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-6">
              {/* Using Suspense is good practice for components that use searchParams */}
              <Suspense fallback={<div>Loading...</div>}>
                <LoginForm searchParams={searchParams} />
              </Suspense>
            </TabsContent>
            
            <TabsContent value="register" className="mt-6">
              <RegisterForm defaultEmail={defaultEmail} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}