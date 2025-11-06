import { ApiClient } from './api';
import { OrderModel, OrderItemModel } from '../models/order';
import { CartService } from './cartService';
import { ProductService } from './productService';
import { Order, OrderItem } from '../types';
import { log } from '../utils/logger';
import { EmailService } from '../../../shared/services/emailService';
import { AuthService } from '../../../shared/services/authService';
import { ShippingService } from '../../../shared/services/shippingService';

export class OrderService {
  private static COLLECTION = 'orders';

  // Create order from cart
  static async createOrderFromCart(
    userId: string,
    shippingAddress: string,
    paymentMethod: 'pix' | 'card' = 'pix'
  ): Promise<Order> {
    try {
      // Get cart with products
      const cartWithProducts = await CartService.getCartWithProducts(userId);
      if (!cartWithProducts) {
        throw new Error('Cart is empty');
      }

      const { cart, products } = cartWithProducts;

      // Validate cart
      const cartValidation = await CartService.validateCart(userId);
      if (!cartValidation.isValid) {
        throw new Error(`Cart validation failed: ${cartValidation.errors.join(', ')}`);
      }

      // Create order items from cart
      const orderItems: OrderItem[] = cart.items.map(cartItem => {
        const product = products.find(p => p.id === cartItem.productId);
        if (!product) {
          throw new Error(`Product ${cartItem.productId} not found`);
        }
        return OrderItemModel.create(cartItem.productId, cartItem.quantity, product.price);
      });

      // Calculate shipping cost using Melhor Envio API
      let shippingCost = 10.00; // fallback
      try {
        // Estimate package dimensions based on cart items
        const totalWeight = orderItems.reduce((weight, item) => {
          // Estimate 0.5kg per product (this should come from product data)
          return weight + (item.quantity * 0.5);
        }, 0);

        // Use estimated package dimensions
        const packageData = {
          weight: Math.max(totalWeight, 0.5), // minimum 0.5kg
          width: 20,  // cm
          height: 10, // cm
          length: 30  // cm
        };

        // Parse shipping address to get postal code
        // This is a simple parsing - in production, you'd want more robust parsing
        const addressParts = shippingAddress.split(',');
        const lastPart = addressParts[addressParts.length - 1]?.trim();
        const postalCodeMatch = lastPart?.match(/\d{5}-?\d{3}/);
        const toPostalCode = postalCodeMatch ? postalCodeMatch[0].replace('-', '') : '01310100'; // São Paulo default

        // Calculate shipping from a central warehouse (using São Paulo postal code)
        const fromPostalCode = '01310100'; // Avenida Paulista area

        const shippingQuotes = await ShippingService.calculateShipping(
          fromPostalCode,
          toPostalCode,
          packageData,
          ['correios'] // Prefer Correios for Brazil
        );

        if (shippingQuotes.length > 0) {
          // Use the cheapest option
          shippingCost = shippingQuotes[0].price;
          log.info('Calculated real shipping cost', { userId, shippingCost, carrier: shippingQuotes[0].company.name });
        }
      } catch (shippingError) {
        log.warn('Failed to calculate real shipping, using fallback', { userId, shippingError, fallbackCost: shippingCost });
      }

      const shipping = {
        address: shippingAddress,
        method: 'standard',
        cost: shippingCost,
      };

      // Create order
      const orderData = OrderModel.create(userId, orderItems, shipping);
      orderData.payment.method = paymentMethod;

      const validation = OrderModel.validate(orderData);
      if (!validation.isValid) {
        throw new Error(`Order validation failed: ${validation.errors.join(', ')}`);
      }

      const orderId = await ApiClient.createDocument(this.COLLECTION, orderData);
      const order = { ...orderData, id: orderId } as Order;

      // Reduce stock for ordered items
      for (const item of orderItems) {
        await ProductService.reduceStock(item.productId, item.quantity);
      }

      // Clear cart after successful order
      await CartService.clearCart(userId);

      // Send order confirmation email
      try {
        const userProfile = await AuthService.getCurrentUserProfile();
        if (userProfile) {
          const emailService = EmailService.getInstance();
          await emailService.sendOrderConfirmation(
            order.id,
            userProfile.email,
            userProfile.displayName || 'Valued Customer',
            order
          );
        }
      } catch (emailError) {
        log.warn('Failed to send order confirmation email, but order was created', { orderId: order.id, emailError });
        // Don't fail the order creation if email fails
      }

      log.info('Created order from cart', { userId, orderId, total: order.total });
      return order;
    } catch (error) {
      log.error('Failed to create order from cart', { userId, error });
      throw error;
    }
  }

  // Get user's orders
  static async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const orders = await ApiClient.queryCollection<Order>(
        this.COLLECTION,
        [{ field: 'userId', operator: '==', value: userId }],
        'createdAt',
        'desc'
      );

      log.info('Retrieved user orders', { userId, count: orders.length });
      return orders;
    } catch (error) {
      log.error('Failed to get user orders', { userId, error });
      throw error;
    }
  }

  // Get order by ID
  static async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const order = await ApiClient.getDocument<Order>(this.COLLECTION, orderId);
      log.info('Retrieved order', { orderId, found: !!order });
      return order;
    } catch (error) {
      log.error('Failed to get order', { orderId, error });
      throw error;
    }
  }

  // Get order by ID with user permission check
  static async getUserOrderById(userId: string, orderId: string): Promise<Order | null> {
    try {
      const order = await this.getOrderById(orderId);
      if (!order || order.userId !== userId) {
        return null; // Not found or not user's order
      }
      return order;
    } catch (error) {
      log.error('Failed to get user order', { userId, orderId, error });
      throw error;
    }
  }

  // Update order status (admin only)
  static async updateOrderStatus(orderId: string, newStatus: Order['status']): Promise<Order> {
    try {
      const order = await this.getOrderById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      const updatedOrder = OrderModel.updateStatus(order, newStatus);
      await ApiClient.updateDocument(this.COLLECTION, orderId, {
        status: newStatus,
        updatedAt: updatedOrder.updatedAt,
      });

      log.info('Updated order status', { orderId, oldStatus: order.status, newStatus });
      return updatedOrder;
    } catch (error) {
      log.error('Failed to update order status', { orderId, newStatus, error });
      throw error;
    }
  }

  // Cancel order
  static async cancelOrder(userId: string, orderId: string): Promise<Order> {
    try {
      const order = await this.getUserOrderById(userId, orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      if (!['pending', 'paid'].includes(order.status)) {
        throw new Error('Order cannot be cancelled at this stage');
      }

      // Restore stock
      for (const item of order.items) {
        const product = await ProductService.getProductById(item.productId);
        if (product) {
          await ProductService.updateStock(item.productId, product.stock + item.quantity);
        }
      }

      const updatedOrder = OrderModel.updateStatus(order, 'cancelled');
      await ApiClient.updateDocument(this.COLLECTION, orderId, {
        status: 'cancelled',
        updatedAt: updatedOrder.updatedAt,
      });

      log.info('Cancelled order', { userId, orderId });
      return updatedOrder;
    } catch (error) {
      log.error('Failed to cancel order', { userId, orderId, error });
      throw error;
    }
  }

  // Get orders by status (admin)
  static async getOrdersByStatus(status: Order['status']): Promise<Order[]> {
    try {
      const orders = await ApiClient.queryCollection<Order>(
        this.COLLECTION,
        [{ field: 'status', operator: '==', value: status }],
        'createdAt',
        'desc'
      );

      log.info('Retrieved orders by status', { status, count: orders.length });
      return orders;
    } catch (error) {
      log.error('Failed to get orders by status', { status, error });
      throw error;
    }
  }

  // Process payment (placeholder for Mercado Pago integration)
  static async processPayment(orderId: string, paymentData: any): Promise<Order> {
    try {
      const order = await this.getOrderById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.status !== 'pending') {
        throw new Error('Order payment already processed');
      }

      // TODO: Integrate with Mercado Pago
      // For now, simulate payment processing
      const paymentStatus = paymentData.success ? 'completed' : 'failed';

      const updatedOrder = {
        ...order,
        payment: {
          ...order.payment,
          status: paymentStatus as 'completed' | 'failed',
          transactionId: paymentData.transactionId,
        },
        status: paymentStatus === 'completed' ? ('paid' as const) : ('pending' as const),
        updatedAt: new Date(),
      };

      await ApiClient.updateDocument(this.COLLECTION, orderId, {
        payment: updatedOrder.payment,
        status: updatedOrder.status,
        updatedAt: updatedOrder.updatedAt,
      });

      log.info('Processed payment', { orderId, status: paymentStatus });
      return updatedOrder;
    } catch (error) {
      log.error('Failed to process payment', { orderId, error });
      throw error;
    }
  }

  // Calculate order statistics (admin)
  static async getOrderStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    ordersByStatus: Record<Order['status'], number>;
  }> {
    try {
      const allOrders = await ApiClient.getCollection<Order>(this.COLLECTION);

      const stats = {
        totalOrders: allOrders.length,
        totalRevenue: allOrders
          .filter(order => order.status === 'delivered')
          .reduce((sum, order) => sum + order.total, 0),
        ordersByStatus: allOrders.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {} as Record<Order['status'], number>),
      };

      log.info('Calculated order stats', stats);
      return stats;
    } catch (error) {
      log.error('Failed to get order stats', { error });
      throw error;
    }
  }
}