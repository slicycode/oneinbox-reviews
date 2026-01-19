"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type ExportCsvButtonProps = {
  href: string;
};

const getFilename = (value: string | null) => {
  if (!value) {
    return null;
  }
  const match = /filename="([^"]+)"/.exec(value);
  return match?.[1] ?? null;
};

export function ExportCsvButton({ href }: ExportCsvButtonProps) {
  const [isExporting, setIsExporting] = React.useState(false);
  const router = useRouter();

  const handleExport = async () => {
    if (isExporting) {
      return;
    }

    setIsExporting(true);
    try {
      const response = await fetch(href, {
        method: "GET",
        headers: {
          Accept: "text/csv",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to export reviews");
      }

      const blob = await response.blob();
      const filename =
        getFilename(response.headers.get("content-disposition")) ??
        "reviews-export.csv";

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Export started");
      router.refresh();
    } catch (error) {
      console.error("Export error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to export reviews"
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
      {isExporting ? "Exporting..." : "Export CSV"}
    </Button>
  );
}
