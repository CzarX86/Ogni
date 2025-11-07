import { ApiClient } from './api';
import { Review, CreateReviewRequest, UpdateReviewRequest, ReviewStats } from '../models/review';
import { log } from '../utils/logger';

export class ReviewService {
  private static COLLECTION = 'reviews';

  /**
   * Get all reviews for a product
   */
  static async getProductReviews(productId: string, _limit: number = 10, _offset: number = 0): Promise<Review[]> {
    try {
      const reviews = await ApiClient.getCollection<Review>(this.COLLECTION);

      return reviews.map(review => ({
        ...review,
        createdAt: review.createdAt instanceof Date ? review.createdAt : new Date(review.createdAt),
        updatedAt: review.updatedAt ? (review.updatedAt instanceof Date ? review.updatedAt : new Date(review.updatedAt)) : undefined
      }));
    } catch (error) {
      log.error('Failed to get product reviews', { error, productId });
      throw new Error('Failed to load reviews');
    }
  }

  /**
   * Get review statistics for a product
   */
  static async getProductReviewStats(productId: string): Promise<ReviewStats> {
    try {
      const reviews = await this.getProductReviews(productId, 1000); // Get all reviews for stats

      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

      const ratingDistribution = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
      };

      reviews.forEach(review => {
        ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
      });

      return {
        averageRating,
        totalReviews,
        ratingDistribution
      };
    } catch (error) {
      log.error('Failed to get product review stats', { error, productId });
      throw new Error('Failed to load review statistics');
    }
  }

  /**
   * Create a new review
   */
  static async createReview(reviewData: CreateReviewRequest): Promise<string> {
    try {
      const review = {
        ...reviewData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const id = await ApiClient.createDocument(this.COLLECTION, review);
      log.info('Created review', { id, productId: reviewData.productId });
      return id;
    } catch (error) {
      log.error('Failed to create review', { error, reviewData });
      throw new Error('Failed to submit review');
    }
  }

  /**
   * Update an existing review
   */
  static async updateReview(reviewId: string, updateData: UpdateReviewRequest): Promise<void> {
    try {
      const updates = {
        ...updateData,
        updatedAt: new Date()
      };

      await ApiClient.updateDocument(this.COLLECTION, reviewId, updates);
      log.info('Updated review', { reviewId });
    } catch (error) {
      log.error('Failed to update review', { error, reviewId, updateData });
      throw new Error('Failed to update review');
    }
  }

  /**
   * Delete a review
   */
  static async deleteReview(reviewId: string): Promise<void> {
    try {
      await ApiClient.deleteDocument(this.COLLECTION, reviewId);
      log.info('Deleted review', { reviewId });
    } catch (error) {
      log.error('Failed to delete review', { error, reviewId });
      throw new Error('Failed to delete review');
    }
  }

  /**
   * Get user's reviews
   */
  static async getUserReviews(userId: string, _limit: number = 20, _offset: number = 0): Promise<Review[]> {
    try {
      const reviews = await ApiClient.getCollection<Review>(this.COLLECTION);

      return reviews.map(review => ({
        ...review,
        createdAt: review.createdAt instanceof Date ? review.createdAt : new Date(review.createdAt),
        updatedAt: review.updatedAt ? (review.updatedAt instanceof Date ? review.updatedAt : new Date(review.updatedAt)) : undefined
      }));
    } catch (error) {
      log.error('Failed to get user reviews', { error, userId });
      throw new Error('Failed to load your reviews');
    }
  }

  /**
   * Check if user can review a product (has purchased and not already reviewed)
   */
  static async canUserReviewProduct(userId: string, productId: string): Promise<boolean> {
    try {
      // Check if user has already reviewed this product
      const existingReviews = await ApiClient.getCollection<Review>(this.COLLECTION);

      if (existingReviews.length > 0) {
        return false; // Already reviewed
      }

      // Check if user has purchased this product
      // This would require checking orders - for now, assume they can review
      // In a real implementation, you'd check OrderService for purchase history
      return true;
    } catch (error) {
      log.error('Failed to check review eligibility', { error, userId, productId });
      return false;
    }
  }
}