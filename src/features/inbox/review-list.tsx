"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReviewListItem {
  id: string;
  status: "unread" | "responded" | "needs_follow_up";
  rating: number;
  content: string;
  authorName?: string | null;
  reviewCreatedAt: string;
}

interface ReviewListProps {
  reviews: ReviewListItem[];
}

const statusLabel: Record<ReviewListItem["status"], string> = {
  unread: "Unread",
  responded: "Responded",
  needs_follow_up: "Needs follow-up",
};

export function ReviewList({ reviews }: ReviewListProps) {
  const [items, setItems] = React.useState(reviews);
  const [updating, setUpdating] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    setItems(reviews);
  }, [reviews]);

  const updateStatus = async (reviewId: string, status: ReviewListItem["status"]) => {
    setUpdating((prev) => ({ ...prev, [reviewId]: true }));
    try {
      const response = await fetch(`/api/app/reviews/${reviewId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        console.error("Failed to update status", await response.text());
        return;
      }

      const data: { id: string; status: ReviewListItem["status"] } =
        await response.json();
      setItems((prev) =>
        prev.map((item) =>
          item.id === data.id ? { ...item, status: data.status } : item
        )
      );
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setUpdating((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  if (items.length === 0) {
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
      {items.map((review) => (
        <Card key={review.id}>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-2">
              <CardTitle className="text-base">
                {review.authorName || "Anonymous"} • {review.rating}★
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>Status: {statusLabel[review.status]}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={review.status}
                onValueChange={(value) =>
                  updateStatus(review.id, value as ReviewListItem["status"])
                }
                disabled={updating[review.id]}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Update status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                  <SelectItem value="needs_follow_up">Needs follow-up</SelectItem>
                </SelectContent>
              </Select>
              <Button asChild size="sm" variant="outline">
                <Link href={`/app/inbox/${review.id}`}>View details</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {review.content}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(review.reviewCreatedAt).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
