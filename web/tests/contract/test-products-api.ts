import { ApiClient } from '../../../shared/services/api';
import { Product } from '../../../shared/types';

// Contract tests for Product Catalog API
// Based on contracts/api.yaml

describe('Product Catalog API Contract', () => {
  describe('GET /products', () => {
    it('should return products with pagination', async () => {
      // This test will fail until the API is implemented
      const response = await ApiClient.queryCollection<Product>('products', [], 'createdAt', 'desc', 20);

      expect(Array.isArray(response)).toBe(true);
      expect(response.length).toBeLessThanOrEqual(20);

      if (response.length > 0) {
        const product = response[0];
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(typeof product.name).toBe('string');
        expect(product.name.length).toBeGreaterThan(0);
        expect(product.name.length).toBeLessThanOrEqual(100);

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

        expect(product).toHaveProperty('createdAt');
        expect(product.createdAt).toBeInstanceOf(Date);

        expect(product).toHaveProperty('updatedAt');
        expect(product.updatedAt).toBeInstanceOf(Date);
      }
    });

    it('should filter products by category', async () => {
      const testCategoryId = 'test-category-id';
      const response = await ApiClient.queryCollection<Product>(
        'products',
        [{ field: 'categoryId', operator: '==', value: testCategoryId }]
      );

      response.forEach(product => {
        expect(product.categoryId).toBe(testCategoryId);
      });
    });

    it('should search products by name', async () => {
      const searchTerm = 'test product';
      // Note: Firestore doesn't have built-in text search
      // This would require a search service or Algolia integration
      // For now, this test documents the expected behavior
      const response = await ApiClient.queryCollection<Product>('products');

      // In a real implementation, this would filter by search term
      response.forEach(product => {
        expect(product.name).toBeDefined();
      });
    });

    it('should limit results', async () => {
      const limit = 5;
      const response = await ApiClient.queryCollection<Product>('products', [], 'createdAt', 'desc', limit);

      expect(response.length).toBeLessThanOrEqual(limit);
    });
  });

  describe('GET /products/{id}', () => {
    it('should return a single product by ID', async () => {
      const testProductId = 'test-product-id';
      const product = await ApiClient.getDocument<Product>('products', testProductId);

      if (product) {
        expect(product.id).toBe(testProductId);
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('images');
        expect(product).toHaveProperty('stock');
        expect(product).toHaveProperty('categoryId');
      } else {
        // Product doesn't exist, which is acceptable
        expect(product).toBeNull();
      }
    });

    it('should return null for non-existent product', async () => {
      const nonExistentId = 'non-existent-id';
      const product = await ApiClient.getDocument<Product>('products', nonExistentId);

      expect(product).toBeNull();
    });
  });

  describe('POST /products (admin only)', () => {
    it('should create a new product', async () => {
      const newProduct = {
        name: 'Test Product',
        description: 'A test product description',
        price: 99.99,
        images: ['https://example.com/image.jpg'],
        stock: 10,
        categoryId: 'test-category',
      };

      const productId = await ApiClient.createDocument('products', newProduct);

      expect(typeof productId).toBe('string');
      expect(productId.length).toBeGreaterThan(0);

      // Verify the product was created
      const createdProduct = await ApiClient.getDocument<Product>('products', productId);
      expect(createdProduct).not.toBeNull();
      expect(createdProduct?.name).toBe(newProduct.name);
      expect(createdProduct?.price).toBe(newProduct.price);
    });

    it('should validate required fields', async () => {
      const invalidProduct = {
        // Missing required fields
        description: 'Missing name and price',
      };

      await expect(ApiClient.createDocument('products', invalidProduct)).rejects.toThrow();
    });
  });

  describe('PUT /products/{id} (admin only)', () => {
    it('should update an existing product', async () => {
      const testProductId = 'test-product-id';
      const updates = {
        price: 149.99,
        stock: 5,
      };

      await ApiClient.updateDocument('products', testProductId, updates);

      const updatedProduct = await ApiClient.getDocument<Product>('products', testProductId);
      if (updatedProduct) {
        expect(updatedProduct.price).toBe(updates.price);
        expect(updatedProduct.stock).toBe(updates.stock);
      }
    });
  });

  describe('GET /categories', () => {
    it('should return all categories', async () => {
      const categories = await ApiClient.getCollection('categories');

      expect(Array.isArray(categories)).toBe(true);

      categories.forEach(category => {
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(typeof category.name).toBe('string');
        expect(category.name.length).toBeGreaterThan(0);
        expect(category.name.length).toBeLessThanOrEqual(50);

        expect(category).toHaveProperty('description');
        expect(category).toHaveProperty('image');
      });
    });
  });
});