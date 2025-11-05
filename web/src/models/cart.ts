import { Cart, CartItem } from '../types';

// Cart and CartItem validation models

export class CartItemModel {
  static validate(item: Partial<CartItem>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!item.productId || item.productId.trim().length === 0) {
      errors.push('Product ID is required');
    }

    if (item.quantity === undefined || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
      errors.push('Quantity must be a positive integer');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static create(productId: string, quantity: number): CartItem {
    return {
      productId,
      quantity,
    };
  }
}

export class CartModel {
  static validate(cart: Partial<Cart>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!cart.userId || cart.userId.trim().length === 0) {
      errors.push('User ID is required');
    }

    if (!cart.items || !Array.isArray(cart.items)) {
      errors.push('Items must be an array');
    } else {
      cart.items.forEach((item, index) => {
        const itemValidation = CartItemModel.validate(item);
        if (!itemValidation.isValid) {
          errors.push(`Item ${index}: ${itemValidation.errors.join(', ')}`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static create(userId: string): Omit<Cart, 'id'> {
    const now = new Date();
    return {
      userId,
      items: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  static addItem(cart: Cart, productId: string, quantity: number): Cart {
    const existingItemIndex = cart.items.findIndex(item => item.productId === productId);

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push(CartItemModel.create(productId, quantity));
    }

    cart.updatedAt = new Date();
    return cart;
  }

  static removeItem(cart: Cart, productId: string): Cart {
    cart.items = cart.items.filter(item => item.productId !== productId);
    cart.updatedAt = new Date();
    return cart;
  }

  static updateItemQuantity(cart: Cart, productId: string, quantity: number): Cart {
    const item = cart.items.find(item => item.productId === productId);
    if (item) {
      item.quantity = quantity;
      cart.updatedAt = new Date();
    }
    return cart;
  }

  static getTotalItems(cart: Cart): number {
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  }

  static isEmpty(cart: Cart): boolean {
    return cart.items.length === 0;
  }
}