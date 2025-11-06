import { ApiClient } from './api';
import { CartModel } from '../models/cart';
import { ProductService } from './productService';
import { Cart, CartItem, Product } from '../types';
import { log } from '../utils/logger';

export class CartService {
  private static COLLECTION = 'carts';

  // Get user's cart
  static async getCart(userId: string): Promise<Cart | null> {
    try {
      const cart = await ApiClient.getDocument<Cart>(this.COLLECTION, userId);
      log.info('Retrieved cart', { userId, found: !!cart });
      return cart;
    } catch (error) {
      log.error('Failed to get cart', { userId, error });
      throw error;
    }
  }

  // Create or get cart for user
  static async getOrCreateCart(userId: string): Promise<Cart> {
    try {
      let cart = await this.getCart(userId);
      if (!cart) {
        cart = CartModel.create(userId) as Cart;
        cart.id = userId; // Use userId as cart ID
        await ApiClient.createDocument(this.COLLECTION, cart);
        log.info('Created new cart', { userId });
      }
      return cart;
    } catch (error) {
      log.error('Failed to get or create cart', { userId, error });
      throw error;
    }
  }

  // Add item to cart
  static async addItem(userId: string, productId: string, quantity: number): Promise<Cart> {
    try {
      // Validate quantity
      if (quantity <= 0) {
        throw new Error('Quantity must be positive');
      }

      // Check if product exists and is in stock
      const product = await ProductService.getProductById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      if (product.stock < quantity) {
        throw new Error('Insufficient stock');
      }

      const cart = await this.getOrCreateCart(userId);
      const updatedCart = CartModel.addItem(cart, productId, quantity);

      const validation = CartModel.validate(updatedCart);
      if (!validation.isValid) {
        throw new Error(`Cart validation failed: ${validation.errors.join(', ')}`);
      }

      await ApiClient.updateDocument(this.COLLECTION, userId, updatedCart);
      log.info('Added item to cart', { userId, productId, quantity });
      return updatedCart;
    } catch (error) {
      log.error('Failed to add item to cart', { userId, productId, quantity, error });
      throw error;
    }
  }

  // Update item quantity in cart
  static async updateItemQuantity(userId: string, productId: string, quantity: number): Promise<Cart> {
    try {
      if (quantity < 0) {
        throw new Error('Quantity cannot be negative');
      }

      const cart = await this.getCart(userId);
      if (!cart) {
        throw new Error('Cart not found');
      }

      let updatedCart: Cart;

      if (quantity === 0) {
        // Remove item if quantity is 0
        updatedCart = CartModel.removeItem(cart, productId);
      } else {
        // Check stock before updating
        const isInStock = await ProductService.isInStock(productId, quantity);
        if (!isInStock) {
          throw new Error('Insufficient stock');
        }

        updatedCart = CartModel.updateItemQuantity(cart, productId, quantity);
      }

      const validation = CartModel.validate(updatedCart);
      if (!validation.isValid) {
        throw new Error(`Cart validation failed: ${validation.errors.join(', ')}`);
      }

      await ApiClient.updateDocument(this.COLLECTION, userId, updatedCart);
      log.info('Updated cart item quantity', { userId, productId, quantity });
      return updatedCart;
    } catch (error) {
      log.error('Failed to update cart item', { userId, productId, quantity, error });
      throw error;
    }
  }

  // Remove item from cart
  static async removeItem(userId: string, productId: string): Promise<Cart> {
    try {
      const cart = await this.getCart(userId);
      if (!cart) {
        throw new Error('Cart not found');
      }

      const updatedCart = CartModel.removeItem(cart, productId);

      const validation = CartModel.validate(updatedCart);
      if (!validation.isValid) {
        throw new Error(`Cart validation failed: ${validation.errors.join(', ')}`);
      }

      await ApiClient.updateDocument(this.COLLECTION, userId, updatedCart);
      log.info('Removed item from cart', { userId, productId });
      return updatedCart;
    } catch (error) {
      log.error('Failed to remove item from cart', { userId, productId, error });
      throw error;
    }
  }

  // Clear cart
  static async clearCart(userId: string): Promise<void> {
    try {
      const cart = await this.getCart(userId);
      if (!cart) {
        return; // Cart doesn't exist, nothing to clear
      }

      const emptyCart = CartModel.create(userId);
      await ApiClient.updateDocument(this.COLLECTION, userId, emptyCart);
      log.info('Cleared cart', { userId });
    } catch (error) {
      log.error('Failed to clear cart', { userId, error });
      throw error;
    }
  }

  // Get cart with product details
  static async getCartWithProducts(userId: string): Promise<{ cart: Cart; products: Product[] } | null> {
    try {
      const cart = await this.getCart(userId);
      if (!cart || CartModel.isEmpty(cart)) {
        return null;
      }

      const productIds = cart.items.map(item => item.productId);
      const products = await Promise.all(
        productIds.map(id => ProductService.getProductById(id))
      );

      // Filter out null products (shouldn't happen in a valid cart)
      const validProducts = products.filter((p): p is Product => p !== null);

      log.info('Retrieved cart with products', { userId, itemCount: cart.items.length });
      return { cart, products: validProducts };
    } catch (error) {
      log.error('Failed to get cart with products', { userId, error });
      throw error;
    }
  }

  // Validate cart (check stock, etc.)
  static async validateCart(userId: string): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      const cartWithProducts = await this.getCartWithProducts(userId);
      if (!cartWithProducts) {
        return { isValid: true, errors: [] }; // Empty cart is valid
      }

      const { cart, products } = cartWithProducts;
      const errors: string[] = [];

      for (const item of cart.items) {
        const product = products.find(p => p.id === item.productId);
        if (!product) {
          errors.push(`Product ${item.productId} not found`);
        } else if (product.stock < item.quantity) {
          errors.push(`Insufficient stock for ${product.name}: requested ${item.quantity}, available ${product.stock}`);
        }
      }

      return { isValid: errors.length === 0, errors };
    } catch (error) {
      log.error('Failed to validate cart', { userId, error });
      return { isValid: false, errors: ['Failed to validate cart'] };
    }
  }

  // Get cart summary
  static async getCartSummary(userId: string): Promise<{
    itemCount: number;
    totalValue: number;
    isValid: boolean;
  } | null> {
    try {
      const cartWithProducts = await this.getCartWithProducts(userId);
      if (!cartWithProducts) {
        return { itemCount: 0, totalValue: 0, isValid: true };
      }

      const { cart, products } = cartWithProducts;
      const itemCount = CartModel.getTotalItems(cart);

      let totalValue = 0;
      for (const item of cart.items) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          totalValue += product.price * item.quantity;
        }
      }

      const validation = await this.validateCart(userId);

      return {
        itemCount,
        totalValue,
        isValid: validation.isValid,
      };
    } catch (error) {
      log.error('Failed to get cart summary', { userId, error });
      return null;
    }
  }
}