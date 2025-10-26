"use client"

import { useEffect, useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import "./globals.css"

// Lazy-loaded sections for better performance
const HeroCarousel = dynamic(() => import("@/components/hero-carousel").then(m => m.HeroCarousel))
const FeaturedItems = dynamic(() => import("@/components/featured-items").then(m => m.FeaturedItems))
const CategoryShowcase = dynamic(() => import("@/components/category-showcase").then(m => m.CategoryShowcase))
const Testimonials = dynamic(() => import("@/components/testimonials").then(m => m.Testimonials))
const CTASection = dynamic(() => import("@/components/cta-section").then(m => m.CTASection))

// Types
type FoodItem = {
  id: number
  name: string
  description: string
  price: number
  image: string
  category: string
}

type PromotionBanner = {
  id: number
  title: string
  description: string
  buttonText: string | null
  buttonLink: string | null
  imageUrl: string
  startDate: string
  endDate: string
  isActive: boolean
}

export default function HomePage() {
  const [showMain, setShowMain] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const [featuredItems, setFeaturedItems] = useState<FoodItem[]>([])
  const [promotions, setPromotions] = useState<PromotionBanner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubscribing, setIsSubscribing] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Fetch food items + promotions
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, promosRes] = await Promise.all([
          fetch("/api/fooditems"),
          fetch("/api/promotion-banners?active=true"),
        ])

        const items = itemsRes.ok ? await itemsRes.json() : []
        const data = promosRes.ok ? await promosRes.json() : { promotions: [] }

        const now = new Date()
        const activePromotions = data.promotions.filter((p: PromotionBanner) => {
          const start = new Date(p.startDate)
          const end = new Date(p.endDate)
          return p.isActive && start <= now && end >= now
        })

        setFeaturedItems(items)
        setPromotions(activePromotions)
      } catch (err) {
        console.error("Fetch failed:", err)
        toast({
          title: "Error",
          description: "Couldn’t load content. Try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Check if user has already seen intro
  useEffect(() => {
    if (localStorage.getItem("hasVisitedHome") === "true") {
      setShowMain(true)
    } else {
      document.body.style.overflow = "hidden" // prevent scroll before entry
    }
  }, [])

  const handleEnter = () => {
    localStorage.setItem("hasVisitedHome", "true")
    setFadeOut(true)
    setTimeout(() => {
      document.body.style.overflow = "auto"
      setShowMain(true)
    }, 1300)
  }

  // Newsletter subscription
  const handleSubscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubscribing(true)

    try {
      const formData = new FormData(event.currentTarget)
      const email = formData.get("email") as string

      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Subscription failed.")

      toast({
        title: "Subscribed! 🎉",
        description: result.message,
      })

      localStorage.setItem("hasInteractedWithNewsletterModal", "true")
    } catch (err: any) {
      toast({
        title: "Oops!",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      })
    } finally {
      setIsSubscribing(false)
    }
  }

  // Format promotions for HeroCarousel
  const formattedPromotions = promotions.map(promo => ({
    id: promo.id,
    title: promo.title,
    description: promo.description,
    image: promo.imageUrl.startsWith("http")
      ? promo.imageUrl
      : `${process.env.NEXT_PUBLIC_APP_URL || ""}${promo.imageUrl}`,
    buttonText: promo.buttonText || "Order Now",
    buttonLink: promo.buttonLink || "/shop",
  }))

  return (
    <>
      <AnimatePresence>
        {!showMain && (
          <IntroScreen fadeOut={fadeOut} onEnter={handleEnter} onSubscribe={handleSubscribe} isSubscribing={isSubscribing} />
        )}
      </AnimatePresence>

      {showMain && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="container mx-auto px-4"
        >
          <HeroCarousel promotions={formattedPromotions} />
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground text-lg">Loading menu...</div>
          ) : (
            <FeaturedItems items={featuredItems} />
          )}
          <CategoryShowcase />
          <Testimonials />
          <CTASection />
        </motion.div>
      )}
    </>
  )
}

// ================== INTRO SCREEN COMPONENT ==================
function IntroScreen({
  fadeOut,
  onEnter,
  onSubscribe,
  isSubscribing,
}: {
  fadeOut: boolean
  onEnter: () => void
  onSubscribe: (e: FormEvent<HTMLFormElement>) => void
  isSubscribing: boolean
}) {
  return (
    <motion.div
      className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-1000 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background: `url('/img/bgimg.png') center/cover no-repeat, linear-gradient(135deg, #7c2d12 0%, #dc2626 50%, #000000 100%)`
      }}
    >
      {/* Background overlay for better readability */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>

      {/* Smoke effects overlay */}
      <div className="smoke-container absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rising-smoke" style={{ left: `${12 + i * 14}%`, animationDelay: `${i * 0.8}s` }} />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-white text-center pt-[5vh] px-4 w-full">
        <div className="backdrop-blur-md bg-black/20 border border-white/20 rounded-2xl p-4 w-full max-w-xl mx-auto shadow-2xl">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1 }}>
            <div className="relative w-40 h-40 mx-auto mb-6">
              <Image src="/img/logo.png" alt="Flames Pizzeria" fill className="object-contain animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-unifrakturcook bg-gradient-to-r from-yellow-300 via-orange-500 to-red-600 bg-clip-text text-transparent animate-pulse">
              Flames of Tradition
            </h1>
            <p className="text-lg md:text-xl max-w-xl mx-auto mb-8 text-white/90">
              Feel the warmth. Smell the smoke. Taste the tradition in every bite of our wood-fired creations.
            </p>
            <button
              onClick={onEnter}
              className="border border-white/80 bg-red-600 text-white px-8 py-2 rounded-full font-semibold text-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Reserve Your Table
            </button>
          </motion.div>

          {/* Newsletter Section */}
          <div className="mt-14">
            <div className="backdrop-blur-sm bg-white/5 p-8 rounded-2xl max-w-2xl mx-auto shadow-xl">
              <h3 className="text-2xl font-semibold mb-3 text-white">Join Our Newsletter</h3>
              <p className="text-white/80 mb-6 text-center">
                Get fresh updates, offers & recipes straight to your inbox.
              </p>
              <form onSubmit={onSubscribe} className="flex flex-col sm:flex-row gap-4 items-center justify-center max-w-lg mx-auto">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="px-6 py-2 w-full sm:flex-1 rounded-full border border-white/30 bg-white/20 text-white placeholder-white/70 focus:ring-2 focus:ring-orange-500 transition-all focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="bg-orange-600 text-white px-8 py-2 rounded-full font-semibold hover:bg-orange-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 shadow-lg"
                >
                  {isSubscribing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Subscribing...
                    </div>
                  ) : (
                    "Subscribe"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
