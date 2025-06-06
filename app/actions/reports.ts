"use server";

import { db } from "@/lib/db";
import { OrderStatus } from "@prisma/client";

function convertToCSV(data: any[]) {
  if (data.length === 0) return "";
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row).map(value => 
      // Handle commas and quotes in values
      `"${String(value).replace(/"/g, '""')}"`
    ).join(',')
  );
  return [headers, ...rows].join('\n');
}

export async function generateSalesReport() {
  try {
    const orders = await db.order.findMany({
      where: {
        status: { in: [OrderStatus.DELIVERED, OrderStatus.COMPLETED] } // Use your relevant statuses
      },
      select: {
        id: true,
        createdAt: true,
        total: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    const flattenedData = orders.map(order => ({
      order_id: order.id,
      date: order.createdAt.toISOString().split('T')[0], // Format as YYYY-MM-DD
      customer_name: `${order.user.firstName} ${order.user.lastName}`,
      total_amount: order.total,
    }));

    const csv = convertToCSV(flattenedData);
    
    return { success: true, csvData: csv, fileName: `sales-report-${new Date().toISOString().split('T')[0]}.csv` };
  } catch (error) {
    console.error("Failed to generate sales report:", error);
    return { success: false, error: "Could not generate report." };
  }
}