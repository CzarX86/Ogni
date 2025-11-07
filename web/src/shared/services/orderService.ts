import { ApiClient } from './api';
import { OrderModel, OrderItemModel } from '../models/order';
import { CartService } from './cartService';
import { ProductService } from './productService';
import { Order, OrderItem } from '../types';
import { log } from '../utils/logger';
import { EmailService } from './emailService';

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

      // Calculate shipping (placeholder - integrate with Melhor Envio later)
      const shippingCost = 10.00; // Fixed for now
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
        await EmailService.getInstance().sendOrderConfirmation(
          orderId,
          'customer@example.com', // TODO: Get from user profile
          'Customer', // TODO: Get from user profile
          order as unknown as Record<string, unknown>
        );
      } catch (emailError) {
        log.warn('Failed to send order confirmation email', { orderId, emailError });
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
      const orders = await ApiClient.getCollection<Order>(this.COLLECTION);

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

      // Send status update email
      try {
        if (newStatus === 'shipped') {
          await EmailService.getInstance().sendShippingConfirmation(
            orderId,
            'customer@example.com', // TODO: Get from user profile
            'Customer', // TODO: Get from user profile
            { trackingNumber: 'TRACK123', carrier: 'Correios', estimatedDelivery: '2024-01-15' } // TODO: Get real tracking info
          );
        } else {
          await EmailService.getInstance().sendOrderStatusUpdate(
            orderId,
            'customer@example.com', // TODO: Get from user profile
            'Customer', // TODO: Get from user profile
            newStatus,
            updatedOrder as unknown as Record<string, unknown>
          );
        }
      } catch (emailError) {
        log.warn('Failed to send order status update email', { orderId, newStatus, emailError });
        // Don't fail the status update if email fails
      }

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
      const orders = await ApiClient.getCollection<Order>(this.COLLECTION);

      log.info('Retrieved orders by status', { status, count: orders.length });
      return orders;
    } catch (error) {
      log.error('Failed to get orders by status', { status, error });
      throw error;
    }
  }

  // Process payment (placeholder for Mercado Pago integration)
  static async processPayment(orderId: string, paymentData: Record<string, unknown>): Promise<Order> {
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
          transactionId: paymentData.transactionId as string,
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