import { log } from 'shared/utils/logger';
import { GoogleAnalyticsService } from './GoogleAnalyticsService';
import { MetaPixelService } from './MetaPixelService';
import { ConversionsAPIService } from './ConversionsAPIService';

export interface AnalyticsConfig {
  googleAnalytics?: {
    measurementId: string;
    debug?: boolean;
    sendPageView?: boolean;
  };
  metaPixel?: {
    pixelId: string;
    debug?: boolean;
    autoTrackPageView?: boolean;
  };
  conversionsAPI?: {
    accessToken: string;
    pixelId: string;
    apiVersion?: string;
    testEventCode?: string;
  };
}

export interface UserData {
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
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbc?: string; // Facebook click ID
  fbp?: string; // Facebook browser ID
}

export class AnalyticsManager {
  private static instance: AnalyticsManager;
  private config: AnalyticsConfig | null = null;
  private isInitialized = false;

  private gaService = GoogleAnalyticsService.getInstance();
  private metaService = MetaPixelService.getInstance();
  private capiService = new ConversionsAPIService();

  private constructor() {}

  static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }

  /**
   * Initialize all analytics services
   */
  async initialize(config: AnalyticsConfig): Promise<void> {
    try {
      log.info('Initializing Analytics Manager');

      // Initialize GA4
      if (config.googleAnalytics) {
        try {
          await this.gaService.initialize(config.googleAnalytics);
          log.info('GA4 service initialized successfully');
        } catch (error) {
          log.error('Failed to initialize GA4 service', { error });
          // Continue with other services
        }
      }

      // Initialize Meta Pixel
      if (config.metaPixel) {
        try {
          await this.metaService.initialize(config.metaPixel);
          log.info('Meta Pixel service initialized successfully');
        } catch (error) {
          log.error('Failed to initialize Meta Pixel service', { error });
          // Continue with other services
        }
      }

      // Configure Conversions API
      if (config.conversionsAPI) {
        try {
          this.capiService.configure(config.conversionsAPI);
          log.info('Conversions API service configured successfully');
        } catch (error) {
          log.error('Failed to configure Conversions API service', { error });
          // Continue with other services
        }
      }

      this.isInitialized = true;
      log.info('Analytics Manager initialized successfully');
    } catch (error) {
      log.error('Failed to initialize Analytics Manager', { error });
      throw new Error('Failed to initialize analytics services');
    }
  }

  /**
   * Track page view across all services
   */
  async trackPageView(pagePath?: string, pageTitle?: string): Promise<void> {
    if (!this.isInitialized) {
      log.warn('Analytics not initialized, skipping page view');
      return;
    }

    try {
      // GA4
      if (this.gaService.isReady()) {
        this.gaService.trackPageView(pagePath || window.location.pathname, pageTitle);
      }

      // Meta Pixel
      if (this.metaService.isReady()) {
        this.metaService.trackPageView();
      }

      // Conversions API (server-side)
      if (this.capiService.isConfigured()) {
        const userData = this.getUserDataForCAPI();
        await this.capiService.trackPageView(userData, window.location.href);
      }

      log.debug('Page view tracked', { pagePath, pageTitle });
    } catch (error) {
      log.error('Failed to track page view', { error });
    }
  }

  /**
   * Track product view
   */
  async trackProductView(product: {
    id: string;
    name: string;
    category: string;
    price: number;
    brand?: string;
    currency?: string;
  }): Promise<void> {
    if (!this.isInitialized) return;

    try {
      // GA4
      if (this.gaService.isReady()) {
        this.gaService.trackProductView(product);
      }

      // Meta Pixel
      if (this.metaService.isReady()) {
        this.metaService.trackProductView(product);
      }

      // Conversions API
      if (this.capiService.isConfigured()) {
        const userData = this.getUserDataForCAPI();
        await this.capiService.trackProductView(product, userData, window.location.href);
      }

      log.debug('Product view tracked', { productId: product.id });
    } catch (error) {
      log.error('Failed to track product view', { error, product });
    }
  }

  /**
   * Track add to cart
   */
  async trackAddToCart(product: {
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
    brand?: string;
    currency?: string;
  }): Promise<void> {
    if (!this.isInitialized) return;

    try {
      // GA4
      if (this.gaService.isReady()) {
        this.gaService.trackAddToCart(product);
      }

      // Meta Pixel
      if (this.metaService.isReady()) {
        this.metaService.trackAddToCart(product);
      }

      // Conversions API
      if (this.capiService.isConfigured()) {
        const userData = this.getUserDataForCAPI();
        await this.capiService.trackAddToCart(product, userData, window.location.href);
      }

      log.debug('Add to cart tracked', { productId: product.id, quantity: product.quantity });
    } catch (error) {
      log.error('Failed to track add to cart', { error, product });
    }
  }

  /**
   * Track purchase
   */
  async trackPurchase(order: {
    id: string;
    total: number;
    tax?: number;
    shipping?: number;
    currency?: string;
    items: Array<{
      id: string;
      name: string;
      category: string;
      price: number;
      quantity: number;
      brand?: string;
    }>;
  }): Promise<void> {
    if (!this.isInitialized) return;

    try {
      // GA4
      if (this.gaService.isReady()) {
        this.gaService.trackPurchase(order);
      }

      // Meta Pixel
      if (this.metaService.isReady()) {
        this.metaService.trackPurchase(order);
      }

      // Conversions API
      if (this.capiService.isConfigured()) {
        const userData = this.getUserDataForCAPI();
        await this.capiService.trackPurchase(order, userData, window.location.href);
      }

      log.debug('Purchase tracked', { orderId: order.id, total: order.total });
    } catch (error) {
      log.error('Failed to track purchase', { error, order });
    }
  }

  /**
   * Track search
   */
  async trackSearch(searchTerm: string, resultsCount?: number): Promise<void> {
    if (!this.isInitialized) return;

    try {
      // GA4
      if (this.gaService.isReady()) {
        this.gaService.trackSearch(searchTerm, resultsCount);
      }

      // Meta Pixel
      if (this.metaService.isReady()) {
        this.metaService.trackSearch(searchTerm, resultsCount);
      }

      // Conversions API
      if (this.capiService.isConfigured()) {
        const userData = this.getUserDataForCAPI();
        await this.capiService.trackSearch(searchTerm, resultsCount || 0, userData, window.location.href);
      }

      log.debug('Search tracked', { searchTerm, resultsCount });
    } catch (error) {
      log.error('Failed to track search', { error, searchTerm });
    }
  }

  /**
   * Track user login
   */
  async trackLogin(method: string): Promise<void> {
    if (!this.isInitialized) return;

    try {
      // GA4
      if (this.gaService.isReady()) {
        this.gaService.trackEvent({ name: 'login', parameters: { method } });
      }

      log.debug('Login tracked', { method });
    } catch (error) {
      log.error('Failed to track login', { error, method });
    }
  }

  /**
   * Track user registration
   */
  async trackSignUp(method: string): Promise<void> {
    if (!this.isInitialized) return;

    try {
      // GA4
      if (this.gaService.isReady()) {
        this.gaService.trackEvent({ name: 'sign_up', parameters: { method } });
      }

      // Meta Pixel
      if (this.metaService.isReady()) {
        this.metaService.trackSignUp(method);
      }

      // Conversions API
      if (this.capiService.isConfigured()) {
        const userData = this.getUserDataForCAPI();
        await this.capiService.trackSignUp(method, userData, window.location.href);
      }

      log.debug('Sign up tracked', { method });
    } catch (error) {
      log.error('Failed to track sign up', { error, method });
    }
  }

  /**
   * Track flash sale interaction
   */
  async trackFlashSaleInteraction(saleId: string, action: 'view' | 'click' | 'purchase'): Promise<void> {
    if (!this.isInitialized) return;

    try {
      // GA4
      if (this.gaService.isReady()) {
        this.gaService.trackFlashSaleInteraction(saleId, action);
      }

      // Meta Pixel
      if (this.metaService.isReady()) {
        this.metaService.trackFlashSaleInteraction(saleId, action);
      }

      // Conversions API
      if (this.capiService.isConfigured()) {
        const userData = this.getUserDataForCAPI();
        await this.capiService.trackFlashSaleInteraction(saleId, action, userData, window.location.href);
      }

      log.debug('Flash sale interaction tracked', { saleId, action });
    } catch (error) {
      log.error('Failed to track flash sale interaction', { error, saleId, action });
    }
  }

  /**
   * Track blog interaction
   */
  async trackBlogInteraction(postId: string, action: 'view' | 'read' | 'share' | 'comment'): Promise<void> {
    if (!this.isInitialized) return;

    try {
      // GA4
      if (this.gaService.isReady()) {
        this.gaService.trackBlogInteraction(postId, action);
      }

      // Meta Pixel
      if (this.metaService.isReady()) {
        this.metaService.trackBlogInteraction(postId, action);
      }

      // Conversions API
      if (this.capiService.isConfigured()) {
        const userData = this.getUserDataForCAPI();
        await this.capiService.trackBlogInteraction(postId, action, userData, window.location.href);
      }

      log.debug('Blog interaction tracked', { postId, action });
    } catch (error) {
      log.error('Failed to track blog interaction', { error, postId, action });
    }
  }

  /**
   * Track chat interaction
   */
  async trackChatInteraction(action: 'start' | 'message' | 'whatsapp_handoff'): Promise<void> {
    if (!this.isInitialized) return;

    try {
      // GA4
      if (this.gaService.isReady()) {
        this.gaService.trackChatInteraction(action);
      }

      // Meta Pixel
      if (this.metaService.isReady()) {
        this.metaService.trackChatInteraction(action);
      }

      // Conversions API
      if (this.capiService.isConfigured()) {
        const userData = this.getUserDataForCAPI();
        await this.capiService.trackChatInteraction(action, userData, window.location.href);
      }

      log.debug('Chat interaction tracked', { action });
    } catch (error) {
      log.error('Failed to track chat interaction', { error, action });
    }
  }

  /**
   * Set user data for targeting
   */
  setUserData(userData: UserData): void {
    if (!this.isInitialized) return;

    try {
      // GA4 user ID
      if (userData.email && this.gaService.isReady()) {
        // In a real implementation, you'd have a user ID
        // this.gaService.setUserId(userId);
      }

      // Meta Pixel user data
      if (this.metaService.isReady()) {
        this.metaService.setUserData(userData);
      }

      log.debug('User data set for analytics');
    } catch (error) {
      log.error('Failed to set user data', { error });
    }
  }

  /**
   * Get user data formatted for Conversions API
   */
  private getUserDataForCAPI(): import('./ConversionsAPIService').ConversionsAPIEvent['user_data'] {
    // In a real implementation, you'd get this from user context/store
    // For now, return basic browser data
    return {
      client_ip_address: '', // Should be set server-side
      client_user_agent: navigator.userAgent,
      fbc: this.getFacebookClickId(),
      fbp: this.getFacebookBrowserId()
    };
  }

  /**
   * Get Facebook Click ID from cookies
   */
  private getFacebookClickId(): string | undefined {
    // Try to get _fbc cookie
    const fbc = document.cookie.split('; ').find(row => row.startsWith('_fbc='));
    return fbc?.split('=')[1];
  }

  /**
   * Get Facebook Browser ID from cookies
   */
  private getFacebookBrowserId(): string | undefined {
    // Try to get _fbp cookie
    const fbp = document.cookie.split('; ').find(row => row.startsWith('_fbp='));
    return fbp?.split('=')[1];
  }

  /**
   * Track custom event
   */
  trackCustomEvent(eventName: string, parameters?: Record<string, unknown>): void {
    if (!this.isInitialized) return;

    try {
      // GA4
      if (this.gaService.isReady()) {
        this.gaService.trackEvent({ name: eventName, parameters });
      }

      // Meta Pixel
      if (this.metaService.isReady()) {
        this.metaService.trackEvent({
          eventName: eventName,
          parameters: parameters
        });
      }

      log.debug('Custom event tracked', { eventName, parameters });
    } catch (error) {
      log.error('Failed to track custom event', { error, eventName });
    }
  }

  /**
   * Check if analytics is ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get service status
   */
  getServiceStatus(): {
    initialized: boolean;
    ga4: boolean;
    metaPixel: boolean;
    conversionsAPI: boolean;
  } {
    return {
      initialized: this.isInitialized,
      ga4: this.gaService.isReady(),
      metaPixel: this.metaService.isReady(),
      conversionsAPI: this.capiService.isConfigured()
    };
  }
}