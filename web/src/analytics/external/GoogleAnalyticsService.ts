import { log } from 'shared/utils/logger';

export interface GA4Event {
  name: string;
  parameters?: Record<string, unknown>;
}

export interface GA4Config {
  measurementId: string;
  debug?: boolean;
  sendPageView?: boolean;
}

export class GoogleAnalyticsService {
  private static instance: GoogleAnalyticsService;
  private config: GA4Config | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): GoogleAnalyticsService {
    if (!GoogleAnalyticsService.instance) {
      GoogleAnalyticsService.instance = new GoogleAnalyticsService();
    }
    return GoogleAnalyticsService.instance;
  }

  /**
   * Initialize Google Analytics 4
   */
  async initialize(config: GA4Config): Promise<void> {
    try {
      this.config = config;

      // Load gtag script if not already loaded
      if (!window.gtag) {
        await this.loadGtagScript();
      }

      // Configure GA4
      if (window.gtag) {
        window.gtag('config', config.measurementId, {
          debug_mode: config.debug,
          send_page_view: config.sendPageView !== false
        });
      }

      this.isInitialized = true;
      log.info('Google Analytics 4 initialized', { measurementId: config.measurementId });
    } catch (error) {
      log.error('Failed to initialize Google Analytics 4', { error, config });
      throw new Error('Failed to initialize Google Analytics 4');
    }
  }

  /**
   * Load gtag script dynamically
   */
  private async loadGtagScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config?.measurementId}`;
      script.onload = () => {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function() {
          window.dataLayer.push(arguments);
        };
        window.gtag('js', new Date());
        resolve();
      };
      script.onerror = reject;

      document.head.appendChild(script);
    });
  }

  /**
   * Track a custom event
   */
  trackEvent(event: GA4Event): void {
    if (!this.isInitialized || !window.gtag) {
      log.warn('Google Analytics not initialized, skipping event', { event });
      return;
    }

    try {
      window.gtag('event', event.name, event.parameters || {});
      log.debug('GA4 event tracked', { event });
    } catch (error) {
      log.error('Failed to track GA4 event', { error, event });
    }
  }

  /**
   * Track page view
   */
  trackPageView(pagePath: string, pageTitle?: string): void {
    this.trackEvent({
      name: 'page_view',
      parameters: {
        page_path: pagePath,
        page_title: pageTitle || document.title
      }
    });
  }

  /**
   * Track user engagement
   */
  trackEngagement(action: string, category: string, label?: string, value?: number): void {
    this.trackEvent({
      name: 'engagement',
      parameters: {
        action,
        category,
        label,
        value
      }
    });
  }

  /**
   * Track e-commerce events
   */
  trackEcommerceEvent(eventType: string, parameters: Record<string, unknown>): void {
    this.trackEvent({
      name: eventType,
      parameters: {
        ...parameters,
        currency: 'BRL'
      }
    });
  }

  /**
   * Track product view
   */
  trackProductView(product: {
    id: string;
    name: string;
    category: string;
    price: number;
    brand?: string;
  }): void {
    this.trackEcommerceEvent('view_item', {
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        brand: product.brand,
        quantity: 1
      }]
    });
  }

  /**
   * Track add to cart
   */
  trackAddToCart(product: {
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
    brand?: string;
  }): void {
    this.trackEcommerceEvent('add_to_cart', {
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        brand: product.brand,
        quantity: product.quantity
      }]
    });
  }

  /**
   * Track purchase
   */
  trackPurchase(order: {
    id: string;
    total: number;
    tax?: number;
    shipping?: number;
    items: Array<{
      id: string;
      name: string;
      category: string;
      price: number;
      quantity: number;
      brand?: string;
    }>;
  }): void {
    this.trackEcommerceEvent('purchase', {
      transaction_id: order.id,
      value: order.total,
      tax: order.tax,
      shipping: order.shipping,
      items: order.items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price,
        brand: item.brand,
        quantity: item.quantity
      }))
    });
  }

  /**
   * Track search
   */
  trackSearch(searchTerm: string, resultsCount?: number): void {
    this.trackEvent({
      name: 'search',
      parameters: {
        search_term: searchTerm,
        results_count: resultsCount
      }
    });
  }

  /**
   * Track user login
   */
  trackLogin(method: string): void {
    this.trackEvent({
      name: 'login',
      parameters: {
        method
      }
    });
  }

  /**
   * Track user registration
   */
  trackSignUp(method: string): void {
    this.trackEvent({
      name: 'sign_up',
      parameters: {
        method
      }
    });
  }

  /**
   * Track flash sale interaction
   */
  trackFlashSaleInteraction(saleId: string, action: 'view' | 'click' | 'purchase'): void {
    this.trackEvent({
      name: 'flash_sale_interaction',
      parameters: {
        sale_id: saleId,
        action
      }
    });
  }

  /**
   * Track blog interaction
   */
  trackBlogInteraction(postId: string, action: 'view' | 'read' | 'share' | 'comment'): void {
    this.trackEvent({
      name: 'blog_interaction',
      parameters: {
        post_id: postId,
        action
      }
    });
  }

  /**
   * Track chat interaction
   */
  trackChatInteraction(action: 'start' | 'message' | 'whatsapp_handoff'): void {
    this.trackEvent({
      name: 'chat_interaction',
      parameters: {
        action
      }
    });
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: Record<string, unknown>): void {
    if (!this.isInitialized || !window.gtag || !this.config) {
      log.warn('Google Analytics not initialized, skipping user properties', { properties });
      return;
    }

    try {
      window.gtag('config', this.config.measurementId, {
        custom_map: properties
      });
      log.debug('GA4 user properties set', { properties });
    } catch (error) {
      log.error('Failed to set GA4 user properties', { error, properties });
    }
  }

  /**
   * Set user ID
   */
  setUserId(userId: string): void {
    if (!this.isInitialized || !window.gtag || !this.config) {
      log.warn('Google Analytics not initialized, skipping user ID', { userId });
      return;
    }

    try {
      window.gtag('config', this.config.measurementId, {
        user_id: userId
      });
      log.debug('GA4 user ID set', { userId });
    } catch (error) {
      log.error('Failed to set GA4 user ID', { error, userId });
    }
  }

  /**
   * Check if GA4 is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get measurement ID
   */
  getMeasurementId(): string | null {
    return this.config?.measurementId || null;
  }
}

// Extend window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}