// 'use client'; 

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { cn } from "@/lib/utils";
// import {
//   LayoutDashboard,
//   ShoppingCart,
//   Package,
//   Users2,
//   LineChart,
//   User,
//   Factory
// } from "lucide-react";

// // This data can stay the same
// const dashboardLinks = [
//   { href: "/dashboard/overview", label: "Overview", icon: LayoutDashboard },
//   { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
//   { href: "/dashboard/foods", label: "Foods", icon: Package },
//   { href: "/dashboard/employees", label: "Employees", icon: Users2 },
//   { href: "/dashboard/users", label: "Customers", icon: User },
//   { href: "/dashboard/raw-materials", label: "Inventory", icon: Factory },
//   { href: "/dashboard/reports", label: "Reports", icon: LineChart },
// ];

// export function DashboardNav() {
//   const pathname = usePathname();

//   return (
//     <nav className="grid items-start gap-2 px-4"> {/* Added some padding here */}
//       {dashboardLinks.map((link) => {
//         const isActive = pathname.startsWith(link.href); // Use startsWith for better active state matching
        
//         return (
//           <Link
//             key={link.href}
//             href={link.href}
//             className={cn(
//               // --- THIS IS THE PART TO CHANGE ---
//               "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all", // Default: light gray text
//               "hover:bg-white/10 hover:text-white", // Hover state: semi-transparent white bg, bright white text
//               isActive && "bg-white/20 text-white font-bold" // Active state: stronger bg, bright white text, bold
//             )}
//           >
//             <link.icon className="h-4 w-4" />
//             {link.label}
//           </Link>
//         );
//       })}
//     </nav>
//   );
// }
// components/sidebar/components/Links.tsx
// components/sidebar/components/Links.tsx
'use client'; 

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, ShoppingCart, Package, Users2, LineChart, User, Factory
} from "lucide-react";
import { UserPayload } from "@/lib/session"; // Import the type

const allDashboardLinks = [
  { href: "/dashboard/overview", label: "Overview", icon: LayoutDashboard, roles: ['ADMIN'] },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart, roles: ['ADMIN', 'CHEF', 'WAITER'] },
  { href: "/dashboard/foods", label: "Foods", icon: Package, roles: ['ADMIN', 'CHEF', 'WAITER'] },
  { href: "/dashboard/employees", label: "Employees", icon: Users2, roles: ['ADMIN'] },
  { href: "/dashboard/users", label: "Customers", icon: User, roles: ['ADMIN'] },
  { href: "/dashboard/raw-materials", label: "Inventory", icon: Factory, roles: ['ADMIN', 'STORE_KEEPER'] },
  { href: "/dashboard/reports", label: "Reports", icon: LineChart, roles: ['ADMIN'] },
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