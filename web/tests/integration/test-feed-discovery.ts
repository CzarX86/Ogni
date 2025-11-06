import { FeedService } from '../../src/services/feedService';
import { SocialService } from '../../src/services/socialService';
import { WishlistService } from '../../src/services/wishlistService';
import { FeedPersonalizationAlgorithm } from '../../src/services/feedAlgorithm';

// Mock the HttpApiClient
jest.mock('../../../shared/services/api');
import { HttpApiClient } from '../../../shared/services/api';

const mockHttpApiClient = HttpApiClient as jest.Mocked<typeof HttpApiClient>;

describe('Feed Discovery Flow Integration', () => {
  const mockUserId = 'test-user-123';
  const mockSessionId = 'session-456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Feed Discovery Journey', () => {
    it('should load personalized feed and handle user interactions', async () => {
      // Mock feed API response
      const mockFeedResponse = {
        success: true,
        data: {
          items: [
            {
              product: {
                id: 'product-1',
                name: 'Amazing Product',
                description: 'This is an amazing product',
                price: 99.99,
                images: ['image1.jpg'],
                stock: 10,
                categoryId: 'category-1',
                createdAt: new Date(),
                updatedAt: new Date()
              },
              socialStats: {
                likes: 5,
                comments: 2,
                shares: 1,
                isLiked: false,
                isSaved: false
              }
            }
          ],
          nextOffset: 20,
          hasMore: true,
          personalization: {
            userId: mockUserId,
            algorithm: 'personalized',
            factors: ['userHistory', 'categoryPreference']
          }
        }
      };

      mockHttpApiClient.get.mockResolvedValueOnce(mockFeedResponse);

      // Step 1: Load personalized feed
      const feedData = await FeedService.getFeed({ userId: mockUserId, limit: 20, offset: 0 });

      expect(feedData).toEqual(mockFeedResponse.data);
      expect(mockHttpApiClient.get).toHaveBeenCalledWith('/feed?limit=20&offset=0&userId=test-user-123');

      // Step 2: User likes a product
      const mockLikeResponse = {
        success: true,
        data: {
          id: 'like-123',
          userId: mockUserId,
          productId: 'product-1',
          timestamp: new Date(),
          context: 'feed'
        }
      };

      mockHttpApiClient.post.mockResolvedValueOnce(mockLikeResponse);

      await SocialService.likeProduct('product-1');

      expect(mockHttpApiClient.post).toHaveBeenCalledWith('/social/like', {
        productId: 'product-1',
        context: 'feed'
      });

      // Step 3: User adds product to wishlist
      const mockWishlistAddResponse = {
        success: true,
        data: { success: true }
      };

      mockHttpApiClient.post.mockResolvedValueOnce(mockWishlistAddResponse);

      await WishlistService.addToWishlist(mockUserId, 'product-1');

      expect(mockHttpApiClient.post).toHaveBeenCalledWith('/wishlist', {
        productId: 'product-1'
      });

      // Step 4: Load next page of feed (should be personalized based on interactions)
      const mockNextFeedResponse = {
        success: true,
        data: {
          items: [
            {
              product: {
                id: 'product-2',
                name: 'Similar Product',
                description: 'Similar to what you liked',
                price: 89.99,
                images: ['image2.jpg'],
                stock: 5,
                categoryId: 'category-1',
                createdAt: new Date(),
                updatedAt: new Date()
              },
              socialStats: {
                likes: 3,
                comments: 1,
                shares: 0,
                isLiked: false,
                isSaved: false
              }
            }
          ],
          nextOffset: 40,
          hasMore: true,
          personalization: {
            userId: mockUserId,
            algorithm: 'personalized',
            factors: ['userHistory', 'categoryPreference', 'collaborative']
          }
        }
      };

      mockHttpApiClient.get.mockResolvedValueOnce(mockNextFeedResponse);

      const nextFeedData = await FeedService.getFeed({ userId: mockUserId, limit: 20, offset: 20 });

      expect(nextFeedData).toEqual(mockNextFeedResponse.data);
      expect(nextFeedData.personalization.algorithm).toBe('personalized');
    });

    it('should handle trending feed for new users', async () => {
      // Mock trending feed response
      const mockTrendingResponse = {
        data: {
          items: [
            {
              product: {
                id: 'trending-1',
                name: 'Trending Product',
                description: 'Everyone is talking about this',
                price: 149.99,
                images: ['trending.jpg'],
                stock: 20,
                categoryId: 'category-2',
                createdAt: new Date(),
                updatedAt: new Date()
              },
              socialStats: {
                likes: 50,
                comments: 15,
                shares: 8,
                isLiked: false,
                isSaved: false
              }
            }
          ],
          nextOffset: 20,
          hasMore: true,
          personalization: {
            algorithm: 'trending',
            factors: ['trending', 'social']
          }
        }
      };

      mockHttpApiClient.get.mockResolvedValueOnce(mockTrendingResponse);

      // Load trending feed for anonymous user
      const feedData = await FeedService.getTrendingFeed(20, 0);

      expect(feedData).toEqual(mockTrendingResponse.data);
      expect(feedData.personalization.algorithm).toBe('trending');
      expect(mockHttpApiClient.get).toHaveBeenCalledWith('/feed/trending?limit=20&offset=0');
    });

    it('should handle algorithm switching and personalization', () => {
      // Test algorithm selection logic
      const algorithm = FeedPersonalizationAlgorithm.getActiveAlgorithm(mockUserId);

      expect(algorithm.id).toBe('personalized');
      expect(algorithm.factors.userHistory).toBeGreaterThan(0);

      // Test algorithm recommendation
      const userData = {
        likedProducts: ['product-1', 'product-2'],
        viewedProducts: ['product-3'],
        purchasedProducts: ['product-1']
      };

      const recommendedAlgorithm = FeedPersonalizationAlgorithm.getRecommendedAlgorithm(userData);
      expect(recommendedAlgorithm.id).toBe('personalized'); // Engaged user
    });

    it('should handle social interactions and stats updates', async () => {
      // Mock social stats API
      const mockStatsResponse = {
        data: {
          likes: 6,
          comments: 3,
          shares: 2
        }
      };

      mockHttpApiClient.get.mockResolvedValueOnce(mockStatsResponse);

      // Get product social stats
      const stats = await SocialService.getProductStats('product-1');

      expect(stats).toEqual(mockStatsResponse.data);
      expect(mockHttpApiClient.get).toHaveBeenCalledWith('/social/stats/product-1');

      // Test comment interaction
      const mockCommentResponse = {
        data: {
          id: 'comment-123',
          userId: mockUserId,
          productId: 'product-1',
          content: 'Great product!',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      mockHttpApiClient.post.mockResolvedValueOnce(mockCommentResponse);

      const comment = await SocialService.addComment('product-1', 'Great product!');

      expect(comment).toEqual(mockCommentResponse.data);
      expect(mockHttpApiClient.post).toHaveBeenCalledWith('/products/product-1/comments', {
        content: 'Great product!'
      });
    });

    it('should handle wishlist management', async () => {
      // Mock wishlist API responses
      const mockWishlistResponse = {
        data: {
          id: 'wishlist-123',
          userId: mockUserId,
          products: ['product-1'],
          isPublic: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      mockHttpApiClient.get.mockResolvedValueOnce(mockWishlistResponse);

      // Get user wishlist
      const wishlist = await WishlistService.getWishlist(mockUserId);

      expect(wishlist).toEqual(mockWishlistResponse.data);
      expect(mockHttpApiClient.get).toHaveBeenCalledWith('/wishlist');

      // Check if product is in wishlist
      const isInWishlist = await WishlistService.isInWishlist(mockUserId, 'product-1');
      expect(isInWishlist).toBe(true);

      // Remove from wishlist
      mockHttpApiClient.delete.mockResolvedValueOnce({ data: { success: true } });

      await WishlistService.removeFromWishlist(mockUserId, 'product-1');

      expect(mockHttpApiClient.delete).toHaveBeenCalledWith('/wishlist?productId=product-1');
    });

    it('should handle feed interaction tracking', async () => {
      // Mock feed interaction tracking
      mockHttpApiClient.post.mockResolvedValueOnce({ data: { success: true } });

      // Track various interactions
      await FeedService.trackInteraction({
        productId: 'product-1',
        interactionType: 'view',
        feedPosition: 0,
        sessionId: mockSessionId
      });

      expect(mockHttpApiClient.post).toHaveBeenCalledWith('/feed/interactions', {
        productId: 'product-1',
        interactionType: 'view',
        feedPosition: 0,
        sessionId: mockSessionId
      });

      // Track like interaction
      await FeedService.trackInteraction({
        productId: 'product-1',
        interactionType: 'like',
        feedPosition: 0,
        sessionId: mockSessionId
      });

      expect(mockHttpApiClient.post).toHaveBeenCalledWith('/feed/interactions', {
        productId: 'product-1',
        interactionType: 'like',
        feedPosition: 0,
        sessionId: mockSessionId
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      // Mock API error
      mockHttpApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(FeedService.getFeed(mockUserId)).rejects.toThrow('Network error');
    });

    it('should handle empty feed responses', async () => {
      const mockEmptyResponse = {
        data: {
          items: [],
          nextOffset: 0,
          hasMore: false,
          personalization: {
            algorithm: 'personalized',
            factors: []
          }
        }
      };

      mockHttpApiClient.get.mockResolvedValueOnce(mockEmptyResponse);

      const feedData = await FeedService.getFeed(mockUserId);

      expect(feedData.items).toHaveLength(0);
      expect(feedData.hasMore).toBe(false);
    });
  });
});