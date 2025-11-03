'use client';

import { Button } from "@/components/ui/button";

interface PrintReceiptButtonProps {
  order: {
    id: number;
    createdAt: string;
    status: string;
    total: number;
    deliveryFee?: number;
    address: string;
    phone: string;
    user: {
      firstName: string;
      lastName: string;
    };
    items: Array<{
      id: number;
      quantity: number;
      price: number;
      foodItem: {
        name: string;
        price: number;
      };
      customizations?: Array<{
        id: number;
        name: string;
        price: number;
      }>;
    }>;
  };
}

export function PrintReceiptButton({ order }: PrintReceiptButtonProps) {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const currency = new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 2,
    });

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - Order #${order.id}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', monospace; padding: 20px; max-width: 400px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #000; padding-bottom: 10px; }
          .header h1 { font-size: 24px; margin-bottom: 5px; }
          .info { margin-bottom: 15px; font-size: 12px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .items { margin-bottom: 15px; }
          .item { margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #ddd; }
          .item-name { font-weight: bold; margin-bottom: 3px; }
          .item-details { font-size: 11px; color: #666; margin-left: 10px; }
          .totals { border-top: 2px solid #000; padding-top: 10px; }
          .total-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .grand-total { font-weight: bold; font-size: 16px; margin-top: 10px; }
          .footer { text-align: center; margin-top: 20px; font-size: 11px; border-top: 2px dashed #000; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FLAMES PIZZERIA</h1>
          <p>Order Receipt</p>
        </div>
        <div class="info">
          <div class="info-row"><span>Order #:</span><span>${order.id}</span></div>
          <div class="info-row"><span>Date:</span><span>${new Date(order.createdAt).toLocaleString()}</span></div>
          <div class="info-row"><span>Customer:</span><span>${order.user.firstName} ${order.user.lastName}</span></div>
          <div class="info-row"><span>Phone:</span><span>${order.phone}</span></div>
          <div class="info-row"><span>Address:</span><span>${order.address || 'Pickup'}</span></div>
          <div class="info-row"><span>Status:</span><span>${order.status.replace(/_/g, ' ')}</span></div>
        </div>
        <div class="items">
          <h3>Items:</h3>
          ${order.items.map(item => {
            const customizations = Array.isArray(item.customizations) ? item.customizations : [];
            const itemSubtotal = (item.quantity * item.foodItem.price) + 
              (customizations.reduce((sum, c) => sum + (c.price * item.quantity), 0));
            
            return `
              <div class="item">
                <div class="item-name">${item.quantity}x ${item.foodItem.name}</div>
                <div class="item-details">@ ${currency.format(item.foodItem.price)} each</div>
                ${customizations.length > 0 ? `
                  <div class="item-details">
                    Customizations: ${customizations.map(c => 
                      `${c.name} (${currency.format(c.price)})`
                    ).join(', ')}
                  </div>
                ` : ''}
                <div class="item-details">Subtotal: ${currency.format(itemSubtotal)}</div>
              </div>
            `;
          }).join('')}
        </div>
        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${currency.format(order.total)}</span>
          </div>
          ${order.deliveryFee ? `
            <div class="total-row">
              <span>Delivery Fee:</span>
              <span>${currency.format(order.deliveryFee)}</span>
            </div>
          ` : ''}
          <div class="total-row grand-total">
            <span>TOTAL:</span>
            <span>${currency.format(order.total + (order.deliveryFee || 0))}</span>
          </div>
        </div>
        <div class="footer">
          <p>Thank you for your order!</p>
          <p>Visit us again soon!</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <Button 
      size="sm" 
      variant="outline"
      onClick={handlePrint}
    >
      Get Receipt
    </Button>
  );
}
