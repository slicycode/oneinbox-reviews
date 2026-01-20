"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, CreditCard, Link2, Bell } from "lucide-react";

interface SettingsNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const settingsNavItems: SettingsNavItem[] = [
  {
    label: "Profile",
    href: "/app/settings/profile",
    icon: User,
    description: "Manage your account settings",
  },
  {
    label: "Billing",
    href: "/app/settings/billing",
    icon: CreditCard,
    description: "Manage your subscription",
  },
  {
    label: "Integrations",
    href: "/app/settings/integrations",
    icon: Link2,
    description: "Connect external services",
  },
  {
    label: "Notifications",
    href: "/app/settings/notifications",
    icon: Bell,
    description: "Configure alert preferences",
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* Sidebar Navigation */}
        <nav className="flex flex-row gap-1 overflow-x-auto pb-2 lg:w-64 lg:shrink-0 lg:flex-col lg:gap-1 lg:pb-0">
          {settingsNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
