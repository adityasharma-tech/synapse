ALTER TABLE "upgrade"."token_table" ALTER COLUMN "reset_password_token_expiry" SET DEFAULT '2025-06-23 18:41:07.028';--> statement-breakpoint
ALTER TABLE "upgrade"."token_table" ALTER COLUMN "email_verification_token_expiry" SET DEFAULT '2025-06-23 18:41:07.028';--> statement-breakpoint
ALTER TABLE "upgrade"."streams" ADD COLUMN "scheduled_time" timestamp;--> statement-breakpoint
ALTER TABLE "upgrade"."streams" ADD COLUMN "is_scheduled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "upgrade"."streams" ADD COLUMN "end_time" timestamp;