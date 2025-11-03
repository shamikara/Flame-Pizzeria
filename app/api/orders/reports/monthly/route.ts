import { NextResponse } from 'next/server';
// import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());

    // Validate year and month
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Invalid year or month' },
        { status: 400 }
      );
    }

    // const session = await auth();
    // if (!session?.user) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    // Calculate date range for the requested month
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));

    // Get all orders for the month
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: {
          include: {
            foodItem: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Calculate daily totals
    const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
    const dailyData = daysInMonth.map((day) => {
      const dayOrders = orders.filter(
        (order) => format(new Date(order.createdAt), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );
      
      const total = dayOrders.reduce((sum, order) => sum + Number(order.total), 0);
      
      return {
        date: format(day, 'yyyy-MM-dd'),
        day: format(day, 'EEE'),
        orders: dayOrders.length,
        total,
      };
    });

    // Calculate summary statistics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get top selling items
    const itemSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!itemSales[item.foodItem.name]) {
          itemSales[item.foodItem.name] = {
            name: item.foodItem.name,
            quantity: 0,
            revenue: 0,
          };
        }
        itemSales[item.foodItem.name].quantity += item.quantity;
        itemSales[item.foodItem.name].revenue += item.quantity * Number(item.price);
      });
    });

    const topSellingItems = Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Prepare response data
    const responseData = {
      period: {
        start: format(startDate, 'yyyy-MM-dd'),
        end: format(endDate, 'yyyy-MM-dd'),
        month: format(startDate, 'MMMM yyyy'),
      },
      summary: {
        totalOrders,
        totalRevenue,
        averageOrderValue,
      },
      dailyData,
      topSellingItems,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error generating monthly report:', error);
    return NextResponse.json(
      { error: 'Failed to generate monthly report' },
      { status: 500 }
    );
  }
}
