import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

type ExportHistoryItem = {
  id: string;
  status: string;
  rowCount: number | null;
  queryParams: string | null;
  createdAt: string;
  completedAt: string | null;
};

interface ExportHistoryProps {
  items: ExportHistoryItem[];
}

const formatDateTime = (value: string) => {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export function ExportHistory({ items }: ExportHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Export history</CardTitle>
        <CardDescription>
          Track the most recent CSV exports for your inbox.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No exports yet. Export your inbox to see history here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exported</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rows</TableHead>
                  <TableHead>Download</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const href = item.queryParams
                    ? `/api/app/reviews/export?${item.queryParams}`
                    : "/api/app/reviews/export";
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{formatDateTime(item.createdAt)}</span>
                          <span className="text-xs text-muted-foreground">
                            {item.completedAt
                              ? `Completed ${formatDateTime(item.completedAt)}`
                              : "Processing"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{item.status}</TableCell>
                      <TableCell>{item.rowCount ?? "—"}</TableCell>
                      <TableCell>
                        {item.status === "completed" ? (
                          <Button asChild size="sm" variant="outline">
                            <a href={href} download>
                              Download
                            </a>
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Pending
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
