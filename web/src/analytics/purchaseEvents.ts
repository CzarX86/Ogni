import { AnalyticsService } from '../services/analytics';

export interface PurchaseEventData {
  orderId: string;
  userId?: string;
  sessionId: string;
  totalValue: number;
  currency: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    category?: string;
  }>;
  paymentMethod: string;
  shippingMethod: string;
  shippingCost: number;
  discountAmount?: number;
  couponCode?: string;
  timestamp: Date;
}

export interface CartEventData {
  userId?: string;
  sessionId: string;
  eventType: 'add_item' | 'remove_item' | 'update_quantity' | 'view_cart' | 'abandon_cart';
  productId: string;
  productName: string;
  quantity: number;
  cartValue: number;
  timestamp: Date;
}

export interface CheckoutEventData {
  userId?: string;
  sessionId: string;
  step: 'start' | 'shipping' | 'payment' | 'review' | 'complete';
  cartValue: number;
  itemsCount: number;
  timestamp: Date;
}

export class PurchaseAnalytics {
  // Track purchase completion
  static trackPurchase(data: PurchaseEventData): void {
    try {
      // Track with internal analytics
      AnalyticsService.trackEvent('purchase', {
        order_id: data.orderId,
        user_id: data.userId,
        session_id: data.sessionId,
        value: data.totalValue,
        currency: data.currency,
        items: data.items,
        payment_method: data.paymentMethod,
        shipping_method: data.shippingMethod,
        shipping_cost: data.shippingCost,
        discount_amount: data.discountAmount,
        coupon_code: data.couponCode,
        timestamp: data.timestamp.toISOString(),
      });

      // Track with Google Analytics 4 (if available)
      if (window.gtag) {
        window.gtag('event', 'purchase', {
          transaction_id: data.orderId,
          value: data.totalValue,
          currency: data.currency,
          items: data.items.map(item => ({
            item_id: item.productId,
            item_name: item.productName,
            quantity: item.quantity,
            price: item.unitPrice,
            category: item.category,
          })),
          shipping: data.shippingCost,
          coupon: data.couponCode,
        });
      }

      // Track with Facebook Pixel (if available)
      if (window.fbq) {
        window.fbq('track', 'Purchase', {
          value: data.totalValue,
          currency: data.currency,
          content_ids: data.items.map(item => item.productId),
          content_type: 'product',
          num_items: data.items.reduce((sum, item) => sum + item.quantity, 0),
        });
      }

      console.log('Purchase tracked:', data);
    } catch (error) {
      console.error('Error tracking purchase:', error);
    }
  }

  // Track cart events
  static trackCartEvent(data: CartEventData): void {
    try {
      AnalyticsService.trackEvent('cart_interaction', {
        user_id: data.userId,
        session_id: data.sessionId,
        event_type: data.eventType,
        product_id: data.productId,
        product_name: data.productName,
        quantity: data.quantity,
        cart_value: data.cartValue,
        timestamp: data.timestamp.toISOString(),
      });

      // Track with Google Analytics
      if (window.gtag) {
        const eventName = data.eventType === 'add_item' ? 'add_to_cart' :
                         data.eventType === 'remove_item' ? 'remove_from_cart' : 'view_cart';

        window.gtag('event', eventName, {
          items: [{
            item_id: data.productId,
            item_name: data.productName,
            quantity: data.quantity,
          }],
          value: data.cartValue,
        });
      }

      console.log('Cart event tracked:', data);
    } catch (error) {
      console.error('Error tracking cart event:', error);
    }
  }

  // Track checkout funnel
  static trackCheckoutEvent(data: CheckoutEventData): void {
    try {
      AnalyticsService.trackEvent('checkout_progress', {
        user_id: data.userId,
        session_id: data.sessionId,
        step: data.step,
        cart_value: data.cartValue,
        items_count: data.itemsCount,
        timestamp: data.timestamp.toISOString(),
      });

      // Track with Google Analytics
      if (window.gtag) {
        window.gtag('event', 'begin_checkout', {
          items: [], // Would need to pass actual items
          value: data.cartValue,
          currency: 'BRL',
        });
      }

      console.log('Checkout event tracked:', data);
    } catch (error) {
      console.error('Error tracking checkout event:', error);
    }
  }

  // Track purchase funnel conversion
  static trackPurchaseFunnel(sessionId: string, userId?: string): void {
    try {
      // Track conversion from cart to purchase
      AnalyticsService.trackConversion('purchase_funnel', {
        session_id: sessionId,
        user_id: userId,
        conversion_type: 'cart_to_purchase',
        timestamp: new Date().toISOString(),
      });

      console.log('Purchase funnel tracked for session:', sessionId);
    } catch (error) {
      console.error('Error tracking purchase funnel:', error);
    }
  }

  // Track abandoned cart
  static trackAbandonedCart(cartData: {
    userId?: string;
    sessionId: string;
    items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
    }>;
    cartValue: number;
    lastActivity: Date;
  }): void {
    try {
      AnalyticsService.trackEvent('abandoned_cart', {
        user_id: cartData.userId,
        session_id: cartData.sessionId,
        items: cartData.items,
        cart_value: cartData.cartValue,
        last_activity: cartData.lastActivity.toISOString(),
        timestamp: new Date().toISOString(),
      });

      console.log('Abandoned cart tracked:', cartData);
    } catch (error) {
      console.error('Error tracking abandoned cart:', error);
    }
  }
}

// Extend Window interface for analytics libraries
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}