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
import { Badge } from "@/components/ui/badge";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Unplug,
  Clock,
  Shield,
  HelpCircle,
  ChevronDown,
  ExternalLink,
  Mail,
  Calendar,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GoogleConnectionCardProps {
  isConnected: boolean;
  canDisconnect: boolean;
  accountId?: string;
  email?: string | null;
  status?: "active" | "expired" | "error" | null;
  lastAuthAt?: string | null;
  errorMessage?: string | null;
  lastSyncAt?: string | null;
  syncStatusLabel?: string | null;
  syncRequiresAction?: boolean;
  syncError?: string | null;
  syncErrorGuidance?: string | null;
  showReconnect?: boolean;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

const statusConfig = {
  active: {
    label: "Connected",
    icon: CheckCircle2,
    variant: "default" as const,
    className: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  expired: {
    label: "Expired",
    icon: AlertTriangle,
    variant: "destructive" as const,
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  error: {
    label: "Error",
    icon: XCircle,
    variant: "destructive" as const,
    className: "bg-red-500/10 text-red-600 border-red-500/20",
  },
  disconnected: {
    label: "Not Connected",
    icon: Unplug,
    variant: "secondary" as const,
    className: "bg-muted text-muted-foreground",
  },
};

const permissionScopes = [
  {
    name: "Google Business Profile",
    description: "Read and manage your business reviews",
  },
  {
    name: "Email Address",
    description: "Identify your account",
  },
  {
    name: "Profile Information",
    description: "Display your name and avatar",
  },
];

const troubleshootingItems = [
  {
    question: "Why do I need to reconnect?",
    answer:
      "Google access tokens expire periodically for security. Reconnecting refreshes your access and ensures uninterrupted review syncing.",
  },
  {
    question: "What happens if I disconnect?",
    answer:
      "Automatic review syncing will stop. Your existing reviews remain in your inbox, but new reviews won't be imported until you reconnect.",
  },
  {
    question: "Why are my reviews not syncing?",
    answer:
      "Check that your Google Business Profile has reviews enabled. If the issue persists, try disconnecting and reconnecting your account.",
  },
  {
    question: "Is my data secure?",
    answer:
      "We only request the minimum permissions needed. Your Google credentials are never stored - we use secure OAuth tokens that can be revoked at any time.",
  },
];

export function GoogleConnectionCard({
  isConnected,
  canDisconnect,
  accountId,
  email,
  status,
  lastAuthAt,
  errorMessage,
  lastSyncAt,
  syncStatusLabel,
  syncRequiresAction = false,
  syncError,
  syncErrorGuidance,
  showReconnect = false,
}: GoogleConnectionCardProps) {
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [isDisconnecting, setIsDisconnecting] = React.useState(false);
  const [helpOpen, setHelpOpen] = React.useState(false);
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

      toast.success("Google disconnected successfully");
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

  const showDisconnectGuard = isConnected && !canDisconnect;
  const effectiveStatus = isConnected ? (status ?? "active") : "disconnected";
  const statusInfo = statusConfig[effectiveStatus];
  const StatusIcon = statusInfo.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-red-500 text-white">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </div>
            <div>
              <CardTitle className="text-lg">Google Business Profile</CardTitle>
              <CardDescription>
                Sync reviews from your Google Business listing
              </CardDescription>
            </div>
          </div>
          <Badge
            variant={statusInfo.variant}
            className={cn("flex items-center gap-1.5 w-fit", statusInfo.className)}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        {/* Error Message */}
        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3"
          >
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">
                Connection Issue
              </p>
              <p className="text-sm text-destructive/80">{errorMessage}</p>
            </div>
          </div>
        )}

        {isConnected ? (
          <>
            {/* Account Info */}
            <div className="rounded-lg border bg-muted/30 p-4">
              <h4 className="text-sm font-medium mb-3">Account Details</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium truncate">{email}</span>
                  </div>
                )}
                {lastAuthAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Connected:</span>
                    <span
                      className="font-medium"
                      title={new Date(lastAuthAt).toLocaleString()}
                    >
                      {formatRelativeTime(lastAuthAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Sync Status */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">Sync Status</h4>
                {lastSyncAt && (
                  <span
                    className="text-xs text-muted-foreground flex items-center gap-1"
                    title={new Date(lastSyncAt).toLocaleString()}
                  >
                    <Clock className="h-3 w-3" />
                    Last sync: {formatRelativeTime(lastSyncAt)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {syncRequiresAction ? (
                  <Badge
                    variant="outline"
                    className="bg-amber-500/10 text-amber-600 border-amber-500/20"
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Action Required
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-green-500/10 text-green-600 border-green-500/20"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {syncStatusLabel ?? "Active"}
                  </Badge>
                )}
              </div>
              {!lastSyncAt && (
                <p className="text-xs text-muted-foreground mt-2">
                  Reviews will begin syncing shortly after connection.
                </p>
              )}
              {syncRequiresAction && syncErrorGuidance && (
                <p className="text-xs text-amber-600 mt-2">{syncErrorGuidance}</p>
              )}
              {(syncError || syncStatusLabel === "Sync error") && (
                <p className="text-xs text-muted-foreground mt-2">
                  We encountered an issue during sync. Try reconnecting if this
                  persists.
                </p>
              )}
            </div>

            {accountId && (
              <p className="text-xs text-muted-foreground">
                Account ID: <code className="font-mono">{accountId}</code>
              </p>
            )}
          </>
        ) : (
          /* Not Connected State */
          <div className="rounded-lg border border-dashed p-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Unplug className="h-6 w-6 text-muted-foreground" />
            </div>
            <h4 className="font-medium mb-1">No Google Account Connected</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your Google Business Profile to start syncing reviews
              automatically.
            </p>
          </div>
        )}

        {/* Permission Scopes */}
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-muted-foreground hover:text-foreground"
            >
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Permissions & Data Access
              </span>
              <ChevronDown className="h-4 w-4 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 rounded-lg border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground mb-3">
                We request only the minimum permissions needed:
              </p>
              <ul className="space-y-2">
                {permissionScopes.map((scope) => (
                  <li key={scope.name} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">{scope.name}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        - {scope.description}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground mt-3">
                You can revoke access at any time from your{" "}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Google Account settings
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Disconnect Guard */}
        {showDisconnectGuard && (
          <div className="flex flex-col gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-600">
                  Cannot Disconnect
                </p>
                <p className="text-sm text-muted-foreground">
                  Google is your only sign-in method. Set a password first to
                  ensure continued access to your account.
                </p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="w-fit">
              <Link href="/reset-password">Set a Password</Link>
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t">
          {!isConnected ? (
            <Button onClick={handleConnect} disabled={isConnecting}>
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect Google Account"
              )}
            </Button>
          ) : (
            <>
              {showReconnect && (
                <Button
                  variant="default"
                  onClick={handleConnect}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Reconnecting...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reconnect Account
                    </>
                  )}
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive hover:bg-destructive/5"
                    disabled={isDisconnecting || showDisconnectGuard}
                  >
                    {isDisconnecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Disconnecting...
                      </>
                    ) : (
                      <>
                        <Unplug className="mr-2 h-4 w-4" />
                        Disconnect
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Disconnect Google Account?</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                      <div className="space-y-3">
                        <p>
                          Disconnecting will stop automatic review syncing for this
                          account.
                        </p>
                        <div className="rounded-lg border bg-muted/50 p-3 text-sm">
                          <p className="font-medium text-foreground mb-2">
                            What happens when you disconnect:
                          </p>
                          <ul className="space-y-1 text-muted-foreground">
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                              Existing reviews remain in your inbox
                            </li>
                            <li className="flex items-center gap-2">
                              <XCircle className="h-3.5 w-3.5 text-red-500" />
                              New reviews won&apos;t be imported
                            </li>
                            <li className="flex items-center gap-2">
                              <XCircle className="h-3.5 w-3.5 text-red-500" />
                              Automatic sync jobs will stop
                            </li>
                          </ul>
                        </div>
                        <p className="text-xs">
                          You can reconnect at any time to resume syncing.
                        </p>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDisconnecting}>
                      Keep Connected
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDisconnect}
                      disabled={isDisconnecting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDisconnecting ? "Disconnecting..." : "Yes, Disconnect"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>

        {/* Troubleshooting Help */}
        <Collapsible open={helpOpen} onOpenChange={setHelpOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-muted-foreground hover:text-foreground"
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Troubleshooting & FAQ
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  helpOpen && "rotate-180"
                )}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 rounded-lg border bg-muted/30 p-4 space-y-4">
              {troubleshootingItems.map((item, index) => (
                <div key={index}>
                  <p className="text-sm font-medium">{item.question}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.answer}
                  </p>
                </div>
              ))}
              <p className="text-xs text-muted-foreground pt-2 border-t">
                Still having issues?{" "}
                <a
                  href="mailto:support@oneinbox.app"
                  className="text-primary hover:underline"
                >
                  Contact support
                </a>
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
