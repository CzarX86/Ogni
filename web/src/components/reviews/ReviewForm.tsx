import React, { useState } from 'react';
import { ReviewService } from '@/shared/services/reviewService';
import { CreateReviewRequest } from '@/shared/models/review';
import { Star, Send } from 'lucide-react';
import { log } from 'shared/utils/logger';

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const reviewData: CreateReviewRequest = {
        productId,
        rating,
        comment: comment.trim() || undefined
      };

      await ReviewService.createReview(reviewData);

      // Reset form
      setRating(0);
      setComment('');
      onReviewSubmitted?.();
    } catch (err) {
      setError('Failed to submit review. Please try again.');
      log.error('Error submitting review:', { err });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => {
      const starRating = i + 1;
      const isActive = starRating <= (hoverRating || rating);

      return (
        <button
          key={i}
          type="button"
          className="focus:outline-none"
          aria-label={`Rate ${starRating} star${starRating > 1 ? 's' : ''}`}
          onMouseEnter={() => setHoverRating(starRating)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => setRating(starRating)}
        >
          <Star
            className={`w-8 h-8 ${
              isActive ? 'text-yellow-400 fill-current' : 'text-gray-300'
            } transition-colors`}
          />
        </button>
      );
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Write a Review
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <div className="flex space-x-1">
            {renderStars()}
          </div>
          {(rating > 0 || hoverRating > 0) && (
            <p className="text-sm text-gray-600 mt-1">
              {hoverRating || rating} out of 5 stars
            </p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this product..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/500 characters
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || rating === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
          <span>{submitting ? 'Submitting...' : 'Submit Review'}</span>
        </button>
      </form>
    </div>
  );
};