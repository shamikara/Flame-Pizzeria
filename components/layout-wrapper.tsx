'use client'

import { usePathname } from 'next/navigation'
import { ThemeProvider } from '@/components/theme-provider'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { CartProvider } from '@/components/cart-provider'
import FireSparkles from '@/components/ui/fireSparkles'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isAdminRoute =
    pathname.startsWith('/admin') || pathname.startsWith('/dashboard')

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <CartProvider>
        {isAdminRoute ? (
          <div className="min-h-screen bg-black text-white">{children}</div>
        ) : (
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 bg-[url('/img/bgimg.png')] bg-cover bg-no-repeat">
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
              {children}
            </main>
            <FireSparkles />
            <Footer />
          </div>
        )}
      </CartProvider>
    </ThemeProvider>
  )
}
