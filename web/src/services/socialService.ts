import { HttpApiClient } from '@/shared/services/api';
import {
  ProductLike,
  ProductComment,
  ProductShare,
  SocialStats,
  LikeResponse,
  CommentResponse,
  ShareResponse,
  ApiResponse
} from '@/shared/types';
import { log } from '../utils/logger';

export class SocialService {
  /**
   * Like a product
   * @param productId Product ID to like
   * @returns Promise<ProductLike>
   */
  static async likeProduct(productId: string): Promise<ProductLike> {
    try {
      const response: ApiResponse<ProductLike> = await HttpApiClient.post<ProductLike>('/social/like', {
        productId
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to like product');
      }

      log.info('Product liked', { productId, likeId: response.data.id });
      return response.data;
    } catch (error) {
      log.error('Failed to like product', { productId, error });
      throw error;
    }
  }

  /**
   * Unlike a product
   * @param likeId Like ID to remove
   * @returns Promise<void>
   */
  static async unlikeProduct(likeId: string): Promise<void> {
    try {
      const response: ApiResponse<null> = await HttpApiClient.delete(`/social/like/${likeId}`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to unlike product');
      }

      log.info('Product unliked', { likeId });
    } catch (error) {
      log.error('Failed to unlike product', { likeId, error });
      throw error;
    }
  }

  /**
   * Get likes for a product
   * @param productId Product ID
   * @returns Promise<LikeResponse>
   */
  static async getProductLikes(productId: string): Promise<LikeResponse> {
    try {
      const response: ApiResponse<LikeResponse> = await HttpApiClient.get<LikeResponse>(`/social/likes/${productId}`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to get product likes');
      }

      log.info('Retrieved product likes', { productId, count: response.data.count });
      return response.data;
    } catch (error) {
      log.error('Failed to get product likes', { productId, error });
      throw error;
    }
  }

  /**
   * Add a comment to a product
   * @param productId Product ID
   * @param content Comment content
   * @param parentId Optional parent comment ID for replies
   * @returns Promise<ProductComment>
   */
  static async addComment(productId: string, content: string, parentId?: string): Promise<ProductComment> {
    try {
      const response: ApiResponse<ProductComment> = await HttpApiClient.post<ProductComment>('/social/comment', {
        productId,
        content,
        parentId
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to add comment');
      }

      log.info('Comment added', { productId, commentId: response.data.id, parentId });
      return response.data;
    } catch (error) {
      log.error('Failed to add comment', { productId, content, parentId, error });
      throw error;
    }
  }

  /**
   * Get comments for a product
   * @param productId Product ID
   * @param options Pagination options
   * @returns Promise<CommentResponse>
   */
  static async getProductComments(
    productId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<CommentResponse> {
    try {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());

      const queryString = params.toString();
      const endpoint = `/social/comments/${productId}${queryString ? `?${queryString}` : ''}`;

      const response: ApiResponse<CommentResponse> = await HttpApiClient.get<CommentResponse>(endpoint);

      if (!response.success) {
        throw new Error(response.message || 'Failed to get product comments');
      }

      log.info('Retrieved product comments', {
        productId,
        count: response.data.comments.length,
        total: response.data.total
      });

      return response.data;
    } catch (error) {
      log.error('Failed to get product comments', { productId, options, error });
      throw error;
    }
  }

  /**
   * Share a product
   * @param productId Product ID
   * @param platform Sharing platform
   * @returns Promise<ProductShare>
   */
  static async shareProduct(productId: string, platform: ProductShare['platform']): Promise<ProductShare> {
    try {
      const response: ApiResponse<ProductShare> = await HttpApiClient.post<ProductShare>('/social/share', {
        productId,
        platform
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to share product');
      }

      log.info('Product shared', { productId, platform, shareId: response.data.id });
      return response.data;
    } catch (error) {
      log.error('Failed to share product', { productId, platform, error });
      throw error;
    }
  }

  /**
   * Get social stats for a product
   * @param productId Product ID
   * @returns Promise<SocialStats>
   */
  static async getProductStats(productId: string): Promise<SocialStats> {
    try {
      const response: ApiResponse<SocialStats> = await HttpApiClient.get<SocialStats>(`/social/stats/${productId}`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to get product stats');
      }

      log.info('Retrieved product stats', { productId, stats: response.data });
      return response.data;
    } catch (error) {
      log.error('Failed to get product stats', { productId, error });
      throw error;
    }
  }

  /**
   * Check if user has liked a product
   * @param productId Product ID
   * @param userId User ID
   * @returns Promise<boolean>
   */
  static async hasUserLikedProduct(productId: string, userId: string): Promise<boolean> {
    try {
      const likes = await this.getProductLikes(productId);
      return likes.likes.some(like => like.userId === userId);
    } catch (error) {
      log.error('Failed to check if user liked product', { productId, userId, error });
      return false;
    }
  }

  /**
   * Get user's like for a product
   * @param productId Product ID
   * @param userId User ID
   * @returns Promise<ProductLike | null>
   */
  static async getUserLikeForProduct(productId: string, userId: string): Promise<ProductLike | null> {
    try {
      const likes = await this.getProductLikes(productId);
      return likes.likes.find(like => like.userId === userId) || null;
    } catch (error) {
      log.error('Failed to get user like for product', { productId, userId, error });
      return null;
    }
  }
}