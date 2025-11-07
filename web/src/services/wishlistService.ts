import { HttpApiClient } from 'shared/services/api';
import { Wishlist, Product } from 'shared/types';
import { log } from '../utils/logger';

export class WishlistService {
  private static readonly API_BASE = '/wishlist';

  /**
   * Get user's wishlist
   */
  static async getWishlist(userId: string): Promise<Wishlist> {
    try {
      const response = await HttpApiClient.get<Wishlist>(this.API_BASE);
      log.info('Fetched user wishlist', { userId });
      return response.data;
    } catch (error) {
      log.error('Failed to fetch wishlist', { userId, error });
      throw error;
    }
  }

  /**
   * Add product to wishlist
   */
  static async addToWishlist(userId: string, productId: string): Promise<void> {
    try {
      await HttpApiClient.post(this.API_BASE, { productId });
      log.info('Added product to wishlist', { userId, productId });
    } catch (error) {
      log.error('Failed to add product to wishlist', { userId, productId, error });
      throw error;
    }
  }

  /**
   * Remove product from wishlist
   */
  static async removeFromWishlist(userId: string, productId: string): Promise<void> {
    try {
      await HttpApiClient.delete(`${this.API_BASE}?productId=${productId}`);
      log.info('Removed product from wishlist', { userId, productId });
    } catch (error) {
      log.error('Failed to remove product from wishlist', { userId, productId, error });
      throw error;
    }
  }

  /**
   * Check if product is in wishlist
   */
  static async isInWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const wishlist = await this.getWishlist(userId);
      return wishlist.products.includes(productId);
    } catch (error) {
      log.error('Failed to check if product is in wishlist', { userId, productId, error });
      return false;
    }
  }

  /**
   * Get wishlist products with full details
   */
  static async getWishlistProducts(userId: string): Promise<Product[]> {
    try {
      const wishlist = await this.getWishlist(userId);
      if (wishlist.products.length === 0) {
        return [];
      }

      // Fetch product details for all wishlist items
      const productPromises = wishlist.products.map(productId =>
        HttpApiClient.get<Product>(`/products/${productId}`)
      );

      const productResponses = await Promise.all(productPromises);
      const products = productResponses.map(response => response.data);
      log.info('Fetched wishlist products', { userId, productCount: products.length });
      return products;
    } catch (error) {
      log.error('Failed to fetch wishlist products', { userId, error });
      throw error;
    }
  }

  /**
   * Create a new wishlist (for future multiple wishlists feature)
   */
  static async createWishlist(userId: string, name: string): Promise<Wishlist> {
    try {
      const response = await HttpApiClient.post<Wishlist>(this.API_BASE, { name });
      log.info('Created new wishlist', { userId, name });
      return response.data;
    } catch (error) {
      log.error('Failed to create wishlist', { userId, name, error });
      throw error;
    }
  }

  /**
   * Update wishlist name
   */
  static async updateWishlist(userId: string, wishlistId: string, name: string): Promise<Wishlist> {
    try {
      const response = await HttpApiClient.put<Wishlist>(`${this.API_BASE}/${wishlistId}`, { name });
      log.info('Updated wishlist', { userId, wishlistId, name });
      return response.data;
    } catch (error) {
      log.error('Failed to update wishlist', { userId, wishlistId, name, error });
      throw error;
    }
  }

  /**
   * Delete wishlist
   */
  static async deleteWishlist(userId: string, wishlistId: string): Promise<void> {
    try {
      await HttpApiClient.delete(`${this.API_BASE}/${wishlistId}`);
      log.info('Deleted wishlist', { userId, wishlistId });
    } catch (error) {
      log.error('Failed to delete wishlist', { userId, wishlistId, error });
      throw error;
    }
  }
}