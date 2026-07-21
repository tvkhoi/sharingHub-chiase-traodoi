import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  size = 18,
  interactive = false,
  onRate,
}) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }).map((_, idx) => {
        const starValue = idx + 1;
        const isFilled = starValue <= Math.round(rating);

        return (
          <Star
            key={idx}
            size={size}
            className={`${
              isFilled ? 'text-brand-amber fill-amber-400' : 'text-gray-500 opacity-40'
            } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={() => interactive && onRate && onRate(starValue)}
          />
        );
      })}
    </div>
  );
};
