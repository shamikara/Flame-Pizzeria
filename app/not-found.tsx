import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-black text-white overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/img/404.png" 
          alt="Background"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>    

      {/* Content */}
      <div className="relative z-10 text-center max-w-md mx-auto p-6">
        <h1 className="text-9xl font-bold mb-4 text-primary">404</h1>
        <div className="text-8xl mb-6">🥹</div>
        <h2 className="text-3xl font-bold mb-6">Oops! We Overcooked This Page</h2>
        <p className="mb-8 text-lg text-muted-foreground">
          Our wood-fired oven was too hot  for this page  <br />
          🔥🔥🔥🔥🔥🔥
          <br />
          it's now extra crispy!
          <br />
          Try something from our menu that won't burn as easily.
        </p>
          <Link href="/" className="text-red-500 hover:text-red-500/80 "> 🔙 Back to Fresh Pizza (Not Burned Pages)</Link>
      </div>
    </div>
  );
}