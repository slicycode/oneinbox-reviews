import * as React from "react";
import { Html, Text, Button } from "@react-email/components";
import Layout from "./components/Layout";
import { appConfig } from "@/lib/config";

interface SyncHealthAlertProps {
  userName: string;
  status: "failed" | "stale";
  provider: string;
  lastAttemptAt?: string | null;
  lastSuccessAt?: string | null;
  inboxUrl: string;
}

const statusLabel: Record<SyncHealthAlertProps["status"], string> = {
  failed: "Sync failed",
  stale: "Sync stale",
};

export default function SyncHealthAlert({
  userName,
  status,
  provider,
  lastAttemptAt,
  lastSuccessAt,
  inboxUrl,
}: SyncHealthAlertProps) {
  const providerLabel =
    provider.charAt(0).toUpperCase() + provider.slice(1).toLowerCase();

  return (
    <Html>
      <Layout previewText={`${statusLabel[status]} on ${providerLabel}`}>
        <Text>Hi {userName},</Text>
        <Text>
          {statusLabel[status]} for your {providerLabel} reviews in{" "}
          {appConfig.projectName}.
        </Text>
        {lastAttemptAt ? (
          <Text className="text-muted">Last attempt: {lastAttemptAt}</Text>
        ) : null}
        {lastSuccessAt ? (
          <Text className="text-muted">Last success: {lastSuccessAt}</Text>
        ) : null}
        <Text>
          Please reconnect your account or trigger a re-sync to restore review
          freshness.
        </Text>
        <Button
          href={inboxUrl}
          className="bg-primary text-primary-foreground rounded-md py-2 px-4 mt-4"
        >
          Open Inbox
        </Button>
      </Layout>
    </Html>
  );
}
