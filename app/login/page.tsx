import { Suspense } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/components/login-form';
import { RegisterForm } from '@/components/register-form';

// The page now receives searchParams and passes them down
export default function LoginPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Determine which tab to show by default. Useful for redirects.
  const defaultTab = searchParams?.tab === 'register' ? 'register' : 'login';
  const defaultEmail = typeof searchParams?.email === 'string' ? searchParams.email : '';

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