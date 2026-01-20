DROP INDEX "subscriptions_user_id_unique";--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "plan_tier" text DEFAULT 'free' NOT NULL;