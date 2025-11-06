import { AnalyticsService } from '@/shared/services/analytics';
import { FeedInteraction, ProductLike, ProductComment, ProductShare, FeedItem } from '@/shared/types';

export interface FeedViewEvent {
  userId?: string;
  sessionId: string;
  feedItems: FeedItem[];
  algorithm: string;
  viewDuration: number;
  scrollDepth: number;
  timestamp: Date;
}

export interface FeedInteractionEvent {
  userId?: string;
  sessionId: string;
  productId: string;
  interactionType: 'view' | 'like' | 'unlike' | 'comment' | 'share' | 'save' | 'unsave' | 'click' | 'add_to_cart' | 'purchase';
  feedPosition: number;
  algorithmScore: number;
  context: 'feed' | 'product_page' | 'search';
  timestamp: Date;
  metadata?: {
    commentLength?: number;
    sharePlatform?: string;
    timeToInteract?: number;
  };
}

export interface FeedPerformanceEvent {
  userId?: string;
  sessionId: string;
  metric: 'load_time' | 'scroll_performance' | 'render_time';
  value: number;
  timestamp: Date;
}

export interface FeedAlgorithmEvent {
  userId?: string;
  sessionId: string;
  algorithm: string;
  factors: Record<string, number>;
  performance: {
    engagement: number;
    conversion: number;
    timeSpent: number;
  };
  timestamp: Date;
}

/**
 * Feed Analytics Service
 * Tracks user interactions and performance metrics for the product feed
 */
export class FeedAnalyticsService {
  private static readonly FEED_VIEW_EVENT = 'feed_view';
  private static readonly FEED_INTERACTION_EVENT = 'feed_interaction';
  private static readonly FEED_PERFORMANCE_EVENT = 'feed_performance';
  private static readonly FEED_ALGORITHM_EVENT = 'feed_algorithm';

  /**
   * Track feed view events
   */
  static trackFeedView(event: FeedViewEvent): void {
    try {
      AnalyticsService.trackCustomEvent(this.FEED_VIEW_EVENT, {
        userId: event.userId,
        sessionId: event.sessionId,
        feedItemCount: event.feedItems.length,
        algorithm: event.algorithm,
        viewDuration: event.viewDuration,
        scrollDepth: event.scrollDepth,
        timestamp: event.timestamp.toISOString(),
        // Additional metadata for analysis
        productIds: event.feedItems.map(item => item.product.id),
        categories: Array.from(new Set(event.feedItems.map(item => item.product.categoryId))),
        priceRange: {
          min: Math.min(...event.feedItems.map(item => item.product.price)),
          max: Math.max(...event.feedItems.map(item => item.product.price)),
          avg: event.feedItems.reduce((sum, item) => sum + item.product.price, 0) / event.feedItems.length
        }
      });

      // Also track as page view for GA4
      AnalyticsService.trackPageView('/feed');
    } catch (error) {
      console.error('Error tracking feed view:', error);
    }
  }

  /**
   * Track individual feed interactions
   */
  static trackFeedInteraction(event: FeedInteractionEvent): void {
    try {
      AnalyticsService.trackCustomEvent(this.FEED_INTERACTION_EVENT, {
        userId: event.userId,
        sessionId: event.sessionId,
        productId: event.productId,
        interactionType: event.interactionType,
        feedPosition: event.feedPosition,
        algorithmScore: event.algorithmScore,
        context: event.context,
        timestamp: event.timestamp.toISOString(),
        ...event.metadata
      });

      // Track conversion events
      if (event.interactionType === 'add_to_cart') {
        AnalyticsService.trackEcommerceEvent('add_to_cart', {
          productId: event.productId,
          value: event.algorithmScore, // Using algorithm score as proxy for value
          quantity: 1
        });
      }

      if (event.interactionType === 'purchase') {
        AnalyticsService.trackEcommerceEvent('purchase', {
          productId: event.productId,
          value: event.algorithmScore,
          quantity: 1
        });
      }
    } catch (error) {
      console.error('Error tracking feed interaction:', error);
    }
  }

  /**
   * Track feed performance metrics
   */
  static trackFeedPerformance(event: FeedPerformanceEvent): void {
    try {
      AnalyticsService.trackCustomEvent(this.FEED_PERFORMANCE_EVENT, {
        userId: event.userId,
        sessionId: event.sessionId,
        metric: event.metric,
        value: event.value,
        timestamp: event.timestamp.toISOString()
      });
    } catch (error) {
      console.error('Error tracking feed performance:', error);
    }
  }

  /**
   * Track algorithm performance
   */
  static trackAlgorithmPerformance(event: FeedAlgorithmEvent): void {
    try {
      AnalyticsService.trackCustomEvent(this.FEED_ALGORITHM_EVENT, {
        userId: event.userId,
        sessionId: event.sessionId,
        algorithm: event.algorithm,
        factors: event.factors,
        performance: event.performance,
        timestamp: event.timestamp.toISOString()
      });
    } catch (error) {
      console.error('Error tracking algorithm performance:', error);
    }
  }

  /**
   * Helper method to track product view in feed context
   */
  static trackProductView(
    userId: string | undefined,
    sessionId: string,
    productId: string,
    feedPosition: number,
    algorithmScore: number
  ): void {
    this.trackFeedInteraction({
      userId,
      sessionId,
      productId,
      interactionType: 'view',
      feedPosition,
      algorithmScore,
      context: 'feed',
      timestamp: new Date()
    });
  }

  /**
   * Helper method to track product like/unlike
   */
  static trackProductLike(
    userId: string | undefined,
    sessionId: string,
    productId: string,
    feedPosition: number,
    algorithmScore: number,
    isLiked: boolean
  ): void {
    this.trackFeedInteraction({
      userId,
      sessionId,
      productId,
      interactionType: isLiked ? 'like' : 'unlike',
      feedPosition,
      algorithmScore,
      context: 'feed',
      timestamp: new Date()
    });
  }

  /**
   * Helper method to track product save/unsave
   */
  static trackProductSave(
    userId: string | undefined,
    sessionId: string,
    productId: string,
    feedPosition: number,
    algorithmScore: number,
    isSaved: boolean
  ): void {
    this.trackFeedInteraction({
      userId,
      sessionId,
      productId,
      interactionType: isSaved ? 'save' : 'unsave',
      feedPosition,
      algorithmScore,
      context: 'feed',
      timestamp: new Date()
    });
  }

  /**
   * Helper method to track product comment
   */
  static trackProductComment(
    userId: string | undefined,
    sessionId: string,
    productId: string,
    feedPosition: number,
    algorithmScore: number,
    commentLength: number
  ): void {
    this.trackFeedInteraction({
      userId,
      sessionId,
      productId,
      interactionType: 'comment',
      feedPosition,
      algorithmScore,
      context: 'feed',
      timestamp: new Date(),
      metadata: {
        commentLength
      }
    });
  }

  /**
   * Helper method to track product share
   */
  static trackProductShare(
    userId: string | undefined,
    sessionId: string,
    productId: string,
    feedPosition: number,
    algorithmScore: number,
    platform: string
  ): void {
    this.trackFeedInteraction({
      userId,
      sessionId,
      productId,
      interactionType: 'share',
      feedPosition,
      algorithmScore,
      context: 'feed',
      timestamp: new Date(),
      metadata: {
        sharePlatform: platform
      }
    });
  }

  /**
   * Track feed scroll depth for engagement analysis
   */
  static trackScrollDepth(
    userId: string | undefined,
    sessionId: string,
    scrollDepth: number,
    timeSpent: number
  ): void {
    try {
      AnalyticsService.trackCustomEvent('feed_scroll', {
        userId,
        sessionId,
        scrollDepth,
        timeSpent,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking scroll depth:', error);
    }
  }

  /**
   * Track feed refresh/load more actions
   */
  static trackFeedRefresh(
    userId: string | undefined,
    sessionId: string,
    action: 'refresh' | 'load_more',
    algorithm: string
  ): void {
    try {
      AnalyticsService.trackCustomEvent('feed_action', {
        userId,
        sessionId,
        action,
        algorithm,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking feed action:', error);
    }
  }
}