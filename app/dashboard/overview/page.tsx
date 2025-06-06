import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, ShoppingCart, Users, UtensilsCrossed } from "lucide-react";
import db from "@/lib/db";
import { OrderStatus, Role } from "@prisma/client";

import { SalesChart } from "@/components/charts/sales-chart";
import { PopularItemsChart } from "@/components/charts/popular-items-chart";
import { EmployeeHoursChart } from "@/components/charts/employee-hours-chart";

// --- Data Fetching Functions (as defined in Step 2) ---

async function getDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalRevenue = await db.order.aggregate({
    _sum: { total: true },
    where: { status: OrderStatus.DELIVERED },
  });

  const totalOrders = await db.order.count();
  const newCustomersToday = await db.user.count({
    where: { role: Role.CUSTOMER, createdAt: { gte: today } },
  });
  const totalMenuItems = await db.foodItem.count({ where: { isActive: true } });
  
  return {
    revenue: totalRevenue._sum.total ?? 0,
    orders: totalOrders,
    customers: newCustomersToday,
    menuItems: totalMenuItems,
  };
}

async function getWeeklySalesData() {
  const today = new Date();
  const last14Days = new Date(today);
  last14Days.setDate(today.getDate() - 13);
  const orders = await db.order.findMany({
    where: { status: OrderStatus.DELIVERED, createdAt: { gte: last14Days } },
    select: { total: true, createdAt: true },
  });
  const dailySales: { [key: string]: number } = {};
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dailySales[date.toISOString().split('T')[0]] = 0;
  }
  orders.forEach(order => {
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
  const aggregatedItems = await db.orderItem.groupBy({ by: ['foodItemId'], _sum: { quantity: true }, orderBy: { _sum: { quantity: 'desc' } }, take: 10 });
  const foodItemIds = aggregatedItems.map(item => item.foodItemId);
  const foodItems = await db.foodItem.findMany({ where: { id: { in: foodItemIds } }, select: { id: true, name: true } });
  const foodItemMap = new Map(foodItems.map(item => [item.id, item.name]));
  return aggregatedItems.map(item => ({ name: foodItemMap.get(item.foodItemId) || 'Unknown', total: item._sum.quantity || 0 }));
}

async function getEmployeeWorkHours() {
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  const shifts = await db.shift.findMany({
    where: { start: { gte: last30Days } },
    select: { start: true, end: true, employee: { select: { user: { select: { firstName: true, lastName: true } } } } },
  });
  const hoursByEmployee: { [key: string]: number } = {};
  shifts.forEach(shift => {
    const name = `${shift.employee.user.firstName} ${shift.employee.user.lastName}`;
    const duration = (shift.end.getTime() - shift.start.getTime()) / (1000 * 60 * 60);
    hoursByEmployee[name] = (hoursByEmployee[name] || 0) + duration;
  });
  return Object.entries(hoursByEmployee).map(([name, value]) => ({ name, value: Math.round(value) }));
}


// --- The Main Page Component ---
export default async function OverviewPage() {
  // Fetch all data in parallel
  const [stats, weeklySales, topItems, employeeHours] = await Promise.all([
    getDashboardStats(),
    getWeeklySalesData(),
    getTopSellingItems(),
    getEmployeeWorkHours(),
  ]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
      
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Revenue</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">Rs. {stats.revenue.toFixed(2)}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Orders</CardTitle><ShoppingCart className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">+{stats.orders}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">New Customers (Today)</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">+{stats.customers}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Active Menu Items</CardTitle><UtensilsCrossed className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.menuItems}</div></CardContent></Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader><CardTitle>Weekly Sales</CardTitle><CardDescription>Comparison of sales between this week and last week.</CardDescription></CardHeader>
          <CardContent className="pl-2"><SalesChart data={weeklySales} /></CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader><CardTitle>Employee Work Hours</CardTitle><CardDescription>Total hours worked in the last 30 days.</CardDescription></CardHeader>
          <CardContent><EmployeeHoursChart data={employeeHours} /></CardContent>
        </Card>
      </div>
      <Card>
          <CardHeader><CardTitle>Top 10 Selling Items</CardTitle><CardDescription>The most popular items based on quantity sold.</CardDescription></CardHeader>
          <CardContent><PopularItemsChart data={topItems} /></CardContent>
      </Card>
    </div>
  );
}