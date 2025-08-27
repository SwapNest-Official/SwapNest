import React from 'react';
import { Star } from 'lucide-react';

const RatingDisplay = ({ rating, reviewCount, size = 'md', showCount = true, className = '' }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const getStarSize = () => {
    switch (size) {
      case 'sm': return 'h-3 w-3';
      case 'lg': return 'h-6 w-6';
      case 'xl': return 'h-8 w-8';
      default: return 'h-4 w-4';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'lg': return 'text-sm';
      case 'xl': return 'text-base';
      default: return 'text-sm';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, index) => (
          <Star
            key={`full-${index}`}
            className={`${getStarSize()} fill-yellow-400 text-yellow-400`}
          />
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <Star className={`${getStarSize()} text-gray-300 dark:text-gray-600`} />
            <div className="absolute inset-0 overflow-hidden">
              <Star className={`${getStarSize()} fill-yellow-400 text-yellow-400`} />
            </div>
            <div className="absolute inset-0 bg-white dark:bg-gray-800" style={{ clipPath: 'inset(0 50% 0 0)' }}>
              <Star className={`${getStarSize()} text-gray-300 dark:text-gray-600`} />
            </div>
          </div>
        )}
        
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, index) => (
          <Star
            key={`empty-${index}`}
            className={`${getStarSize()} text-gray-300 dark:text-gray-600`}
          />
        ))}
      </div>
      
      {showCount && (
        <div className={`text-gray-600 dark:text-gray-400 ${getTextSize()}`}>
          <span className="font-medium">{rating.toFixed(1)}</span>
          {reviewCount > 0 && (
            <span className="ml-1">({reviewCount} review{reviewCount !== 1 ? 's' : ''})</span>
          )}
        </div>
      )}
    </div>
  );
};

export default RatingDisplay;
