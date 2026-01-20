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
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { X, Filter, ArrowUpDown, Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ReviewFiltersInput,
  SortBy,
} from "@/lib/validations/review-filters.schema";

const ratings = ["1", "2", "3", "4", "5"];

const statusOptions = [
  { value: "unread", label: "Unread" },
  { value: "responded", label: "Responded" },
  { value: "needs_follow_up", label: "Needs Follow-up" },
];

const sortOptions = [
  { value: "date_newest", label: "Newest first" },
  { value: "date_oldest", label: "Oldest first" },
  { value: "rating_highest", label: "Highest rated" },
  { value: "rating_lowest", label: "Lowest rated" },
];

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
    defaultValues.dateFrom
      ? defaultValues.dateFrom.toISOString().slice(0, 10)
      : ""
  );
  const [dateTo, setDateTo] = React.useState(
    defaultValues.dateTo ? defaultValues.dateTo.toISOString().slice(0, 10) : ""
  );
  const [query, setQuery] = React.useState(defaultValues.query ?? "");
  const [status, setStatus] = React.useState(defaultValues.status ?? "any");
  const [sortBy, setSortBy] = React.useState(
    defaultValues.sortBy ?? "date_newest"
  );
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const didMountRef = React.useRef(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const applyFilters = React.useCallback(() => {
    const params = new URLSearchParams();
    if (ratingMin !== "any") params.set("rating_min", ratingMin);
    if (ratingMax !== "any") params.set("rating_max", ratingMax);
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);
    if (query) params.set("q", query);
    if (status !== "any") params.set("status", status);
    if (sortBy !== "date_newest") params.set("sort", sortBy);
    router.push(`/app/inbox?${params.toString()}`);
  }, [dateFrom, dateTo, query, ratingMax, ratingMin, status, sortBy, router]);

  const clearSearch = React.useCallback(() => {
    setQuery("");
    const params = new URLSearchParams();
    if (ratingMin !== "any") params.set("rating_min", ratingMin);
    if (ratingMax !== "any") params.set("rating_max", ratingMax);
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);
    if (status !== "any") params.set("status", status);
    if (sortBy !== "date_newest") params.set("sort", sortBy);
    router.push(`/app/inbox?${params.toString()}`);
    searchInputRef.current?.focus();
  }, [dateFrom, dateTo, ratingMax, ratingMin, status, sortBy, router]);

  const clearFilters = React.useCallback(() => {
    setRatingMin("any");
    setRatingMax("any");
    setDateFrom("");
    setDateTo("");
    setQuery("");
    setStatus("any");
    setSortBy("date_newest");
    router.push("/app/inbox");
  }, [router]);

  // Check if any filters are active (excluding search and sort)
  const hasActiveFilters =
    ratingMin !== "any" ||
    ratingMax !== "any" ||
    dateFrom !== "" ||
    dateTo !== "" ||
    status !== "any";

  // Count active filters (excluding sort and search)
  const activeFilterCount = [
    ratingMin !== "any",
    ratingMax !== "any",
    dateFrom !== "",
    dateTo !== "",
    status !== "any",
  ].filter(Boolean).length;

  const hasSearchQuery = query.trim() !== "";

  // Debounced search
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
    <div className="flex flex-col gap-4">
      {/* Search Bar - Prominent */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={searchInputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search reviews by content or author..."
          className="pl-10 pr-10 h-11"
        />
        {hasSearchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-muted"
            aria-label="Clear search"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Search indicator */}
      {hasSearchQuery && (
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="secondary" className="gap-1">
            <Search className="h-3 w-3" />
            Searching: &quot;{query}&quot;
          </Badge>
          <button
            onClick={clearSearch}
            className="text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Filters Section - Collapsible */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 text-sm font-medium hover:text-primary">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFilterCount}
                </Badge>
              )}
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  filtersOpen && "rotate-180"
                )}
              />
            </button>
          </CollapsibleTrigger>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <Select
              value={sortBy}
              onValueChange={(value) => {
                setSortBy(value as SortBy);
              }}
            >
              <SelectTrigger className="w-[150px] h-9">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <CollapsibleContent>
          <div className="mt-3 rounded-lg border p-4">
            {/* Filter grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any status</SelectItem>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">
                  Rating min
                </Label>
                <Select value={ratingMin} onValueChange={setRatingMin}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    {ratings.map((rating) => (
                      <SelectItem key={rating} value={rating}>
                        {rating}+ stars
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">
                  Rating max
                </Label>
                <Select value={ratingMax} onValueChange={setRatingMax}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    {ratings.map((rating) => (
                      <SelectItem key={rating} value={rating}>
                        {rating} stars
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">
                  Date from
                </Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">Date to</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
              <Button size="sm" onClick={applyFilters}>
                Apply Filters
              </Button>
              {hasActiveFilters && (
                <Button size="sm" variant="ghost" onClick={clearFilters}>
                  <X className="mr-1 h-3 w-3" />
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
