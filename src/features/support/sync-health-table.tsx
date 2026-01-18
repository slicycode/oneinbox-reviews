"use client";

import * as React from "react";
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
