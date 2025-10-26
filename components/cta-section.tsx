import Link from "next/link"
import { Button } from "@/components/ui/button"
import { NewsletterSubscription } from "./newsletter-subscription"

export function CTASection() {
  return (
    <section className="py-16 text-primary backdrop-blur-md bg-white/10 rounded-xl mb-16">
      <div className="container px-4">
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Order?</h2>
            <p className="text-lg mb-8 max-w-2xl">
              Enjoy our delicious pizza, burgers, and submarines delivered straight to your door. Order online for fast
              delivery or convenient pickup.
            </p>
            <Button asChild size="default" variant="secondary" className="bg-orange-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-800 transition">
              <Link href="/shop">Order Now</Link>
            </Button>
          </div>
          <div className="lg:pl-8">
            <NewsletterSubscription variant="compact" />
          </div>
        </div>
      </div>
    </section>
  )
}
