"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SyncHealthFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(searchParams.get("search") ?? "");
  const [provider, setProvider] = React.useState(
    searchParams.get("provider") ?? "all"
  );
  const [status, setStatus] = React.useState(
    searchParams.get("status") ?? "all"
  );

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (provider !== "all") params.set("provider", provider);
    if (status !== "all") params.set("status", status);
    router.push(`/app/super-admin/sync-health?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch("");
    setProvider("all");
    setStatus("all");
    router.push("/app/super-admin/sync-health");
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Input
          placeholder="Search email or name"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Select value={provider} onValueChange={setProvider}>
          <SelectTrigger>
            <SelectValue placeholder="Provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All providers</SelectItem>
            <SelectItem value="google">Google</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="stale">Stale</SelectItem>
          </SelectContent>
        </Select>
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
