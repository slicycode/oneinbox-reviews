"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Database, Trash2 } from "lucide-react";

export default function DevToolsPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const seedReviews = async () => {
    setIsSeeding(true);
    try {
      const response = await fetch("/api/dev/seed-reviews", {
        method: "POST",
      });
      const data = await response.json();

      if (response.ok) {
        toast.success(`Seeded reviews! Total: ${data.totalReviews}`);
      } else {
        toast.error(data.error || "Failed to seed reviews");
      }
    } catch (error) {
      toast.error("Failed to seed reviews");
      console.error(error);
    } finally {
      setIsSeeding(false);
    }
  };

  const clearReviews = async () => {
    setIsClearing(true);
    try {
      const response = await fetch("/api/dev/seed-reviews", {
        method: "DELETE",
      });
      const data = await response.json();

      if (response.ok) {
        toast.success("Cleared all seeded reviews!");
      } else {
        toast.error(data.error || "Failed to clear reviews");
      }
    } catch (error) {
      toast.error("Failed to clear reviews");
      console.error(error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dev Tools</h1>
        <p className="text-sm text-muted-foreground">
          Development utilities for testing (only works in development mode)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Review Seeding</CardTitle>
          <CardDescription>
            Seed test reviews into your account to test the inbox, dashboard, and other features
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button onClick={seedReviews} disabled={isSeeding}>
            {isSeeding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Seeding...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Seed 15 Test Reviews
              </>
            )}
          </Button>
          <Button variant="destructive" onClick={clearReviews} disabled={isClearing}>
            {isClearing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Clearing...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Seeded Reviews
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
