import { ReviewService } from '../../../shared/services/reviewService';
import { ApiClient } from '../../../shared/services/api';

// Mock the ApiClient
jest.mock('../../../shared/services/api');
const mockApiClient = ApiClient as jest.Mocked<typeof ApiClient>;

describe('ReviewService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getProductReviews', () => {
        it('should return reviews for a product', async () => {
            const mockReviews = [
                {
                    id: '1',
                    productId: 'product1',
                    userId: 'user1',
                    rating: 5,
                    comment: 'Great product!',
                    createdAt: new Date('2023-01-01'),
                    updatedAt: new Date('2023-01-01')
                }
            ];

            mockApiClient.getCollection.mockResolvedValue(mockReviews);

            const result = await ReviewService.getProductReviews('product1');

            expect(mockApiClient.getCollection).toHaveBeenCalledWith('reviews');
            expect(result).toEqual(mockReviews);
        });

        it('should handle empty results', async () => {
            mockApiClient.getCollection.mockResolvedValue([]);

            const result = await ReviewService.getProductReviews('product1');

            expect(result).toEqual([]);
        });
    });

    describe('getProductReviewStats', () => {
        it('should calculate review statistics correctly', async () => {
            const mockReviews = [
                { rating: 5 },
                { rating: 4 },
                { rating: 5 },
                { rating: 3 }
            ];

            mockApiClient.getCollection.mockResolvedValue(mockReviews);

            const result = await ReviewService.getProductReviewStats('product1');

            expect(result.averageRating).toBe(4.25);
            expect(result.totalReviews).toBe(4);
            expect(result.ratingDistribution).toEqual({
                1: 0,
                2: 0,
                3: 1,
                4: 1,
                5: 2
            });
        });

        it('should handle no reviews', async () => {
            mockApiClient.getCollection.mockResolvedValue([]);

            const result = await ReviewService.getProductReviewStats('product1');

            expect(result.averageRating).toBe(0);
            expect(result.totalReviews).toBe(0);
            expect(result.ratingDistribution).toEqual({
                1: 0, 2: 0, 3: 0, 4: 0, 5: 0
            });
        });
    });

    describe('createReview', () => {
        it('should create a review successfully', async () => {
            const reviewData = {
                productId: 'product1',
                rating: 5,
                comment: 'Excellent!'
            };

            mockApiClient.createDocument.mockResolvedValue('review123');

            const result = await ReviewService.createReview(reviewData);

            expect(mockApiClient.createDocument).toHaveBeenCalledWith('reviews', {
                ...reviewData,
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date)
            });
            expect(result).toBe('review123');
        });
    });

    describe('updateReview', () => {
        it('should update a review successfully', async () => {
            const updateData = {
                rating: 4,
                comment: 'Updated review'
            };

            mockApiClient.updateDocument.mockResolvedValue(undefined);

            await ReviewService.updateReview('review123', updateData);

            expect(mockApiClient.updateDocument).toHaveBeenCalledWith('reviews', 'review123', {
                ...updateData,
                updatedAt: expect.any(Date)
            });
        });
    });

    describe('deleteReview', () => {
        it('should delete a review successfully', async () => {
            mockApiClient.deleteDocument.mockResolvedValue(undefined);

            await ReviewService.deleteReview('review123');

            expect(mockApiClient.deleteDocument).toHaveBeenCalledWith('reviews', 'review123');
        });
    });

    describe('getUserReviews', () => {
        it('should return user reviews', async () => {
            const mockReviews = [
                {
                    id: '1',
                    productId: 'product1',
                    userId: 'user1',
                    rating: 5,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];

            mockApiClient.getCollection.mockResolvedValue(mockReviews);

            const result = await ReviewService.getUserReviews('user1');

            expect(mockApiClient.getCollection).toHaveBeenCalledWith('reviews');
            expect(result).toEqual(mockReviews);
        });
    });

    describe('canUserReviewProduct', () => {
        it('should return true if user has not reviewed the product', async () => {
            mockApiClient.getCollection.mockResolvedValue([]);

            const result = await ReviewService.canUserReviewProduct('user1', 'product1');

            expect(result).toBe(true);
        });

        it('should return false if user has already reviewed the product', async () => {
            const existingReview = [{
                id: '1',
                userId: 'user1',
                productId: 'product1'
            }];

            mockApiClient.getCollection.mockResolvedValue(existingReview);

            const result = await ReviewService.canUserReviewProduct('user1', 'product1');

            expect(result).toBe(false);
        });
    });
});