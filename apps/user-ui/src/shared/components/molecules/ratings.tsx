import { Star } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface IRatingProps {
  rating: number;
  totalStars?: number;
  size?: number;
  className?: string;
  showLabel?: boolean;
}

const Ratings = ({ rating, totalStars = 5, size = 20, className, showLabel = true }: IRatingProps) => {
  // Validate and clamp the rating to prevent invalid array lengths
  const validRating = Math.max(0, Math.min(totalStars, isNaN(rating) ? 0 : rating));
  const fullStars = Math.floor(validRating);
  const partialStar = validRating - fullStars;
  const emptyStars = Math.max(0, totalStars - fullStars - (partialStar > 0 ? 1 : 0));

  return (
    <div className={twMerge('flex items-center gap-2', className)}>
      <div className="flex items-center">
        {[...new Array(fullStars)].map((_, i) => (
          <Star key={i} size={size} className="text-primary fill-primary" />
        ))}
        {partialStar > 0 && (
          <div className="relative">
            <Star
              key="partial"
              size={size}
              className="text-primary"
              style={{
                clipPath: `inset(0 ${100 - partialStar * 100}% 0 0)`,
              }}
            />
            <Star
              key="partial-bg"
              size={size}
              className="absolute left-0 top-0 text-muted-foreground/50"
              style={{
                zIndex: -1,
              }}
            />
          </div>
        )}
        {[...new Array(emptyStars)].map((_, i) => (
          <Star key={i + fullStars + 1} size={size} className="text-muted-foreground/50" />
        ))}
      </div>
      {showLabel && <p className="text-sm text-muted-foreground">{validRating.toFixed(1)}</p>}
    </div>
  );
};

export default Ratings;
