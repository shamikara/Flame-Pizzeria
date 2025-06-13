"use client";

import { useEffect, useState ,FormEvent } from "react";
import { useRouter } from "next/navigation";
import "./globals.css"; // ensure styles load correctly if you’re not using layout.tsx
import { HeroCarousel } from "@/components/hero-carousel";
import { FeaturedItems } from "@/components/featured-items";
import { CategoryShowcase } from "@/components/category-showcase";
import { Testimonials } from "@/components/testimonials";
import { CTASection } from "@/components/cta-section";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const [fadeOut, setFadeOut] = useState(false);
  const [showMain, setShowMain] = useState(false);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { toast } = useToast();

  const handleEnter = () => {
    setFadeOut(true);
    setTimeout(() => {
      setShowMain(true);
    }, 1500); // should match CSS animation time
  };

  const handleSubscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent the default form submission
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
      setEmail(""); // Clear the input field on success

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
    return (
      <div className={`landing-page ${fadeOut ? "fadeout" : ""}`}>
        <div className="smoke-container">
          {[...Array(5)].map((_, i) => (
            <div
              key={`r${i}`}
              className="rising-smoke"
              style={{ left: `${10 + i * 15}%`, animationDelay: `${i}s` }}
            />
          ))}
          {[...Array(5)].map((_, i) => (
            <div
              key={`d${i}`}
              className="drifting-smoke"
              style={{
                left: `${20 + i * 10}%`,
                top: `${10 + i * 8}%`,
                animationDelay: `${i * 3}s`,
              }}
            />
          ))}
        </div>
        <div className="content text-white text-center pt-[5vh] relative z-10">
        <div className="backdrop-blur-md bg-white/5 border border-white/50 rounded-lg p-8 w-full max-w-3xl">
        <Image src="img/logo.png" className="mx-auto mb-6" alt="Flames" width={200} height={200} />
          <h1 className="text-5xl font-bold mb-6 font-unifrakturcook flame-text bg-gradient-to-r from-yellow-300 via-orange-500 to-red-600 bg-clip-text text-transparent">Flames of Tradition</h1>
          <p className="text-xl max-w-xl mx-auto mb-8">
          Feel the warmth. Smell the smoke. Taste the tradition in every bite of our wood-fired creations
          </p>
          <button
            onClick={handleEnter}
            className="bg-red-600 text-white px-6 py-3 rounded-full font-semibold text-lg hover:bg-red-700 transition"
          >
            Reserve Your Table
          </button>
          <div className="mt-20 flex justify-center">
  <div className="border border-white/5 p-8 w-full rounded-lg">
    <h3 className="text-2xl font-semibold mb-4 text-gray-300 text-center">Sapp\page.tsx</h3>
    <p className="text-gray-400 mb-6 text-center">Get fresh bakery updates, offers & recipes straight to your inbox</p>
    
    <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="px-5 py-3 w-full sm:w-auto rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 transition bg-white/30 text-white placeholder-white/70"
                    required
                    value={email} // Controlled input
                    onChange={(e) => setEmail(e.target.value)} // Update state on change
                    disabled={isSubscribing} // Disable while submitting
                  />
                  <button
                    type="submit"
                    className="bg-orange-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-800 transition disabled:bg-orange-900 disabled:cursor-not-allowed"
                    disabled={isSubscribing} // Disable while submitting
                  >
                    {isSubscribing ? "Subscribing..." : "Subscribe"}
                  </button>
                </form>
  </div>
</div>
</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <HeroCarousel promotions={promotions} />
      <FeaturedItems items={featuredItems} />
      <CategoryShowcase />
      <Testimonials />
      <CTASection />
    </div>
  );
}

const promotions = [
  {
    id: 1,
    title: "Summer Special",
    description: "Get 20% off on all pizzas this summer!",
    image: "img/hero/B3.jpg?height=600&width=1200",
    buttonText: "Order Now",
    buttonLink: "/shop",
  },
  {
    id: 2,
    title: "New Submarine Combo",
    description:
      "Try our new submarine combo with fries and drink for just Rs. 2299.00",
    image: "img/hero/B4.jpg?height=600&width=1200",
    buttonText: "Try Now",
    buttonLink: "/shop",
  },
  {
    id: 3,
    title: "Family Meal Deal",
    description: "2 Large Pizzas, 4 Burgers, and 2L Soda for Rs. 3999.00",
    image: "img/hero/B5.jpg?height=600&width=1200",
    buttonText: "Feed the Family",
    buttonLink: "/shop",
  },
  {
    id: 4,
    title: "Family Meal Deal",
    description: "2 Large Pizzas, 4 Burgers, and 2L Soda for Rs. 5999.00",
    image: "img/hero/B6.jpg?height=600&width=1200",
    buttonText: "Feed the Family",
    buttonLink: "/shop",
  },
];

const featuredItems = [
  {
    id: 8,
      name: "BBQ Bacon Burger",
      description: "Beef patty, bacon, cheddar, BBQ sauce, onion rings",
      price: 1299.00,
      image: "img/fooditems/8.png?height=300&width=300",
      category: "burgers-and-submarines"
  },
  {
    id: 10,
      name: "Turkey Club Sub",
      description: "Turkey, bacon, lettuce, tomato, mayo on a fresh baked roll",
      price: 1199.00,
      image: "img/fooditems/10.png?height=300&width=300",
      category: "burgers-and-submarines",
  },
  {
    id: 15,
      name: "Chicken Patty",
      description: "Golden crust filled with curried chicken and potato",
      price: 120,
      image: "img/fooditems/15.png?height=300&width=300",
      category: "short-eats",
  },
  {
    id: 18,
      name: "Sausage Roll",
      description: "Puff pastry with local grilled sausage filling",
      price: 150,
      image: "img/fooditems/18.png?height=300&width=300",
      category: "short-eats",
  },
];
