import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Softer, more pleasant color scheme
const COLORS = {
  primary: [99, 102, 241] as [number, number, number], // Indigo-500 - easier on eyes
  secondary: [129, 140, 248] as [number, number, number], // Indigo-400
  success: [34, 197, 94] as [number, number, number], // Green
  text: [31, 41, 55] as [number, number, number], // Gray-800
  textLight: [107, 114, 128] as [number, number, number], // Gray-500
};

// Add letterhead to every page
function addLetterhead(doc: jsPDF, title: string, subtitle?: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Softer header background
  doc.setFillColor(99, 102, 241); // Indigo-500
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  // Company name - left aligned
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('FLAMES PIZZERIA', 20, 14);
  
  // Company info - left aligned
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('123 Pizza Street, Colombo, Sri Lanka', 20, 21);
  doc.text('Tel: +94 11 234 5678 | Email: info@flamepizzeria.lk', 20, 27);
  
  // Report title - left aligned
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.text);
  doc.text(title, 20, 48);
  
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.textLight);
    doc.text(subtitle, 20, 55);
  }
  
  // Timestamp - right aligned
  const now = new Date();
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textLight);
  doc.text(`Generated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, pageWidth - 15, 48, { align: 'right' });
  
  return 65;
}

// Add footer to every page
function addFooter(doc: jsPDF, pageNumber: number, totalPages: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.setDrawColor(200, 200, 200);
  doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);
  
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textLight);
  doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth / 2, pageHeight - 12, { align: 'center' });
  doc.text('© 2025 Flame Pizzeria - Confidential', 20, pageHeight - 12);
  doc.text('www.flamepizzeria.lk', pageWidth - 20, pageHeight - 12, { align: 'right' });
}

// ============================================
// SALES REPORT PDF
// ============================================
export function generateSalesReportPDF(orders: any[], summary: any, dateRange: string) {
  const doc = new jsPDF('landscape');
  
  let startY = addLetterhead(
    doc, 
    'SALES REPORT',
    `Period: ${dateRange}`
  );
  
  // Summary Cards
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(20, startY, 80, 30, 3, 3, 'F');
  doc.roundedRect(110, startY, 80, 30, 3, 3, 'F');
  doc.roundedRect(200, startY, 80, 30, 3, 3, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textLight);
  doc.text('Total Revenue', 25, startY + 10);
  doc.text('Total Orders', 115, startY + 10);
  doc.text('Average Order Value', 205, startY + 10);
  
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text(`Rs. ${summary.totalRevenue.toFixed(2)}`, 25, startY + 22);
  doc.text(`${summary.totalOrders}`, 115, startY + 22);
  doc.text(`Rs. ${summary.avgOrderValue.toFixed(2)}`, 205, startY + 22);
  
  doc.setFont('helvetica', 'normal');
  
  // Orders Table
  startY += 40;
  
  const tableData = orders.map(order => [
    order.order_id,
    order.date,
    order.time,
    order.customer_name,
    order.order_type,
    order.status,
    order.items_count,
    order.total_amount,
  ]);
  
  autoTable(doc, {
    startY: startY,
    head: [['Order ID', 'Date', 'Time', 'Customer', 'Type', 'Status', 'Items', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: { 
      fillColor: COLORS.primary,
      fontSize: 10,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    margin: { left: 20, right: 20 },
  });
  
  // Add footer
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }
  
  return doc;
}

// ============================================
// INVENTORY REPORT PDF
// ============================================
export function generateInventoryReportPDF(ingredients: any[], summary: any) {
  const doc = new jsPDF('landscape');
  
  let startY = addLetterhead(
    doc,
    'INVENTORY REPORT',
    `Total Items: ${summary.totalItems} | Low Stock: ${summary.lowStockCount}`
  );
  
  // Alert section for low stock
  if (summary.lowStockCount > 0) {
    doc.setFillColor(254, 226, 226);
    doc.setDrawColor(220, 38, 38);
    doc.roundedRect(20, startY, 260, 15, 2, 2, 'FD');
    doc.setFontSize(10);
    doc.setTextColor(220, 38, 38);
    doc.setFont('helvetica', 'bold');
    doc.text(`⚠️ WARNING: ${summary.lowStockCount} items need immediate restocking!`, 25, startY + 10);
    doc.setFont('helvetica', 'normal');
    startY += 20;
  }
  
  // Inventory Table
  const tableData = ingredients.map(item => [
    item.ingredient_name,
    item.supplier_name,
    item.current_stock,
    item.unit,
    item.restock_threshold,
    item.expiry_date || 'N/A',
    item.status,
  ]);
  
  autoTable(doc, {
    startY: startY,
    head: [['Ingredient', 'Supplier', 'Stock', 'Unit', 'Threshold', 'Expiry', 'Status']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: COLORS.primary,
      fontSize: 10,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      6: { 
        cellWidth: 30,
        fontStyle: 'bold',
      }
    },
    didParseCell: (data) => {
      if (data.column.index === 6 && data.cell.section === 'body') {
        const status = data.cell.raw as string;
        if (status === 'Low Stock') {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fillColor = [254, 226, 226];
        } else if (status === 'In Stock') {
          data.cell.styles.textColor = [34, 197, 94];
        }
      }
    },
    margin: { left: 20, right: 20 },
  });
  
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }
  
  return doc;
}

// ============================================
// SALARY REPORT PDF
// ============================================
export function generateSalaryReportPDF(salaries: any[], summary: any, month: string, year: string) {
  const doc = new jsPDF('landscape');
  
  let startY = addLetterhead(
    doc,
    'SALARY REPORT',
    `Period: ${month} ${year}`
  );
  
  // Summary
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(20, startY, 120, 30, 3, 3, 'F');
  doc.roundedRect(160, startY, 120, 30, 3, 3, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textLight);
  doc.text('Total Employees', 25, startY + 10);
  doc.text('Total Payroll', 165, startY + 10);
  
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text(`${summary.totalEmployees}`, 25, startY + 22);
  doc.text(`Rs. ${summary.totalPayroll.toFixed(2)}`, 165, startY + 22);
  doc.setFont('helvetica', 'normal');
  
  startY += 40;
  
  // Salary Table
  const tableData = salaries.map(emp => [
    emp.employee_name,
    emp.email,
    emp.position,
    emp.hours_worked,
    `Rs. ${emp.hourly_rate}`,
    `Rs. ${emp.total_salary}`,
  ]);
  
  autoTable(doc, {
    startY: startY,
    head: [['Employee', 'Email', 'Position', 'Hours', 'Rate/Hour', 'Total Salary']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: COLORS.primary,
      fontSize: 10,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      5: { fontStyle: 'bold', textColor: COLORS.success }
    },
    margin: { left: 20, right: 20 },
  });
  
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }
  
  return doc;
}

// ============================================
// SUMMARY REPORT PDF
// ============================================
export function generateSummaryReportPDF(data: any, dateRange: string) {
  const doc = new jsPDF('landscape');
  
  let startY = addLetterhead(
    doc,
    'BUSINESS SUMMARY REPORT',
    `Period: ${dateRange}`
  );
  
  // Key Metrics Grid
  const metrics = [
    { label: 'Total Revenue', value: `Rs. ${data.totalRevenue.toFixed(2)}`, color: COLORS.success },
    { label: 'Total Orders', value: `${data.totalOrders}`, color: COLORS.primary },
    { label: 'Avg Order Value', value: `Rs. ${data.avgOrderValue.toFixed(2)}`, color: COLORS.secondary },
    { label: 'Total Customers', value: `${data.totalCustomers}`, color: [59, 130, 246] as [number, number, number] },
  ];
  
  metrics.forEach((metric, index) => {
    const x = 20 + (index * 70);
    doc.setFillColor(...metric.color);
    doc.roundedRect(x, startY, 65, 30, 3, 3, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(metric.label, x + 5, startY + 10);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(metric.value, x + 5, startY + 22);
    doc.setFont('helvetica', 'normal');
  });
  
  startY += 40;
  
  // Top Selling Items
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text('Top Selling Items', 20, startY);
  doc.setFont('helvetica', 'normal');
  
  startY += 5;
  
  autoTable(doc, {
    startY: startY,
    head: [['Item Name', 'Quantity Sold', 'Revenue']],
    body: data.topItems.map((item: any) => [
      item.item_name,
      item.quantity_sold,
      `Rs. ${item.revenue.toFixed(2)}`,
    ]),
    theme: 'striped',
    headStyles: {
      fillColor: COLORS.primary,
      fontSize: 10,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    margin: { left: 20, right: 20 },
  });
  
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }
  
  return doc;
}

// Keep existing forecast functions with updated styling
export function generateBudgetForecastPDF(data: any) {
  const doc = new jsPDF('landscape');
  
  let startY = addLetterhead(
    doc,
    'BUDGET FORECAST REPORT',
    `Forecast for: ${data.rawData.nextMonthName}`
  );
  
  // Current vs Predicted comparison
  autoTable(doc, {
    startY: startY,
    head: [['Metric', 'Current Month', 'Predicted Next Month', 'Growth']],
    body: [
      [
        'Revenue',
        `Rs. ${data.rawData.currentRevenue.toFixed(2)}`,
        `Rs. ${data.rawData.predictedRevenue.toFixed(2)}`,
        '+10%'
      ],
      [
        'Orders',
        data.rawData.currentOrderCount.toString(),
        data.rawData.predictedOrderCount.toString(),
        '+10%'
      ],
      [
        'Expenses',
        'N/A',
        `Rs. ${data.rawData.totalPredictedExpenses.toFixed(2)}`,
        'N/A'
      ],
      [
        'Profit',
        'N/A',
        `Rs. ${data.rawData.predictedProfit.toFixed(2)}`,
        `${data.rawData.profitMargin.toFixed(2)}%`
      ],
    ],
    theme: 'striped',
    headStyles: {
      fillColor: COLORS.primary,
      fontSize: 10,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    margin: { left: 20, right: 20 },
  });
  
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }
  
  return doc;
}

export function generateInventoryForecastPDF(data: any) {
  const doc = new jsPDF('landscape');
  
  let startY = addLetterhead(
    doc,
    'INVENTORY FORECAST REPORT',
    `Forecast for: ${data.summary.nextMonthName}`
  );
  
  // High priority items
  const highPriority = data.rawData.filter((item: any) => item.priority === 'HIGH');
  
  if (highPriority.length > 0) {
    doc.setFillColor(254, 226, 226);
    doc.roundedRect(20, startY, 260, 15, 2, 2, 'F');
    doc.setFontSize(10);
    doc.setTextColor(220, 38, 38);
    doc.setFont('helvetica', 'bold');
    doc.text(`⚠️ ${highPriority.length} items need immediate restocking!`, 25, startY + 10);
    doc.setFont('helvetica', 'normal');
    startY += 20;
  }
  
  autoTable(doc, {
    startY: startY,
    head: [['Ingredient', 'Current Stock', 'Predicted Stock', 'Recommended Order', 'Priority']],
    body: data.rawData.map((item: any) => [
      item.ingredient_name,
      item.current_stock,
      item.predicted_stock_end_of_month,
      item.recommended_order_quantity,
      item.priority,
    ]),
    theme: 'striped',
    headStyles: {
      fillColor: COLORS.primary,
      fontSize: 10,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    didParseCell: (cellData) => {
      if (cellData.column.index === 4 && cellData.cell.section === 'body') {
        const priority = cellData.cell.raw as string;
        if (priority === 'HIGH') {
          cellData.cell.styles.textColor = [220, 38, 38];
          cellData.cell.styles.fontStyle = 'bold';
        }
      }
    },
    margin: { left: 20, right: 20 },
  });
  
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }
  
  return doc;
}

export function generateSalesPredictionPDF(data: any) {
  const doc = new jsPDF('landscape');
  
  let startY = addLetterhead(
    doc,
    'SALES PREDICTION REPORT',
    `Forecast for: ${data.summary.nextMonthName}`
  );
  
  // Summary metrics
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(20, startY, 80, 30, 3, 3, 'F');
  doc.roundedRect(110, startY, 80, 30, 3, 3, 'F');
  doc.roundedRect(200, startY, 80, 30, 3, 3, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textLight);
  doc.text('Predicted Revenue', 25, startY + 10);
  doc.text('Predicted Orders', 115, startY + 10);
  doc.text('Growth Rate', 205, startY + 10);
  
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text(`Rs. ${data.summary.predictedRevenue.toFixed(2)}`, 25, startY + 22);
  doc.text(`${data.summary.predictedOrders}`, 115, startY + 22);
  doc.text('+10%', 205, startY + 22);
  doc.setFont('helvetica', 'normal');
  
  startY += 40;
  
  // Item predictions
  autoTable(doc, {
    startY: startY,
    head: [['Item', 'Current Sales', 'Predicted Sales', 'Growth']],
    body: data.rawData.map((item: any) => [
      item.item_name,
      item.current_quantity_sold,
      item.predicted_quantity_sold,
      '+10%',
    ]),
    theme: 'striped',
    headStyles: {
      fillColor: COLORS.primary,
      fontSize: 10,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    margin: { left: 20, right: 20 },
  });
  
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }
  
  return doc;
}