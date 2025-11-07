import { FeedAlgorithm, Product, FeedItem, UserInteraction } from 'shared/types';
import { log } from '../utils/logger';

export class FeedPersonalizationAlgorithm {
  private static algorithms: FeedAlgorithm[] = [
    {
      id: 'personalized',
      name: 'Personalized Feed',
      description: 'Based on user behavior and preferences',
      factors: {
        userHistory: 0.4,
        categoryPreference: 0.3,
        trending: 0.2,
        collaborative: 0.1,
        random: 0.0
      },
      isActive: true
    },
    {
      id: 'trending',
      name: 'Trending Products',
      description: 'Most popular products right now',
      factors: {
        userHistory: 0.1,
        categoryPreference: 0.1,
        trending: 0.7,
        collaborative: 0.1,
        random: 0.0
      },
      isActive: true
    },
    {
      id: 'discovery',
      name: 'Discovery Mode',
      description: 'Help users discover new products',
      factors: {
        userHistory: 0.2,
        categoryPreference: 0.2,
        trending: 0.2,
        collaborative: 0.2,
        random: 0.2
      },
      isActive: true
    }
  ];

  /**
   * Get active algorithm for user
   * @param userId User ID (optional)
   * @returns FeedAlgorithm
   */
  static getActiveAlgorithm(userId?: string): FeedAlgorithm {
    // For now, return personalized if user is logged in, otherwise trending
    if (userId) {
      return this.algorithms.find(alg => alg.id === 'personalized') || this.algorithms[0];
    }
    return this.algorithms.find(alg => alg.id === 'trending') || this.algorithms[0];
  }

  /**
   * Calculate personalization score for a product
   * @param product Product to score
   * @param userData User behavior data
   * @param algorithm Algorithm to use
   * @returns number Score between 0-1
   */
  static calculateProductScore(
    product: Product,
    userData: {
      likedProducts?: string[];
      viewedProducts?: string[];
      purchasedProducts?: string[];
      preferredCategories?: string[];
      interactions?: UserInteraction[];
    },
    algorithm: FeedAlgorithm
  ): number {
    let score = 0;

    // User history factor
    if (algorithm.factors.userHistory > 0) {
      const userHistoryScore = this.calculateUserHistoryScore(product, userData);
      score += userHistoryScore * algorithm.factors.userHistory;
    }

    // Category preference factor
    if (algorithm.factors.categoryPreference > 0) {
      const categoryScore = this.calculateCategoryPreferenceScore(product, userData);
      score += categoryScore * algorithm.factors.categoryPreference;
    }

    // Trending factor (simplified - would need real trending data)
    if (algorithm.factors.trending > 0) {
      const trendingScore = this.calculateTrendingScore(product);
      score += trendingScore * algorithm.factors.trending;
    }

    // Collaborative filtering factor
    if (algorithm.factors.collaborative > 0) {
      const collaborativeScore = this.calculateCollaborativeScore(product, userData);
      score += collaborativeScore * algorithm.factors.collaborative;
    }

    // Random factor for discovery
    if (algorithm.factors.random > 0) {
      const randomScore = Math.random();
      score += randomScore * algorithm.factors.random;
    }

    // Ensure score is between 0 and 1
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate score based on user's interaction history
   */
  private static calculateUserHistoryScore(
    product: Product,
    userData: { likedProducts?: string[]; viewedProducts?: string[]; purchasedProducts?: string[] }
  ): number {
    let score = 0;

    // Higher score if user has interacted with similar products
    if (userData.likedProducts?.includes(product.id)) score += 1.0;
    if (userData.purchasedProducts?.includes(product.id)) score += 0.8;
    if (userData.viewedProducts?.includes(product.id)) score += 0.3;

    // Check for similar products in same category
    const likedInCategory = userData.likedProducts?.filter(_id =>
      // This would need actual product data to check categories
      // For now, just return a base score
      true
    ).length || 0;

    if (likedInCategory > 0) score += 0.2;

    return Math.min(1, score);
  }

  /**
   * Calculate score based on user's preferred categories
   */
  private static calculateCategoryPreferenceScore(
    product: Product,
    userData: { preferredCategories?: string[] }
  ): number {
    if (!userData.preferredCategories?.length) return 0.5; // Neutral score

    // Higher score if product is in preferred category
    if (userData.preferredCategories.includes(product.categoryId)) {
      return 0.9;
    }

    return 0.3; // Lower score for non-preferred categories
  }

  /**
   * Calculate trending score (simplified implementation)
   */
  private static calculateTrendingScore(product: Product): number {
    // This would typically use real-time data like:
    // - Recent likes/comments/shares
    // - Recent purchases
    // - Social media mentions
    // - Search popularity

    // For now, use a simple heuristic based on product data
    let score = 0.5; // Base score

    // Newer products get slightly higher score
    const daysSinceCreated = product.createdAt ?
      (Date.now() - product.createdAt.getTime()) / (1000 * 60 * 60 * 24) : 30;

    if (daysSinceCreated < 7) score += 0.2; // New products
    else if (daysSinceCreated < 30) score += 0.1; // Recent products

    // Products with images get higher score
    if (product.images?.length > 0) score += 0.1;

    // Available products get higher score
    if (product.stock > 0) score += 0.1;

    return Math.min(1, score);
  }

  /**
   * Calculate collaborative filtering score
   */
  private static calculateCollaborativeScore(
    _product: Product,
    _userData: { interactions?: UserInteraction[] }
  ): number {
    // This would implement collaborative filtering:
    // - Find users similar to current user
    // - See what products they liked/purchased
    // - Recommend products based on similar user behavior

    // For now, return a neutral score
    return 0.5;
  }

  /**
   * Rank products for feed
   * @param products Products to rank
   * @param userData User behavior data
   * @param algorithm Algorithm to use
   * @returns FeedItem[] Ranked products with scores
   */
  static rankProductsForFeed(
    products: Product[],
    userData: {
      likedProducts?: string[];
      viewedProducts?: string[];
      purchasedProducts?: string[];
      preferredCategories?: string[];
      interactions?: UserInteraction[];
    },
    algorithm: FeedAlgorithm
  ): FeedItem[] {
    try {
      const rankedItems: FeedItem[] = products.map((product, index) => {
        const score = this.calculateProductScore(product, userData, algorithm);

        return {
          product,
          socialStats: {
            likes: 0, // This would come from real social data
            comments: 0,
            shares: 0,
            isLiked: userData.likedProducts?.includes(product.id) || false,
            isSaved: false // This would come from wishlist data
          },
          algorithmScore: score,
          feedPosition: index
        };
      });

      // Sort by score (highest first)
      rankedItems.sort((a, b) => (b.algorithmScore || 0) - (a.algorithmScore || 0));

      log.info('Ranked products for feed', {
        algorithm: algorithm.id,
        productCount: products.length,
        averageScore: rankedItems.reduce((sum, item) => sum + (item.algorithmScore || 0), 0) / rankedItems.length
      });

      return rankedItems;
    } catch (error) {
      log.error('Failed to rank products for feed', { error, productCount: products.length });
      // Return products in original order if ranking fails
      return products.map(product => ({
        product,
        socialStats: {
          likes: 0,
          comments: 0,
          shares: 0,
          isLiked: false,
          isSaved: false
        }
      }));
    }
  }

  /**
   * Get algorithm recommendations for user
   * @param userData User behavior data
   * @returns FeedAlgorithm Recommended algorithm
   */
  static getRecommendedAlgorithm(userData: {
    likedProducts?: string[];
    viewedProducts?: string[];
    purchasedProducts?: string[];
    interactions?: UserInteraction[];
  }): FeedAlgorithm {
    // Simple logic to choose algorithm based on user engagement
    const totalInteractions = (userData.likedProducts?.length || 0) +
                             (userData.viewedProducts?.length || 0) +
                             (userData.purchasedProducts?.length || 0);

    if (totalInteractions > 10) {
      // Engaged user - use personalized
      return this.algorithms.find(alg => alg.id === 'personalized') || this.algorithms[0];
    } else if (totalInteractions > 5) {
      // Somewhat engaged - use discovery
      return this.algorithms.find(alg => alg.id === 'discovery') || this.algorithms[0];
    } else {
      // New user - use trending
      return this.algorithms.find(alg => alg.id === 'trending') || this.algorithms[0];
    }
  }
}