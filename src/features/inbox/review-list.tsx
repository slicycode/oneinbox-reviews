"use client";

import * as React from "react";
import Link from "next/link";
import { Inbox, ChevronDown, ChevronUp, User, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { StarRating } from "@/components/ui/star-rating";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatReviewLimit, formatRetentionDays } from "@/lib/plans/format";

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
  totalCount?: number;
  limit?: number | null;
  isFreePlan?: boolean;
  retentionDays?: number;
  searchQuery?: string;
}

const statusConfig: Record<
  ReviewListItem["status"],
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    className?: string;
  }
> = {
  unread: {
    label: "Unread",
    variant: "secondary",
    className:
      "bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300",
  },
  responded: {
    label: "Responded",
    variant: "secondary",
    className:
      "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/50 dark:text-green-300",
  },
  needs_follow_up: {
    label: "Follow-up",
    variant: "secondary",
    className:
      "bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/50 dark:text-amber-300",
  },
};

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes <= 1 ? "Just now" : `${diffMinutes}m ago`;
    }
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString();
}

// Highlight matching text in content
function HighlightedText({
  text,
  query,
}: {
  text: string;
  query?: string;
}) {
  if (!query || !text) {
    return <>{text}</>;
  }

  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, "gi"));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={index}
            className="bg-yellow-200 dark:bg-yellow-800 text-inherit rounded-sm px-0.5"
          >
            {part}
          </mark>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        )
      )}
    </>
  );
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function ReviewCard({
  review,
  updating,
  onStatusChange,
  searchQuery,
}: {
  review: ReviewListItem;
  updating: boolean;
  onStatusChange: (status: ReviewListItem["status"]) => void;
  searchQuery?: string;
}) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const contentRef = React.useRef<HTMLParagraphElement>(null);
  const [isTruncated, setIsTruncated] = React.useState(false);

  React.useEffect(() => {
    const el = contentRef.current;
    if (el) {
      setIsTruncated(el.scrollHeight > el.clientHeight);
    }
  }, [review.content]);

  const status = statusConfig[review.status];

  return (
    <div
      className={cn(
        "group relative rounded-lg border bg-card p-4 transition-all hover:shadow-md",
        review.status === "unread" && "border-l-4 border-l-blue-500"
      )}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Author & Rating */}
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">
                <HighlightedText
                  text={review.authorName || "Anonymous"}
                  query={searchQuery}
                />
              </span>
              <Badge
                variant={status.variant}
                className={cn("text-xs", status.className)}
              >
                {status.label}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <StarRating rating={review.rating} size="sm" />
              <span className="text-xs">
                {formatRelativeDate(review.reviewCreatedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Select
            value={review.status}
            onValueChange={(value) =>
              onStatusChange(value as ReviewListItem["status"])
            }
            disabled={updating}
          >
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="responded">Responded</SelectItem>
              <SelectItem value="needs_follow_up">Follow-up</SelectItem>
            </SelectContent>
          </Select>
          <Button asChild size="sm" variant="outline" className="h-8">
            <Link href={`/app/inbox/${review.id}`}>View</Link>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-3">
        <p
          ref={contentRef}
          className={cn(
            "text-sm text-muted-foreground",
            !isExpanded && "line-clamp-2"
          )}
        >
          {searchQuery ? (
            <HighlightedText
              text={review.content || "No review content"}
              query={searchQuery}
            />
          ) : (
            review.content || "No review content"
          )}
        </p>
        {isTruncated && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-1 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            {isExpanded ? (
              <>
                Show less <ChevronUp className="h-3 w-3" />
              </>
            ) : (
              <>
                Read more <ChevronDown className="h-3 w-3" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export function ReviewList({
  reviews,
  totalCount,
  limit,
  isFreePlan,
  retentionDays,
  searchQuery,
}: ReviewListProps) {
  const [items, setItems] = React.useState(reviews);
  const [updating, setUpdating] = React.useState<Record<string, boolean>>({});

  const showLimitWarning =
    isFreePlan &&
    limit !== null &&
    totalCount !== undefined &&
    totalCount > (limit ?? 0);
  const displayedCount = items.length;
  const hasLimit = limit !== null && limit !== undefined;
  const showRetentionInfo = isFreePlan && retentionDays !== undefined;
  const isSearching = searchQuery && searchQuery.trim() !== "";

  React.useEffect(() => {
    setItems(reviews);
  }, [reviews]);

  const updateStatus = async (
    reviewId: string,
    status: ReviewListItem["status"]
  ) => {
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

  // Empty state for search with no results
  if (items.length === 0 && isSearching) {
    return (
      <EmptyState
        icon={SearchX}
        title="No reviews found"
        description={`No reviews match your search for "${searchQuery}". Try different keywords or clear the search.`}
      />
    );
  }

  // Empty state for no reviews at all
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No reviews yet"
        description="If you just connected Google, your first sync can take a few minutes. You can refresh or check your integration status."
        action={{
          label: "Go to integrations",
          href: "/app/integrations",
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {(hasLimit || showRetentionInfo || isSearching) &&
        totalCount !== undefined && (
          <div className="flex flex-col gap-2 rounded-lg border bg-muted/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
              <span>
                {isSearching ? (
                  <>
                    Found {displayedCount}{" "}
                    {displayedCount === 1 ? "review" : "reviews"} matching your
                    search
                  </>
                ) : (
                  <>
                    Showing {displayedCount} of {totalCount} reviews
                    {showLimitWarning &&
                      limit !== undefined &&
                      ` (limited to ${formatReviewLimit(limit)} on Free plan)`}
                  </>
                )}
              </span>
              {showRetentionInfo && retentionDays !== undefined && !isSearching && (
                <span>
                  Data retention: {formatRetentionDays(retentionDays)} on Free
                  plan
                </span>
              )}
            </div>
            {(showLimitWarning || showRetentionInfo) && !isSearching && (
              <a
                href="/app/settings/billing"
                className="text-sm font-medium text-primary hover:underline"
              >
                Upgrade for more
              </a>
            )}
          </div>
        )}

      <div className="flex flex-col gap-3">
        {items.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            updating={updating[review.id] ?? false}
            onStatusChange={(status) => updateStatus(review.id, status)}
            searchQuery={searchQuery}
          />
        ))}
      </div>
    </div>
  );
}
