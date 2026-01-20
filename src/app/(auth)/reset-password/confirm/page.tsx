import { Suspense } from "react";
import ResetPasswordConfirmForm from "./ResetPasswordConfirmForm";

// Force dynamic rendering to avoid prerender issues with useSearchParams
export const dynamic = "force-dynamic";

function LoadingFallback() {
  return (
    <div className="flex flex-col gap-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          Reset Your Password
        </h1>
        <p className="text-sm text-muted-foreground">
          Loading...
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordConfirmPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordConfirmForm />
    </Suspense>
  );
}
