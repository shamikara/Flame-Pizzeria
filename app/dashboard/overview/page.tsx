import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  DollarSign,
  ShoppingCart,
  Users,
  UtensilsCrossed,
  TrendingUp,
  ChefHat,
  ClipboardList,
  Factory,
  CalendarClock,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

import db from "@/lib/db";
import { order_status, user_role } from "@prisma/client";

import { SalesChart } from "@/components/charts/sales-chart";
import { PopularItemsChart } from "@/components/charts/popular-items-chart";
import { EmployeeHoursChart } from "@/components/charts/employee-hours-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

async function getDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalRevenue = await db.order.aggregate({
    _sum: { total: true },
    where: { status: order_status.DELIVERED },
  });

  const totalOrders = await db.order.count();
  const newCustomersToday = await db.user.count({
    where: { role: user_role.CUSTOMER, createdAt: { gte: today } },
  });
  const totalMenuItems = await db.fooditem.count({ where: { isActive: true } });
  
  return {
    revenue: totalRevenue._sum.total ?? 0,
    orders: totalOrders,
    customers: newCustomersToday,
    menuItems: totalMenuItems,
  };
}

async function getEmployeeRoleStats() {
  const trackedRoles: user_role[] = [
    user_role.MANAGER,
    user_role.CHEF,
    user_role.WAITER,
    user_role.STORE_KEEP,
    user_role.DELIVERY_PERSON,
  ];

  const [grouped, totalActive] = await Promise.all([
    db.user.groupBy({
      by: ["role"],
      _count: { role: true },
      where: {
        role: { in: trackedRoles },
        employee: { is: { isActive: true } },
      },
    }),
    db.employee.count({ where: { isActive: true } }),
  ]);

  const counts = trackedRoles.reduce((acc, role) => {
    acc[role] = 0;
    return acc;
  }, {} as Record<user_role, number>);

  for (const entry of grouped) {
    const role = entry.role as user_role;
    counts[role] = entry._count.role ?? 0;
  }

  return {
    totalActive,
    counts,
  };
}

async function getWeeklySalesData() {
  const today = new Date();
  const last14Days = new Date(today);
  last14Days.setDate(today.getDate() - 13);
  const orders = await db.order.findMany({
    where: { status: order_status.DELIVERED, createdAt: { gte: last14Days } },
    select: { total: true, createdAt: true },
  });
  const dailySales: { [key: string]: number } = {};
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dailySales[date.toISOString().split('T')[0]] = 0;
  }
  orders.forEach((order: { createdAt: { toISOString: () => string; }; total: number; }) => {
    const dateString = order.createdAt.toISOString().split('T')[0];
    if (dailySales[dateString] !== undefined) dailySales[dateString] += order.total;
  });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return weekDays.map((day, index) => {
    const thisWeekDate = new Date(today);
    thisWeekDate.setDate(today.getDate() - (today.getDay() - index + 7) % 7);
    const lastWeekDate = new Date(thisWeekDate);
    lastWeekDate.setDate(thisWeekDate.getDate() - 7);
    return {
      name: day,
      thisWeek: dailySales[thisWeekDate.toISOString().split('T')[0]] || 0,
      lastWeek: dailySales[lastWeekDate.toISOString().split('T')[0]] || 0,
    };
  });
}

async function getTopSellingItems() {
  const aggregatedItems = await db.orderitem.groupBy({ by: ['foodItemId'], _sum: { quantity: true }, orderBy: { _sum: { quantity: 'desc' } }, take: 10 });
  const foodItemIds = aggregatedItems.map((item: { foodItemId: any; }) => item.foodItemId);
  const foodItems = await db.fooditem.findMany({ where: { id: { in: foodItemIds } }, select: { id: true, name: true } });
  const foodItemMap = new Map(foodItems.map((item: { id: any; name: any; }) => [item.id, item.name]));
  return aggregatedItems.map((item: { foodItemId: unknown; _sum: { quantity: any; }; }) => ({ name: foodItemMap.get(item.foodItemId) || 'Unknown', total: item._sum.quantity || 0 }));
}

async function getEmployeeWorkHours() {
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const shifts = await db.shift.findMany({
    where: {
      date: { gte: last30Days },
      status: {
        in: ["COMPLETED", "ON_DUTY", "SCHEDULED"]
      }
    },
    select: {
      startTime: true,
      endTime: true,
      date: true,
      employee: {
        select: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      }
    },
  });

  const hoursByEmployee: { [key: string]: number } = {};

  shifts.forEach((shift: { employee: { user: { firstName: any; lastName: any; }; }; startTime: string | null; endTime: string | null; }) => {
    if (!shift.startTime || !shift.endTime) return;

    const name = `${shift.employee.user.firstName} ${shift.employee.user.lastName}`;

    // Parse time strings (assuming format like "09:00" or "14:30")
    const parseTime = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes; // Convert to minutes for easier calculation
    };

    const startMinutes = parseTime(shift.startTime);
    const endMinutes = parseTime(shift.endTime);

    // Calculate duration in hours
    let duration = (endMinutes - startMinutes) / 60;

    // Handle overnight shifts (if end time is before start time, it's next day)
    if (duration < 0) {
      duration += 24; // Add 24 hours for overnight shifts
    }

    hoursByEmployee[name] = (hoursByEmployee[name] || 0) + duration;
  });

  return Object.entries(hoursByEmployee).map(([name, value]) => ({
    name,
    value: Math.round(value * 10) / 10 // Round to 1 decimal place
  }));
}

async function getRecentCateringRequests() {
  return db.cateringrequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });
}

export default async function OverviewPage() {
  const [stats, weeklySales, topItems, employeeHours, employeeRoles, recentCatering] = await Promise.all([
    getDashboardStats(),
    getWeeklySalesData(),
    getTopSellingItems(),
    getEmployeeWorkHours(),
    getEmployeeRoleStats(),
    getRecentCateringRequests(),
  ]);

  return (
    <div className="flex-1 space-y-6 p-6 md:p-10">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Dashboard Overview
        </h2>
        <p className="text-gray-400 mt-2">Welcome back! Here's what's happening today.</p>
      </div>
      
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-gray-800 bg-gradient-to-br from-blue-500/10 to-blue-600/5 hover:shadow-lg hover:shadow-blue-500/20 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Rs. {stats.revenue.toFixed(2)}</div>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-400" />
              All time earnings
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gradient-to-br from-green-500/10 to-green-600/5 hover:shadow-lg hover:shadow-green-500/20 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Orders</CardTitle>
            <ShoppingCart className="h-5 w-5 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">+{stats.orders}</div>
            <p className="text-xs text-gray-400 mt-1">Lifetime orders</p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gradient-to-br from-purple-500/10 to-purple-600/5 hover:shadow-lg hover:shadow-purple-500/20 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">New Customers</CardTitle>
            <Users className="h-5 w-5 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">+{stats.customers}</div>
            <p className="text-xs text-gray-400 mt-1">Joined today</p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gradient-to-br from-orange-500/10 to-orange-600/5 hover:shadow-lg hover:shadow-orange-500/20 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Menu Items</CardTitle>
            <UtensilsCrossed className="h-5 w-5 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.menuItems}</div>
            <p className="text-xs text-gray-400 mt-1">Active items</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-gray-800 bg-gradient-to-b from-gray-950 to-gray-900">
          <CardHeader>
            <CardTitle className="text-gray-200">Weekly Sales</CardTitle>
            <CardDescription className="text-gray-400">Comparison of sales between this week and last week</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <SalesChart data={weeklySales} />
          </CardContent>
        </Card>

        <Card className="col-span-3 border-gray-800 bg-gradient-to-b from-gray-950 to-gray-900">
          <CardHeader>
            <CardTitle className="text-gray-200">Employee Work Hours</CardTitle>
            <CardDescription className="text-gray-400">Total hours worked in the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <EmployeeHoursChart data={employeeHours} />
          </CardContent>
        </Card>
      </div>

      <Card className="border-gray-800 bg-gradient-to-b from-gray-950 to-gray-900">
        <CardHeader>
          <CardTitle className="text-gray-200">Top 10 Selling Items</CardTitle>
          <CardDescription className="text-gray-400">The most popular items based on quantity sold</CardDescription>
        </CardHeader>
        <CardContent>
          <PopularItemsChart data={topItems} />
        </CardContent>
      </Card>
    </div>
  );
}