"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

const textSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  showNumber = false,
  className,
}: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, i) => {
          const starNumber = i + 1;
          const isFilled = starNumber <= rating;

          return (
            <Star
              key={starNumber}
              className={cn(
                sizeClasses[size],
                isFilled
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-muted text-muted"
              )}
              aria-hidden="true"
            />
          );
        })}
      </div>
      {showNumber && (
        <span
          className={cn(
            "font-medium text-muted-foreground",
            textSizeClasses[size]
          )}
        >
          {rating}
        </span>
      )}
      <span className="sr-only">{rating} out of {maxRating} stars</span>
    </div>
  );
}
