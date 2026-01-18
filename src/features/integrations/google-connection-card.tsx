"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface GoogleConnectionCardProps {
  isConnected: boolean;
  canDisconnect: boolean;
  accountId?: string;
  email?: string | null;
  status?: "active" | "expired" | "error" | null;
  lastAuthAt?: string | null;
}

export function GoogleConnectionCard({
  isConnected,
  canDisconnect,
  accountId,
  email,
  status,
  lastAuthAt,
}: GoogleConnectionCardProps) {
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [isDisconnecting, setIsDisconnecting] = React.useState(false);
  const router = useRouter();

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

  const handleDisconnect = async () => {
    if (isDisconnecting) {
      return;
    }

    setIsDisconnecting(true);
    try {
      const response = await fetch("/api/app/integrations/google", {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const message =
          errorData?.error?.message ||
          errorData?.error ||
          "Failed to disconnect Google";
        throw new Error(message);
      }

      toast.success("Google disconnected");
      router.refresh();
    } catch (error) {
      console.error("Disconnect error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to disconnect Google"
      );
    } finally {
      setIsDisconnecting(false);
    }
  };

  const showReconnect = isConnected && status === "expired";
  const showDisconnectGuard = isConnected && !canDisconnect;

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
              Status:{" "}
              <span className="text-foreground">
                {status
                  ? status.charAt(0).toUpperCase() + status.slice(1)
                  : "Active"}
              </span>
            </p>
            {email ? (
              <p className="text-sm text-muted-foreground">
                Connected as <span className="text-foreground">{email}</span>
              </p>
            ) : null}
            {lastAuthAt ? (
              <p className="text-xs text-muted-foreground">
                Last auth: {new Date(lastAuthAt).toLocaleString()}
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
        {showDisconnectGuard ? (
          <div className="flex flex-col gap-2 rounded-md border border-muted px-3 py-2">
            <p className="text-sm text-muted-foreground">
              Google is your only sign-in method. Set a password before
              disconnecting to keep access to your account.
            </p>
            <Button asChild variant="secondary" className="w-fit">
              <Link href="/reset-password">Set a password</Link>
            </Button>
          </div>
        ) : null}
        {!isConnected ? (
          <Button
            className="w-fit"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? "Connecting..." : "Connect Google"}
          </Button>
        ) : (
          <div className="flex flex-wrap gap-2">
            {showReconnect ? (
              <Button
                variant="secondary"
                onClick={handleConnect}
                disabled={isConnecting}
              >
                {isConnecting ? "Reconnecting..." : "Reconnect Google"}
              </Button>
            ) : null}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={isDisconnecting || showDisconnectGuard}
                >
                  {isDisconnecting ? "Disconnecting..." : "Disconnect Google"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Disconnect Google?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will stop sync jobs for this account. Historical reviews
                    are retained.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDisconnecting}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDisconnect}
                    disabled={isDisconnecting}
                  >
                    {isDisconnecting ? "Disconnecting..." : "Disconnect"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
