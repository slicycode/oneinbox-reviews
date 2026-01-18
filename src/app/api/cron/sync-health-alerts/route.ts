import { NextResponse } from "next/server";
import cronAuthRequired from "@/lib/auth/cronAuthRequired";
import { processSyncHealthAlerts } from "@/lib/alerts/process-sync-health-alerts";

const handleSyncHealthAlerts = async () => {
  const result = await processSyncHealthAlerts();
  const message =
    result.sent === 0
      ? "No sync health alerts to send"
      : "Sync health alerts sent";

  return NextResponse.json({
    success: true,
    message,
    processed: result.processed,
    sent: result.sent,
    processedAt: new Date().toISOString(),
  });
};

export const GET = cronAuthRequired(handleSyncHealthAlerts);
