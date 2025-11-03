"use client"

import { useState, FormEvent } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Mail, Loader2 } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import Image from "next/image"

interface NewsletterSubscriptionProps {
  className?: string
  variant?: "default" | "compact" | "modal"
  onSubscribed?: () => void
}

export function NewsletterSubscription({
  className = "",
  variant = "default",
  onSubscribed
}: NewsletterSubscriptionProps) {
  const [email, setEmail] = useState("")
  const [isSubscribing, setIsSubscribing] = useState(false)
  const { toast } = useToast()

  const handleSubscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubscribing(true)

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const result = await res.json()

      if (!res.ok) throw new Error(result.error || "Subscription failed.")

      toast({
        title: "Subscribed 🎉",
        description: result.message,
      })
      setEmail("")
      onSubscribed?.()
    } catch (error: any) {
      toast({
        title: "Oops!",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      })
    } finally {
      setIsSubscribing(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  // ==== COMPACT VARIANT ====
  if (variant === "compact") {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-red-500 to-rose-500 p-8 text-white shadow-lg ${className}`}
      >
        <div className="text-center space-y-2">
          <Mail className="h-8 w-8 mx-auto mb-2 opacity-90" />
          <h3 className="text-xl font-semibold tracking-tight">Get Exclusive Offers</h3>
          <p className="text-sm text-white/80 mb-5">Join our newsletter for deals & menu updates</p>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 bg-white text-gray-900 placeholder:text-gray-500"
              required
            />
            <Button
              type="submit"
              disabled={isSubscribing}
              className="bg-white text-orange-600 hover:bg-gray-100 transition"
            >
              {isSubscribing ? <Spinner size="sm" className="text-orange-600" /> : "Subscribe"}
            </Button>
          </form>
        </div>
      </motion.div>
    )
  }

  // ==== MODAL VARIANT ====
  if (variant === "modal") {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className={`bg-white rounded-2xl p-8 shadow-xl max-w-md mx-auto ${className}`}
      >
        <div className="text-center">
         <Image src="/img/logo.png" alt="Flames" width={80} height={80} />
          <h3 className="text-2xl font-semibold mb-2 text-gray-800">Stay Updated!</h3>
          <p className="text-gray-500 mb-6">
            Get the latest offers, events, and menu updates straight to your inbox.
          </p>

          <form onSubmit={handleSubscribe} className="space-y-4">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full border-gray-300"
              required
            />
            <Button
              type="submit"
              disabled={isSubscribing}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all"
            >
              {isSubscribing ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Subscribing...
                </>
              ) : (
                "Subscribe to Newsletter"
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    )
  }

  // ==== DEFAULT VARIANT ====
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`rounded-2xl bg-slate-100 p-8 text-center shadow-md ${className}`}
    >
      <Mail className="h-10 w-10 mx-auto mb-3 text-orange-500" />
      <h3 className="text-xl font-semibold mb-2 text-gray-800">Join Our Newsletter</h3>
      <p className="text-gray-500 mb-5">Be the first to know about new dishes & exclusive deals.</p>

      <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-1 border-gray-300"
          required
        />
        <Button
          type="submit"
          disabled={isSubscribing}
          className="bg-orange-500 hover:bg-orange-600 transition"
        >
          {isSubscribing ? <Spinner size="sm" className="text-orange-600" /> : "Subscribe"}
        </Button>
      </form>
    </motion.div>
  )
}
