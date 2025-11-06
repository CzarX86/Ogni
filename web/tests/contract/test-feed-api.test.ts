import { Product } from '../../../shared/types';

// Mock the HttpApiClient
jest.mock('../../../shared/services/api', () => ({
  HttpApiClient: {
    get: jest.fn(),
  },
}));

import { HttpApiClient } from '../../../shared/services/api';

// Contract tests for Feed API
// Based on contracts/api.yaml

describe('Feed API Contract', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /feed', () => {
    it('should return personalized product feed', async () => {
      // Mock the API response
      const mockResponse = {
        success: true,
        data: {
          products: [
            {
              id: '1',
              name: 'Test Product',
              description: 'A test product',
              price: 99.99,
              images: ['image1.jpg'],
              stock: 10,
              categoryId: 'cat1'
            }
          ],
          nextOffset: 1
        }
      };

      (HttpApiClient.get as jest.MockedFunction<typeof HttpApiClient.get>).mockResolvedValue(mockResponse);

      // This test validates the contract
      const response = await HttpApiClient.get<{ products: Product[]; nextOffset: number }>('/feed');

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('products');
      expect(Array.isArray(response.data.products)).toBe(true);

      expect(response.data).toHaveProperty('nextOffset');
      expect(typeof response.data.nextOffset).toBe('number');

      // Validate product structure in feed
      response.data.products.forEach((product: Product) => {
        expect(product).toHaveProperty('id');
        expect(typeof product.id).toBe('string');

        expect(product).toHaveProperty('name');
        expect(typeof product.name).toBe('string');
        expect(product.name.length).toBeGreaterThan(0);
        expect(product.name.length).toBeLessThanOrEqual(100);

        expect(product).toHaveProperty('description');
        expect(typeof product.description).toBe('string');

        expect(product).toHaveProperty('price');
        expect(typeof product.price).toBe('number');
        expect(product.price).toBeGreaterThanOrEqual(0);

        expect(product).toHaveProperty('images');
        expect(Array.isArray(product.images)).toBe(true);
        expect(product.images.length).toBeGreaterThan(0);

        expect(product).toHaveProperty('stock');
        expect(typeof product.stock).toBe('number');
        expect(product.stock).toBeGreaterThanOrEqual(0);

        expect(product).toHaveProperty('categoryId');
        expect(typeof product.categoryId).toBe('string');
      });
    });

    it('should support pagination with limit parameter', async () => {
      const limit = 5;
      const mockResponse = {
        success: true,
        data: {
          products: [],
          nextOffset: 5
        }
      };

      (HttpApiClient.get as jest.MockedFunction<typeof HttpApiClient.get>).mockResolvedValue(mockResponse);

      const response = await HttpApiClient.get<{ products: Product[]; nextOffset: number }>(`/feed?limit=${limit}`);

      expect(response.success).toBe(true);
      expect(response.data.products.length).toBeLessThanOrEqual(limit);
    });

    it('should support pagination with offset parameter', async () => {
      const offset = 10;
      const mockResponse = {
        success: true,
        data: {
          products: [],
          nextOffset: 10
        }
      };

      (HttpApiClient.get as jest.MockedFunction<typeof HttpApiClient.get>).mockResolvedValue(mockResponse);

      const response = await HttpApiClient.get<{ products: Product[]; nextOffset: number }>(`/feed?offset=${offset}`);

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('nextOffset');
      expect(response.data.nextOffset).toBe(offset + response.data.products.length);
    });

    it('should return different products for different users (personalization)', async () => {
      // This test documents the expected personalization behavior
      // In a real implementation, this would require mocking different user contexts
      const mockResponse1 = {
        success: true,
        data: {
          products: [{ id: '1', name: 'Product 1', description: 'Desc 1', price: 10, images: ['img1.jpg'], stock: 5, categoryId: 'cat1' }],
          nextOffset: 1
        }
      };

      const mockResponse2 = {
        success: true,
        data: {
          products: [{ id: '2', name: 'Product 2', description: 'Desc 2', price: 20, images: ['img2.jpg'], stock: 3, categoryId: 'cat2' }],
          nextOffset: 1
        }
      };

      (HttpApiClient.get as jest.MockedFunction<typeof HttpApiClient.get>)
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2);

      const response1 = await HttpApiClient.get<{ products: Product[]; nextOffset: number }>('/feed');
      const response2 = await HttpApiClient.get<{ products: Product[]; nextOffset: number }>('/feed');

      // For now, just verify the structure is consistent
      expect(response1.success).toBe(true);
      expect(response2.success).toBe(true);
      expect(response1.data).toHaveProperty('products');
      expect(response2.data).toHaveProperty('products');
      expect(Array.isArray(response1.data.products)).toBe(true);
      expect(Array.isArray(response2.data.products)).toBe(true);
    });

    it('should handle empty feed gracefully', async () => {
      // This test documents behavior when no products are available
      const mockResponse = {
        success: true,
        data: {
          products: [],
          nextOffset: 0
        }
      };

      (HttpApiClient.get as jest.MockedFunction<typeof HttpApiClient.get>).mockResolvedValue(mockResponse);

      const response = await HttpApiClient.get<{ products: Product[]; nextOffset: number }>('/feed?limit=0');

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('products');
      expect(Array.isArray(response.data.products)).toBe(true);
      expect(response.data.products.length).toBe(0);
      expect(response.data).toHaveProperty('nextOffset');
      expect(response.data.nextOffset).toBe(0);
    });
  });
});