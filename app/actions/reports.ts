"use server";

import prisma from "@/lib/db";
import { OrderStatus } from "@prisma/client";

// ============================================
// SALES REPORT
// ============================================
export async function generateSalesReport(startDate?: string, endDate?: string) {
  try {
    const whereClause: any = {
      status: { in: [OrderStatus.DELIVERED, OrderStatus.CONFIRMED] }
    };

    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate + 'T23:59:59'),
      };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      select: {
        id: true,
        createdAt: true,
        total: true,
        status: true,
        type: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        items: {
          select: {
            quantity: true,
            price: true,
            foodItem: {
              select: {
                name: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    const flattenedData = orders.map(order => ({
      order_id: order.id,
      date: order.createdAt.toISOString().split('T')[0],
      time: order.createdAt.toTimeString().split(' ')[0],
      customer_name: `${order.user.firstName} ${order.user.lastName}`,
      customer_email: order.user.email,
      order_type: order.type,
      status: order.status,
      items_count: order.items.reduce((sum, item) => sum + item.quantity, 0),
      total_amount: `Rs. ${order.total.toFixed(2)}`,
    }));

    // Calculate summary
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const dateRange = startDate && endDate ? `${startDate} to ${endDate}` : 'All time';
    
    return { 
      success: true, 
      data: flattenedData,
      summary: {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        dateRange
      },
      fileName: `sales-report-${new Date().toISOString().split('T')[0]}.pdf`
    };
  } catch (error) {
    console.error("Failed to generate sales report:", error);
    return { success: false, error: "Could not generate sales report." };
  }
}

// ============================================
// INVENTORY REPORT
// ============================================
export async function generateInventoryReport() {
  try {
    const ingredients = await prisma.ingredient.findMany({
      include: { supplier: true },
      orderBy: { name: 'asc' },
    });

    const flattenedData = ingredients.map(ing => ({
      ingredient_name: ing.name,
      supplier_name: ing.supplier?.name || 'N/A',
      current_stock: `${ing.stock} ${ing.unit}`,
      unit: ing.unit,
      restock_threshold: `${ing.restockThreshold} ${ing.unit}`,
      expiry_date: ing.expiryDate ? ing.expiryDate.toISOString().split('T')[0] : null,
      status: ing.stock <= ing.restockThreshold ? 'Low Stock' : 'In Stock',
    }));

    const lowStockCount = ingredients.filter(ing => ing.stock <= ing.restockThreshold).length;

    return { 
      success: true, 
      data: flattenedData,
      summary: {
        totalItems: ingredients.length,
        lowStockCount,
      },
      fileName: `inventory-report-${new Date().toISOString().split('T')[0]}.pdf`
    };
  } catch (error) {
    console.error("Failed to generate inventory report:", error);
    return { success: false, error: "Could not generate inventory report." };
  }
}

// ============================================
// SALARY REPORT
// ============================================
export async function generateSalaryReport(month: string, year: string) {
  try {
    const monthNum = new Date(`${month} 1, ${year}`).getMonth();
    const startDate = new Date(parseInt(year), monthNum, 1);
    const endDate = new Date(parseInt(year), monthNum + 1, 0, 23, 59, 59);

    const shifts = await prisma.shift.findMany({
      where: {
        start: { gte: startDate, lte: endDate },
      },
      include: {
        employee: {
          include: {
            user: true,
          }
        }
      }
    });

    const employeeSalaries: { [key: number]: any } = {};

    shifts.forEach(shift => {
      const empId = shift.employee.id;
      const hours = (shift.end.getTime() - shift.start.getTime()) / (1000 * 60 * 60);
      
      if (!employeeSalaries[empId]) {
        employeeSalaries[empId] = {
          employee_name: `${shift.employee.user.firstName} ${shift.employee.user.lastName}`,
          email: shift.employee.user.email,
          position: shift.employee.position,
          hourly_rate: shift.employee.hourlyRate.toFixed(2),
          hours_worked: 0,
          total_salary: 0,
        };
      }
      
      employeeSalaries[empId].hours_worked += hours;
      employeeSalaries[empId].total_salary += hours * shift.employee.hourlyRate;
    });

    const salaryData = Object.values(employeeSalaries).map(emp => ({
      ...emp,
      hours_worked: emp.hours_worked.toFixed(2),
      total_salary: emp.total_salary.toFixed(2),
    }));

    const totalPayroll = salaryData.reduce((sum, emp) => sum + parseFloat(emp.total_salary), 0);

    return { 
      success: true, 
      data: salaryData,
      summary: {
        totalEmployees: salaryData.length,
        totalPayroll,
        month,
        year,
      },
      fileName: `salary-report-${month}-${year}.pdf`
    };
  } catch (error) {
    console.error("Failed to generate salary report:", error);
    return { success: false, error: "Could not generate salary report." };
  }
}

// ============================================
// SUMMARY REPORT
// ============================================
export async function generateSummaryReport(startDate?: string, endDate?: string) {
  try {
    const whereClause: any = {
      status: { in: [OrderStatus.DELIVERED, OrderStatus.CONFIRMED] }
    };

    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate + 'T23:59:59'),
      };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            foodItem: true,
          }
        },
        user: true,
      }
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get unique customers
    const uniqueCustomers = new Set(orders.map(o => o.userId));
    const totalCustomers = uniqueCustomers.size;

    // Top selling items
    const itemSales: { [key: number]: { name: string; quantity: number; revenue: number } } = {};
    
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!itemSales[item.foodItemId]) {
          itemSales[item.foodItemId] = {
            name: item.foodItem.name,
            quantity: 0,
            revenue: 0,
          };
        }
        itemSales[item.foodItemId].quantity += item.quantity;
        itemSales[item.foodItemId].revenue += item.price * item.quantity;
      });
    });

    const topItems = Object.values(itemSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map(item => ({
        item_name: item.name,
        quantity_sold: item.quantity,
        revenue: item.revenue,
      }));

    const dateRange = startDate && endDate ? `${startDate} to ${endDate}` : 'All time';

    return {
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        totalCustomers,
        topItems,
      },
      dateRange,
      fileName: `summary-report-${new Date().toISOString().split('T')[0]}.pdf`
    };
  } catch (error) {
    console.error("Failed to generate summary report:", error);
    return { success: false, error: "Could not generate summary report." };
  }
}

// Keep existing forecast functions
export async function generateBudgetForecast() {
  try {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const orders = await prisma.order.findMany({
      where: {
        status: OrderStatus.DELIVERED,
        createdAt: { gte: currentMonthStart, lte: currentMonthEnd },
      },
    });

    const currentRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const currentOrderCount = orders.length;

    const predictedRevenue = currentRevenue * 1.1;
    const predictedOrderCount = Math.ceil(currentOrderCount * 1.1);

    const ingredients = await prisma.ingredient.findMany();
    const totalPredictedExpenses = ingredients.reduce((sum, ing) => {
      const monthlyUsage = ing.restockThreshold * 2;
      return sum + (monthlyUsage * 50);
    }, 0);

    const predictedProfit = predictedRevenue - totalPredictedExpenses;
    const profitMargin = (predictedProfit / predictedRevenue) * 100;

    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonthName = nextMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return {
      success: true,
      rawData: {
        currentRevenue,
        currentOrderCount,
        predictedRevenue,
        predictedOrderCount,
        totalPredictedExpenses,
        predictedProfit,
        profitMargin,
        nextMonthName,
      }
    };
  } catch (error) {
    console.error("Failed to generate budget forecast:", error);
    return { success: false, error: "Could not generate budget forecast." };
  }
}

export async function generateInventoryForecast() {
  try {
    const ingredients = await prisma.ingredient.findMany({
      include: { supplier: true },
    });

    const forecastData = ingredients.map(ing => {
      const monthlyUsage = ing.restockThreshold * 1.5;
      const predictedStock = Math.max(0, ing.stock - monthlyUsage);
      const recommendedOrder = predictedStock < ing.restockThreshold 
        ? ing.restockThreshold * 2 
        : 0;

      let priority = 'LOW';
      if (predictedStock <= 0) priority = 'HIGH';
      else if (predictedStock < ing.restockThreshold) priority = 'MEDIUM';

      return {
        ingredient_name: ing.name,
        current_stock: `${ing.stock} ${ing.unit}`,
        predicted_next_month_usage: `${monthlyUsage.toFixed(2)} ${ing.unit}`,
        predicted_stock_end_of_month: `${predictedStock.toFixed(2)} ${ing.unit}`,
        recommended_order_quantity: `${recommendedOrder.toFixed(2)} ${ing.unit}`,
        priority,
      };
    });

    const needsRestockCount = forecastData.filter(item => item.priority !== 'LOW').length;
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthName = nextMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return {
      success: true,
      rawData: forecastData,
      summary: {
        totalItems: ingredients.length,
        needsRestockCount,
        nextMonthName,
      }
    };
  } catch (error) {
    console.error("Failed to generate inventory forecast:", error);
    return { success: false, error: "Could not generate inventory forecast." };
  }
}

export async function generateSalesPrediction() {
  try {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const orders = await prisma.order.findMany({
      where: {
        status: OrderStatus.DELIVERED,
        createdAt: { gte: currentMonthStart },
      },
      include: {
        items: {
          include: { foodItem: true },
        },
      },
    });

    const itemSales: { [key: number]: { name: string; quantity: number } } = {};
    
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!itemSales[item.foodItemId]) {
          itemSales[item.foodItemId] = {
            name: item.foodItem.name,
            quantity: 0,
          };
        }
        itemSales[item.foodItemId].quantity += item.quantity;
      });
    });

    const predictionData = Object.values(itemSales).map(item => ({
      item_name: item.name,
      current_quantity_sold: item.quantity,
      predicted_quantity_sold: Math.ceil(item.quantity * 1.1),
    }));

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const predictedRevenue = totalRevenue * 1.1;
    const predictedOrders = Math.ceil(orders.length * 1.1);

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthName = nextMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return {
      success: true,
      rawData: predictionData,
      summary: {
        predictedRevenue,
        predictedOrders,
        nextMonthName,
      }
    };
  } catch (error) {
    console.error("Failed to generate sales prediction:", error);
    return { success: false, error: "Could not generate sales prediction." };
  }
}