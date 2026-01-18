"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReviewListItem {
  id: string;
  rating: number;
  content: string;
  authorName?: string | null;
  reviewCreatedAt: string;
}

interface ReviewListProps {
  reviews: ReviewListItem[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No reviews yet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Once your Google account is connected, reviews will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardHeader>
            <CardTitle className="text-base">
              {review.authorName || "Anonymous"} • {review.rating}★
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">{review.content}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(review.reviewCreatedAt).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
