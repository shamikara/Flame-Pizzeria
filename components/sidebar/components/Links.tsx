'use client'; 

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users2,
  LineChart,
  User,
  Factory,
  Salad,
  CalendarDays,
} from "lucide-react";

import { UserPayload } from "@/lib/session"; // Import the type

const allDashboardLinks = [
  { href: "/dashboard/overview", label: "Overview", icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER'] },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart, roles: ['ADMIN', 'MANAGER', 'CHEF', 'WAITER'] },
  { href: "/dashboard/foods", label: "Foods", icon: Package, roles: ['ADMIN', 'MANAGER', 'CHEF', 'WAITER'] },
  { href: "/dashboard/customizations", label: "Add-on Extras", icon: Salad, roles: ['ADMIN', 'MANAGER', 'CHEF'] },
  { href: "/dashboard/catering", label: "Catering Requests", icon: CalendarDays, roles: ['ADMIN', 'MANAGER'] },
  { href: "/dashboard/employees", label: "Employees", icon: Users2, roles: ['ADMIN', 'MANAGER'] },
  { href: "/dashboard/users", label: "Customers", icon: User, roles: ['ADMIN', 'MANAGER'] },
  { href: "/dashboard/ingredients", label: "Inventory", icon: Factory, roles: ['ADMIN', 'MANAGER', 'STORE_KEEP'] },
  { href: "/dashboard/reports", label: "Reports", icon: LineChart, roles: ['ADMIN', 'MANAGER'] },
];

export function DashboardNav({ userRole }: { userRole: UserPayload['role'] }) {
  const pathname = usePathname();

  // Filter links based on the user's role
  const accessibleLinks = allDashboardLinks.filter(link => link.roles.includes(userRole));

  return (
    <nav className="grid items-start gap-2 px-4">
      {accessibleLinks.map((link) => {
        const isActive = pathname.startsWith(link.href);
        
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all",
              "hover:bg-white/10 hover:text-white",
              isActive && "bg-white/20 text-white font-bold"
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}