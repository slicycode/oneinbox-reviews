CREATE TYPE "public"."transaction_type" AS ENUM('credit', 'debit', 'expired');--> statement-breakpoint
CREATE TYPE "public"."review_audit_event" AS ENUM('status_change');--> statement-breakpoint
CREATE TYPE "public"."review_export_status" AS ENUM('completed', 'failed', 'queued');--> statement-breakpoint
CREATE TYPE "public"."review_response_status" AS ENUM('pending', 'sent', 'failed', 'draft');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('unread', 'responded', 'needs_follow_up');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'trialing', 'past_due', 'canceled', 'paused', 'none');--> statement-breakpoint
CREATE TYPE "public"."connection_status" AS ENUM('active', 'expired', 'error');--> statement-breakpoint
CREATE TABLE "account_deletion_job" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp,
	"error" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alert_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"email_alerts_enabled" boolean DEFAULT false NOT NULL,
	"negative_review_threshold" integer DEFAULT 2 NOT NULL,
	"alerts_paused" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "billing_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"country" text NOT NULL,
	"state" text NOT NULL,
	"city" text NOT NULL,
	"street" text NOT NULL,
	"zipcode" text NOT NULL,
	"is_business_customer" boolean DEFAULT false NOT NULL,
	"tax_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"company" text,
	"message" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"read_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "coupon" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"userId" text,
	"createdAt" timestamp DEFAULT now(),
	"usedAt" timestamp,
	"expired" boolean DEFAULT false,
	CONSTRAINT "coupon_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "credit_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"transaction_type" "transaction_type" NOT NULL,
	"credit_type" text NOT NULL,
	"amount" integer NOT NULL,
	"payment_id" text,
	"expiration_date" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_deletion_job" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provider" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"reason" text NOT NULL,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp,
	"error" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paypal_access_tokens" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paypal_context" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"plan_id" text,
	"user_id" text,
	"frequency" text NOT NULL,
	"paypal_order_id" text,
	"paypal_subscription_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"purchase_type" text DEFAULT 'plan' NOT NULL,
	"credit_type" text,
	"credit_amount" text
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"codename" text,
	"default" boolean DEFAULT false,
	"requiredCouponCount" integer DEFAULT 0,
	"hasOnetimePricing" boolean DEFAULT false,
	"hasMonthlyPricing" boolean DEFAULT false,
	"hasYearlyPricing" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now(),
	"monthlyPrice" integer,
	"monthlyPriceAnchor" integer,
	"monthlyStripePriceId" text,
	"monthlyLemonSqueezyVariantId" text,
	"monthlyDodoProductId" text,
	"monthlyPaddlePriceId" text,
	"monthlyPaypalPlanId" text,
	"yearlyPrice" integer,
	"yearlyPriceAnchor" integer,
	"yearlyStripePriceId" text,
	"yearlyLemonSqueezyVariantId" text,
	"yearlyDodoProductId" text,
	"yearlyPaddlePriceId" text,
	"yearlyPaypalPlanId" text,
	"onetimePrice" integer,
	"onetimePriceAnchor" integer,
	"onetimeStripePriceId" text,
	"onetimeLemonSqueezyVariantId" text,
	"onetimeDodoProductId" text,
	"onetimePaddlePriceId" text,
	"onetimePaypalPlanId" text,
	"quotas" jsonb,
	CONSTRAINT "plans_codename_unique" UNIQUE("codename")
);
--> statement-breakpoint
CREATE TABLE "review_audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"review_id" text NOT NULL,
	"user_id" text NOT NULL,
	"event_type" "review_audit_event" NOT NULL,
	"from_status" "review_status",
	"to_status" "review_status",
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_exports" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"status" "review_export_status" DEFAULT 'completed' NOT NULL,
	"query_params" text,
	"row_count" integer,
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "review_responses" (
	"id" text PRIMARY KEY NOT NULL,
	"review_id" text NOT NULL,
	"user_id" text NOT NULL,
	"provider" text NOT NULL,
	"response_text" text NOT NULL,
	"author_name" text,
	"author_email" text,
	"status" "review_response_status" DEFAULT 'pending' NOT NULL,
	"provider_response_id" text,
	"error_message" text,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_sync_job" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provider" text NOT NULL,
	"job_type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"idempotency_key" text NOT NULL,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp,
	"error" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_sync_status" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provider" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"last_success_at" timestamp,
	"last_attempt_at" timestamp,
	"last_error" text,
	"last_alert_at" timestamp,
	"last_alert_status" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provider" text NOT NULL,
	"provider_review_id" text NOT NULL,
	"status" "review_status" DEFAULT 'unread' NOT NULL,
	"rating" integer NOT NULL,
	"content" text NOT NULL,
	"author_name" text,
	"author_url" text,
	"review_url" text,
	"reply_url" text,
	"location_name" text,
	"review_created_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"dodo_subscription_id" text,
	"dodo_product_id" text,
	"dodo_customer_id" text,
	"status" "subscription_status" DEFAULT 'none' NOT NULL,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"trial_start" timestamp,
	"trial_end" timestamp,
	"canceled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	"connection_status" "connection_status" DEFAULT 'active',
	"last_auth_at" timestamp,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "authenticator" (
	"credentialID" text NOT NULL,
	"userId" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"credentialPublicKey" text NOT NULL,
	"counter" integer NOT NULL,
	"credentialDeviceType" text NOT NULL,
	"credentialBackedUp" boolean NOT NULL,
	"transports" text,
	CONSTRAINT "authenticator_userId_credentialID_pk" PRIMARY KEY("userId","credentialID"),
	CONSTRAINT "authenticator_credentialID_unique" UNIQUE("credentialID")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	"password" text,
	"createdAt" timestamp DEFAULT now(),
	"deletedAt" timestamp,
	"credits" jsonb DEFAULT '{}'::jsonb,
	"stripeCustomerId" text,
	"stripeSubscriptionId" text,
	"lemonSqueezyCustomerId" text,
	"lemonSqueezySubscriptionId" text,
	"dodoCustomerId" text,
	"dodoSubscriptionId" text,
	"paddleCustomerId" text,
	"paddleSubscriptionId" text,
	"planId" text,
	CONSTRAINT "app_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "waitlist" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"twitterAccount" text,
	"email" text,
	"createdAt" timestamp DEFAULT now(),
	CONSTRAINT "waitlist_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "account_deletion_job" ADD CONSTRAINT "account_deletion_job_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_settings" ADD CONSTRAINT "alert_settings_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_profile" ADD CONSTRAINT "billing_profile_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon" ADD CONSTRAINT "coupon_userId_app_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_userId_app_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_deletion_job" ADD CONSTRAINT "data_deletion_job_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paypal_context" ADD CONSTRAINT "paypal_context_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paypal_context" ADD CONSTRAINT "paypal_context_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_audit_log" ADD CONSTRAINT "review_audit_log_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_audit_log" ADD CONSTRAINT "review_audit_log_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_exports" ADD CONSTRAINT "review_exports_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_responses" ADD CONSTRAINT "review_responses_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_responses" ADD CONSTRAINT "review_responses_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_sync_job" ADD CONSTRAINT "review_sync_job_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_sync_status" ADD CONSTRAINT "review_sync_status_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_app_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authenticator" ADD CONSTRAINT "authenticator_userId_app_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_app_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_user" ADD CONSTRAINT "app_user_planId_plans_id_fk" FOREIGN KEY ("planId") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_deletion_job_user_id_idx" ON "account_deletion_job" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "account_deletion_job_status_idx" ON "account_deletion_job" USING btree ("status");--> statement-breakpoint
CREATE INDEX "account_deletion_job_requested_at_idx" ON "account_deletion_job" USING btree ("requested_at");--> statement-breakpoint
CREATE UNIQUE INDEX "account_deletion_job_user_id_unique" ON "account_deletion_job" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "alert_settings_user_id_idx" ON "alert_settings" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "alert_settings_user_id_unique" ON "alert_settings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "billing_profile_user_id_idx" ON "billing_profile" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "billing_profile_user_id_unique" ON "billing_profile" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "billing_profile_created_at_idx" ON "billing_profile" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "data_deletion_job_user_id_idx" ON "data_deletion_job" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "data_deletion_job_provider_idx" ON "data_deletion_job" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "data_deletion_job_status_idx" ON "data_deletion_job" USING btree ("status");--> statement-breakpoint
CREATE INDEX "data_deletion_job_requested_at_idx" ON "data_deletion_job" USING btree ("requested_at");--> statement-breakpoint
CREATE UNIQUE INDEX "data_deletion_job_user_provider_unique" ON "data_deletion_job" USING btree ("user_id","provider");--> statement-breakpoint
CREATE INDEX "review_audit_log_review_id_idx" ON "review_audit_log" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX "review_audit_log_user_id_idx" ON "review_audit_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "review_audit_log_event_type_idx" ON "review_audit_log" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "review_audit_log_created_at_idx" ON "review_audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "review_exports_user_id_idx" ON "review_exports" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "review_exports_status_idx" ON "review_exports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "review_exports_created_at_idx" ON "review_exports" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "review_responses_review_id_idx" ON "review_responses" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX "review_responses_user_id_idx" ON "review_responses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "review_responses_status_idx" ON "review_responses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "review_responses_created_at_idx" ON "review_responses" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "review_sync_job_user_id_idx" ON "review_sync_job" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "review_sync_job_status_idx" ON "review_sync_job" USING btree ("status");--> statement-breakpoint
CREATE INDEX "review_sync_job_requested_at_idx" ON "review_sync_job" USING btree ("requested_at");--> statement-breakpoint
CREATE UNIQUE INDEX "review_sync_job_idempotency_key_unique" ON "review_sync_job" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "review_sync_status_user_id_idx" ON "review_sync_status" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "review_sync_status_provider_idx" ON "review_sync_status" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "review_sync_status_last_success_idx" ON "review_sync_status" USING btree ("last_success_at");--> statement-breakpoint
CREATE UNIQUE INDEX "review_sync_status_user_provider_unique" ON "review_sync_status" USING btree ("user_id","provider");--> statement-breakpoint
CREATE INDEX "reviews_user_id_idx" ON "reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reviews_provider_idx" ON "reviews" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "reviews_status_idx" ON "reviews" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "reviews_review_created_at_idx" ON "reviews" USING btree ("review_created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "reviews_provider_unique" ON "reviews" USING btree ("user_id","provider","provider_review_id");--> statement-breakpoint
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_dodo_subscription_id_idx" ON "subscriptions" USING btree ("dodo_subscription_id");--> statement-breakpoint
CREATE INDEX "subscriptions_status_idx" ON "subscriptions" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_user_id_unique" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "account_user_provider_idx" ON "account" USING btree ("userId","provider");--> statement-breakpoint
CREATE INDEX "app_user_deleted_at_idx" ON "app_user" USING btree ("deletedAt");