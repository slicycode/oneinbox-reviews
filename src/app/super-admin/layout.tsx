import React from "react";
import SuperAdminLayoutClient from "./layout-client";

// Force dynamic rendering for all super-admin pages
export const dynamic = "force-dynamic";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SuperAdminLayoutClient>{children}</SuperAdminLayoutClient>;
}
