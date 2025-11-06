import { FeedAnalyticsService, FeedViewEvent, FeedInteractionEvent, FeedPerformanceEvent, FeedAlgorithmEvent } from '../../src/analytics/feedEvents';
import { AnalyticsService } from '../../../shared/services/analytics';

// Mock the AnalyticsService
jest.mock('../../../shared/services/analytics', () => ({
  AnalyticsService: {
    trackCustomEvent: jest.fn(),
    trackPageView: jest.fn(),
    trackInteraction: jest.fn(),
    trackEcommerceEvent: jest.fn(),
  },
}));

describe('FeedAnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('trackFeedView', () => {
    it('should track feed view with correct metadata', () => {
      const mockEvent: FeedViewEvent = {
        userId: 'user123',
        sessionId: 'session456',
        feedItems: [
          {
            product: {
              id: 'prod1',
              name: 'Product 1',
              price: 100,
              categoryId: 'cat1',
            } as any,
            socialStats: {
              likes: 10,
              comments: 5,
              shares: 2,
              isLiked: false,
              isSaved: false,
            },
            algorithmScore: 0.8,
          },
          {
            product: {
              id: 'prod2',
              name: 'Product 2',
              price: 200,
              categoryId: 'cat2',
            } as any,
            socialStats: {
              likes: 20,
              comments: 8,
              shares: 3,
              isLiked: true,
              isSaved: false,
            },
            algorithmScore: 0.6,
          },
        ],
        algorithm: 'personalized',
        viewDuration: 30000,
        scrollDepth: 75,
        timestamp: new Date('2024-01-01T10:00:00Z'),
      };

      FeedAnalyticsService.trackFeedView(mockEvent);

      expect(AnalyticsService.trackCustomEvent).toHaveBeenCalledWith('feed_view', {
        userId: 'user123',
        sessionId: 'session456',
        feedItemCount: 2,
        algorithm: 'personalized',
        viewDuration: 30000,
        scrollDepth: 75,
        timestamp: '2024-01-01T10:00:00.000Z',
        productIds: ['prod1', 'prod2'],
        categories: ['cat1', 'cat2'],
        priceRange: {
          min: 100,
          max: 200,
          avg: 150,
        },
      });

      expect(AnalyticsService.trackPageView).toHaveBeenCalledWith('/feed');
    });

    it('should handle empty feed items', () => {
      const mockEvent: FeedViewEvent = {
        sessionId: 'session456',
        feedItems: [],
        algorithm: 'trending',
        viewDuration: 10000,
        scrollDepth: 0,
        timestamp: new Date(),
      };

      FeedAnalyticsService.trackFeedView(mockEvent);

      expect(AnalyticsService.trackCustomEvent).toHaveBeenCalledWith('feed_view', expect.objectContaining({
        feedItemCount: 0,
        productIds: [],
        categories: [],
        priceRange: {
          min: Infinity,
          max: -Infinity,
          avg: NaN,
        },
      }));
    });
  });

  describe('trackFeedInteraction', () => {
    it('should track product view interaction', () => {
      const mockEvent: FeedInteractionEvent = {
        userId: 'user123',
        sessionId: 'session456',
        productId: 'prod1',
        interactionType: 'view',
        feedPosition: 5,
        algorithmScore: 0.8,
        context: 'feed',
        timestamp: new Date('2024-01-01T10:00:00Z'),
      };

      FeedAnalyticsService.trackFeedInteraction(mockEvent);

      expect(AnalyticsService.trackCustomEvent).toHaveBeenCalledWith('feed_interaction', {
        userId: 'user123',
        sessionId: 'session456',
        productId: 'prod1',
        interactionType: 'view',
        feedPosition: 5,
        algorithmScore: 0.8,
        context: 'feed',
        timestamp: '2024-01-01T10:00:00.000Z',
      });
    });

    it('should track add to cart with ecommerce event', () => {
      const mockEvent: FeedInteractionEvent = {
        productId: 'prod1',
        interactionType: 'add_to_cart',
        feedPosition: 3,
        algorithmScore: 0.9,
        context: 'feed',
        sessionId: 'session456',
        timestamp: new Date(),
      };

      FeedAnalyticsService.trackFeedInteraction(mockEvent);

      expect(AnalyticsService.trackEcommerceEvent).toHaveBeenCalledWith('add_to_cart', {
        productId: 'prod1',
        value: 0.9,
        quantity: 1,
      });
    });

    it('should track purchase with ecommerce event', () => {
      const mockEvent: FeedInteractionEvent = {
        productId: 'prod1',
        interactionType: 'purchase',
        feedPosition: 1,
        algorithmScore: 0.95,
        context: 'feed',
        sessionId: 'session456',
        timestamp: new Date(),
        metadata: {
          timeToInteract: 5000,
        },
      };

      FeedAnalyticsService.trackFeedInteraction(mockEvent);

      expect(AnalyticsService.trackEcommerceEvent).toHaveBeenCalledWith('purchase', {
        productId: 'prod1',
        value: 0.95,
        quantity: 1,
      });
    });

    it('should track comment with metadata', () => {
      const mockEvent: FeedInteractionEvent = {
        userId: 'user123',
        sessionId: 'session456',
        productId: 'prod1',
        interactionType: 'comment',
        feedPosition: 2,
        algorithmScore: 0.7,
        context: 'feed',
        timestamp: new Date(),
        metadata: {
          commentLength: 150,
        },
      };

      FeedAnalyticsService.trackFeedInteraction(mockEvent);

      expect(AnalyticsService.trackCustomEvent).toHaveBeenCalledWith('feed_interaction', expect.objectContaining({
        interactionType: 'comment',
        commentLength: 150,
      }));
    });
  });

  describe('trackFeedPerformance', () => {
    it('should track performance metrics', () => {
      const mockEvent: FeedPerformanceEvent = {
        userId: 'user123',
        sessionId: 'session456',
        metric: 'load_time',
        value: 1500,
        timestamp: new Date('2024-01-01T10:00:00Z'),
      };

      FeedAnalyticsService.trackFeedPerformance(mockEvent);

      expect(AnalyticsService.trackCustomEvent).toHaveBeenCalledWith('feed_performance', {
        userId: 'user123',
        sessionId: 'session456',
        metric: 'load_time',
        value: 1500,
        timestamp: '2024-01-01T10:00:00.000Z',
      });
    });
  });

  describe('trackAlgorithmPerformance', () => {
    it('should track algorithm performance metrics', () => {
      const mockEvent: FeedAlgorithmEvent = {
        userId: 'user123',
        sessionId: 'session456',
        algorithm: 'collaborative_filtering',
        factors: {
          user_similarity: 0.8,
          item_similarity: 0.6,
          popularity: 0.4,
        },
        performance: {
          engagement: 0.75,
          conversion: 0.12,
          timeSpent: 45000,
        },
        timestamp: new Date('2024-01-01T10:00:00Z'),
      };

      FeedAnalyticsService.trackAlgorithmPerformance(mockEvent);

      expect(AnalyticsService.trackCustomEvent).toHaveBeenCalledWith('feed_algorithm', {
        userId: 'user123',
        sessionId: 'session456',
        algorithm: 'collaborative_filtering',
        factors: {
          user_similarity: 0.8,
          item_similarity: 0.6,
          popularity: 0.4,
        },
        performance: {
          engagement: 0.75,
          conversion: 0.12,
          timeSpent: 45000,
        },
        timestamp: '2024-01-01T10:00:00.000Z',
      });
    });
  });

  describe('Helper methods', () => {
    it('should track product view using helper method', () => {
      FeedAnalyticsService.trackProductView('user123', 'session456', 'prod1', 5, 0.8);

      expect(AnalyticsService.trackCustomEvent).toHaveBeenCalledWith('feed_interaction', expect.objectContaining({
        interactionType: 'view',
        productId: 'prod1',
        feedPosition: 5,
        algorithmScore: 0.8,
      }));
    });

    it('should track product like using helper method', () => {
      FeedAnalyticsService.trackProductLike('user123', 'session456', 'prod1', 3, 0.9, true);

      expect(AnalyticsService.trackCustomEvent).toHaveBeenCalledWith('feed_interaction', expect.objectContaining({
        interactionType: 'like',
        productId: 'prod1',
      }));
    });

    it('should track product unlike using helper method', () => {
      FeedAnalyticsService.trackProductLike('user123', 'session456', 'prod1', 3, 0.9, false);

      expect(AnalyticsService.trackCustomEvent).toHaveBeenCalledWith('feed_interaction', expect.objectContaining({
        interactionType: 'unlike',
        productId: 'prod1',
      }));
    });

    it('should track product save using helper method', () => {
      FeedAnalyticsService.trackProductSave('user123', 'session456', 'prod1', 2, 0.7, true);

      expect(AnalyticsService.trackCustomEvent).toHaveBeenCalledWith('feed_interaction', expect.objectContaining({
        interactionType: 'save',
        productId: 'prod1',
      }));
    });

    it('should track product comment using helper method', () => {
      FeedAnalyticsService.trackProductComment('user123', 'session456', 'prod1', 1, 0.95, 200);

      expect(AnalyticsService.trackCustomEvent).toHaveBeenCalledWith('feed_interaction', expect.objectContaining({
        interactionType: 'comment',
        productId: 'prod1',
        commentLength: 200,
      }));
    });

    it('should track product share using helper method', () => {
      FeedAnalyticsService.trackProductShare('user123', 'session456', 'prod1', 4, 0.8, 'whatsapp');

      expect(AnalyticsService.trackCustomEvent).toHaveBeenCalledWith('feed_interaction', expect.objectContaining({
        interactionType: 'share',
        productId: 'prod1',
        sharePlatform: 'whatsapp',
      }));
    });
  });

  describe('trackScrollDepth', () => {
    it('should track scroll depth with time spent', () => {
      FeedAnalyticsService.trackScrollDepth('user123', 'session456', 80, 30000);

      expect(AnalyticsService.trackCustomEvent).toHaveBeenCalledWith('feed_scroll', {
        userId: 'user123',
        sessionId: 'session456',
        scrollDepth: 80,
        timeSpent: 30000,
        timestamp: expect.any(String),
      });
    });
  });

  describe('trackFeedRefresh', () => {
    it('should track feed refresh actions', () => {
      FeedAnalyticsService.trackFeedRefresh('user123', 'session456', 'refresh', 'personalized');

      expect(AnalyticsService.trackCustomEvent).toHaveBeenCalledWith('feed_action', {
        userId: 'user123',
        sessionId: 'session456',
        action: 'refresh',
        algorithm: 'personalized',
        timestamp: expect.any(String),
      });
    });

    it('should track load more actions', () => {
      FeedAnalyticsService.trackFeedRefresh('user123', 'session456', 'load_more', 'trending');

      expect(AnalyticsService.trackCustomEvent).toHaveBeenCalledWith('feed_action', {
        userId: 'user123',
        sessionId: 'session456',
        action: 'load_more',
        algorithm: 'trending',
        timestamp: expect.any(String),
      });
    });
  });

  describe('Error handling', () => {
    it('should handle errors gracefully in trackFeedView', () => {
      const mockAnalyticsService = AnalyticsService.trackCustomEvent as jest.MockedFunction<typeof AnalyticsService.trackCustomEvent>;
      mockAnalyticsService.mockImplementation(() => {
        throw new Error('Analytics error');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const mockEvent: FeedViewEvent = {
        sessionId: 'session456',
        feedItems: [],
        algorithm: 'test',
        viewDuration: 1000,
        scrollDepth: 0,
        timestamp: new Date(),
      };

      expect(() => FeedAnalyticsService.trackFeedView(mockEvent)).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('Error tracking feed view:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should handle errors gracefully in trackFeedInteraction', () => {
      const mockAnalyticsService = AnalyticsService.trackCustomEvent as jest.MockedFunction<typeof AnalyticsService.trackCustomEvent>;
      mockAnalyticsService.mockImplementation(() => {
        throw new Error('Analytics error');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const mockEvent: FeedInteractionEvent = {
        sessionId: 'session456',
        productId: 'prod1',
        interactionType: 'view',
        feedPosition: 1,
        algorithmScore: 0.5,
        context: 'feed',
        timestamp: new Date(),
      };

      expect(() => FeedAnalyticsService.trackFeedInteraction(mockEvent)).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('Error tracking feed interaction:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });
});