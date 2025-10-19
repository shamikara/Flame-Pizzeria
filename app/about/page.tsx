import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Flames Pizzeria",
  description: "Learn about Flames Pizzeria's story, values, and commitment to great food.",
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl space-y-12">
          <header className="space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Our Story</h1>
            <p className="text-lg text-muted-foreground">
              Flames Pizzeria began as a neighborhood kitchen fueled by a love for handcrafted dishes and
              community hospitality. Today we deliver that same care at every table, counter, and door we serve.
            </p>
          </header>

          <div className="grid gap-10 md:grid-cols-2">
            <article className="space-y-4">
              <h2 className="text-2xl font-semibold">What Drives Us</h2>
              <p className="text-muted-foreground">
                We believe memorable meals start with honest ingredients. That is why we source fresh produce,
                local cheeses, and house-made sauces daily. Our chefs experiment constantly, refining classics while
                introducing new seasonal favorites.
              </p>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-semibold">Craft in Every Bite</h2>
              <p className="text-muted-foreground">
                From stone-fired pizzas to signature milkshakes, every menu item goes through rigorous testing.
                Recipes are tuned by our culinary team and validated by the people who matter most—our guests.
              </p>
            </article>
          </div>

          <section className="rounded-xl border bg-card p-8 shadow-sm">
            <h2 className="text-2xl font-semibold">Community Matters</h2>
            <p className="mt-4 text-muted-foreground">
              Flames is more than a restaurant; it is a gathering place. We partner with schools, local farmers,
              and charities to support the neighborhoods that have embraced us. Every catering order, family meal,
              and late-night snack strengthens those community connections.
            </p>
          </section>

          <section className="rounded-xl border bg-card p-8 shadow-sm">
            <h2 className="text-2xl font-semibold">Visit Us</h2>
            <p className="mt-4 text-muted-foreground">
              Drop in for lunch, plan your next celebration with our catering team, or order online for delivery.
              However you dine with us, you will experience the Flames commitment to warm service and bold flavors.
            </p>
          </section>
        </div>
      </section>
    </main>
  )
}
