"use client"

import React from 'react';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

// Dynamic imports for better performance
const LoginForm = dynamic(() => import('@/components/login-form').then(m => m.LoginForm), {
  loading: () => <LoginFormLoading />
});

const RegisterForm = dynamic(() => import('@/components/register-form').then(m => m.RegisterForm), {
  loading: () => <RegisterFormLoading />
});

// Define the search params type
type SearchParams = Promise<{
  tab?: string | string[];
  email?: string | string[];
  [key: string]: string | string[] | undefined;
}>;

// Define the resolved search params type
type ResolvedSearchParams = {
  tab?: string | string[];
  email?: string | string[];
  [key: string]: string | string[] | undefined;
};

// Loading component for the entire page
function LoginPageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Image src="/img/logo.png" alt="Flames Pizzeria" width={60} height={60} />
          </div>
          <CardTitle className="text-2xl">Loading...</CardTitle>
          <CardDescription>Please wait while we prepare your login page</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="text-sm text-muted-foreground">Loading login page...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main login page component
function LoginPageContent({ searchParams }: { searchParams: SearchParams }) {
  // Safely extract search params using React.use()
  const params = React.use(searchParams);
  const tabParam = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const emailParam = Array.isArray(params.email) ? params.email[0] : params.email;

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
              <LoginForm searchParams={searchParams} />
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

// Loading component for login form
function LoginFormLoading() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        <p className="text-sm text-muted-foreground">Loading login form...</p>
      </div>
    </div>
  );
}

// Loading component for register form
function RegisterFormLoading() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        <p className="text-sm text-muted-foreground">Loading registration form...</p>
      </div>
    </div>
  );
}

// Main export with client-side loading
export default function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Minimal loading time for better UX (reduces flash)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300); // Reduced to 300ms for faster perceived loading

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoginPageLoading />;
  }

  return <LoginPageContent searchParams={searchParams} />;
}