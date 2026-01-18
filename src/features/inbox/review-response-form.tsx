"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  reviewResponseSchema,
} from "@/lib/validations/review-response.schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ReviewResponseFormValues = {
  response: string;
};

type ReviewResponseItem = {
  id: string;
  status: "pending" | "sent" | "failed";
  responseText: string;
  authorName: string | null;
  authorEmail: string | null;
  createdAt: string;
  sentAt: string | null;
};

type ReviewDraftItem = {
  id: string;
  responseText: string;
  updatedAt: string;
};

interface ReviewResponseFormProps {
  reviewId: string;
  initialResponses: ReviewResponseItem[];
  initialDraft: ReviewDraftItem | null;
}

const statusLabel: Record<ReviewResponseItem["status"], string> = {
  pending: "Pending",
  sent: "Sent",
  failed: "Failed",
};

export function ReviewResponseForm({
  reviewId,
  initialResponses,
  initialDraft,
}: ReviewResponseFormProps) {
  const [responses, setResponses] = React.useState(initialResponses);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [draft, setDraft] = React.useState<ReviewDraftItem | null>(
    initialDraft
  );
  const [isDraftSaving, setIsDraftSaving] = React.useState(false);

  const form = useForm<ReviewResponseFormValues>({
    resolver: zodResolver(reviewResponseSchema),
    defaultValues: { response: initialDraft?.responseText ?? "" },
  });

  const onSubmit = async (values: ReviewResponseFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/app/reviews/${reviewId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        console.error("Failed to send response", await response.text());
        return;
      }

      const data: { response: ReviewResponseItem } = await response.json();
      setResponses((prev) => [data.response, ...prev]);
      if (draft) {
        await deleteDraft();
      }
      form.reset();
    } catch (error) {
      console.error("Failed to send response", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveDraft = async () => {
    const values = form.getValues();
    if (!values.response.trim()) {
      return;
    }

    setIsDraftSaving(true);
    try {
      const response = await fetch(`/api/app/reviews/${reviewId}/draft`, {
        method: draft ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        console.error("Failed to save draft", await response.text());
        return;
      }

      const data: { draft: ReviewDraftItem } = await response.json();
      setDraft(data.draft);
    } catch (error) {
      console.error("Failed to save draft", error);
    } finally {
      setIsDraftSaving(false);
    }
  };

  const deleteDraft = async () => {
    if (!draft) return;
    try {
      const response = await fetch(`/api/app/reviews/${reviewId}/draft`, {
        method: "DELETE",
      });

      if (!response.ok) {
        console.error("Failed to delete draft", await response.text());
        return;
      }

      setDraft(null);
      form.reset({ response: "" });
    } catch (error) {
      console.error("Failed to delete draft", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Response</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="response">Write a response</Label>
            <Textarea
              id="response"
              rows={4}
              {...form.register("response")}
            />
            {form.formState.errors.response ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.response.message}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send response"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={saveDraft}
              disabled={isDraftSaving}
            >
              {isDraftSaving ? "Saving..." : draft ? "Update draft" : "Save draft"}
            </Button>
            {draft ? (
              <Button type="button" variant="ghost" onClick={deleteDraft}>
                Delete draft
              </Button>
            ) : null}
          </div>
        </form>
        {draft ? (
          <p className="text-xs text-muted-foreground">
            Draft last saved {new Date(draft.updatedAt).toLocaleString()}
          </p>
        ) : null}
        {responses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No responses have been sent yet.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {responses.map((item) => (
              <div
                key={item.id}
                className="rounded-md border p-3 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>Status: {statusLabel[item.status]}</span>
                  <span>
                    By {item.authorName || item.authorEmail || "Unknown"}
                  </span>
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                </div>
                <p className="mt-2">{item.responseText}</p>
                {item.sentAt ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Sent at {new Date(item.sentAt).toLocaleString()}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
