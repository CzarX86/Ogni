import { log } from '@/shared/utils/logger';

export interface MetaPixelEvent {
  eventName: string;
  parameters?: Record<string, any>;
  eventId?: string;
}

export interface MetaPixelConfig {
  pixelId: string;
  debug?: boolean;
  autoTrackPageView?: boolean;
}

export class MetaPixelService {
  private static instance: MetaPixelService;
  private config: MetaPixelConfig | null = null;
  private isInitialized = false;
  private queuedEvents: MetaPixelEvent[] = [];

  private constructor() {}

  static getInstance(): MetaPixelService {
    if (!MetaPixelService.instance) {
      MetaPixelService.instance = new MetaPixelService();
    }
    return MetaPixelService.instance;
  }

  /**
   * Initialize Meta Pixel
   */
  async initialize(config: MetaPixelConfig): Promise<void> {
    try {
      this.config = config;

      // Load Facebook Pixel script if not already loaded
      if (!window.fbq) {
        await this.loadFacebookPixelScript();
      }

      // Initialize pixel
      if (window.fbq) {
        window.fbq('init', config.pixelId);

        if (config.autoTrackPageView !== false) {
          window.fbq('track', 'PageView');
        }
      }

      this.isInitialized = true;

      // Process queued events
      this.processQueuedEvents();

      log.info('Meta Pixel initialized', { pixelId: config.pixelId });
    } catch (error) {
      log.error('Failed to initialize Meta Pixel', { error, config });
      throw new Error('Failed to initialize Meta Pixel');
    }
  }

  /**
   * Load Facebook Pixel script dynamically
   */
  private async loadFacebookPixelScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (document.querySelector('script[src*="connect.facebook.net"]')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      script.onload = () => {
        // Facebook Pixel will initialize fbq
        resolve();
      };
      script.onerror = reject;

      document.head.appendChild(script);
    });
  }

  /**
   * Track a custom event
   */
  trackEvent(event: MetaPixelEvent): void {
    if (!this.isInitialized) {
      // Queue event for later
      this.queuedEvents.push(event);
      log.debug('Meta Pixel event queued', { event });
      return;
    }

    if (!window.fbq) {
      log.warn('Meta Pixel not available, skipping event', { event });
      return;
    }

    try {
      const { eventName, parameters, eventId } = event;

      if (parameters && eventId) {
        window.fbq('track', eventName, parameters, { eventID: eventId });
      } else if (parameters) {
        window.fbq('track', eventName, parameters);
      } else {
        window.fbq('track', eventName);
      }

      log.debug('Meta Pixel event tracked', { event });
    } catch (error) {
      log.error('Failed to track Meta Pixel event', { error, event });
    }
  }

  /**
   * Process queued events
   */
  private processQueuedEvents(): void {
    while (this.queuedEvents.length > 0) {
      const event = this.queuedEvents.shift();
      if (event) {
        this.trackEvent(event);
      }
    }
  }

  /**
   * Track page view
   */
  trackPageView(): void {
    this.trackEvent({ eventName: 'PageView' });
  }

  /**
   * Track product view
   */
  trackProductView(product: {
    id: string;
    name: string;
    category: string;
    price: number;
    currency?: string;
  }): void {
    this.trackEvent({
      eventName: 'ViewContent',
      parameters: {
        content_type: 'product',
        content_ids: [product.id],
        content_name: product.name,
        content_category: product.category,
        value: product.price,
        currency: product.currency || 'BRL'
      }
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
    currency?: string;
  }): void {
    this.trackEvent({
      eventName: 'AddToCart',
      parameters: {
        content_type: 'product',
        content_ids: [product.id],
        content_name: product.name,
        content_category: product.category,
        value: product.price * product.quantity,
        currency: product.currency || 'BRL',
        num_items: product.quantity
      }
    });
  }

  /**
   * Track purchase
   */
  trackPurchase(order: {
    id: string;
    total: number;
    currency?: string;
    items: Array<{
      id: string;
      name: string;
      category: string;
      price: number;
      quantity: number;
    }>;
  }): void {
    const contentIds = order.items.map(item => item.id);

    this.trackEvent({
      eventName: 'Purchase',
      parameters: {
        content_type: 'product',
        content_ids: contentIds,
        value: order.total,
        currency: order.currency || 'BRL',
        num_items: order.items.reduce((sum, item) => sum + item.quantity, 0)
      }
    });
  }

  /**
   * Track search
   */
  trackSearch(searchTerm: string, resultsCount?: number): void {
    this.trackEvent({
      eventName: 'Search',
      parameters: {
        search_string: searchTerm,
        content_category: resultsCount ? 'has_results' : 'no_results'
      }
    });
  }

  /**
   * Track user registration
   */
  trackSignUp(method?: string): void {
    this.trackEvent({
      eventName: 'CompleteRegistration',
      parameters: {
        content_name: 'user_registration',
        status: 'completed',
        method: method
      }
    });
  }

  /**
   * Track lead generation
   */
  trackLead(formType: string, value?: number): void {
    this.trackEvent({
      eventName: 'Lead',
      parameters: {
        content_name: formType,
        value: value,
        currency: 'BRL'
      }
    });
  }

  /**
   * Track custom conversion event
   */
  trackConversion(conversionType: string, parameters?: Record<string, any>): void {
    this.trackEvent({
      eventName: 'CustomConversion',
      parameters: {
        conversion_type: conversionType,
        ...parameters
      }
    });
  }

  /**
   * Track flash sale interaction
   */
  trackFlashSaleInteraction(saleId: string, action: 'view' | 'click' | 'purchase'): void {
    this.trackEvent({
      eventName: 'CustomEvent',
      parameters: {
        event_category: 'flash_sale',
        event_action: action,
        sale_id: saleId
      }
    });
  }

  /**
   * Track blog interaction
   */
  trackBlogInteraction(postId: string, action: 'view' | 'read' | 'share' | 'comment'): void {
    this.trackEvent({
      eventName: 'CustomEvent',
      parameters: {
        event_category: 'blog',
        event_action: action,
        post_id: postId
      }
    });
  }

  /**
   * Track chat interaction
   */
  trackChatInteraction(action: 'start' | 'message' | 'whatsapp_handoff'): void {
    this.trackEvent({
      eventName: 'CustomEvent',
      parameters: {
        event_category: 'chat',
        event_action: action
      }
    });
  }

  /**
   * Set user data for better targeting
   */
  setUserData(userData: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: 'm' | 'f';
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  }): void {
    if (!this.isInitialized || !window.fbq) {
      log.warn('Meta Pixel not initialized, skipping user data', { userData });
      return;
    }

    try {
      // Hash sensitive data (Meta requires SHA256 hashing)
      const hashedData: Record<string, string> = {};

      if (userData.email) {
        hashedData.em = this.hashData(userData.email);
      }
      if (userData.phone) {
        hashedData.ph = this.hashData(userData.phone);
      }
      if (userData.firstName) {
        hashedData.fn = this.hashData(userData.firstName);
      }
      if (userData.lastName) {
        hashedData.ln = this.hashData(userData.lastName);
      }
      if (userData.dateOfBirth) {
        hashedData.db = this.hashData(userData.dateOfBirth);
      }
      if (userData.gender) {
        hashedData.ge = this.hashData(userData.gender);
      }
      if (userData.city) {
        hashedData.ct = this.hashData(userData.city);
      }
      if (userData.state) {
        hashedData.st = this.hashData(userData.state);
      }
      if (userData.zip) {
        hashedData.zp = this.hashData(userData.zip);
      }
      if (userData.country) {
        hashedData.country = this.hashData(userData.country);
      }

      // Note: In production, you should hash these values server-side
      // This is a simplified client-side implementation for demo purposes
      log.warn('Client-side hashing used - implement server-side hashing for production');

      log.debug('Meta Pixel user data set', { hashedData });
    } catch (error) {
      log.error('Failed to set Meta Pixel user data', { error, userData });
    }
  }

  /**
   * Simple hash function (NOT secure - use proper SHA256 server-side)
   */
  private hashData(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  /**
   * Check if Meta Pixel is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get pixel ID
   */
  getPixelId(): string | null {
    return this.config?.pixelId || null;
  }
}

// Extend window interface for fbq
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any[];
  }
}