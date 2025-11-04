import { log } from '../utils/logger';

export interface AnalyticsEvent {
  eventType: string;
  page?: string;
  element?: string;
  metadata?: Record<string, any>;
  sessionId?: string;
  userId?: string;
  timestamp?: Date;
}

export interface PageViewEvent extends AnalyticsEvent {
  eventType: 'page_view';
  page: string;
  referrer?: string;
  timeOnPage?: number;
  deviceInfo?: {
    type: string;
    os: string;
    browser: string;
  };
}

export interface UserInteractionEvent extends AnalyticsEvent {
  eventType: 'click' | 'scroll' | 'form_submit' | 'search' | 'add_to_cart' | 'purchase';
  element: string;
  page: string;
  metadata?: {
    productId?: string;
    searchTerm?: string;
    cartValue?: number;
    orderId?: string;
  };
}

export interface EcommerceEvent extends AnalyticsEvent {
  eventType: 'product_view' | 'add_to_cart' | 'begin_checkout' | 'purchase';
  metadata: {
    productId?: string;
    quantity?: number;
    value?: number;
    currency?: string;
    orderId?: string;
  };
}

export class AnalyticsService {
  private static sessionId: string = this.generateSessionId();
  private static userId?: string;
  private static pageStartTime: number = Date.now();

  static initialize(userId?: string): void {
    this.userId = userId;
    log.info('Analytics initialized', { userId, sessionId: this.sessionId });
  }

  static setUserId(userId: string): void {
    this.userId = userId;
    log.info('User ID set', { userId });
  }

  // Track page views
  static trackPageView(page: string, referrer?: string): void {
    const event: PageViewEvent = {
      eventType: 'page_view',
      page,
      referrer,
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: new Date(),
      deviceInfo: this.getDeviceInfo(),
    };

    this.sendEvent(event);
    this.pageStartTime = Date.now();
  }

  // Track time on page when leaving
  static trackTimeOnPage(): void {
    const timeOnPage = Date.now() - this.pageStartTime;
    const event: PageViewEvent = {
      eventType: 'page_view',
      page: window.location.pathname,
      timeOnPage,
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: new Date(),
    };

    this.sendEvent(event);
  }

  // Track user interactions
  static trackInteraction(
    eventType: UserInteractionEvent['eventType'],
    element: string,
    page: string,
    metadata?: UserInteractionEvent['metadata']
  ): void {
    const event: UserInteractionEvent = {
      eventType,
      element,
      page,
      metadata,
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: new Date(),
    };

    this.sendEvent(event);
  }

  // Track e-commerce events
  static trackEcommerceEvent(
    eventType: EcommerceEvent['eventType'],
    metadata: EcommerceEvent['metadata']
  ): void {
    const event: EcommerceEvent = {
      eventType,
      metadata: {
        ...metadata,
        currency: metadata.currency || 'BRL',
      },
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: new Date(),
    };

    this.sendEvent(event);
  }

  // Track custom events
  static trackCustomEvent(eventType: string, metadata?: Record<string, any>): void {
    const event: AnalyticsEvent = {
      eventType,
      metadata,
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: new Date(),
    };

    this.sendEvent(event);
  }

  // Send event to multiple analytics providers
  private static sendEvent(event: AnalyticsEvent): void {
    log.trackEvent(event.eventType, event);

    // Google Analytics 4
    this.sendToGA4(event);

    // Meta Pixel
    this.sendToMetaPixel(event);

    // Custom analytics endpoint
    this.sendToCustomAnalytics(event);
  }

  private static sendToGA4(event: AnalyticsEvent): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.eventType, {
        custom_parameters: event.metadata,
        page_location: event.page,
        session_id: event.sessionId,
        user_id: event.userId,
      });
    }
  }

  private static sendToMetaPixel(event: AnalyticsEvent): void {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      // Map events to Meta Pixel standard events
      const pixelEvent = this.mapToPixelEvent(event);
      if (pixelEvent) {
        (window as any).fbq('track', pixelEvent.name, pixelEvent.params);
      }
    }
  }

  private static sendToCustomAnalytics(event: AnalyticsEvent): void {
    // Send to custom analytics API
    try {
      fetch('/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }).catch(error => {
        console.warn('Failed to send analytics event:', error);
      });
    } catch (error) {
      console.warn('Analytics send failed:', error);
    }
  }

  private static mapToPixelEvent(event: AnalyticsEvent): { name: string; params?: any } | null {
    switch (event.eventType) {
      case 'product_view':
        return {
          name: 'ViewContent',
          params: {
            content_ids: [event.metadata?.productId],
            content_type: 'product',
          },
        };
      case 'add_to_cart':
        return {
          name: 'AddToCart',
          params: {
            content_ids: [event.metadata?.productId],
            value: event.metadata?.value,
            currency: event.metadata?.currency || 'BRL',
          },
        };
      case 'begin_checkout':
        return { name: 'InitiateCheckout' };
      case 'purchase':
        return {
          name: 'Purchase',
          params: {
            value: event.metadata?.value,
            currency: event.metadata?.currency || 'BRL',
            content_ids: event.metadata?.productIds,
          },
        };
      case 'search':
        return {
          name: 'Search',
          params: {
            search_string: event.metadata?.searchTerm,
          },
        };
      default:
        return null;
    }
  }

  private static getDeviceInfo(): { type: string; os: string; browser: string } | undefined {
    if (typeof window === 'undefined') return undefined;

    return {
      type: /Mobile|Android|iP(hone|od|ad)/.test(navigator.userAgent) ? 'mobile' : 'desktop',
      os: this.getOS(),
      browser: this.getBrowser(),
    };
  }

  private static getOS(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Unknown';
  }

  private static getBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}