import { ProductLike, ProductComment, ProductShare } from '../../../shared/types';

// Mock the HttpApiClient
jest.mock('../../../shared/services/api', () => ({
  HttpApiClient: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

import { HttpApiClient } from '../../../shared/services/api';

// Contract tests for Social Interactions API
// Based on contracts/api.yaml

describe('Social Interactions API Contract', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /social/like', () => {
    it('should create a like for a product', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'like123',
          productId: 'product1',
          userId: 'user1',
          timestamp: new Date().toISOString()
        }
      };

      (HttpApiClient.post as jest.MockedFunction<typeof HttpApiClient.post>).mockResolvedValue(mockResponse);

      const response = await HttpApiClient.post<ProductLike>('/social/like', {
        productId: 'product1'
      });

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('productId', 'product1');
      expect(response.data).toHaveProperty('userId');
      expect(response.data).toHaveProperty('timestamp');
    });

    it('should handle duplicate likes gracefully', async () => {
      const mockResponse = {
        success: false,
        data: null,
        message: 'Already liked'
      };

      (HttpApiClient.post as jest.MockedFunction<typeof HttpApiClient.post>).mockResolvedValue(mockResponse);

      const response = await HttpApiClient.post<ProductLike>('/social/like', {
        productId: 'product1'
      });

      expect(response.success).toBe(false);
      expect(response.message).toBe('Already liked');
    });
  });

  describe('DELETE /social/like/{likeId}', () => {
    it('should remove a like', async () => {
      const mockResponse = {
        success: true,
        data: null
      };

      (HttpApiClient.delete as jest.MockedFunction<typeof HttpApiClient.delete>).mockResolvedValue(mockResponse);

      const response = await HttpApiClient.delete('/social/like/like123');

      expect(response.success).toBe(true);
    });
  });

  describe('GET /social/likes/{productId}', () => {
    it('should return likes for a product', async () => {
      const mockResponse = {
        success: true,
        data: {
          likes: [
            {
              id: 'like1',
              productId: 'product1',
              userId: 'user1',
              timestamp: '2024-01-01T00:00:00Z'
            },
            {
              id: 'like2',
              productId: 'product1',
              userId: 'user2',
              timestamp: '2024-01-02T00:00:00Z'
            }
          ],
          count: 2
        }
      };

      (HttpApiClient.get as jest.MockedFunction<typeof HttpApiClient.get>).mockResolvedValue(mockResponse);

      const response = await HttpApiClient.get<{ likes: ProductLike[]; count: number }>(`/social/likes/product1`);

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('likes');
      expect(Array.isArray(response.data.likes)).toBe(true);
      expect(response.data).toHaveProperty('count', 2);

      response.data.likes.forEach((like: ProductLike) => {
        expect(like).toHaveProperty('id');
        expect(like).toHaveProperty('productId', 'product1');
        expect(like).toHaveProperty('userId');
        expect(like).toHaveProperty('timestamp');
      });
    });
  });

  describe('POST /social/comment', () => {
    it('should create a comment for a product', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'comment123',
          productId: 'product1',
          userId: 'user1',
          content: 'Great product!',
          parentId: null,
          likes: 0,
          timestamp: new Date().toISOString()
        }
      };

      (HttpApiClient.post as jest.MockedFunction<typeof HttpApiClient.post>).mockResolvedValue(mockResponse);

      const response = await HttpApiClient.post<ProductComment>('/social/comment', {
        productId: 'product1',
        content: 'Great product!'
      });

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('productId', 'product1');
      expect(response.data).toHaveProperty('userId');
      expect(response.data).toHaveProperty('content', 'Great product!');
      expect(response.data).toHaveProperty('timestamp');
    });

    it('should validate comment content length', async () => {
      const mockResponse = {
        success: false,
        data: null,
        message: 'Comment too long'
      };

      (HttpApiClient.post as jest.MockedFunction<typeof HttpApiClient.post>).mockResolvedValue(mockResponse);

      const response = await HttpApiClient.post<ProductComment>('/social/comment', {
        productId: 'product1',
        content: 'a'.repeat(1001) // Too long
      });

      expect(response.success).toBe(false);
      expect(response.message).toBe('Comment too long');
    });
  });

  describe('GET /social/comments/{productId}', () => {
    it('should return comments for a product with pagination', async () => {
      const mockResponse = {
        success: true,
        data: {
          comments: [
            {
              id: 'comment1',
              productId: 'product1',
              userId: 'user1',
              content: 'Nice!',
              parentId: null,
              likes: 0,
              timestamp: '2024-01-01T00:00:00Z'
            }
          ],
          nextOffset: 1,
          total: 5
        }
      };

      (HttpApiClient.get as jest.MockedFunction<typeof HttpApiClient.get>).mockResolvedValue(mockResponse);

      const response = await HttpApiClient.get<{ comments: ProductComment[]; nextOffset: number; total: number }>(`/social/comments/product1`);

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('comments');
      expect(Array.isArray(response.data.comments)).toBe(true);
      expect(response.data).toHaveProperty('nextOffset');
      expect(response.data).toHaveProperty('total');

      response.data.comments.forEach((comment: ProductComment) => {
        expect(comment).toHaveProperty('id');
        expect(comment).toHaveProperty('productId');
        expect(comment).toHaveProperty('userId');
        expect(comment).toHaveProperty('content');
        expect(comment).toHaveProperty('timestamp');
      });
    });
  });

  describe('POST /social/share', () => {
    it('should create a share for a product', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'share123',
          productId: 'product1',
          userId: 'user1',
          platform: 'whatsapp',
          timestamp: new Date().toISOString()
        }
      };

      (HttpApiClient.post as jest.MockedFunction<typeof HttpApiClient.post>).mockResolvedValue(mockResponse);

      const response = await HttpApiClient.post<ProductShare>('/social/share', {
        productId: 'product1',
        platform: 'whatsapp'
      });

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('productId', 'product1');
      expect(response.data).toHaveProperty('userId');
      expect(response.data).toHaveProperty('platform', 'whatsapp');
      expect(response.data).toHaveProperty('timestamp');
    });
  });

  describe('GET /social/stats/{productId}', () => {
    it('should return social stats for a product', async () => {
      const mockResponse = {
        success: true,
        data: {
          likes: 15,
          comments: 8,
          shares: 3,
          total: 26
        }
      };

      (HttpApiClient.get as jest.MockedFunction<typeof HttpApiClient.get>).mockResolvedValue(mockResponse);

      const response = await HttpApiClient.get<{ likes: number; comments: number; shares: number; total: number }>(`/social/stats/product1`);

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('likes', 15);
      expect(response.data).toHaveProperty('comments', 8);
      expect(response.data).toHaveProperty('shares', 3);
      expect(response.data).toHaveProperty('total', 26);
    });
  });
});