import { useCallback } from 'react';
import { AnalyticsManager } from '../analytics/external/AnalyticsManager';

export const useAnalytics = () => {
  const analyticsManager = AnalyticsManager.getInstance();

  const trackPageView = useCallback((pagePath?: string, pageTitle?: string) => {
    if (analyticsManager.isReady()) {
      analyticsManager.trackPageView(pagePath, pageTitle);
    }
  }, [analyticsManager]);

  const trackProductView = useCallback((product: {
    id: string;
    name: string;
    category: string;
    price: number;
    brand?: string;
    currency?: string;
  }) => {
    if (analyticsManager.isReady()) {
      analyticsManager.trackProductView(product);
    }
  }, [analyticsManager]);

  const trackAddToCart = useCallback((product: {
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
    brand?: string;
    currency?: string;
  }) => {
    if (analyticsManager.isReady()) {
      analyticsManager.trackAddToCart(product);
    }
  }, [analyticsManager]);

  const trackPurchase = useCallback((order: {
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
    if (analyticsManager.isReady()) {
      analyticsManager.trackPurchase(order);
    }
  }, [analyticsManager]);

  const trackSearch = useCallback((searchTerm: string, resultsCount?: number) => {
    if (analyticsManager.isReady()) {
      analyticsManager.trackSearch(searchTerm, resultsCount);
    }
  }, [analyticsManager]);

  const trackLogin = useCallback((method: string) => {
    if (analyticsManager.isReady()) {
      analyticsManager.trackLogin(method);
    }
  }, [analyticsManager]);

  const trackSignUp = useCallback((method: string) => {
    if (analyticsManager.isReady()) {
      analyticsManager.trackSignUp(method);
    }
  }, [analyticsManager]);

  const trackFlashSaleInteraction = useCallback((saleId: string, action: 'view' | 'click' | 'purchase') => {
    if (analyticsManager.isReady()) {
      analyticsManager.trackFlashSaleInteraction(saleId, action);
    }
  }, [analyticsManager]);

  const trackBlogInteraction = useCallback((postId: string, action: 'view' | 'read' | 'share' | 'comment') => {
    if (analyticsManager.isReady()) {
      analyticsManager.trackBlogInteraction(postId, action);
    }
  }, [analyticsManager]);

  const trackChatInteraction = useCallback((action: 'start' | 'message' | 'whatsapp_handoff') => {
    if (analyticsManager.isReady()) {
      analyticsManager.trackChatInteraction(action);
    }
  }, [analyticsManager]);

  const trackCustomEvent = useCallback((eventName: string, parameters?: Record<string, unknown>) => {
    if (analyticsManager.isReady()) {
      analyticsManager.trackCustomEvent(eventName, parameters);
    }
  }, [analyticsManager]);

  const setUserData = useCallback((userData: {
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
    fbc?: string;
    fbp?: string;
  }) => {
    if (analyticsManager.isReady()) {
      analyticsManager.setUserData(userData);
    }
  }, [analyticsManager]);

  const getServiceStatus = useCallback(() => {
    return analyticsManager.getServiceStatus();
  }, [analyticsManager]);

  return {
    trackPageView,
    trackProductView,
    trackAddToCart,
    trackPurchase,
    trackSearch,
    trackLogin,
    trackSignUp,
    trackFlashSaleInteraction,
    trackBlogInteraction,
    trackChatInteraction,
    trackCustomEvent,
    setUserData,
    getServiceStatus,
    isReady: analyticsManager.isReady()
  };
};