"use client"

import { useState, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Mail, Loader2 } from "lucide-react"

interface NewsletterSubscriptionProps {
  className?: string
  variant?: "default" | "compact" | "modal"
}

export function NewsletterSubscription({
  className = "",
  variant = "default"
}: NewsletterSubscriptionProps) {
  const [email, setEmail] = useState("")
  const [isSubscribing, setIsSubscribing] = useState(false)
  const { toast } = useToast()

  const handleSubscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubscribing(true)

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || "Subscription failed.")
      }

      toast({
        title: "Success!",
        description: result.message,
      })
      setEmail("")

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      })
    } finally {
      setIsSubscribing(false)
    }
  }

  if (variant === "compact") {
    return (
      <div className={`bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-6 text-white ${className}`}>
        <div className="text-center">
          <Mail className="h-8 w-8 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">Get Exclusive Offers</h3>
          <p className="text-sm mb-4 opacity-90">Subscribe for special deals and new menu updates</p>
          <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 bg-white text-gray-900"
              required
            />
            <Button
              type="submit"
              disabled={isSubscribing}
              className="bg-white text-orange-500 hover:bg-gray-100"
            >
              {isSubscribing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Subscribe"
              )}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  if (variant === "modal") {
    return (
      <div className={`bg-white rounded-lg p-6 max-w-md mx-auto ${className}`}>
        <div className="text-center">
          <Mail className="h-12 w-12 mx-auto mb-4 text-orange-500" />
          <h3 className="text-xl font-semibold mb-2">Stay Updated!</h3>
          <p className="text-gray-600 mb-6">Get the latest deals and menu updates delivered to your inbox</p>
          <form onSubmit={handleSubscribe} className="space-y-4">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full"
              required
            />
            <Button
              type="submit"
              disabled={isSubscribing}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {isSubscribing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subscribing...
                </>
              ) : (
                "Subscribe to Newsletter"
              )}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className={`bg-gray-50 rounded-lg p-6 ${className}`}>
      <div className="text-center">
        <Mail className="h-10 w-10 mx-auto mb-3 text-orange-500" />
        <h3 className="text-lg font-semibold mb-2">Newsletter Subscription</h3>
        <p className="text-gray-600 mb-4">Get exclusive offers and updates</p>
        <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1"
            required
          />
          <Button
            type="submit"
            disabled={isSubscribing}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isSubscribing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Subscribe"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
