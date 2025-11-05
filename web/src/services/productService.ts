import { ApiClient } from './api';
import { ProductModel } from '../models/product';
import { Product } from '../types';
import { log } from '../utils/logger';

export class ProductService {
  private static COLLECTION = 'products';

  // Get all products with optional filtering
  static async getProducts(options: {
    categoryId?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<Product[]> {
    try {
      const filters = options.categoryId ? [{ field: 'categoryId', operator: '==', value: options.categoryId }] : [];
      const products = await ApiClient.queryCollection<Product>(
        this.COLLECTION,
        filters,
        undefined, // Remove ordering by createdAt temporarily
        'desc',
        options.limit
      );

      log.info('Retrieved products', { count: products.length, filters });
      return products;
    } catch (error) {
      log.error('Failed to get products', { error, options });
      throw error;
    }
  }

  // Get all products
  static async getAllProducts(): Promise<Product[]> {
    return this.getProducts();
  }

  // Get product by ID
  static async getProductById(id: string): Promise<Product | null> {
    try {
      const product = await ApiClient.getDocument<Product>(this.COLLECTION, id);
      log.info('Retrieved product', { id, found: !!product });
      return product;
    } catch (error) {
      log.error('Failed to get product', { id, error });
      throw error;
    }
  }

  // Search products by name (basic implementation)
  static async searchProducts(query: string, limit: number = 20): Promise<Product[]> {
    try {
      // Note: Firestore doesn't have built-in text search
      // This is a basic implementation - in production, use Algolia or similar
      const allProducts = await this.getProducts({ limit: 100 });
      const filtered = allProducts.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
      );

      const results = filtered.slice(0, limit);
      log.info('Searched products', { query, resultsCount: results.length });
      return results;
    } catch (error) {
      log.error('Failed to search products', { query, error });
      throw error;
    }
  }

  // Create new product (admin only)
  static async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const validation = ProductModel.validate(productData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const product = ProductModel.create(productData);
      const id = await ApiClient.createDocument(this.COLLECTION, product);

      log.info('Created product', { id, name: productData.name });
      return id;
    } catch (error) {
      log.error('Failed to create product', { productData, error });
      throw error;
    }
  }

  // Update product (admin only)
  static async updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const existing = await this.getProductById(id);
      if (!existing) {
        throw new Error('Product not found');
      }

      const updated = ProductModel.update(existing, updates);
      const validation = ProductModel.validate(updated);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      await ApiClient.updateDocument(this.COLLECTION, id, updates);
      log.info('Updated product', { id, updates });
    } catch (error) {
      log.error('Failed to update product', { id, updates, error });
      throw error;
    }
  }

  // Delete product (admin only)
  static async deleteProduct(id: string): Promise<void> {
    try {
      await ApiClient.deleteDocument(this.COLLECTION, id);
      log.info('Deleted product', { id });
    } catch (error) {
      log.error('Failed to delete product', { id, error });
      throw error;
    }
  }

  // Get products by category
  static async getProductsByCategory(categoryId: string, limit: number = 20): Promise<Product[]> {
    return this.getProducts({ categoryId, limit });
  }

  // Check if product is in stock
  static async isInStock(productId: string, quantity: number = 1): Promise<boolean> {
    try {
      const product = await this.getProductById(productId);
      return product ? product.stock >= quantity : false;
    } catch (error) {
      log.error('Failed to check stock', { productId, quantity, error });
      return false;
    }
  }

  // Update product stock
  static async updateStock(productId: string, newStock: number): Promise<void> {
    try {
      if (newStock < 0) {
        throw new Error('Stock cannot be negative');
      }

      await this.updateProduct(productId, { stock: newStock });
      log.info('Updated product stock', { productId, newStock });
    } catch (error) {
      log.error('Failed to update stock', { productId, newStock, error });
      throw error;
    }
  }

  // Reduce stock (for order fulfillment)
  static async reduceStock(productId: string, quantity: number): Promise<void> {
    try {
      const product = await this.getProductById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      if (product.stock < quantity) {
        throw new Error('Insufficient stock');
      }

      const newStock = product.stock - quantity;
      await this.updateStock(productId, newStock);
      log.info('Reduced product stock', { productId, quantity, newStock });
    } catch (error) {
      log.error('Failed to reduce stock', { productId, quantity, error });
      throw error;
    }
  }
}