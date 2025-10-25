"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Menu, X, LogOut, User as UserIcon, LayoutDashboard, Sun, Moon, Loader2, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useSession } from "@/components/session-provider"
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CartSheet } from "./cart-sheet";
import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AccountSettingsModal } from './account-settings-modal';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [themeMounted, setThemeMounted] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false)
  const { resolvedTheme, setTheme } = useTheme();
  const { user, handleLogout: sessionLogout } = useSession();
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/dashboard');

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await sessionLogout()
    } catch (error) {
      console.error('Failed to logout:', error)
    } finally {
      setLoggingOut(false)
    }
  };

  useEffect(() => {
    setThemeMounted(true)
  }, [])

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light')
  }

  const renderThemeToggle = (variant: 'inline' | 'mobile') => {
    if (!themeMounted || isAdminRoute) return null
    const isDark = resolvedTheme === 'dark'

    const switchControl = (
      <div className="flex items-center gap-2">
        <Sun className={cn('h-4 w-4 transition-colors', !isDark ? 'text-orange-700' : 'text-muted-foreground')} />
        <Switch
          checked={isDark}
          onCheckedChange={handleThemeToggle}
          aria-label="Toggle dark mode"
        />
        <Moon className={cn('h-4 w-4 transition-colors', isDark ? 'text-blue-400' : 'text-muted-foreground')} />
      </div>
    )

    if (variant === 'mobile') {
      return (
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium">Dark mode</span>
          {switchControl}
        </div>
      )
    }

    return switchControl
  }

  const displayName = user?.firstName || user?.email?.split('@')[0] || 'Account';

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (user && user.role !== 'CUSTOMER') {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n: Notification) => !n.read).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: number) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, { method: 'PATCH' });
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const notificationTime = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

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
            <Link href="/shop?category=pasta-corner" className="text-sm font-medium transition-colors hover:text-primary">
              Pasta Corner
            </Link>
            <Link href="/shop?category=drinks-and-desserts" className="text-sm font-medium transition-colors hover:text-primary">
              Drinks & Desserts
            </Link>
            <Link href="/event-catering" className="text-sm font-medium transition-colors hover:text-primary">
              Event Catering
            </Link>

            <Link href="/recipes-board" className="text-sm font-medium transition-colors hover:text-primary">
              Receipes
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {renderThemeToggle('inline')}
          <CartSheet />

          {/* Notifications - Only show for staff */}
          {user && user.role !== 'CUSTOMER' && (
            <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                  <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  Notifications
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                      Mark all read
                    </Button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className={`p-3 cursor-pointer ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="flex flex-col gap-1 w-full">
                          <div className="text-sm font-medium">{notification.message}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatTimeAgo(notification.createdAt)}
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

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
                  <Link href="/profile" className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => setIsAccountSettingsOpen(true)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50">
                  {loggingOut ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="mr-2 h-4 w-4" />
                  )}
                  <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>
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
          <Link href="/shop?category=pasta-corner" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
            Pasta Corner
          </Link>
          <Link href="/shop?category=drinks-and-desserts" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
            Drinks & Desserts
          </Link>
          <Link href="/custom-orders" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
            Bulk Orders
          </Link>
          {user?.role === 'CUSTOMER' && (
            <Link href="/profile" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
              My Profile
            </Link>
          )}
          <Link href="/login" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
            Login
          </Link>
          {renderThemeToggle('mobile')}
          {user ? (
            <button
              onClick={() => { handleLogout(); setIsMenuOpen(false); }}
              className="flex items-center gap-2 text-left text-lg font-medium text-red-500"
              disabled={loggingOut}
            >
              {loggingOut && <Loader2 className="h-4 w-4 animate-spin" />}
              {loggingOut ? 'Logging out...' : 'Logout'}
            </button>
          ) : (
            <Link href="/login" className="text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
              Login
            </Link>
          )}
        </nav>
      </div>
      {/* Account Settings Modal */}
      <AccountSettingsModal 
        open={isAccountSettingsOpen}
        onOpenChange={setIsAccountSettingsOpen}
      />
    </header>
  )
}