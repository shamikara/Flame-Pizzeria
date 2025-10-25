import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import LayoutWrapper from '@/components/layout-wrapper';
import { SessionProvider } from '@/components/session-provider'; // <-- 1. Import the SessionProvider
import { Toaster } from '@/components/ui/toaster';           // <-- 2. Import the Toaster
import { TidioChat } from '@/components/TidioChat';
import Chatbot from '@/components/chatbot';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Flames Pizzeria - Pizza, Burgers & Submarines',
  description:
    'Delicious pizza, burgers & submarines, short eats and desserts made with fresh ingredients and filled with love',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Add any necessary meta tags or other head elements */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <SessionProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </SessionProvider>
        <Toaster />
        <Chatbot />
      </body>
    </html>
  );
}