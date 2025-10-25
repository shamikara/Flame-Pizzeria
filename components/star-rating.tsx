'use client';

import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value?: number;
  count?: number;
  size?: 'sm' | 'md';
  className?: string;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
};

export function StarRating({ value = 0, count, size = 'sm', className }: StarRatingProps) {
  const clampedValue = Math.min(Math.max(value, 0), 5);
  const stars = Array.from({ length: 5 }, (_, index) => {
    const threshold = index + 1;
    if (clampedValue >= threshold) {
      return (
        <Star
          key={index}
          className={cn(sizeMap[size], 'text-yellow-400 fill-yellow-400')}
        />
      );
    }
    if (clampedValue > threshold - 1 && clampedValue < threshold) {
      return (
        <StarHalf
          key={index}
          className={cn(sizeMap[size], 'text-yellow-400 fill-yellow-400')}
        />
      );
    }
    return (
      <Star
        key={index}
        className={cn(sizeMap[size], 'text-muted-foreground')}
      />
    );
  });

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">{stars}</div>
      <span className="text-xs font-medium text-muted-foreground">
        {clampedValue.toFixed(1)}{typeof count === 'number' ? ` (${count})` : ''}
      </span>
    </div>
  );
}
