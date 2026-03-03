import { Injectable } from '@angular/core';
import { CartItem } from '../models/cart.model';
import { DeliveryMethod } from '../models/order.model';
import { environment } from '../../../environments/environment';

export interface CheckoutData {
  firstName: string;
  lastName: string;
  phone: string;
  deliveryMethod: DeliveryMethod;
  address?: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class WhatsappService {

  openWhatsApp(data: CheckoutData, items: CartItem[], total: number): void {
    const message = this.buildMessage(data, items, total);
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${environment.whatsappNumber}?text=${encoded}`;
    window.open(url, '_blank');
  }

  private buildMessage(data: CheckoutData, items: CartItem[], total: number): string {
    const divider = '─'.repeat(30);
    const method  = data.deliveryMethod === 'DELIVERY' ? '🚚 Delivery' : '🏪 Store Pickup';

    let lines: string[] = [
      '🛒 *NEW ORDER - Nehrem Store*',
      divider,
      '',
      '👤 *Customer Information*',
      `• Name:  ${data.firstName} ${data.lastName}`,
      `• Phone: ${data.phone}`,
      `• Method: ${method}`,
    ];

    if (data.deliveryMethod === 'DELIVERY' && data.address) {
      lines.push(`• Address: ${data.address}`);
    }

    if (data.notes) {
      lines.push(`• Notes: ${data.notes}`);
    }

    lines.push('', divider, '', '🛍️ *Order Items*');

    items.forEach((item, idx) => {
      const price = item.product.discountPrice ?? item.product.price;
      const subtotal = price * item.quantity;
      lines.push(
        `${idx + 1}. ${item.product.name}`,
        `   Qty: ${item.quantity} × ${price.toFixed(2)} AZN = ${subtotal.toFixed(2)} AZN`
      );
    });

    lines.push(
      '',
      divider,
      `💰 *Total: ${total.toFixed(2)} AZN*`,
      divider,
      '',
      '_Thank you for your order! We will contact you shortly._'
    );

    return lines.join('\n');
  }
}
