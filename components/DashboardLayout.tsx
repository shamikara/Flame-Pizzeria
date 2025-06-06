"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  LineChart,
  Package,
  PanelLeft,
  ShoppingCart,
  Users2,
  User,
  Factory
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DashboardNav } from "./sidebar/components/Links"; // Assuming this path is correct
import Image from "next/image";
import { LiveClock } from './live-clock';
import flame from "@/public/img/logo.png";

// Your Logo Component (for the mobile sidebar)
const Logo = () => (
  <Link
    href="/"
    className="group flex items-center gap-2 px-4 text-lg font-semibold"
  >
    <Image src={flame} alt="Flames" width={40} height={40} />
    <span className="font-unifrakturcook text-xl font-bold flame-text">Flames</span>
  </Link>
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout');
      window.location.href = '/login';
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    // --- The Main Background Wrapper ---
    // This parent div holds the main dashboard background.
    <div className="relative min-h-screen">
      
      {/* This pseudo-element applies the dashboard background and opacity */}
      <div 
        className="
          absolute inset-0 z-[-1] 
          bg-dashboard-bg bg-cover bg-center bg-no-repeat
          before:absolute before:inset-0 before:bg-black/50 before:content-['']
        "
      />

      {/* --- The Flex Layout Container --- */}
      {/* This sits on top of the background and handles the flex layout. */}
      <div className="flex min-h-screen w-full flex-col bg-transparent">
        
        {/* --- DESKTOP SIDEBAR --- */}
        <aside 
          className="
            fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r 
            border-white/20 bg-background sm:flex overflow-hidden
          "
        >
          {/* Sidebar-specific background and overlay */}
          <div 
            className="
              absolute inset-0 z-[-1] 
              bg-sidebar-bg bg-cover bg-center bg-no-repeat
              before:absolute before:inset-0 before:bg-black/70 before:content-['']
            "
          />
          
          {/* Sidebar content (logo, nav) sits on top */}
          <div className="relative z-10 flex h-16 items-center border-b border-white/20">
            <Image src={flame} className="ml-6 mb-2" alt="Flames" width={60} height={60} />
            <span className="ml-2 font-unifrakturcook text-2xl font-bold flame-text text-white">Flames Pizzeria</span>
          </div>
          <nav className="relative z-10 flex-1 overflow-auto py-4">
            <DashboardNav />
          </nav>
        </aside>

        {/* --- Main Content Area --- */}
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-transparent px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            
            {/* Mobile Sidebar */}
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="sm:hidden">
                  <PanelLeft className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="left" 
                className="sm:max-w-xs p-0 border-r border-white/20 relative overflow-hidden"
              >
                <div 
                  className="
                    absolute inset-0 z-[-1] 
                    bg-sidebar-bg bg-cover bg-center bg-no-repeat
                    before:absolute before:inset-0 before:bg-black/70 before:content-['']
                  "
                />
                <div className="relative z-10 flex h-16 items-center border-b border-white/20 px-2">
                  <Logo />
                </div>
                <div className="relative z-10 py-4">
                  <DashboardNav />
                </div>
              </SheetContent>
            </Sheet>

            {/* Right-aligned header items */}
            <div className="relative ml-auto flex items-center gap-4">
              <LiveClock />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="overflow-hidden rounded-full"
                  >
                    <Image
                      src="/img/avatars/avatar1.png" 
                      width={36}
                      height={36}
                      alt="Avatar"
                      className="overflow-hidden rounded-full"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="cursor-pointer w-full">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Support</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 p-4 sm:px-6 sm:py-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}