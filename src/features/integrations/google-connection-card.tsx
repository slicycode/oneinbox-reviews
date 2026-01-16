"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface GoogleConnectionCardProps {
  isConnected: boolean;
  accountId?: string;
  email?: string | null;
}

export function GoogleConnectionCard({
  isConnected,
  accountId,
  email,
}: GoogleConnectionCardProps) {
  const [isConnecting, setIsConnecting] = React.useState(false);

  const handleConnect = async () => {
    if (isConnecting) {
      return;
    }

    setIsConnecting(true);
    try {
      await signIn("google", { callbackUrl: "/app/integrations" });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Business Profile</CardTitle>
        <CardDescription>
          Connect Google to sync reviews into your inbox.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isConnected ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              Status: <span className="text-foreground">Active</span>
            </p>
            {email ? (
              <p className="text-sm text-muted-foreground">
                Connected as <span className="text-foreground">{email}</span>
              </p>
            ) : null}
            {accountId ? (
              <p className="text-xs text-muted-foreground">
                Account ID: {accountId}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Not connected yet. Connect your Google account to continue.
          </p>
        )}
        {!isConnected ? (
          <Button
            className="w-fit"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? "Connecting..." : "Connect Google"}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
