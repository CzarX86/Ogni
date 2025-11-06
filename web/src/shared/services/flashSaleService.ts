import { log } from '../utils/logger';
import { Product } from '../models/product';

export interface FlashSale {
  id: string;
  title: string;
  description: string;
  products: Product[];
  discountPercentage: number;
  originalPrice: number;
  salePrice: number;
  startTime: Date;
  endTime: Date;
  maxQuantity: number;
  soldQuantity: number;
  isActive: boolean;
  bannerImage?: string;
  category?: string;
  priority: number; // Higher priority shows first
  targetAudience?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FlashSaleFilters {
  category?: string;
  isActive?: boolean;
  dateRange?: { start: Date; end: Date };
}

export interface FlashSaleAnalytics {
  saleId: string;
  views: number;
  clicks: number;
  purchases: number;
  conversionRate: number;
  revenue: number;
  avgOrderValue: number;
  dateRange: { start: Date; end: Date };
}

export class FlashSaleService {
  private static readonly COLLECTION_SALES = 'flash_sales';
  private static readonly COLLECTION_ANALYTICS = 'flash_sale_analytics';

  /**
   * Get all flash sales with filtering
   */
  static async getFlashSales(filters: FlashSaleFilters = {}): Promise<FlashSale[]> {
    try {
      log.info('Fetching flash sales', { filters });

      // In a real implementation, this would query Firestore
      const mockSales = this.generateMockFlashSales();

      let filteredSales = mockSales;

      // Apply filters
      if (filters.category) {
        filteredSales = filteredSales.filter(sale => sale.category === filters.category);
      }

      if (filters.isActive !== undefined) {
        const now = new Date();
        filteredSales = filteredSales.filter(sale =>
          filters.isActive
            ? sale.isActive && sale.startTime <= now && sale.endTime > now
            : !sale.isActive || sale.endTime <= now
        );
      }

      if (filters.dateRange) {
        filteredSales = filteredSales.filter(sale =>
          sale.startTime >= filters.dateRange!.start &&
          sale.endTime <= filters.dateRange!.end
        );
      }

      // Sort by priority and start time
      filteredSales.sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        return a.startTime.getTime() - b.startTime.getTime();
      });

      return filteredSales;
    } catch (error) {
      log.error('Failed to fetch flash sales', { error, filters });
      throw new Error('Failed to fetch flash sales');
    }
  }

  /**
   * Get a single flash sale by ID
   */
  static async getFlashSale(id: string): Promise<FlashSale | null> {
    try {
      log.info('Fetching flash sale', { saleId: id });

      // In a real implementation, this would query Firestore
      const sales = this.generateMockFlashSales();
      const sale = sales.find(s => s.id === id);

      return sale || null;
    } catch (error) {
      log.error('Failed to fetch flash sale', { error, saleId: id });
      throw new Error('Failed to fetch flash sale');
    }
  }

  /**
   * Create a new flash sale
   */
  static async createFlashSale(saleData: Omit<FlashSale, 'id' | 'createdAt' | 'updatedAt'>): Promise<FlashSale> {
    try {
      log.info('Creating flash sale', { title: saleData.title });

      const now = new Date();
      const sale: FlashSale = {
        ...saleData,
        id: `flash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
        updatedAt: now
      };

      // In a real implementation, this would save to Firestore
      log.info('Flash sale created successfully', { saleId: sale.id });

      return sale;
    } catch (error) {
      log.error('Failed to create flash sale', { error, title: saleData.title });
      throw new Error('Failed to create flash sale');
    }
  }

  /**
   * Update an existing flash sale
   */
  static async updateFlashSale(id: string, updates: Partial<FlashSale>): Promise<FlashSale> {
    try {
      log.info('Updating flash sale', { saleId: id });

      const existingSale = await this.getFlashSale(id);
      if (!existingSale) {
        throw new Error('Flash sale not found');
      }

      const updatedSale: FlashSale = {
        ...existingSale,
        ...updates,
        updatedAt: new Date()
      };

      // In a real implementation, this would update Firestore
      log.info('Flash sale updated successfully', { saleId: id });

      return updatedSale;
    } catch (error) {
      log.error('Failed to update flash sale', { error, saleId: id });
      throw new Error('Failed to update flash sale');
    }
  }

  /**
   * Delete a flash sale
   */
  static async deleteFlashSale(id: string): Promise<void> {
    try {
      log.info('Deleting flash sale', { saleId: id });

      // In a real implementation, this would delete from Firestore
      log.info('Flash sale deleted successfully', { saleId: id });
    } catch (error) {
      log.error('Failed to delete flash sale', { error, saleId: id });
      throw new Error('Failed to delete flash sale');
    }
  }

  /**
   * Check if a product is on flash sale
   */
  static async getProductFlashSale(productId: string): Promise<FlashSale | null> {
    try {
      log.info('Checking product flash sale', { productId });

      const activeSales = await this.getFlashSales({ isActive: true });

      for (const sale of activeSales) {
        if (sale.products.some(product => product.id === productId)) {
          return sale;
        }
      }

      return null;
    } catch (error) {
      log.error('Failed to check product flash sale', { error, productId });
      return null;
    }
  }

  /**
   * Get flash sale analytics
   */
  static async getAnalytics(saleId?: string, dateRange?: { start: Date; end: Date }): Promise<FlashSaleAnalytics[]> {
    try {
      log.info('Fetching flash sale analytics', { saleId, dateRange });

      // In a real implementation, this would aggregate analytics data
      return this.generateMockAnalytics(saleId);
    } catch (error) {
      log.error('Failed to fetch flash sale analytics', { error, saleId });
      return [];
    }
  }

  /**
   * Track flash sale interaction
   */
  static async trackInteraction(saleId: string, action: 'view' | 'click' | 'purchase', userId?: string): Promise<void> {
    try {
      log.info('Tracking flash sale interaction', { saleId, action, userId });

      // In a real implementation, this would track analytics
      // Could integrate with Google Analytics, Firebase Analytics, etc.
    } catch (error) {
      log.error('Failed to track flash sale interaction', { error, saleId, action });
    }
  }

  /**
   * Get active flash sales for homepage banner
   */
  static async getActiveSalesForBanner(limit: number = 3): Promise<FlashSale[]> {
    try {
      const activeSales = await this.getFlashSales({ isActive: true });
      return activeSales.slice(0, limit);
    } catch (error) {
      log.error('Failed to get active sales for banner', { error });
      return [];
    }
  }

  /**
   * Calculate sale price for a product
   */
  static calculateSalePrice(originalPrice: number, discountPercentage: number): number {
    return originalPrice * (1 - discountPercentage / 100);
  }

  /**
   * Check if flash sale is currently active
   */
  static isSaleActive(sale: FlashSale): boolean {
    const now = new Date();
    return sale.isActive && sale.startTime <= now && sale.endTime > now;
  }

  /**
   * Get time remaining for flash sale
   */
  static getTimeRemaining(sale: FlashSale): { days: number; hours: number; minutes: number; seconds: number } | null {
    if (!this.isSaleActive(sale)) {
      return null;
    }

    const now = new Date().getTime();
    const end = sale.endTime.getTime();
    const difference = end - now;

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000)
    };
  }

  /**
   * Generate mock flash sales for development
   */
  private static generateMockFlashSales(): FlashSale[] {
    const now = new Date();

    return [
      {
        id: 'flash_1',
        title: 'Oferta Relâmpago - Eletrônicos',
        description: 'Até 70% OFF em smartphones e acessórios!',
        products: [], // Would be populated with actual products
        discountPercentage: 70,
        originalPrice: 2999.99,
        salePrice: 899.99,
        startTime: new Date(now.getTime() - 30 * 60 * 1000), // Started 30 minutes ago
        endTime: new Date(now.getTime() + 90 * 60 * 1000), // Ends in 90 minutes
        maxQuantity: 50,
        soldQuantity: 23,
        isActive: true,
        bannerImage: '/flash-sale-electronics.jpg',
        category: 'electronics',
        priority: 10,
        targetAudience: ['tech_enthusiasts', 'students'],
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 30 * 60 * 1000)
      },
      {
        id: 'flash_2',
        title: 'Moda com Desconto',
        description: 'Roupas e acessórios com até 50% OFF!',
        products: [], // Would be populated with actual products
        discountPercentage: 50,
        originalPrice: 199.99,
        salePrice: 99.99,
        startTime: new Date(now.getTime() - 60 * 60 * 1000), // Started 1 hour ago
        endTime: new Date(now.getTime() + 3 * 60 * 60 * 1000), // Ends in 3 hours
        maxQuantity: 100,
        soldQuantity: 67,
        isActive: true,
        bannerImage: '/flash-sale-fashion.jpg',
        category: 'fashion',
        priority: 8,
        targetAudience: ['fashion_lovers', 'young_adults'],
        createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 60 * 60 * 1000)
      },
      {
        id: 'flash_3',
        title: 'Oferta de Casa e Jardim',
        description: 'Decoração e utensílios com 40% OFF!',
        products: [], // Would be populated with actual products
        discountPercentage: 40,
        originalPrice: 149.99,
        salePrice: 89.99,
        startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // Starts in 2 hours
        endTime: new Date(now.getTime() + 5 * 60 * 60 * 1000), // Ends in 5 hours
        maxQuantity: 75,
        soldQuantity: 0,
        isActive: false, // Not yet started
        bannerImage: '/flash-sale-home.jpg',
        category: 'home',
        priority: 6,
        targetAudience: ['homeowners', 'designers'],
        createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000)
      }
    ];
  }

  /**
   * Generate mock analytics for development
   */
  private static generateMockAnalytics(saleId?: string): FlashSaleAnalytics[] {
    const now = new Date();
    const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    if (saleId) {
      return [{
        saleId,
        views: 15420,
        clicks: 2340,
        purchases: 156,
        conversionRate: 6.7,
        revenue: 23450.99,
        avgOrderValue: 150.33,
        dateRange: {
          start: startDate,
          end: now
        }
      }];
    }

    return [];
  }
}