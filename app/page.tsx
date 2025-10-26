"use client";

import { useEffect, useState ,FormEvent } from "react";
import { useRouter } from "next/navigation";
import "./globals.css";
import { HeroCarousel } from "@/components/hero-carousel";
import { FeaturedItems } from "@/components/featured-items";
import { CategoryShowcase } from "@/components/category-showcase";
import { Testimonials } from "@/components/testimonials";
import { CTASection } from "@/components/cta-section";
import { NewsletterModal } from "@/components/newsletter-modal";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type FoodItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
};

type PromotionBanner = {
  id: number;
  title: string;
  description: string;
  buttonText: string | null;
  buttonLink: string | null;
  imageUrl: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

export default function HomePage() {
  const [fadeOut, setFadeOut] = useState(false);
  const [showMain, setShowMain] = useState(false);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [featuredItems, setFeaturedItems] = useState<FoodItem[]>([]);
  const [promotions, setPromotions] = useState<PromotionBanner[]>([]);
  const [isLoading, setIsLoading] = useState({
    items: true,
    promotions: true
  });
  const { toast } = useToast();

  // Fetch popular items and promotions when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch popular items
        const [itemsRes, promotionsRes] = await Promise.all([
          fetch('/api/fooditems'),
          fetch('/api/promotion-banners?active=true')
        ]);

        if (itemsRes.ok) {
          const items = await itemsRes.json();
          setFeaturedItems(items);
        }

        if (promotionsRes.ok) {
          const data = await promotionsRes.json();
          // Filter out any promotions that are outside their date range, just in case
          const now = new Date();
          const activePromotions = data.promotions.filter((p: PromotionBanner) => {
            const startDate = new Date(p.startDate);
            const endDate = new Date(p.endDate);
            return p.isActive && startDate <= now && endDate >= now;
          });
          setPromotions(activePromotions);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast({
          title: "Error",
          description: "Failed to load promotions. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(prev => ({
          ...prev,
          items: false,
          promotions: false
        }));
      }
    };

    fetchData();
  }, []);

    // Check if user has visited before
    useEffect(() => {
      const hasVisited = localStorage.getItem('hasVisitedHome');
      if (hasVisited === 'true') {
        setShowMain(true);
      }
    }, []);

    const handleEnter = () => {
      localStorage.setItem('hasVisitedHome', 'true');
      setFadeOut(true);
      setTimeout(() => {
        setShowMain(true);
      }, 1500);
    };

  const handleSubscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubscribing(true);

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Subscription failed.");
      }

      toast({
        title: "Success!",
        description: result.message,
      });
      setEmail("");

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  if (!showMain) {
    // Format promotions for the HeroCarousel component
    const formattedPromotions = promotions.map(promo => ({
      id: promo.id,
      title: promo.title,
      description: promo.description,
      image: promo.imageUrl.startsWith('http') ? promo.imageUrl : `${process.env.NEXT_PUBLIC_APP_URL || ''}${promo.imageUrl}`,
      buttonText: promo.buttonText || "Order Now",
      buttonLink: promo.buttonLink || "/shop"
    }));

    return (
      <div className="min-h-screen bg-white">
        {!showMain ? (
          <div
            className={`fixed inset-0 bg-black flex items-center justify-center z-50 transition-opacity duration-1000 ${
              fadeOut ? "opacity-0" : "opacity-100"
            }`}
          >
            <div className="text-center">
              <div className="relative w-40 h-40 mx-auto mb-6">
                <Image
                  src="/img/logo.png"
                  alt="Flames Pizzeria"
                  layout="fill"
                  objectFit="contain"
                  className="animate-pulse"
                />
              </div>
              <h1 className="text-4xl font-bold text-white mb-8 font-unifrakturcook">
                Flames Pizzeria
              </h1>
              <button
                onClick={handleEnter}
                className="px-8 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Enter Site
              </button>
            </div>
          </div>
        ) : (
          <main className="min-h-screen">
            <NewsletterModal />
            {isLoading.promotions ? (
              <div className="h-[500px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
              </div>
            ) : promotions.length > 0 ? (
              <HeroCarousel promotions={formattedPromotions} />
            ) : (
              <div className="relative h-[500px] w-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
                <div className="text-center text-white px-4">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Welcome to Flames Pizzeria
                  </h1>
                  <p className="text-xl mb-8">
                    Delicious food made with love
                  </p>
                  <Button asChild size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
                    <Link href="/shop">Order Now</Link>
                  </Button>
                </div>
              </div>
            )}
          </main>
        )}
      </div>
    );
  }

  // Format promotions for the HeroCarousel component
  const formattedPromotions = promotions.map(promo => ({
    id: promo.id,
    title: promo.title,
    description: promo.description,
    image: promo.imageUrl.startsWith('http') ? promo.imageUrl : `${process.env.NEXT_PUBLIC_APP_URL || ''}${promo.imageUrl}`,
    buttonText: promo.buttonText || "Order Now",
    buttonLink: promo.buttonLink || "/shop"
  }));

  return (
    <div className="container mx-auto px-4">
      <NewsletterModal />
      <HeroCarousel promotions={formattedPromotions} />
      {isLoading.items ? (
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">Loading popular items...</p>
        </div>
      ) : (
        <FeaturedItems items={featuredItems} />
      )}
      <CategoryShowcase />
      <Testimonials />
      <CTASection />
    </div>
  );
}

// Fallback promotions in case the API fails
const fallbackPromotions = [
  {
    id: 1,
    title: "Welcome to Flames Pizzeria",
    description: "Experience the taste of authentic Italian cuisine made with love and fresh ingredients.",
    image: "/img/hero/fallback-1.jpg",
    buttonText: "Order Now",
    buttonLink: "/shop",
  },
  {
    id: 2,
    title: "Special Deals Every Week",
    description: "Check out our weekly specials and save on your favorite dishes!",
    image: "/img/hero/fallback-2.jpg",
    buttonText: "View Specials",
    buttonLink: "/shop",
  },
];