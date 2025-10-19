import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Flames Pizzeria",
  description: "Understand how Flames Pizzeria collects, uses, and protects your information.",
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl space-y-8">
          <header className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            <p className="text-lg text-muted-foreground">
              Flames Pizzeria respects your privacy. This policy explains what information we collect, how we use it,
              and the choices you have regarding your personal data.
            </p>
          </header>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Information We Collect</h2>
            <p className="text-muted-foreground">
              We collect information you provide directly, such as contact details when placing an order, booking
              catering, applying for a job, or subscribing to updates. We also gather device and usage data to improve
              site performance and personalize experiences.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">How We Use Your Information</h2>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>To process orders, reservations, and catering inquiries.</li>
              <li>To communicate updates, promotions, and service notices with your consent.</li>
              <li>To analyze service performance and enhance our menus, apps, and guest interactions.</li>
              <li>To fulfill legal obligations and secure our digital and in-store experiences.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Sharing Your Information</h2>
            <p className="text-muted-foreground">
              We share personal information only with trusted partners that help us deliver orders, process payments,
              or support our operations. These partners are bound by confidentiality agreements. We do not sell or rent
              your personal data.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Your Choices</h2>
            <p className="text-muted-foreground">
              You may update your contact preferences, request access to your data, or ask us to delete your
              information by contacting privacy@flamespizzeria.com. Marketing emails include an unsubscribe link, and
              account holders can manage preferences in the profile dashboard.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Contact</h2>
            <p className="text-muted-foreground">
              For any questions about this policy or our privacy practices, email privacy@flamespizzeria.com or mail us
              at Flames Pizzeria, 123 Food Street, Colombo 07.
            </p>
          </section>
        </div>
      </section>
    </main>
  )
}
