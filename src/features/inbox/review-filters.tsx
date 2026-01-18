"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReviewFiltersInput } from "@/lib/validations/review-filters.schema";

const ratings = ["1", "2", "3", "4", "5"];

interface ReviewFiltersProps {
  defaultValues: ReviewFiltersInput;
}

export function ReviewFilters({ defaultValues }: ReviewFiltersProps) {
  const router = useRouter();
  const [ratingMin, setRatingMin] = React.useState(
    defaultValues.ratingMin?.toString() ?? "any"
  );
  const [ratingMax, setRatingMax] = React.useState(
    defaultValues.ratingMax?.toString() ?? "any"
  );
  const [dateFrom, setDateFrom] = React.useState(
    defaultValues.dateFrom ? defaultValues.dateFrom.toISOString().slice(0, 10) : ""
  );
  const [dateTo, setDateTo] = React.useState(
    defaultValues.dateTo ? defaultValues.dateTo.toISOString().slice(0, 10) : ""
  );
  const [query, setQuery] = React.useState(defaultValues.query ?? "");
  const didMountRef = React.useRef(false);

  const applyFilters = React.useCallback(() => {
    const params = new URLSearchParams();
    if (ratingMin !== "any") params.set("rating_min", ratingMin);
    if (ratingMax !== "any") params.set("rating_max", ratingMax);
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);
    if (query) params.set("q", query);
    router.push(`/app/inbox?${params.toString()}`);
  }, [dateFrom, dateTo, query, ratingMax, ratingMin, router]);

  const clearFilters = React.useCallback(() => {
    setRatingMin("any");
    setRatingMax("any");
    setDateFrom("");
    setDateTo("");
    setQuery("");
    router.push("/app/inbox");
  }, [router]);

  React.useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    const timer = window.setTimeout(() => {
      applyFilters();
    }, 400);

    return () => window.clearTimeout(timer);
  }, [applyFilters, query]);

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="flex flex-col gap-2">
          <Label>Rating min</Label>
          <Select value={ratingMin} onValueChange={setRatingMin}>
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              {ratings.map((rating) => (
                <SelectItem key={rating} value={rating}>
                  {rating}+
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Rating max</Label>
          <Select value={ratingMax} onValueChange={setRatingMax}>
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              {ratings.map((rating) => (
                <SelectItem key={rating} value={rating}>
                  {rating}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Date from</Label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Date to</Label>
          <Input
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Search</Label>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Keywords"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={applyFilters}>Apply</Button>
        <Button variant="secondary" onClick={clearFilters}>
          Clear
        </Button>
      </div>
    </div>
  );
}
