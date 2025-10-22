'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Spinner } from '@/components/ui/spinner'
import Link from 'next/link'
import { useSession } from '@/components/session-provider'

interface LoginFormProps {
  searchParams?: { [key: string]: string | string[] | undefined }
  onLoginSuccess?: () => void
}

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
})

export function LoginForm({ searchParams, onLoginSuccess }: LoginFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { refreshSession } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const defaultEmail = typeof searchParams?.email === 'string' ? searchParams.email : ''

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: defaultEmail,
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const result = await res.json()

      if (!res.ok) {
        toast({ 
          variant: 'destructive', 
          title: 'Login Failed', 
          description: result.error || 'Invalid email or password.' 
        })
        setIsLoading(false)
        return
      }

      // Show success message
      toast({ 
        title: 'Login Successful', 
        description: 'Redirecting you now...',
        duration: 2000,
      })

      // Set redirecting state for overlay spinner
      setIsRedirecting(true)

      // Small delay to show success message
      await new Promise(resolve => setTimeout(resolve, 500))

      await refreshSession()

      if (onLoginSuccess) {
        onLoginSuccess()
      } else {
        router.refresh()
        const userRole = result.user.role
        if (userRole === 'ADMIN' || userRole === 'MANAGER') {
          router.push('/dashboard/overview')
        } else if (userRole === 'CHEF') {
          router.push('/dashboard/chef/overview')
        } else if (userRole === 'WAITER') {
          router.push('/dashboard/waiter/overview')
        } else if (userRole === 'STORE_KEEP') {
          router.push('/dashboard/store-keep/overview')
        } else {
          router.push('/shop')
        }
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error)
      toast({ 
        variant: 'destructive', 
        title: 'Connection Error', 
        description: 'Please check your internet connection and try again.' 
      })
      setIsLoading(false)
      setIsRedirecting(false)
    } finally {
      // Don't reset loading state here - keep it until redirect completes
    }
  }

  return (
    <>
      {/* Full-page loading overlay during redirect */}
      {isRedirecting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Spinner />
            <p className="text-lg font-medium">Signing you in...</p>
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="example@example.com" 
                    {...field} 
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pr-10"
                      {...field}
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center justify-end">
            <Link 
              href="/forgot-password" 
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </Form>
    </>
  )
}