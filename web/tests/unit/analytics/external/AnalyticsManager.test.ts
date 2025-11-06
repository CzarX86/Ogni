// Mock external dependencies
jest.mock('../../../../src/analytics/external/GoogleAnalyticsService');
jest.mock('../../../../src/analytics/external/MetaPixelService');
jest.mock('../../../../src/analytics/external/ConversionsAPIService');

import { AnalyticsManager } from '../../../../src/analytics/external/AnalyticsManager';

// Mock implementations
const mockGAInitialize = jest.fn().mockResolvedValue(undefined);
const mockGAIsReady = jest.fn().mockReturnValue(true);
const mockGATrackPageView = jest.fn();
const mockGATrackProductView = jest.fn();
const mockGATrackAddToCart = jest.fn();
const mockGATrackPurchase = jest.fn();
const mockGATrackSearch = jest.fn();
const mockGATrackEvent = jest.fn();
const mockGATrackBlogInteraction = jest.fn();
const mockGATrackChatInteraction = jest.fn();
const mockGATrackFlashSaleInteraction = jest.fn();

const mockMetaInitialize = jest.fn().mockResolvedValue(undefined);
const mockMetaIsReady = jest.fn().mockReturnValue(true);
const mockMetaTrackPageView = jest.fn();
const mockMetaTrackProductView = jest.fn();
const mockMetaTrackAddToCart = jest.fn();
const mockMetaTrackPurchase = jest.fn();
const mockMetaTrackSearch = jest.fn();
const mockMetaTrackSignUp = jest.fn();
const mockMetaTrackEvent = jest.fn();

const mockCAPIConfigure = jest.fn();
const mockCAPIIsConfigured = jest.fn().mockReturnValue(true);
const mockCAPITrackPageView = jest.fn().mockResolvedValue({ success: true });
const mockCAPITrackProductView = jest.fn().mockResolvedValue({ success: true });
const mockCAPITrackAddToCart = jest.fn().mockResolvedValue({ success: true });
const mockCAPITrackPurchase = jest.fn().mockResolvedValue({ success: true });
const mockCAPITrackSearch = jest.fn().mockResolvedValue({ success: true });
const mockCAPITrackSignUp = jest.fn().mockResolvedValue({ success: true });
const mockCAPITrackFlashSaleInteraction = jest.fn().mockResolvedValue({ success: true });
const mockCAPITrackBlogInteraction = jest.fn().mockResolvedValue({ success: true });
const mockMetaSetUserData = jest.fn();
const mockCAPITrackChatInteraction = jest.fn().mockResolvedValue({ success: true });

// Apply mocks
jest.mocked(require('../../../../src/analytics/external/GoogleAnalyticsService')).GoogleAnalyticsService.getInstance.mockReturnValue({
  initialize: mockGAInitialize,
  isReady: mockGAIsReady,
  trackPageView: mockGATrackPageView,
  trackProductView: mockGATrackProductView,
  trackAddToCart: mockGATrackAddToCart,
  trackPurchase: mockGATrackPurchase,
  trackSearch: mockGATrackSearch,
  trackEvent: mockGATrackEvent,
  trackBlogInteraction: mockGATrackBlogInteraction,
  trackChatInteraction: mockGATrackChatInteraction,
  trackFlashSaleInteraction: mockGATrackFlashSaleInteraction
} as any);

jest.mocked(require('../../../../src/analytics/external/MetaPixelService')).MetaPixelService.getInstance.mockReturnValue({
  initialize: mockMetaInitialize,
  isReady: mockMetaIsReady,
  trackPageView: mockMetaTrackPageView,
  trackProductView: mockMetaTrackProductView,
  trackAddToCart: mockMetaTrackAddToCart,
  trackPurchase: mockMetaTrackPurchase,
  trackSearch: mockMetaTrackSearch,
  trackSignUp: mockMetaTrackSignUp,
  trackEvent: mockMetaTrackEvent,
  setUserData: mockMetaSetUserData
} as any);

jest.mocked(require('../../../../src/analytics/external/ConversionsAPIService')).ConversionsAPIService.mockImplementation(() => ({
  configure: mockCAPIConfigure,
  isConfigured: mockCAPIIsConfigured,
  trackPageView: mockCAPITrackPageView,
  trackProductView: mockCAPITrackProductView,
  trackAddToCart: mockCAPITrackAddToCart,
  trackPurchase: mockCAPITrackPurchase,
  trackSearch: mockCAPITrackSearch,
  trackSignUp: mockCAPITrackSignUp,
  trackFlashSaleInteraction: mockCAPITrackFlashSaleInteraction,
  trackBlogInteraction: mockCAPITrackBlogInteraction,
  trackChatInteraction: mockCAPITrackChatInteraction
} as any));

describe('AnalyticsManager', () => {
  let analyticsManager: AnalyticsManager;

  beforeEach(() => {
    // Clear all instances and mocks
    jest.clearAllMocks();

    // Reset singleton instance
    (AnalyticsManager as any).instance = null;

    analyticsManager = AnalyticsManager.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = AnalyticsManager.getInstance();
      const instance2 = AnalyticsManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Initialization', () => {
    it('should initialize all services with valid config', async () => {
      const config = {
        googleAnalytics: { measurementId: 'GA123' },
        metaPixel: { pixelId: 'FB123' },
        conversionsAPI: { accessToken: 'token', pixelId: 'FB123' }
      };

      await analyticsManager.initialize(config);

      expect(mockGAInitialize).toHaveBeenCalledWith(config.googleAnalytics);
      expect(mockMetaInitialize).toHaveBeenCalledWith(config.metaPixel);
      expect(mockCAPIConfigure).toHaveBeenCalledWith(config.conversionsAPI);
      expect(analyticsManager.isReady()).toBe(true);
    });

    it('should handle partial config', async () => {
      const config = {
        googleAnalytics: { measurementId: 'GA123' }
      };

      await analyticsManager.initialize(config);

      expect(mockGAInitialize).toHaveBeenCalled();
      expect(mockMetaInitialize).not.toHaveBeenCalled();
      expect(mockCAPIConfigure).not.toHaveBeenCalled();
    });

    it('should handle initialization errors', async () => {
      mockGAInitialize.mockRejectedValue(new Error('GA failed'));

      const config = {
        googleAnalytics: { measurementId: 'GA123' },
        metaPixel: { pixelId: 'FB123' },
        conversionsAPI: { accessToken: 'token', pixelId: 'FB123' }
      };

      // Should not throw - continues with other services
      await expect(analyticsManager.initialize(config)).resolves.not.toThrow();
      expect(analyticsManager.isReady()).toBe(true);
    });
  });

  describe('Tracking Methods', () => {
    beforeEach(async () => {
      const config = {
        googleAnalytics: { measurementId: 'GA123' },
        metaPixel: { pixelId: 'FB123' },
        conversionsAPI: { accessToken: 'token', pixelId: 'FB123' }
      };
      await analyticsManager.initialize(config);
    });

    describe('trackPageView', () => {
      it('should track page view across all services', async () => {
        await analyticsManager.trackPageView('/test', 'Test Page');

        expect(mockGATrackPageView).toHaveBeenCalledWith('/test', 'Test Page');
        expect(mockMetaTrackPageView).toHaveBeenCalled();
        expect(mockCAPITrackPageView).toHaveBeenCalled();
      });

      it('should handle tracking errors gracefully', async () => {
        mockGATrackPageView.mockImplementation(() => {
          throw new Error('GA error');
        });

        await expect(analyticsManager.trackPageView()).resolves.not.toThrow();
      });
    });

    describe('trackProductView', () => {
      const product = {
        id: 'prod1',
        name: 'Test Product',
        category: 'Test Category',
        price: 99.99,
        brand: 'Test Brand',
        currency: 'BRL'
      };

      it('should track product view across all services', async () => {
        await analyticsManager.trackProductView(product);

        expect(mockGATrackProductView).toHaveBeenCalledWith(product);
        expect(mockMetaTrackProductView).toHaveBeenCalledWith(product);
        expect(mockCAPITrackProductView).toHaveBeenCalled();
      });
    });

    describe('trackAddToCart', () => {
      const product = {
        id: 'prod1',
        name: 'Test Product',
        category: 'Test Category',
        price: 99.99,
        quantity: 2,
        brand: 'Test Brand',
        currency: 'BRL'
      };

      it('should track add to cart across all services', async () => {
        await analyticsManager.trackAddToCart(product);

        expect(mockGATrackAddToCart).toHaveBeenCalledWith(product);
        expect(mockMetaTrackAddToCart).toHaveBeenCalledWith(product);
        expect(mockCAPITrackAddToCart).toHaveBeenCalled();
      });
    });

    describe('trackPurchase', () => {
      const order = {
        id: 'order1',
        total: 199.99,
        tax: 19.99,
        shipping: 9.99,
        currency: 'BRL',
        items: [{
          id: 'prod1',
          name: 'Test Product',
          category: 'Test Category',
          price: 99.99,
          quantity: 2,
          brand: 'Test Brand'
        }]
      };

      it('should track purchase across all services', async () => {
        await analyticsManager.trackPurchase(order);

        expect(mockGATrackPurchase).toHaveBeenCalledWith(order);
        expect(mockMetaTrackPurchase).toHaveBeenCalledWith(order);
        expect(mockCAPITrackPurchase).toHaveBeenCalled();
      });
    });

    describe('trackSearch', () => {
      it('should track search across all services', async () => {
        await analyticsManager.trackSearch('test query', 10);

        expect(mockGATrackSearch).toHaveBeenCalledWith('test query', 10);
        expect(mockMetaTrackSearch).toHaveBeenCalledWith('test query', 10);
        expect(mockCAPITrackSearch).toHaveBeenCalled();
      });
    });

    describe('trackLogin', () => {
      it('should track login via GA4', async () => {
        await analyticsManager.trackLogin('email');

        expect(mockGATrackEvent).toHaveBeenCalledWith({
          name: 'login',
          parameters: { method: 'email' }
        });
      });
    });

    describe('trackSignUp', () => {
      it('should track sign up across all services', async () => {
        await analyticsManager.trackSignUp('email');

        expect(mockGATrackEvent).toHaveBeenCalledWith({
          name: 'sign_up',
          parameters: { method: 'email' }
        });
        expect(mockMetaTrackSignUp).toHaveBeenCalledWith('email');
        expect(mockCAPITrackSignUp).toHaveBeenCalled();
      });
    });

    describe('trackFlashSaleInteraction', () => {
      it('should track flash sale interaction across all services', async () => {
        await analyticsManager.trackFlashSaleInteraction('sale1', 'click');

        expect(mockGATrackFlashSaleInteraction).toHaveBeenCalledWith('sale1', 'click');
        expect(mockMetaTrackEvent).toHaveBeenCalled();
        expect(mockCAPITrackFlashSaleInteraction).toHaveBeenCalled();
      });
    });

    describe('trackBlogInteraction', () => {
      it('should track blog interaction across all services', async () => {
        await analyticsManager.trackBlogInteraction('post1', 'read');

        expect(mockGATrackBlogInteraction).toHaveBeenCalledWith('post1', 'read');
        expect(mockMetaTrackEvent).toHaveBeenCalled();
        expect(mockCAPITrackBlogInteraction).toHaveBeenCalled();
      });
    });

    describe('trackChatInteraction', () => {
      it('should track chat interaction across all services', async () => {
        await analyticsManager.trackChatInteraction('start');

        expect(mockGATrackChatInteraction).toHaveBeenCalledWith('start');
        expect(mockMetaTrackEvent).toHaveBeenCalled();
        expect(mockCAPITrackChatInteraction).toHaveBeenCalled();
      });
    });

    describe('trackCustomEvent', () => {
      it('should track custom event via GA4 and Meta Pixel', () => {
        analyticsManager.trackCustomEvent('custom_event', { param1: 'value1' });

        expect(mockGATrackEvent).toHaveBeenCalledWith({
          name: 'custom_event',
          parameters: { param1: 'value1' }
        });
        expect(mockMetaTrackEvent).toHaveBeenCalledWith({
          eventName: 'custom_event',
          parameters: { param1: 'value1' }
        });
      });
    });
  });

  describe('User Data Management', () => {
    beforeEach(async () => {
      const config = {
        googleAnalytics: { measurementId: 'GA123' },
        metaPixel: { pixelId: 'FB123' }
      };
      await analyticsManager.initialize(config);
    });

    it('should set user data for Meta Pixel', () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe'
      };

      analyticsManager.setUserData(userData);

      expect(mockMetaSetUserData).toHaveBeenCalledWith(userData);
    });
  });

  describe('Service Status', () => {
    it('should return correct service status', async () => {
      const config = {
        googleAnalytics: { measurementId: 'GA123' },
        metaPixel: { pixelId: 'FB123' },
        conversionsAPI: { accessToken: 'token', pixelId: 'FB123' }
      };

      await analyticsManager.initialize(config);

      const status = analyticsManager.getServiceStatus();

      expect(status).toEqual({
        initialized: true,
        ga4: true,
        metaPixel: true,
        conversionsAPI: true
      });
    });
  });

  describe('Error Handling', () => {
    it('should not track when not initialized', async () => {
      await analyticsManager.trackPageView();

      expect(mockGATrackPageView).not.toHaveBeenCalled();
      expect(mockMetaTrackPageView).not.toHaveBeenCalled();
    });

    it('should handle service failures gracefully', async () => {
      const config = {
        googleAnalytics: { measurementId: 'GA123' }
      };
      await analyticsManager.initialize(config);

      mockGATrackPageView.mockImplementation(() => {
        throw new Error('Service error');
      });

      // Should not throw
      await expect(analyticsManager.trackPageView()).resolves.not.toThrow();
    });
  });
});