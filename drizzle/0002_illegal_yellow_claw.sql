CREATE TABLE "onboarding_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"connect_google" boolean DEFAULT false NOT NULL,
	"sync_reviews" boolean DEFAULT false NOT NULL,
	"view_inbox" boolean DEFAULT false NOT NULL,
	"setup_alerts" boolean DEFAULT false NOT NULL,
	"dismissed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "onboarding_progress" ADD CONSTRAINT "onboarding_progress_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "onboarding_progress_user_id_idx" ON "onboarding_progress" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "onboarding_progress_user_id_unique" ON "onboarding_progress" USING btree ("user_id");