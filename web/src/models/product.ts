import { Product } from '../types';

// Product validation model

export class ProductModel {
  static validate(product: Partial<Product>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!product.name || product.name.trim().length === 0) {
      errors.push('Name is required');
    } else if (product.name.length > 100) {
      errors.push('Name must be 100 characters or less');
    }

    if (!product.description || product.description.trim().length === 0) {
      errors.push('Description is required');
    }

    if (product.price === undefined || product.price < 0) {
      errors.push('Price must be a non-negative number');
    }

    if (!product.images || !Array.isArray(product.images) || product.images.length === 0) {
      errors.push('At least one image is required');
    }

    if (product.stock === undefined || product.stock < 0 || !Number.isInteger(product.stock)) {
      errors.push('Stock must be a non-negative integer');
    }

    if (!product.categoryId || product.categoryId.trim().length === 0) {
      errors.push('Category ID is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Omit<Product, 'id'> {
    const now = new Date();
    return {
      ...data,
      createdAt: now,
      updatedAt: now,
    };
  }

  static update(existing: Product, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Product {
    return {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
  }
}