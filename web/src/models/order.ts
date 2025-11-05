import { Order, OrderItem } from '../types';

// Order and OrderItem validation models

export class OrderItemModel {
  static validate(item: Partial<OrderItem>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!item.productId || item.productId.trim().length === 0) {
      errors.push('Product ID is required');
    }

    if (item.quantity === undefined || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
      errors.push('Quantity must be a positive integer');
    }

    if (item.price === undefined || item.price < 0) {
      errors.push('Price must be a non-negative number');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static create(productId: string, quantity: number, price: number): OrderItem {
    return {
      productId,
      quantity,
      price,
    };
  }
}

export class OrderModel {
  static validate(order: Partial<Order>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!order.userId || order.userId.trim().length === 0) {
      errors.push('User ID is required');
    }

    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
      errors.push('At least one item is required');
    } else {
      order.items.forEach((item, index) => {
        const itemValidation = OrderItemModel.validate(item);
        if (!itemValidation.isValid) {
          errors.push(`Item ${index}: ${itemValidation.errors.join(', ')}`);
        }
      });
    }

    if (order.total === undefined || order.total < 0) {
      errors.push('Total must be a non-negative number');
    }

    if (!order.status || !['pending', 'paid', 'shipped', 'delivered', 'cancelled'].includes(order.status)) {
      errors.push('Status must be one of: pending, paid, shipped, delivered, cancelled');
    }

    if (!order.shipping || typeof order.shipping !== 'object') {
      errors.push('Shipping information is required');
    } else {
      if (!order.shipping.address || order.shipping.address.trim().length === 0) {
        errors.push('Shipping address is required');
      }
      if (!order.shipping.method || order.shipping.method.trim().length === 0) {
        errors.push('Shipping method is required');
      }
      if (order.shipping.cost === undefined || order.shipping.cost < 0) {
        errors.push('Shipping cost must be a non-negative number');
      }
    }

    if (!order.payment || typeof order.payment !== 'object') {
      errors.push('Payment information is required');
    } else {
      if (!order.payment.method || !['pix', 'card'].includes(order.payment.method)) {
        errors.push('Payment method must be pix or card');
      }
      if (!order.payment.status || !['pending', 'processing', 'completed', 'failed'].includes(order.payment.status)) {
        errors.push('Payment status is invalid');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static create(userId: string, items: OrderItem[], shipping: Order['shipping']): Omit<Order, 'id'> {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + shipping.cost;
    const now = new Date();

    return {
      userId,
      items,
      total,
      status: 'pending',
      shipping,
      payment: {
        method: 'pix', // default
        status: 'pending',
      },
      createdAt: now,
      updatedAt: now,
    };
  }

  static calculateTotal(items: OrderItem[], shippingCost: number): number {
    const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return itemsTotal + shippingCost;
  }

  static canTransitionStatus(currentStatus: Order['status'], newStatus: Order['status']): boolean {
    const validTransitions: Record<Order['status'], Order['status'][]> = {
      pending: ['paid', 'cancelled'],
      paid: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: [], // final state
      cancelled: [], // final state
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  static updateStatus(order: Order, newStatus: Order['status']): Order {
    if (!this.canTransitionStatus(order.status, newStatus)) {
      throw new Error(`Invalid status transition from ${order.status} to ${newStatus}`);
    }

    return {
      ...order,
      status: newStatus,
      updatedAt: new Date(),
    };
  }
}