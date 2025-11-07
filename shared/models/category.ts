import { Category } from '../types';

// Category model with validation
export type { Category };

export class CategoryModel {
  static validate(category: Partial<Category>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!category.name || category.name.trim().length === 0) {
      errors.push('Name is required');
    } else if (category.name.length > 50) {
      errors.push('Name must be 50 characters or less');
    }

    if (!category.description || category.description.trim().length === 0) {
      errors.push('Description is required');
    }

    if (!category.image || category.image.trim().length === 0) {
      errors.push('Image URL is required');
    }

    // parentId is optional

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static create(data: Omit<Category, 'id'>): Category {
    return {
      id: `category_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
    };
  }

  static update(existing: Category, updates: Partial<Omit<Category, 'id'>>): Category {
    return {
      ...existing,
      ...updates,
    };
  }
}