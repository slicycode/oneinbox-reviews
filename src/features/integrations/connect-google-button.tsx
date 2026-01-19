"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { getGoogleConnectOptions } from "../../lib/auth/google-connect";

type ConnectGoogleButtonProps = {
  label: string;
};

export function ConnectGoogleButton({ label }: ConnectGoogleButtonProps) {
  const [isConnecting, setIsConnecting] = React.useState(false);

  const handleConnect = async () => {
    if (isConnecting) {
      return;
    }

    setIsConnecting(true);
    try {
      const options = getGoogleConnectOptions();
      await signIn(options.provider, { callbackUrl: options.callbackUrl });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Button size="lg" className="w-fit" onClick={handleConnect} disabled={isConnecting}>
      {isConnecting ? "Connecting..." : label}
    </Button>
  );
}
