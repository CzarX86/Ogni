import { HttpApiClient } from '@/shared/services/api';
import { FeedResponse, FeedItem, ApiResponse } from '@/shared/types';
import { log } from '../utils/logger';

export class FeedService {
  /**
   * Get personalized product feed
   * @param options Feed options including pagination and personalization
   * @returns Promise<FeedResponse>
   */
  static async getFeed(options: {
    limit?: number;
    offset?: number;
    userId?: string;
  } = {}): Promise<FeedResponse> {
    try {
      const params = new URLSearchParams();

      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());
      if (options.userId) params.append('userId', options.userId);

      const queryString = params.toString();
      const endpoint = `/feed${queryString ? `?${queryString}` : ''}`;

      const response: ApiResponse<FeedResponse> = await HttpApiClient.get<FeedResponse>(endpoint);

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch feed');
      }

      log.info('Retrieved feed', {
        itemsCount: response.data.items.length,
        hasMore: response.data.hasMore,
        nextOffset: response.data.nextOffset,
        algorithm: response.data.personalization.algorithm
      });

      return response.data;
    } catch (error) {
      log.error('Failed to get feed', { error, options });
      throw error;
    }
  }

  /**
   * Get feed items with infinite scroll support
   * @param limit Number of items to fetch
   * @param offset Offset for pagination
   * @returns Promise<FeedItem[]>
   */
  static async getFeedItems(limit: number = 20, offset: number = 0): Promise<FeedItem[]> {
    try {
      const feed = await this.getFeed({ limit, offset });
      return feed.items;
    } catch (error) {
      log.error('Failed to get feed items', { error, limit, offset });
      throw error;
    }
  }

  /**
   * Get trending products for feed
   * @param limit Number of trending items to fetch
   * @returns Promise<FeedItem[]>
   */
  static async getTrendingFeed(limit: number = 20): Promise<FeedItem[]> {
    try {
      // For trending, we can use a special endpoint or filter
      const feed = await this.getFeed({ limit, offset: 0 });
      // Filter or sort by trending score if available
      return feed.items.filter(item => item.algorithmScore && item.algorithmScore > 0.7);
    } catch (error) {
      log.error('Failed to get trending feed', { error, limit });
      throw error;
    }
  }

  /**
   * Refresh feed with latest content
   * @param userId User ID for personalization
   * @returns Promise<FeedResponse>
   */
  static async refreshFeed(userId?: string): Promise<FeedResponse> {
    try {
      return await this.getFeed({ limit: 20, offset: 0, userId });
    } catch (error) {
      log.error('Failed to refresh feed', { error, userId });
      throw error;
    }
  }
}