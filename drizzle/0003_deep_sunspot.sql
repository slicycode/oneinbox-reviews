ALTER TABLE "alert_settings" ADD COLUMN "notification_frequency" text DEFAULT 'immediate' NOT NULL;--> statement-breakpoint
ALTER TABLE "alert_settings" ADD COLUMN "notify_on_all_reviews" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "alert_settings" ADD COLUMN "quiet_hours_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "alert_settings" ADD COLUMN "quiet_hours_start" time DEFAULT '22:00:00';--> statement-breakpoint
ALTER TABLE "alert_settings" ADD COLUMN "quiet_hours_end" time DEFAULT '08:00:00';