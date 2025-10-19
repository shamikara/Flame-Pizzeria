import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Flames Pizzeria",
  description: "Reach out to Flames Pizzeria for reservations, catering inquiries, or general questions.",
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2">
          <div className="space-y-6">
            <header className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">We would love to hear from you</h1>
              <p className="text-lg text-muted-foreground">
                Whether you are planning a celebration, have feedback, or want to collaborate, our team is here to help.
              </p>
            </header>

            <section className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Call or Visit</h2>
              <div className="mt-4 space-y-2 text-muted-foreground">
                <p>Flames Pizzeria HQ</p>
                <p>123 Food Street, Colombo 07</p>
                <p>Phone: +94 11 234 5678</p>
                <p>Hours: Mon–Sun, 10:00 AM – 11:00 PM</p>
              </div>
            </section>

            <section className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Email</h2>
              <div className="mt-4 space-y-2 text-muted-foreground">
                <p>General inquiries: hello@flamespizzeria.com</p>
                <p>Catering: catering@flamespizzeria.com</p>
                <p>Careers: careers@flamespizzeria.com</p>
              </div>
            </section>
          </div>

          <section className="rounded-xl border bg-card p-8 shadow-sm">
            <h2 className="text-2xl font-semibold">Send us a message</h2>
            <form className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none"
                  placeholder="Your name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none"
                  placeholder="How can we help?"
                  required
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Send Message
              </button>
              <p className="text-xs text-muted-foreground">
                We aim to respond within one business day. For urgent matters, call us directly.
              </p>
            </form>
          </section>
        </div>
      </section>
    </main>
  )
}
