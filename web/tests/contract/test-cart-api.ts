import { ApiClient } from '../../../shared/services/api';
import { Cart, CartItem } from '../../../shared/types';

// Contract tests for Cart Operations API
// Based on contracts/api.yaml

describe('Cart Operations API Contract', () => {
  describe('GET /cart', () => {
    it('should return user cart', async () => {
      const cart = await ApiClient.getDocument<Cart>('carts', 'test-user-id');

      if (cart) {
        expect(cart).toHaveProperty('userId');
        expect(cart).toHaveProperty('items');
        expect(Array.isArray(cart.items)).toBe(true);

        cart.items.forEach((item: CartItem) => {
          expect(item).toHaveProperty('productId');
          expect(typeof item.productId).toBe('string');
          expect(item).toHaveProperty('quantity');
          expect(typeof item.quantity).toBe('number');
          expect(item.quantity).toBeGreaterThan(0);
        });

        expect(cart).toHaveProperty('createdAt');
        expect(cart).toHaveProperty('updatedAt');
      }
    });
  });

  describe('POST /cart', () => {
    it('should add item to cart', async () => {
      const newItem = {
        productId: 'test-product-id',
        quantity: 2,
      };

      // Note: This endpoint might be implemented differently
      // For now, testing the cart document update
      const cartId = 'test-user-id';
      const existingCart = await ApiClient.getDocument<Cart>('carts', cartId) || {
        userId: cartId,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      existingCart.items.push(newItem as CartItem);
      existingCart.updatedAt = new Date();

      await ApiClient.updateDocument('carts', cartId, existingCart);

      const updatedCart = await ApiClient.getDocument<Cart>('carts', cartId);
      expect(updatedCart?.items).toContainEqual(newItem);
    });

    it('should validate quantity is positive', async () => {
      const invalidItem = {
        productId: 'test-product-id',
        quantity: -1,
      };

      // This should fail validation
      await expect(async () => {
        const cartId = 'test-user-id';
        const cart = await ApiClient.getDocument<Cart>('carts', cartId) || {
          userId: cartId,
          items: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        cart.items.push(invalidItem as CartItem);
        await ApiClient.updateDocument('carts', cartId, cart);
      }).rejects.toThrow();
    });
  });

  describe('DELETE /cart/items/{productId}', () => {
    it('should remove item from cart', async () => {
      const cartId = 'test-user-id';
      const productIdToRemove = 'test-product-id';

      const cart = await ApiClient.getDocument<Cart>('carts', cartId);
      if (cart) {
        cart.items = cart.items.filter(item => item.productId !== productIdToRemove);
        cart.updatedAt = new Date();

        await ApiClient.updateDocument('carts', cartId, cart);

        const updatedCart = await ApiClient.getDocument<Cart>('carts', cartId);
        expect(updatedCart?.items.find(item => item.productId === productIdToRemove)).toBeUndefined();
      }
    });
  });
});