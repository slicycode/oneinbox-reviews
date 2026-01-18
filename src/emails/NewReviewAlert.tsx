import * as React from "react";
import { Html, Text, Button } from "@react-email/components";
import Layout from "./components/Layout";
import { appConfig } from "@/lib/config";

export interface NewReviewAlertItem {
  rating: number;
  authorName?: string | null;
  content: string;
  reviewUrl?: string | null;
  reviewCreatedAt: string;
}

interface NewReviewAlertProps {
  userName: string;
  reviews: NewReviewAlertItem[];
  totalNew: number;
  inboxUrl: string;
}

const truncate = (value: string, length: number) =>
  value.length > length ? `${value.slice(0, length)}...` : value;

export default function NewReviewAlert({
  userName,
  reviews,
  totalNew,
  inboxUrl,
}: NewReviewAlertProps) {
  return (
    <Html>
      <Layout previewText={`${totalNew} new review${totalNew > 1 ? "s" : ""}`}>
        <Text>Hi {userName},</Text>
        <Text>
          You have {totalNew} new review{totalNew > 1 ? "s" : ""} in{" "}
          {appConfig.projectName}.
        </Text>
        {reviews.map((review, index) => (
          <div key={`${review.reviewCreatedAt}-${index}`}>
            <Text>
              {review.authorName || "Anonymous"} • {review.rating}★
            </Text>
            <Text className="text-muted">
              {new Date(review.reviewCreatedAt).toLocaleString()}
            </Text>
            <Text>{truncate(review.content, 140)}</Text>
            {review.reviewUrl ? (
              <Button
                href={review.reviewUrl}
                className="bg-primary text-primary-foreground rounded-md py-2 px-4 mt-2"
              >
                View on platform
              </Button>
            ) : null}
          </div>
        ))}
        <Button
          href={inboxUrl}
          className="bg-primary text-primary-foreground rounded-md py-2 px-4 mt-4"
        >
          Open Inbox
        </Button>
      </Layout>
    </Html>
  );
}
