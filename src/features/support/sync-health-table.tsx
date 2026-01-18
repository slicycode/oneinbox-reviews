"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type SyncHealthRow = {
  userId: string;
  provider: string;
  status: string;
  lastSuccessAt: string | null;
  lastAttemptAt: string | null;
  lastError: string | null;
  email: string | null;
  name: string | null;
};

interface SyncHealthTableProps {
  rows: SyncHealthRow[];
}

export function SyncHealthTable({ rows }: SyncHealthTableProps) {
  const [triggering, setTriggering] = React.useState<Record<string, boolean>>({});

  const triggerSync = async (userId: string, provider: string) => {
    const key = `${userId}-${provider}`;
    setTriggering((prev) => ({ ...prev, [key]: true }));
    try {
      const response = await fetch("/api/super-admin/sync-health/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, provider }),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error?.message ?? "Failed to trigger re-sync");
        return;
      }
      toast.success("Manual re-sync queued");
    } catch (error) {
      console.error("Failed to trigger re-sync:", error);
      toast.error("Something went wrong");
    } finally {
      setTriggering((prev) => ({ ...prev, [key]: false }));
    }
  };

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No sync health entries match the current filters.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last success</TableHead>
          <TableHead>Last attempt</TableHead>
          <TableHead>Error</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={`${row.userId}-${row.provider}`}>
            <TableCell>
              <div className="flex flex-col">
                <span>{row.name ?? "Unknown"}</span>
                <span className="text-xs text-muted-foreground">
                  {row.email ?? "No email"}
                </span>
              </div>
            </TableCell>
            <TableCell>{row.provider}</TableCell>
            <TableCell>{row.status}</TableCell>
            <TableCell>{row.lastSuccessAt ?? "—"}</TableCell>
            <TableCell>{row.lastAttemptAt ?? "—"}</TableCell>
            <TableCell className="max-w-[260px] whitespace-normal">
              {row.lastError ?? "—"}
            </TableCell>
            <TableCell>
              <Button
                size="sm"
                variant="outline"
                onClick={() => triggerSync(row.userId, row.provider)}
                disabled={triggering[`${row.userId}-${row.provider}`]}
              >
                {triggering[`${row.userId}-${row.provider}`]
                  ? "Queuing..."
                  : "Trigger re-sync"}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
