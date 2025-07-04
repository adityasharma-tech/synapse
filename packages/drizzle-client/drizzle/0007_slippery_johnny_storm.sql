ALTER TABLE "upgrade"."token_table" ALTER COLUMN "reset_password_token_expiry" SET DEFAULT '2025-07-04 19:20:49.503';--> statement-breakpoint
ALTER TABLE "upgrade"."token_table" ALTER COLUMN "email_verification_token_expiry" SET DEFAULT '2025-07-04 19:20:49.503';--> statement-breakpoint
ALTER TABLE "upgrade"."session" ADD COLUMN "location" varchar;