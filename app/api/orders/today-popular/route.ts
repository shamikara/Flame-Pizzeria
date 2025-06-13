import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { startOfDay } from 'date-fns';

export async function GET() {
  try {
    const today = startOfDay(new Date());

    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: {
            gte: today,
          },
        },
      },
      include: {
        foodItem: {
          select: {
            name: true,
          },
        },
      },
    });

    const itemCounts: { [name: string]: number } = {};

    orderItems.forEach(item => {
      if (item.foodItem) {
        const name = item.foodItem.name;
        const quantity = item.quantity;
        
        if (itemCounts[name]) {
          itemCounts[name] += quantity;
        } else {
          itemCounts[name] = quantity;
        }
      }
    });

    const chartData = Object.entries(itemCounts).map(([name, count]) => ({
      name,
      count,
    }));
    
    const topItems = chartData.sort((a, b) => b.count - a.count).slice(0, 6);

    return NextResponse.json(topItems);
  } catch (error) {
    console.error("[TODAY_POPULAR_ITEMS_ERROR]", error);
    // Ensure even errors return a JSON response
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}