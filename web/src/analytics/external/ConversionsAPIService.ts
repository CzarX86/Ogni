import { log } from '@/shared/utils/logger';

export interface ConversionsAPIEvent {
  event_name: string;
  event_time: number;
  user_data: {
    em?: string; // hashed email
    ph?: string; // hashed phone
    fn?: string; // hashed first name
    ln?: string; // hashed last name
    db?: string; // hashed date of birth
    ge?: string; // hashed gender
    ct?: string; // hashed city
    st?: string; // hashed state
    zp?: string; // hashed zip
    country?: string; // hashed country
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string; // Facebook click ID
    fbp?: string; // Facebook browser ID
  };
  custom_data?: {
    value?: number;
    currency?: string;
    content_name?: string;
    content_category?: string;
    content_ids?: string[];
    num_items?: number;
    search_string?: string;
    status?: string;
    [key: string]: any;
  };
  event_source_url?: string;
  action_source: 'website' | 'mobile_app' | 'phone_call' | 'chat' | 'physical_store' | 'system_generated' | 'other';
  event_id?: string;
}

export interface ConversionsAPIConfig {
  accessToken: string;
  pixelId: string;
  apiVersion?: string;
  testEventCode?: string; // For testing
}

export class ConversionsAPIService {
  private static readonly BASE_URL = 'https://graph.facebook.com';
  private config: ConversionsAPIConfig | null = null;

  constructor(config?: ConversionsAPIConfig) {
    if (config) {
      this.config = config;
    }
  }

  /**
   * Configure the service
   */
  configure(config: ConversionsAPIConfig): void {
    this.config = config;
  }

  /**
   * Send event to Conversions API
   */
  async sendEvent(event: ConversionsAPIEvent): Promise<{ success: boolean; event_id?: string; error?: string }> {
    if (!this.config) {
      const error = 'Conversions API not configured';
      log.error(error);
      return { success: false, error };
    }

    try {
      const apiVersion = this.config.apiVersion || 'v18.0';
      const url = `${ConversionsAPIService.BASE_URL}/${apiVersion}/${this.config.pixelId}/events`;

      const payload = {
        data: [event],
        access_token: this.config.accessToken,
        ...(this.config.testEventCode && { test_event_code: this.config.testEventCode })
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.events_received === 1) {
        log.info('Conversions API event sent successfully', {
          event_name: event.event_name,
          event_id: event.event_id
        });
        return { success: true, event_id: event.event_id };
      } else {
        const error = result.error?.message || 'Unknown error';
        log.error('Failed to send Conversions API event', { error, result });
        return { success: false, error };
      }
    } catch (error) {
      log.error('Error sending Conversions API event', { error, event });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Track page view
   */
  async trackPageView(userData: ConversionsAPIEvent['user_data'], eventSourceUrl?: string): Promise<{ success: boolean; event_id?: string; error?: string }> {
    const event: ConversionsAPIEvent = {
      event_name: 'PageView',
      event_time: Math.floor(Date.now() / 1000),
      user_data: userData,
      action_source: 'website',
      event_source_url: eventSourceUrl,
      event_id: this.generateEventId()
    };

    return this.sendEvent(event);
  }

  /**
   * Track product view
   */
  async trackProductView(
    product: {
      id: string;
      name: string;
      category: string;
      price: number;
      currency?: string;
    },
    userData: ConversionsAPIEvent['user_data'],
    eventSourceUrl?: string
  ): Promise<{ success: boolean; event_id?: string; error?: string }> {
    const event: ConversionsAPIEvent = {
      event_name: 'ViewContent',
      event_time: Math.floor(Date.now() / 1000),
      user_data: userData,
      custom_data: {
        content_ids: [product.id],
        content_name: product.name,
        content_category: product.category,
        value: product.price,
        currency: product.currency || 'BRL'
      },
      action_source: 'website',
      event_source_url: eventSourceUrl,
      event_id: this.generateEventId()
    };

    return this.sendEvent(event);
  }

  /**
   * Track add to cart
   */
  async trackAddToCart(
    product: {
      id: string;
      name: string;
      category: string;
      price: number;
      quantity: number;
      currency?: string;
    },
    userData: ConversionsAPIEvent['user_data'],
    eventSourceUrl?: string
  ): Promise<{ success: boolean; event_id?: string; error?: string }> {
    const event: ConversionsAPIEvent = {
      event_name: 'AddToCart',
      event_time: Math.floor(Date.now() / 1000),
      user_data: userData,
      custom_data: {
        content_ids: [product.id],
        content_name: product.name,
        content_category: product.category,
        value: product.price * product.quantity,
        currency: product.currency || 'BRL',
        num_items: product.quantity
      },
      action_source: 'website',
      event_source_url: eventSourceUrl,
      event_id: this.generateEventId()
    };

    return this.sendEvent(event);
  }

  /**
   * Track purchase
   */
  async trackPurchase(
    order: {
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
    },
    userData: ConversionsAPIEvent['user_data'],
    eventSourceUrl?: string
  ): Promise<{ success: boolean; event_id?: string; error?: string }> {
    const contentIds = order.items.map(item => item.id);
    const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

    const event: ConversionsAPIEvent = {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      user_data: userData,
      custom_data: {
        content_ids: contentIds,
        value: order.total,
        currency: order.currency || 'BRL',
        num_items: totalQuantity
      },
      action_source: 'website',
      event_source_url: eventSourceUrl,
      event_id: this.generateEventId()
    };

    return this.sendEvent(event);
  }

  /**
   * Track search
   */
  async trackSearch(
    searchTerm: string,
    resultsCount: number,
    userData: ConversionsAPIEvent['user_data'],
    eventSourceUrl?: string
  ): Promise<{ success: boolean; event_id?: string; error?: string }> {
    const event: ConversionsAPIEvent = {
      event_name: 'Search',
      event_time: Math.floor(Date.now() / 1000),
      user_data: userData,
      custom_data: {
        search_string: searchTerm,
        content_category: resultsCount > 0 ? 'has_results' : 'no_results'
      },
      action_source: 'website',
      event_source_url: eventSourceUrl,
      event_id: this.generateEventId()
    };

    return this.sendEvent(event);
  }

  /**
   * Track user registration
   */
  async trackSignUp(
    method: string,
    userData: ConversionsAPIEvent['user_data'],
    eventSourceUrl?: string
  ): Promise<{ success: boolean; event_id?: string; error?: string }> {
    const event: ConversionsAPIEvent = {
      event_name: 'CompleteRegistration',
      event_time: Math.floor(Date.now() / 1000),
      user_data: userData,
      custom_data: {
        content_name: 'user_registration',
        status: 'completed'
      },
      action_source: 'website',
      event_source_url: eventSourceUrl,
      event_id: this.generateEventId()
    };

    return this.sendEvent(event);
  }

  /**
   * Track lead generation
   */
  async trackLead(
    formType: string,
    value: number,
    userData: ConversionsAPIEvent['user_data'],
    eventSourceUrl?: string
  ): Promise<{ success: boolean; event_id?: string; error?: string }> {
    const event: ConversionsAPIEvent = {
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      user_data: userData,
      custom_data: {
        content_name: formType,
        value: value,
        currency: 'BRL'
      },
      action_source: 'website',
      event_source_url: eventSourceUrl,
      event_id: this.generateEventId()
    };

    return this.sendEvent(event);
  }

  /**
   * Track flash sale interaction
   */
  async trackFlashSaleInteraction(
    saleId: string,
    action: 'view' | 'click' | 'purchase',
    userData: ConversionsAPIEvent['user_data'],
    eventSourceUrl?: string
  ): Promise<{ success: boolean; event_id?: string; error?: string }> {
    const event: ConversionsAPIEvent = {
      event_name: 'CustomEvent',
      event_time: Math.floor(Date.now() / 1000),
      user_data: userData,
      custom_data: {
        event_category: 'flash_sale',
        event_action: action,
        sale_id: saleId
      },
      action_source: 'website',
      event_source_url: eventSourceUrl,
      event_id: this.generateEventId()
    };

    return this.sendEvent(event);
  }

  /**
   * Track blog interaction
   */
  async trackBlogInteraction(
    postId: string,
    action: 'view' | 'read' | 'share' | 'comment',
    userData: ConversionsAPIEvent['user_data'],
    eventSourceUrl?: string
  ): Promise<{ success: boolean; event_id?: string; error?: string }> {
    const event: ConversionsAPIEvent = {
      event_name: 'CustomEvent',
      event_time: Math.floor(Date.now() / 1000),
      user_data: userData,
      custom_data: {
        event_category: 'blog',
        event_action: action,
        post_id: postId
      },
      action_source: 'website',
      event_source_url: eventSourceUrl,
      event_id: this.generateEventId()
    };

    return this.sendEvent(event);
  }

  /**
   * Track chat interaction
   */
  async trackChatInteraction(
    action: 'start' | 'message' | 'whatsapp_handoff',
    userData: ConversionsAPIEvent['user_data'],
    eventSourceUrl?: string
  ): Promise<{ success: boolean; event_id?: string; error?: string }> {
    const event: ConversionsAPIEvent = {
      event_name: 'CustomEvent',
      event_time: Math.floor(Date.now() / 1000),
      user_data: userData,
      custom_data: {
        event_category: 'chat',
        event_action: action
      },
      action_source: 'website',
      event_source_url: eventSourceUrl,
      event_id: this.generateEventId()
    };

    return this.sendEvent(event);
  }

  /**
   * Hash user data for privacy compliance
   * Note: In production, this should be done server-side with proper SHA256
   */
  hashUserData(userData: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  }): ConversionsAPIEvent['user_data'] {
    const hashed: ConversionsAPIEvent['user_data'] = {};

    // Simple hash function (NOT secure - use proper SHA256 server-side)
    const simpleHash = (str: string): string => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return hash.toString();
    };

    if (userData.email) hashed.em = simpleHash(userData.email.toLowerCase().trim());
    if (userData.phone) hashed.ph = simpleHash(userData.phone.replace(/\D/g, ''));
    if (userData.firstName) hashed.fn = simpleHash(userData.firstName.toLowerCase().trim());
    if (userData.lastName) hashed.ln = simpleHash(userData.lastName.toLowerCase().trim());
    if (userData.dateOfBirth) hashed.db = simpleHash(userData.dateOfBirth);
    if (userData.gender) hashed.ge = simpleHash(userData.gender.toLowerCase());
    if (userData.city) hashed.ct = simpleHash(userData.city.toLowerCase().trim());
    if (userData.state) hashed.st = simpleHash(userData.state.toLowerCase().trim());
    if (userData.zip) hashed.zp = simpleHash(userData.zip.replace(/\s/g, ''));
    if (userData.country) hashed.country = simpleHash(userData.country.toLowerCase().trim());

    log.warn('Client-side hashing used - implement server-side SHA256 hashing for production');

    return hashed;
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if service is configured
   */
  isConfigured(): boolean {
    return this.config !== null;
  }

  /**
   * Get pixel ID
   */
  getPixelId(): string | null {
    return this.config?.pixelId || null;
  }
}