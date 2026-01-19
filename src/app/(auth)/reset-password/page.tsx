import { Metadata } from "next";
import Link from "next/link";
import { appConfig } from "@/lib/config";
import { ResetPasswordForm } from "@/features/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Set or Reset Password",
  description: `Set or reset your ${appConfig.projectName} password`,
};

export default function ResetPasswordPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          Set or Reset Password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we&apos;ll send you a link to set or reset your password.
        </p>
      </div>

      <ResetPasswordForm />

      <div className="mt-6 text-center">
        <Link
          href="/sign-in"
          className="text-sm text-primary hover:text-primary/90 underline underline-offset-4"
        >
          Back to Sign In
        </Link>
      </div>
    </>
  );
}
