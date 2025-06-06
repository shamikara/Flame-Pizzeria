import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import LayoutWrapper from '@/components/layout-wrapper'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Flames Pizzeria - Pizza, Burgers & Submarines',
  description:
    'Delicious pizza, burgers & submarines, short eats and desserts made with fresh ingredients and filled with love',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  )
}
