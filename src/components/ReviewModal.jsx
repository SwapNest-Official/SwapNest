import React, { useState } from 'react';
import { Star, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const ReviewModal = ({ isOpen, onClose, sellerId, sellerName, currentUserId, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debug props
  console.log("ReviewModal props:", { isOpen, sellerId, sellerName, currentUserId });

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (review.trim().length < 10) {
      toast.error('Review must be at least 10 characters long');
      return;
    }

    if (!sellerId) {
      console.error('Seller ID is missing:', sellerId);
      toast.error('Seller information is missing. Please refresh the page.');
      return;
    }

    if (!currentUserId) {
      console.error('Current user ID is missing:', currentUserId);
      toast.error('User authentication error. Please login again.');
      return;
    }

    const reviewData = {
      sellerId,
      reviewerId: currentUserId,
      rating,
      review: review.trim(),
      createdAt: new Date()
    };

    console.log("Submitting review data:", reviewData);

    setIsSubmitting(true);
    try {
      await onSubmit(reviewData);
      
      toast.success('Review submitted successfully!');
      onClose();
      setRating(0);
      setReview('');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Review {sellerName}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Rating */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Rating *
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-all duration-200 transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {rating > 0 && `${rating} star${rating > 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Review Text */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Review *
          </label>
          <Textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience with this seller..."
            className="min-h-[100px] resize-none border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            maxLength={500}
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-right">
            {review.length}/500
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0 || review.trim().length < 10}
            className="flex-1 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Submit Review
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
