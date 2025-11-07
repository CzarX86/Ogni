import { ApiClient } from './api';
import { CategoryModel } from '../models/category';
import { Category } from '../types';
import { log } from 'shared/utils/logger';

export class CategoryService {
  private static COLLECTION = 'categories';

  // Get all categories
  static async getAllCategories(): Promise<Category[]> {
    try {
      const categories = await ApiClient.getCollection<Category>(this.COLLECTION);
      log.info('Retrieved categories', { count: categories.length });
      return categories;
    } catch (error) {
      log.error('Failed to get categories', { error });
      throw error;
    }
  }

  // Get category by ID
  static async getCategoryById(id: string): Promise<Category | null> {
    try {
      const category = await ApiClient.getDocument<Category>(this.COLLECTION, id);
      log.info('Retrieved category', { id, found: !!category });
      return category;
    } catch (error) {
      log.error('Failed to get category', { id, error });
      throw error;
    }
  }

  // Create new category (admin only)
  static async createCategory(categoryData: Omit<Category, 'id'>): Promise<string> {
    try {
      const validation = CategoryModel.validate(categoryData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const category = CategoryModel.create(categoryData);
      const id = await ApiClient.createDocument(this.COLLECTION, category);

      log.info('Created category', { id, name: categoryData.name });
      return id;
    } catch (error) {
      log.error('Failed to create category', { categoryData, error });
      throw error;
    }
  }

  // Update category (admin only)
  static async updateCategory(id: string, updates: Partial<Omit<Category, 'id'>>): Promise<void> {
    try {
      const existing = await this.getCategoryById(id);
      if (!existing) {
        throw new Error('Category not found');
      }

      const updated = CategoryModel.update(existing, updates);
      const validation = CategoryModel.validate(updated);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      await ApiClient.updateDocument(this.COLLECTION, id, updates);
      log.info('Updated category', { id, updates });
    } catch (error) {
      log.error('Failed to update category', { id, updates, error });
      throw error;
    }
  }

  // Delete category (admin only)
  static async deleteCategory(id: string): Promise<void> {
    try {
      await ApiClient.deleteDocument(this.COLLECTION, id);
      log.info('Deleted category', { id });
    } catch (error) {
      log.error('Failed to delete category', { id, error });
      throw error;
    }
  }

  // Get categories by parent (for subcategories)
  static async getCategoriesByParent(parentId?: string): Promise<Category[]> {
    try {
      const categories = await ApiClient.queryCollection<Category>(
        this.COLLECTION,
        parentId !== undefined ? [{ field: 'parentId', operator: '==' as const, value: parentId }] : []
      );

      log.info('Retrieved categories by parent', { parentId, count: categories.length });
      return categories;
    } catch (error) {
      log.error('Failed to get categories by parent', { parentId, error });
      throw error;
    }
  }

  // Get main categories (no parent)
  static async getMainCategories(): Promise<Category[]> {
    return this.getCategoriesByParent(undefined);
  }

  // Get subcategories for a category
  static async getSubcategories(parentId: string): Promise<Category[]> {
    return this.getCategoriesByParent(parentId);
  }
}