CREATE INDEX "review_exports_user_created_at_idx" ON "review_exports" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "reviews_user_review_date_idx" ON "reviews" USING btree ("user_id","review_created_at");--> statement-breakpoint
CREATE INDEX "reviews_user_rating_idx" ON "reviews" USING btree ("user_id","rating");