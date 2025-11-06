// Analytics Configuration
// This file contains configuration for external analytics services
// In production, these values should be loaded from environment variables

export const analyticsConfig = {
  // Google Analytics 4
  googleAnalytics: {
    measurementId: process.env.REACT_APP_GA_MEASUREMENT_ID || 'GA_MEASUREMENT_ID',
    debug: process.env.NODE_ENV === 'development',
    sendPageView: true
  },

  // Meta Pixel (Facebook Pixel)
  metaPixel: {
    pixelId: process.env.REACT_APP_META_PIXEL_ID || 'META_PIXEL_ID',
    debug: process.env.NODE_ENV === 'development',
    autoTrackPageView: true
  },

  // Meta Conversions API
  conversionsAPI: {
    accessToken: process.env.REACT_APP_META_CONVERSIONS_API_TOKEN || 'META_CONVERSIONS_API_TOKEN',
    pixelId: process.env.REACT_APP_META_PIXEL_ID || 'META_PIXEL_ID',
    apiVersion: 'v18.0',
    testEventCode: process.env.NODE_ENV === 'development' ? 'TEST12345' : undefined
  }
};

// Analytics initialization helper
export const initializeAnalytics = async () => {
  const { AnalyticsManager } = await import('./AnalyticsManager');

  const manager = AnalyticsManager.getInstance();

  try {
    await manager.initialize(analyticsConfig);
    console.log('Analytics initialized successfully');
    return manager;
  } catch (error) {
    console.error('Failed to initialize analytics:', error);
    // Don't throw - analytics failure shouldn't break the app
    return null;
  }
};

// Analytics tracking helpers
export const trackPageView = (pagePath?: string, pageTitle?: string) => {
  const { AnalyticsManager } = require('./AnalyticsManager');
  const manager = AnalyticsManager.getInstance();
  if (manager.isReady()) {
    manager.trackPageView(pagePath, pageTitle);
  }
};

export const trackProductView = (product: {
  id: string;
  name: string;
  category: string;
  price: number;
  brand?: string;
  currency?: string;
}) => {
  const { AnalyticsManager } = require('./AnalyticsManager');
  const manager = AnalyticsManager.getInstance();
  if (manager.isReady()) {
    manager.trackProductView(product);
  }
};

export const trackAddToCart = (product: {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  brand?: string;
  currency?: string;
}) => {
  const { AnalyticsManager } = require('./AnalyticsManager');
  const manager = AnalyticsManager.getInstance();
  if (manager.isReady()) {
    manager.trackAddToCart(product);
  }
};

export const trackPurchase = (order: {
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
}) => {
  const { AnalyticsManager } = require('./AnalyticsManager');
  const manager = AnalyticsManager.getInstance();
  if (manager.isReady()) {
    manager.trackPurchase(order);
  }
};

export const trackSearch = (searchTerm: string, resultsCount?: number) => {
  const { AnalyticsManager } = require('./AnalyticsManager');
  const manager = AnalyticsManager.getInstance();
  if (manager.isReady()) {
    manager.trackSearch(searchTerm, resultsCount);
  }
};

export const trackLogin = (method: string) => {
  const { AnalyticsManager } = require('./AnalyticsManager');
  const manager = AnalyticsManager.getInstance();
  if (manager.isReady()) {
    manager.trackLogin(method);
  }
};

export const trackSignUp = (method: string) => {
  const { AnalyticsManager } = require('./AnalyticsManager');
  const manager = AnalyticsManager.getInstance();
  if (manager.isReady()) {
    manager.trackSignUp(method);
  }
};

export const trackFlashSaleInteraction = (saleId: string, action: 'view' | 'click' | 'purchase') => {
  const { AnalyticsManager } = require('./AnalyticsManager');
  const manager = AnalyticsManager.getInstance();
  if (manager.isReady()) {
    manager.trackFlashSaleInteraction(saleId, action);
  }
};

export const trackBlogInteraction = (postId: string, action: 'view' | 'read' | 'share' | 'comment') => {
  const { AnalyticsManager } = require('./AnalyticsManager');
  const manager = AnalyticsManager.getInstance();
  if (manager.isReady()) {
    manager.trackBlogInteraction(postId, action);
  }
};

export const trackChatInteraction = (action: 'start' | 'message' | 'whatsapp_handoff') => {
  const { AnalyticsManager } = require('./AnalyticsManager');
  const manager = AnalyticsManager.getInstance();
  if (manager.isReady()) {
    manager.trackChatInteraction(action);
  }
};

export const trackCustomEvent = (eventName: string, parameters?: Record<string, any>) => {
  const { AnalyticsManager } = require('./AnalyticsManager');
  const manager = AnalyticsManager.getInstance();
  if (manager.isReady()) {
    manager.trackCustomEvent(eventName, parameters);
  }
};