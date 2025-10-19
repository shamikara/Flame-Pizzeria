import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Careers at Flames Pizzeria",
  description: "Explore opportunities to join the Flames Pizzeria team.",
}

const openRoles = [
  {
    title: "Restaurant Manager",
    type: "Full-time",
    location: "Colombo, Sri Lanka",
    summary:
      "Lead daily operations, manage staff scheduling, and ensure guest experiences meet Flames service standards.",
  },
  {
    title: "Line Chef",
    type: "Full-time",
    location: "Negombo, Sri Lanka",
    summary:
      "Prepare signature dishes with precision, maintain prep stations, and collaborate with the culinary team on new specials.",
  },
  {
    title: "Delivery Specialist",
    type: "Part-time",
    location: "Colombo & Suburbs",
    summary:
      "Deliver orders promptly while upholding our hospitality values and representing Flames on the move.",
  },
]

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl space-y-12">
          <header className="space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Grow with Flames</h1>
            <p className="text-lg text-muted-foreground">
              Our teams bring energy, craft, and warmth to every guest interaction. If you love food and hospitality,
              there is a place for you here.
            </p>
          </header>

          <section className="rounded-xl border bg-card p-8 shadow-sm">
            <h2 className="text-2xl font-semibold">Why Flames</h2>
            <ul className="mt-6 space-y-4 text-muted-foreground">
              <li>Competitive pay with performance bonuses and shift meals.</li>
              <li>Flexible scheduling for students and multi-role opportunities for seasoned pros.</li>
              <li>Team-first culture focused on mentorship, cross-training, and career growth.</li>
              <li>Community impact through charity drives, food festivals, and staff-led events.</li>
            </ul>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Open Positions</h2>
            <div className="space-y-4">
              {openRoles.map((role) => (
                <article key={role.title} className="rounded-xl border bg-card p-6 shadow-sm">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <h3 className="text-xl font-semibold">{role.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {role.type} • {role.location}
                      </p>
                    </div>
                    <a
                      href="mailto:careers@flamespizzeria.com?subject=Career%20Inquiry"
                      className="inline-flex items-center rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary hover:text-primary-foreground"
                    >
                      Apply Now
                    </a>
                  </div>
                  <p className="mt-4 text-muted-foreground">{role.summary}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-xl border bg-card p-8 shadow-sm">
            <h2 className="text-2xl font-semibold">Don’t See the Role You Want?</h2>
            <p className="mt-4 text-muted-foreground">
              We are always meeting passionate people. Send your CV and a quick introduction to
              careers@flamespizzeria.com and we will reach out when there’s a fit.
            </p>
          </section>
        </div>
      </section>
    </main>
  )
}
