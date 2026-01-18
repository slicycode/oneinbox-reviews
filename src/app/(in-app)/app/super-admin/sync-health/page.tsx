import { auth, signIn } from "@/auth";
import { SyncHealthFilters } from "@/features/support/sync-health-filters";
import { SyncHealthTable } from "@/features/support/sync-health-table";

const isSuperAdmin = (email?: string | null) => {
  const allowList = process.env.SUPER_ADMIN_EMAILS?.split(",") ?? [];
  return email ? allowList.includes(email) : false;
};

export default async function SyncHealthPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    return signIn();
  }

  if (!isSuperAdmin(session.user.email)) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold">Not authorized</h1>
        <p className="text-sm text-muted-foreground">
          This page is restricted to super admins.
        </p>
      </div>
    );
  }

  const rawParams = await searchParams;
  const search = typeof rawParams.search === "string" ? rawParams.search : "";
  const provider =
    typeof rawParams.provider === "string" ? rawParams.provider : "";
  const status = typeof rawParams.status === "string" ? rawParams.status : "";

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (provider && provider !== "all") params.set("provider", provider);
  if (status && status !== "all") params.set("status", status);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const response = await fetch(
    `${baseUrl}/api/super-admin/sync-health?${params.toString()}`,
    { cache: "no-store" }
  );

  const result = await response.json();
  const data = Array.isArray(result.rows) ? result.rows : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Sync Health (Support)
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor review sync status across customer accounts.
        </p>
      </div>
      <SyncHealthFilters />
      <SyncHealthTable rows={data} />
    </div>
  );
}
