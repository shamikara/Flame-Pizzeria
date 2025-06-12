"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Menu, X, LogOut, User as UserIcon, LayoutDashboard } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useSession } from "@/components/session-provider"
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { items } = useCart()
  const { user } = useSession()
  const router = useRouter();

  const totalItems = items.reduce((total, item) => total + item.quantity, 0)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.refresh();
   // router.push('/login');
  };
  
  // --- CHANGE 1: Create a safe display name variable ---
  // This logic now safely handles the case where user might be null.
  const displayName = user?.firstName || user?.email?.split('@')[0] || 'Account';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
           <Image src="/img/logo.png" alt="Flames" width={40} height={40} />
           <span className="hidden sm:inline">Flames Pizzeria</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/shop" className="text-sm font-medium transition-colors hover:text-primary">
              Menu
            </Link>
            <Link href="/shop?category=pizza" className="text-sm font-medium transition-colors hover:text-primary">
              Pizza
            </Link>
            <Link href="/shop?category=burgers-and-submarines" className="text-sm font-medium transition-colors hover:text-primary">
            Burgers & Submarines
          </Link>
          <Link href="/shop?category=short-eats" className="text-sm font-medium transition-colors hover:text-primary">
            Short Eats
          </Link>
          <Link href="/shop?category=drinks-and-deserts" className="text-sm font-medium transition-colors hover:text-primary">
            Drinks & Deserts
          </Link>
          <Link href="/recipes-board" className="text-sm font-medium transition-colors hover:text-primary">
            Receipes 
          </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/checkout">
            <Button variant="outline" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="outline" size="icon" className="rounded-full">
                    <UserIcon className="h-5 w-5" />
                    <span className="sr-only">Toggle user menu</span>
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* CHANGE 2: Use the safe displayName variable */}
                <DropdownMenuLabel>
                  Hi, {displayName}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {user.role !== 'CUSTOMER' && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/overview" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="lg" asChild className="hidden md:inline-flex">
              <Link href="/login">Login</Link>
            </Button>
          )}

          <Button variant="default" size="lg" asChild className="hidden md:inline-flex bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-800 transition">
            <Link href="/shop">Order Now</Link>
          </Button>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div className={cn("fixed inset-0 top-16 z-50 bg-background md:hidden", isMenuOpen ? "block" : "hidden")}>
        <nav className="container grid gap-6 p-6">
          <Link href="/" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
            Home
          </Link>
          <Link href="/shop" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
            Menu
          </Link>
          <Link href="/shop?category=pizza" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
            Pizza
          </Link>
          <Link href="/shop?category=burgers-and-submarines" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
            Burgers & Submarines
          </Link>
          <Link href="/shop?category=short-eats" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
            Short Eats
          </Link>
          <Link href="/shop?category=drinks-and-deserts" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
            Drinks & Deserts
          </Link>
          <Link href="/login" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
            Login
          </Link>
          {user ? (
             <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="text-left text-lg font-medium text-red-500">
                Logout
            </button>
          ) : (
            <Link href="/login" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}